import fs from 'node:fs'
import path from 'node:path'
import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ params, request }: LoaderFunctionArgs) {
	const { storyName, page } = params
	invariantResponse(storyName && page, 'Story name and page are required', { status: 400 })

	const audioDir = path.join(process.cwd(), 'data', 'processed-pdfs', storyName, 'audio')
	const paddings = [0, 2, 3, 4]
	let audioPath = ''
	for (const pad of paddings) {
		const filename = pad === 0 ? `page-${page}.mp3` : `page-${page.padStart(pad, '0')}.mp3`
		const tryPath = path.join(audioDir, filename)
		if (fs.existsSync(tryPath)) {
			audioPath = tryPath
			break
		}
	}

	if (!audioPath) {
		throw new Response('Audio not found', { status: 404 })
	}

	const stat = await fs.promises.stat(audioPath)
	const fileSize = stat.size
	const range = request.headers.get('range')

	if (range) {
		const parts = range.replace(/bytes=/, '').split('-')
		const start = parseInt(parts[0] ?? '0', 10)
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
		const chunksize = end - start + 1
		const file = fs.createReadStream(audioPath, { start, end })

		// @ts-expect-error - ReadableStream/Node stream mismatch
		return new Response(file, {
			status: 206,
			headers: {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': chunksize.toString(),
				'Content-Type': 'audio/mpeg',
			},
		})
	}

	const file = fs.createReadStream(audioPath)
	// @ts-expect-error - ReadableStream/Node stream mismatch
	return new Response(file, {
		headers: {
			'Content-Length': fileSize.toString(),
			'Content-Type': 'audio/mpeg',
			'Accept-Ranges': 'bytes',
		},
	})
}

