import path from 'path'
import fs from 'fs-extra'
import OpenAI from 'openai'

export interface BookPage {
	page: number
	text: string
	prompt: string
}

export interface BookConfig {
	title: string
	folder: string
	pages: BookPage[]
	layout?: 'caption' | 'split'
	imageSize?: '1024x1024' | '1536x1024' | '1024x1536'
	imageQuality?: 'low' | 'medium' | 'high'
	concurrency?: number
}

const openai = new OpenAI()

async function generateImage(
	prompt: string,
	outPath: string,
	size: '1024x1024' | '1536x1024' | '1024x1536',
	quality: 'low' | 'medium' | 'high',
) {
	console.log(`  Generating: ${path.basename(outPath)}`)
	const result = await openai.images.generate({
		model: 'gpt-image-1',
		prompt,
		size,
		quality,
		n: 1,
	})
	const b64 = result.data?.[0]?.b64_json
	if (!b64) throw new Error('No image data returned')
	const buffer = Buffer.from(b64, 'base64')
	await fs.writeFile(outPath, buffer)
}

export async function generateBook(config: BookConfig) {
	const {
		title,
		folder,
		pages,
		layout = 'caption',
		imageSize = '1024x1024',
		imageQuality = 'medium',
		concurrency = 3,
	} = config

	const baseDir = path.join(process.cwd(), 'data', 'processed-pdfs', folder)
	const imagesDir = path.join(baseDir, 'images')
	const textDir = path.join(baseDir, 'text')
	await fs.ensureDir(imagesDir)
	await fs.ensureDir(textDir)

	await fs.writeJSON(
		path.join(baseDir, 'metadata.json'),
		{ title, showText: true, layout },
		{ spaces: 2 },
	)

	const markers = pages.map(p => ({
		page: p.page,
		startTime: 0,
		duration: 0,
		text: p.text,
	}))
	await fs.writeJSON(path.join(baseDir, 'markers.json'), markers, { spaces: 2 })

	const fullText = pages.map(p => `--- Page ${p.page} ---\n${p.text}\n`).join('\n')
	await fs.writeFile(path.join(baseDir, 'full_text.txt'), fullText)

	for (const p of pages) {
		await fs.writeFile(path.join(textDir, `page-${p.page}.txt`), p.text)
	}

	const onlyPage = process.argv[2] ? parseInt(process.argv[2]) : null

	const toGenerate = pages.filter(p => {
		if (onlyPage !== null && p.page !== onlyPage) return false
		const outPath = path.join(imagesDir, `page-${String(p.page).padStart(2, '0')}.jpg`)
		if (fs.existsSync(outPath)) {
			console.log(`  Skipping page ${p.page} (already exists)`)
			return false
		}
		return true
	})

	console.log(`Generating ${toGenerate.length} images...`)

	for (let i = 0; i < toGenerate.length; i += concurrency) {
		const chunk = toGenerate.slice(i, i + concurrency)
		await Promise.all(
			chunk.map(async p => {
				const outPath = path.join(imagesDir, `page-${String(p.page).padStart(2, '0')}.jpg`)
				try {
					await generateImage(p.prompt, outPath, imageSize, imageQuality)
				} catch (e) {
					console.error(`  FAILED page ${p.page}:`, e)
				}
			}),
		)
	}

	console.log('\nDone!')
	console.log(`Visit /pdf-stories/${folder} to see the book.`)
}
