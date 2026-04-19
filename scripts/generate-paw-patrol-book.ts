import 'dotenv/config'
import path from 'path'
import fs from 'fs-extra'
import OpenAI from 'openai'

const openai = new OpenAI()

interface Page {
	page: number
	text: string
	prompt: string
}

// Story: "Chase and the Dogs" — only words from TYC lessons 1-62 (+ proper nouns)
const TITLE = 'Chase and the Dogs'
const FOLDER = 'Chase-and-the-Dogs'

const STYLE_SUFFIX =
	' Bright, cheerful cartoon illustration in the style of a children\'s picture book, ' +
	'colorful, simple shapes, no text, no words, no letters, no speech bubbles, ' +
	'clean white or pastel background, for a young child.'

const PAGES: Page[] = [
	{
		page: 1,
		text: '', // cover
		prompt:
			'Picture book cover illustration: A group of six friendly cartoon rescue puppies ' +
			'standing together smiling — a German Shepherd pup in a blue police uniform and cap, ' +
			'a Dalmatian pup in red firefighter gear, a cream-colored Cockapoo pup in pink and purple flight gear with wings, ' +
			'a tan English Bulldog pup in a yellow construction hardhat, a gray mixed-breed pup in a green recycling vest, ' +
			'and a chocolate Labrador pup in orange water-rescue gear. Sunny day, grassy hill.' +
			STYLE_SUFFIX,
	},
	{
		page: 2,
		text: 'This is Chase. Chase is a cop dog.',
		prompt:
			'A friendly cartoon German Shepherd puppy wearing a blue police officer uniform and a blue police cap, ' +
			'sitting proudly and smiling, next to a small blue police car.' +
			STYLE_SUFFIX,
	},
	{
		page: 3,
		text: 'Marshall is a red dog. He hits hot rocks with rain.',
		prompt:
			'A cheerful cartoon Dalmatian puppy in red firefighter gear and a red helmet, ' +
			'spraying water from a fire hose onto glowing hot red rocks. Big splashes of water and rain.' +
			STYLE_SUFFIX,
	},
	{
		page: 4,
		text: 'Skye can go far. She is in the fog.',
		prompt:
			'A cute cartoon cream-colored Cockapoo puppy girl wearing pink goggles and a purple flight-suit with small wings, ' +
			'flying high in a foggy gray-and-white cloudy sky, smiling with paws out.' +
			STYLE_SUFFIX,
	},
	{
		page: 5,
		text: 'Rubble sat on a lot of sand.',
		prompt:
			'A happy cartoon tan English Bulldog puppy wearing a yellow construction hardhat, ' +
			'sitting on a big pile of golden sand at a construction site, tongue out, smiling.' +
			STYLE_SUFFIX,
	},
	{
		page: 6,
		text: 'Rocky has lots of rocks in a sack.',
		prompt:
			'A cute cartoon gray-and-white mixed-breed puppy wearing a green recycling vest and a green cap, ' +
			'holding a brown sack full of colorful rocks, smiling proudly.' +
			STYLE_SUFFIX,
	},
	{
		page: 7,
		text: 'Zuma is in the lake. He likes to dive.',
		prompt:
			'A cheerful cartoon chocolate Labrador puppy wearing orange water-rescue gear and an orange helmet, ' +
			'diving into a sparkling blue lake, splashing water everywhere.' +
			STYLE_SUFFIX,
	},
	{
		page: 8,
		text: 'A little kitten ran to a big hill. The kitten was sad.',
		prompt:
			'A small sad orange tabby kitten with big teary eyes running up a big green grassy hill, ' +
			'looking worried. Sunny blue sky.' +
			STYLE_SUFFIX,
	},
	{
		page: 9,
		text: 'Chase ran to the hill. Skye came down with the kitten!',
		prompt:
			'A cartoon German Shepherd puppy in a blue police uniform running up a green grassy hill, ' +
			'while a cream-colored Cockapoo puppy in pink goggles and purple wings flies down from the sky ' +
			'gently holding a small orange tabby kitten. Happy scene, sunny sky.' +
			STYLE_SUFFIX,
	},
	{
		page: 10,
		text: 'The kitten is home. We did it!',
		prompt:
			'A group of six cartoon rescue puppies (a German Shepherd in blue police uniform, a Dalmatian in red firefighter gear, ' +
			'a cream Cockapoo in pink and purple flight gear, a tan English Bulldog in a yellow hardhat, a gray mixed-breed in a green vest, ' +
			'and a chocolate Labrador in orange gear) cheering and celebrating together as an orange tabby kitten ' +
			'is safely snuggled with a smiling mother cat. Everyone is happy, confetti in the air, sunny home setting.' +
			STYLE_SUFFIX,
	},
]

async function generateImage(prompt: string, outPath: string) {
	console.log(`  Generating: ${path.basename(outPath)}`)
	const result = await openai.images.generate({
		model: 'gpt-image-1',
		prompt,
		size: '1024x1024',
		quality: 'medium',
		n: 1,
	})
	const b64 = result.data?.[0]?.b64_json
	if (!b64) throw new Error('No image data returned')
	const buffer = Buffer.from(b64, 'base64')
	await fs.writeFile(outPath, buffer)
}

async function main() {
	const baseDir = path.join(process.cwd(), 'data', 'processed-pdfs', FOLDER)
	const imagesDir = path.join(baseDir, 'images')
	const textDir = path.join(baseDir, 'text')
	await fs.ensureDir(imagesDir)
	await fs.ensureDir(textDir)

	// Metadata
	await fs.writeJSON(
		path.join(baseDir, 'metadata.json'),
		{ title: TITLE, showText: true },
		{ spaces: 2 },
	)

	// Markers (no audio, but text is used for overlay)
	const markers = PAGES.map(p => ({
		page: p.page,
		startTime: 0,
		duration: 0,
		text: p.text,
	}))
	await fs.writeJSON(path.join(baseDir, 'markers.json'), markers, { spaces: 2 })

	// Full text
	const fullText = PAGES.map(p => `--- Page ${p.page} ---\n${p.text}\n`).join('\n')
	await fs.writeFile(path.join(baseDir, 'full_text.txt'), fullText)

	// Per-page text files
	for (const p of PAGES) {
		await fs.writeFile(path.join(textDir, `page-${p.page}.txt`), p.text)
	}

	// Generate images (skip if already exist)
	const onlyPage = process.argv[2] ? parseInt(process.argv[2]) : null

	const toGenerate = PAGES.filter(p => {
		if (onlyPage !== null && p.page !== onlyPage) return false
		const outPath = path.join(imagesDir, `page-${String(p.page).padStart(2, '0')}.jpg`)
		if (fs.existsSync(outPath)) {
			console.log(`  Skipping page ${p.page} (already exists)`)
			return false
		}
		return true
	})

	console.log(`Generating ${toGenerate.length} images...`)

	// Process with some concurrency
	const CONCURRENCY = 3
	for (let i = 0; i < toGenerate.length; i += CONCURRENCY) {
		const chunk = toGenerate.slice(i, i + CONCURRENCY)
		await Promise.all(
			chunk.map(async p => {
				const outPath = path.join(imagesDir, `page-${String(p.page).padStart(2, '0')}.jpg`)
				try {
					await generateImage(p.prompt, outPath)
				} catch (e) {
					console.error(`  FAILED page ${p.page}:`, e)
				}
			}),
		)
	}

	console.log('\nDone!')
	console.log(`Visit /pdf-stories/${FOLDER} to see the book.`)
}

main().catch(e => {
	console.error(e)
	process.exit(1)
})
