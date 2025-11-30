import { spawn, execSync } from 'node:child_process'
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
    type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import ffprobeStatic from 'ffprobe-static'
import { useState } from 'react'
import YtDlpWrap from 'yt-dlp-wrap'
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

function normalizeTime(time: string): string {
    time = time.trim()
    if (time.startsWith(':')) {
        return '0' + time
    }
    return time
}

async function ensureYtDlp() {
    try {
        // Check if yt-dlp is in PATH
        execSync('which yt-dlp', { stdio: 'ignore' })
        return 'yt-dlp'
    } catch {
        const binaryPath = path.join(process.cwd(), 'bin', 'yt-dlp')
        if (!fs.existsSync(binaryPath)) {
            console.log('Downloading yt-dlp binary to', binaryPath)
            await fs.promises.mkdir(path.dirname(binaryPath), { recursive: true })
            await YtDlpWrap.downloadFromGithub(binaryPath)
            await fs.promises.chmod(binaryPath, '755')
        }
        return binaryPath
    }
}

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return json({ tags })
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

    const storyType = formData.get('storyType')
    const tagIds = formData.getAll('tagIds') as string[]

    if (storyType === 'readaloud') {
        const youtubeUrl = formData.get('youtubeUrl')
        if (typeof youtubeUrl !== 'string' || !youtubeUrl) {
             return json({ error: 'YouTube URL is required' }, { status: 400 })
        }

        let startTime = formData.get('startTime') as string
        let endTime = formData.get('endTime') as string

        if (startTime) startTime = normalizeTime(startTime)
        if (endTime) endTime = normalizeTime(endTime)

        const storageDir = process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'uploads', 'audiobooks')
        await fs.promises.mkdir(storageDir, { recursive: true })

        const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}`
        const outputBase = path.join(storageDir, uniqueFilename)
        const outputPath = outputBase + '.mp4'

        try {
            const binaryPath = await ensureYtDlp()
            const ytDlpWrap = new YtDlpWrap(binaryPath)

            const args = [
                youtubeUrl,
                '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                '--merge-output-format', 'mp4',
                '-o', outputPath,
                '--add-metadata',
                '--write-thumbnail',
                '--convert-thumbnails', 'jpg'
            ]

            if (startTime || endTime) {
                 const section = `*${startTime || ''}-${endTime || ''}`
                 args.push('--download-sections', section)
                 args.push('--force-keyframes-at-cuts')
            }

            console.log('Executing yt-dlp with args:', args)
            await ytDlpWrap.execPromise(args)

            // Check for thumbnail
            let coverBlob = null
            let coverContentType = 'image/jpeg'
            const potentialExts = ['.jpg', '.jpeg', '.webp', '.png']

            for (const ext of potentialExts) {
                 const thumbPath = outputBase + ext
                 if (fs.existsSync(thumbPath)) {
                     coverBlob = await fs.promises.readFile(thumbPath)
                     coverContentType = ext === '.webp' ? 'image/webp' : (ext === '.png' ? 'image/png' : 'image/jpeg')
                     // Clean up thumb file
                     await fs.promises.unlink(thumbPath)
                     break
                 }
            }

            // Probe for metadata (duration, title)
            let duration = 0
            let title = formData.get('title') as string

            try {
                const info = await probe(outputPath)
                duration = info.format?.duration || 0
                if (!title && info.format?.tags?.title) title = info.format.tags.title
            } catch (e) {
                console.error('Probing downloaded file failed:', e)
            }

            if (!title) title = 'Downloaded Video'

            // Create DB entry
            await prisma.story.create({
                data: {
                    title,
                    type: 'readaloud',
                    originalLink: youtubeUrl as string,
                    tags: tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
                    images: coverBlob ? {
                        create: {
                            contentType: coverContentType,
                            blob: coverBlob,
                            altText: title,
                        }
                    } : undefined,
                    audio: {
                        create: {
                            contentType: 'video/mp4',
                            filepath: outputPath,
                        }
                    },
                    chapters: {
                        create: {
                            title: 'Full Video',
                            order: 0,
                            startTime: 0,
                            endTime: parseFloat(String(duration)),
                        }
                    }
                }
            })

            return redirect(`/admin/stories`)

        } catch (e: any) {
            console.error('Download failed:', e)
            return json({ error: `Download failed: ${e.message}` }, { status: 500 })
        }
    }

    // Audiobook Handling
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

	const mimeType = filepath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4'

	const story = await prisma.story.create({
		data: {
			title,
            type: 'audiobook',
            tags: tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
			images: coverPicture ? {
				create: {
					contentType: coverPicture.format,
					blob: Buffer.from(coverPicture.data),
					altText: title,
				},
			} : undefined,
			audio: {
				create: {
					contentType: mimeType,
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
    const { tags } = useLoaderData<typeof loader>()
	const isPending = useIsPending()
    const [storyType, setStoryType] = useState<'audiobook' | 'readaloud'>('audiobook')

	const [form] = useForm({
		id: 'story-editor',
		shouldRevalidate: 'onBlur',
	})

	return (
		<div className="container mx-auto p-6">
			<h1 className="mb-6 text-2xl font-bold">Add New Story</h1>
			<FormProvider context={form.context}>
				<Form
					method="POST"
					className="flex flex-col gap-y-6"
					{...getFormProps(form)}
					encType="multipart/form-data"
				>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label>Story Type</Label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="storyType"
                                        value="audiobook"
                                        checked={storyType === 'audiobook'}
                                        onChange={() => setStoryType('audiobook')}
                                        className="w-4 h-4 text-orange-600"
                                    />
                                    Audiobook (M4B/MP3)
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="storyType"
                                        value="readaloud"
                                        checked={storyType === 'readaloud'}
                                        onChange={() => setStoryType('readaloud')}
                                        className="w-4 h-4 text-orange-600"
                                    />
                                    Read Aloud (YouTube)
                                </label>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags">Tags / Collections</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900 max-h-48 overflow-y-auto">
                                {tags.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No tags available. Create some in Admin.</p>}
                                {tags.map((tag) => (
                                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="tagIds"
                                            value={tag.id}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm">{tag.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {storyType === 'audiobook' ? (
                        <div>
                            <Label htmlFor="audiobookFile">Audiobook File (.m4b, .mp3)</Label>
                            <input
                                id="audiobookFile"
                                name="audiobookFile"
                                type="file"
                                accept=".m4b,.mp3,audio/*"
                                required
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                                <input
                                    id="youtubeUrl"
                                    name="youtubeUrl"
                                    type="url"
                                    required
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="startTime">Start Time (Optional, MM:SS or SS)</Label>
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="text"
                                        placeholder="0:00"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="endTime">End Time (Optional, MM:SS or SS)</Label>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="text"
                                        placeholder="10:00"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="title">Title (Optional)</Label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="My Custom Title"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </>
                    )}

					{actionData?.error && (
						<div className="min-h-[32px] px-4 pb-3 pt-1">
							<p className="text-sm text-red-500">{actionData.error}</p>
						</div>
					)}

					<div className="flex justify-end gap-4">
						<Button type="reset" variant="secondary">
							Reset
						</Button>
						<StatusButton
							type="submit"
							disabled={isPending}
							status={isPending ? 'pending' : 'idle'}
						>
							{storyType === 'audiobook' ? 'Upload & Process' : 'Download & Add'}
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
