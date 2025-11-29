import fs from 'node:fs'
import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ params, request }: LoaderFunctionArgs) {
	invariantResponse(params.fileId, 'File ID is required', { status: 400 })
	const audio = await prisma.audioFile.findUnique({
		where: { id: params.fileId },
		select: { contentType: true, blob: true, filepath: true },
	})

	invariantResponse(audio, 'Not found', { status: 404 })

	// Fallback for old records stored in blob
	if (audio.blob && !audio.filepath) {
		return new Response(audio.blob, {
			headers: {
				'Content-Type': audio.contentType,
				'Content-Length': Buffer.byteLength(audio.blob).toString(),
				'Content-Disposition': `inline; filename="${params.fileId}"`,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		})
	}

	// Serve from filesystem with Range support
	if (audio.filepath) {
		const stat = await fs.promises.stat(audio.filepath)
		const fileSize = stat.size
		const range = request.headers.get('range')

		if (range) {
			const parts = range.replace(/bytes=/, '').split('-')
			const start = parseInt(parts[0] ?? '0', 10)
			const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
			const chunksize = (end - start) + 1
			const file = fs.createReadStream(audio.filepath, { start, end })

			// @ts-expect-error - ReadableStream/Node stream mismatch but it works in Remix/Node adapter
			return new Response(file, {
				status: 206,
				headers: {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
					'Accept-Ranges': 'bytes',
					'Content-Length': chunksize.toString(),
					'Content-Type': audio.contentType,
				},
			})
		} else {
			const file = fs.createReadStream(audio.filepath)
			// @ts-expect-error - ReadableStream/Node stream mismatch
			return new Response(file, {
				headers: {
					'Content-Length': fileSize.toString(),
					'Content-Type': audio.contentType,
					'Content-Disposition': `inline; filename="${params.fileId}"`,
					'Cache-Control': 'public, max-age=31536000, immutable',
					'Accept-Ranges': 'bytes',
				},
			})
		}
	}

	throw new Response("File not found", { status: 404 })
}
