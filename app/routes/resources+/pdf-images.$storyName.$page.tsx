import fs from 'node:fs'
import path from 'node:path'
import { invariantResponse } from '@epic-web/invariant'
import { type LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ params }: LoaderFunctionArgs) {
	const { storyName, page } = params
	invariantResponse(storyName && page, 'Story name and page are required', { status: 400 })

	const imagePath = path.join(process.cwd(), 'data', 'processed-pdfs', storyName, 'images', `page-${page.padStart(2, '0')}.jpg`)

	if (!fs.existsSync(imagePath)) {
		throw new Response('Image not found', { status: 404 })
	}

	const stat = await fs.promises.stat(imagePath)
	const file = fs.createReadStream(imagePath)

	// @ts-expect-error - ReadableStream/Node stream mismatch
	return new Response(file, {
		headers: {
			'Content-Length': stat.size.toString(),
			'Content-Type': 'image/jpeg',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}

