import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
	FormProvider,
	getFormProps,
	useForm,
} from '@conform-to/react'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import {
	json,
	redirect,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import ffprobeStatic from 'ffprobe-static'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 2 // 2GB

// Helper to run ffprobe with custom arguments
function probe(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn(ffprobeStatic.path, [
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            '-show_chapters',
            filePath
        ])

        let stdout = ''
        let stderr = ''

        ffprobe.stdout.on('data', (data) => {
            stdout += data
        })

        ffprobe.stderr.on('data', (data) => {
            stderr += data
        })

        ffprobe.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`ffprobe exited with code ${code}: ${stderr}`))
            } else {
                try {
                    resolve(JSON.parse(stdout))
                } catch {
                    reject(new Error('Failed to parse ffprobe JSON output'))
                }
            }
        })
    })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const uploadHandler = async (file: FileUpload) => {
		if (file.fieldName !== 'audiobookFile') {
			return
		}

		const storageDir = process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'uploads', 'audiobooks')
		await fs.promises.mkdir(storageDir, { recursive: true })

		const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`
		const filepath = path.join(storageDir, uniqueFilename)

		const writeStream = fs.createWriteStream(filepath)

		for await (const chunk of file.stream()) {
			writeStream.write(chunk)
		}
		writeStream.end()

		await new Promise<void>((resolve, reject) => {
			writeStream.on('finish', resolve)
			writeStream.on('error', reject)
		})

		return filepath
	}

	const formData = await parseFormData(
		request,
		{ maxFileSize: MAX_FILE_SIZE },
		uploadHandler
	)

	const filepath = formData.get('audiobookFile')

	if (typeof filepath !== 'string' || !filepath) {
		return json(
			{ error: 'File upload failed' },
			{ status: 400 },
		)
	}

	const { parseFile } = await import('music-metadata')
	const metadata = await parseFile(filepath)
	const { common } = metadata

	const originalFilename = path.basename(filepath).split('-').slice(2).join('-')
	const title = common.title ?? originalFilename.replace(/\.[^/.]+$/, "")
	const coverPicture = common.picture?.[0]

	const story = await prisma.story.create({
		data: {
			title,
			images: coverPicture ? {
				create: {
					contentType: coverPicture.format,
					blob: Buffer.from(coverPicture.data),
					altText: title,
				},
			} : undefined,
			audio: {
				create: {
					contentType: 'audio/mp4',
					filepath: filepath,
				},
			},
		},
	})

    let chapters: any[] = []
    let duration = 0

    try {
        console.log('Running custom ffprobe on:', filepath)
        const info = await probe(filepath)
        console.log('FFPROBE info chapters:', info.chapters ? info.chapters.length : 'None')
        chapters = info.chapters || []
        duration = info.format?.duration || 0
    } catch (e) {
        console.error('ffprobe failed:', e)
        duration = metadata.format.duration || 0
    }

	if (chapters.length > 0) {
		await prisma.chapter.createMany({
			data: chapters.map((c: any, i: number) => ({
				title: c.tags?.title || `Chapter ${i + 1}`,
				order: i,
				startTime: parseFloat(c.start_time),
				endTime: parseFloat(c.end_time),
				storyId: story.id,
			})),
		})
	} else {
		await prisma.chapter.create({
			data: {
				title: "Full Audiobook",
				order: 0,
				startTime: 0,
				endTime: parseFloat(String(duration)),
				storyId: story.id,
			},
		})
	}

	return redirect(`/admin/stories`)
}

export default function NewStory() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form] = useForm({
		id: 'story-editor',
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container mx-auto p-6">
			<h1 className="mb-6 text-2xl font-bold">Upload Audiobook (M4B)</h1>
			<FormProvider context={form.context}>
				<Form
					method="POST"
					className="flex flex-col gap-y-6"
					{...getFormProps(form)}
					encType="multipart/form-data"
				>
					<div>
						<Label htmlFor="audiobookFile">Audiobook File (.m4b)</Label>
						<input
							id="audiobookFile"
							name="audiobookFile"
							type="file"
							accept=".m4b,audio/*"
							required
							className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
						/>
						{actionData?.error && (
							<div className="min-h-[32px] px-4 pb-3 pt-1">
								<p className="text-sm text-red-500">{actionData.error}</p>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-4">
						<Button type="reset" variant="secondary">
							Reset
						</Button>
						<StatusButton
							type="submit"
							disabled={isPending}
							status={isPending ? 'pending' : 'idle'}
						>
							Upload & Process
						</StatusButton>
					</div>
				</Form>
			</FormProvider>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
