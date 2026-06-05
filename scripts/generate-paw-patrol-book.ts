import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_PAW_PATROL,
	CHAR_CHASE,
	CHAR_MARSHALL,
	CHAR_SKYE,
	CHAR_RUBBLE,
	CHAR_ROCKY,
	CHAR_ZUMA,
} from './lib/characters'

const TITLE = 'Chase and the Dogs'
const FOLDER = 'Chase-and-the-Dogs'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['chase'],
		prompt:
			'A warm inviting book-cover illustration. Chase, a cheerful cartoon puppy in a blue ' +
			'police uniform, sits happily in the middle of a bright green grassy meadow with a few ' +
			'wildflowers, blue sky with fluffy white clouds, warm sunny afternoon light. Friendly ' +
			'welcoming composition. Leave a clear sky-area at the top for a title.',
	},
	{
		page: 2,
		text: 'This is Chase. Chase is a cop dog.',
		characters: ['chase'],
		prompt:
			'Chase sitting proudly and smiling on a patch of green grass, next to a small blue ' +
			'police car. Sunny day.',
	},
	{
		page: 3,
		text: 'Marshall is a red dog. He hits hot rocks with rain.',
		characters: ['marshall'],
		prompt:
			'Marshall spraying water from a fire hose onto glowing hot red rocks. Big splashes of ' +
			'water and rain. Grassy ground, bright sky.',
	},
	{
		page: 4,
		text: 'Skye can go far. She is in the fog.',
		characters: ['skye'],
		prompt:
			'Skye flying high in a foggy gray-and-white cloudy sky, smiling with paws out, goggles ' +
			'on, propeller spinning.',
	},
	{
		page: 5,
		text: 'Rubble sat on a lot of sand.',
		characters: ['rubble'],
		prompt:
			'Rubble sitting happily on a big pile of golden sand at a small construction site, ' +
			'tongue out, smiling.',
	},
	{
		page: 6,
		text: 'Rocky has lots of rocks in a sack.',
		characters: ['rocky'],
		prompt:
			'Rocky holding a brown burlap sack full of colourful rocks, smiling proudly, warm sunny ' +
			'outdoor background.',
	},
	{
		page: 7,
		text: 'Zuma is in the lake. He likes to dive.',
		characters: ['zuma'],
		prompt:
			'Zuma diving into a sparkling blue lake, splashing water everywhere, gleeful expression.',
	},
	{
		page: 8,
		text: 'A kitten ran to a big hill. The kitten was sad.',
		characters: [],
		prompt:
			'A small sad orange tabby kitten with big teary eyes running up a big green grassy hill, ' +
			'looking worried. Sunny blue sky. (Draw the kitten in the same art style as the character ' +
			'references.)',
	},
	{
		page: 9,
		text: 'Chase ran to the hill. Skye came down with the kitten!',
		characters: ['chase', 'skye'],
		prompt:
			'Chase runs up a green grassy hill, while Skye flies down from the sky gently holding a ' +
			'small orange tabby kitten in her paws. Happy scene, sunny sky.',
	},
	{
		page: 10,
		text: 'The kitten is home. We did it!',
		characters: ['chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma'],
		prompt:
			'All six pups cheering and celebrating together as an orange tabby kitten is safely ' +
			'snuggled with a smiling mother cat. Everyone is happy, confetti in the air, sunny ' +
			'home setting.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Paw Patrol',
	style: STYLE_PAW_PATROL,
	characters: [CHAR_CHASE, CHAR_MARSHALL, CHAR_SKYE, CHAR_RUBBLE, CHAR_ROCKY, CHAR_ZUMA],
	pages: PAGES,
	layout: 'caption',
	imageSize: '1024x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
