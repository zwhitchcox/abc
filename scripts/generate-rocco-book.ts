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

const TITLE = 'Rocco and the Long Road Home'
const FOLDER = 'Rocco-and-the-Long-Road-Home'

const STYLE_SUFFIX =
	' Warm, cozy, hand-painted watercolor children\'s book illustration, soft colors, ' +
	'gentle lighting, friendly and sweet mood, no text, no words, no letters, no speech bubbles.'

const ROCCO =
	'a small fluffy tan-and-white puppy with floppy ears, big dark eyes, and a little red collar'

const PAGES: Page[] = [
	{
		page: 1,
		text: '', // cover
		prompt:
			`Book cover: ${ROCCO} sitting on a sunny green hillside in front of a big red barn with a white fence, ` +
			'surrounded by a few fluffy sheep and a golden retriever mother dog behind him, blue sky with soft clouds, ' +
			'cheerful and inviting composition.' +
			STYLE_SUFFIX,
	},
	{
		page: 2,
		text:
			'Rocco is a little tan pup. He lives on a big farm with his mom and his pals.\n\n' +
			'That farm has a red gate, a green hill, and a lot of sheep. Rocco likes the farm a lot.',
		prompt:
			`${ROCCO} sitting happily on a grassy green hill on a farm. A red wooden gate stands to one side, ` +
			'white fluffy sheep graze in the background, a big red barn is visible farther back, ' +
			'his golden retriever mother stands nearby smiling. Warm sunny afternoon.' +
			STYLE_SUFFIX,
	},
	{
		page: 3,
		text:
			'One hot day, a pink moth went past his nose. Rocco had to see it. He ran after that pink moth fast.\n\n' +
			'"Stop!" said his mom. But Rocco did not stop. He ran and ran.',
		prompt:
			`${ROCCO} dashing playfully across a sunny meadow, nose pointed forward, chasing a large pretty pink moth ` +
			'fluttering just out of reach. In the background, his worried golden retriever mother is barking after him. ' +
			'Bright daisies and tall grass around them.' +
			STYLE_SUFFIX,
	},
	{
		page: 4,
		text:
			'The moth went into the dark woods. Then — poof! — the moth was gone.\n\n' +
			'Rocco sat down on a fat log. He did not see the farm. He did not see his mom. Rocco felt sad.',
		prompt:
			`${ROCCO} sitting all alone on a thick mossy log deep inside a shadowy forest, ears drooping, ` +
			'big sad eyes looking around. Tall dark trees surround him, a few beams of soft light filter through the leaves. ' +
			'No sign of the farm.' +
			STYLE_SUFFIX,
	},
	{
		page: 5,
		text:
			'A tall deer came near. "Are you lost, little pup?" said the deer.\n\n' +
			'"Yes," said Rocco. "I can not see the road home."',
		prompt:
			`${ROCCO} looking up at a tall friendly brown deer with gentle eyes and small antlers, ` +
			'bending its head down kindly toward the puppy. They are in a clearing in the forest with ferns ' +
			'and wildflowers around them, soft dappled sunlight.' +
			STYLE_SUFFIX,
	},
	{
		page: 6,
		text:
			'The deer led Rocco to a pond. A fat duck was in the reeds.\n\n' +
			'"Which way is the big red farm?" said Rocco. "Quack! Go past the rocks and then up the hill," said the duck.',
		prompt:
			`${ROCCO} standing at the edge of a small clear forest pond, next to the tall friendly deer. ` +
			'A plump white duck sits among green reeds in the water, quacking and pointing one wing toward a distant ' +
			'grassy hill visible beyond some gray rocks. Peaceful, reflective water.' +
			STYLE_SUFFIX,
	},
	{
		page: 7,
		text:
			'Rocco went past the rocks. But then came the rain. Big wet drops hit his ears and his back.\n\n' +
			'Fog fell on the land. Rocco sat in the mud. He let out a sad little yip.',
		prompt:
			`${ROCCO} sitting in the mud in a rainy gray landscape, fur wet and flattened, ` +
			'raindrops falling heavily, thick fog blurring the distance, gray rocks around him, mouth slightly open ' +
			'in a small sad whimper. Moody, misty, muted colors but still gentle.' +
			STYLE_SUFFIX,
	},
	{
		page: 8,
		text:
			'"Here, pup! Here, pup!" came a call. It was Meg, the shepherd girl. She had a lamp and a red coat.\n\n' +
			'Meg ran to him. She gave him a big hug. "I came to get you home," said Meg.',
		prompt:
			`A kind young shepherd girl named Meg, about 10 years old, with long brown braided hair, wearing a ` +
			`bright red raincoat and rubber boots, holding a warm glowing lantern, kneeling down in the rain to hug ${ROCCO} ` +
			'tightly. Relief and joy on her face. The puppy nuzzles into her coat. Rainy, misty forest edge around them.' +
			STYLE_SUFFIX,
	},
	{
		page: 9,
		text:
			'Meg and Rocco went down the road. The rain let up. A fat sun came back. Meg had Rocco in her arms.\n\n' +
			'They went past the pond. They went past the dark woods. Then they went up the green hill.',
		prompt:
			`The shepherd girl Meg in a red raincoat walking along a winding dirt road, carrying ${ROCCO} ` +
			'cradled contentedly in her arms. The rain has just stopped, the sun is breaking through the clouds, ' +
			'a rainbow arches over green hills in the distance. The pond and the edge of the dark forest are visible behind them.' +
			STYLE_SUFFIX,
	},
	{
		page: 10,
		text:
			'At the top of the hill, Rocco saw the big red gate! His mom ran to him and gave him lots of licks.\n\n' +
			'Meg sat down with Rocco. She gave him a dish of meat. Rocco ate and ate. Then he fell into a deep, happy sleep.',
		prompt:
			`A warm happy homecoming scene at the farm. The big red barn and red gate are in the background, ` +
			`the golden retriever mother dog is licking ${ROCCO} joyfully while he wags his tail. The shepherd girl Meg ` +
			'in her red coat kneels beside them, smiling, setting down a little blue dish of food. Sheep watch in the background. ' +
			'Late golden-hour sunlight. Cozy and heartwarming.' +
			STYLE_SUFFIX,
	},
]

async function generateImage(prompt: string, outPath: string) {
	console.log(`  Generating: ${path.basename(outPath)}`)
	const result = await openai.images.generate({
		model: 'gpt-image-1',
		prompt,
		size: '1536x1024', // landscape — nicer for split layout
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

	await fs.writeJSON(
		path.join(baseDir, 'metadata.json'),
		{ title: TITLE, showText: true, layout: 'split' },
		{ spaces: 2 },
	)

	const markers = PAGES.map(p => ({
		page: p.page,
		startTime: 0,
		duration: 0,
		text: p.text,
	}))
	await fs.writeJSON(path.join(baseDir, 'markers.json'), markers, { spaces: 2 })

	const fullText = PAGES.map(p => `--- Page ${p.page} ---\n${p.text}\n`).join('\n')
	await fs.writeFile(path.join(baseDir, 'full_text.txt'), fullText)

	for (const p of PAGES) {
		await fs.writeFile(path.join(textDir, `page-${p.page}.txt`), p.text)
	}

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
