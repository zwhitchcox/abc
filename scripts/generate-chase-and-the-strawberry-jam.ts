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
	CHAR_FARMER_GIRL,
	CHAR_PIGLET,
} from './lib/characters'

const TITLE = 'chase and the strawberry jam'
const FOLDER = 'Chase-and-the-Strawberry-Jam'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['chase', 'piglet'],
		prompt:
			'A warm inviting book-cover illustration of a sunny strawberry farm. In the foreground ' +
			'Chase sits proudly on a grassy spot next to a big woven basket overflowing with bright ' +
			'ripe red strawberries. A small pink piglet peeks cheerfully out from behind the basket, ' +
			'one strawberry in its mouth. Behind them, neat rows of leafy green strawberry plants ' +
			'stretch toward a red-roofed wooden barn. Blue sky with a few fluffy white clouds, warm ' +
			'sunny afternoon light, a couple of butterflies in the air. Leave a clear sky-area at ' +
			'the top for a title.',
	},
	{
		page: 2,
		text:
			'this is chase. he is a cop dog. he lives with the big dogs.\n\n' +
			'they like to run. they like to have fun.',
		characters: ['chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma'],
		prompt:
			'A sunny grassy field at the pups\' home base on a gentle green hill. Chase stands in ' +
			'the centre, proud. Marshall, Skye, Rubble, Rocky, and Zuma play happily around him — ' +
			'one chases a ball, one is jumping, one is wagging tail. Warm sunny day, a few ' +
			'wildflowers in the grass, blue sky with puffy clouds.',
	},
	{
		page: 3,
		text:
			'it is a hot day. a girl came up the road.\n\n' +
			'"dogs, come here!" said the girl. "i need you to find the strawberries."',
		characters: ['farmer-girl', 'chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma'],
		prompt:
			'On a warm sunny afternoon, the farmer girl walks up a dirt road toward the pups, ' +
			'waving one hand cheerfully and holding her empty wooden basket in the other. Chase ' +
			'and the other pups are gathered on the grass in front of her, ears perked and ' +
			'attentive, excited to help. A sign for a strawberry farm is visible down the road in ' +
			'the background. Golden afternoon light.',
	},
	{
		page: 4,
		text:
			'the girl has a farm. she has lots of strawberries.\n\n' +
			'"i will make jam!" said the girl. "red jam for us!"',
		characters: ['farmer-girl'],
		prompt:
			'Wide view of the farmer girl\'s strawberry farm: long tidy rows of lush green ' +
			'strawberry plants bursting with bright ripe red strawberries stretching to a ' +
			'red-roofed wooden barn in the distance. In the foreground, the girl stands between ' +
			'two rows holding up a small glass jar of glossy red strawberry jam and pointing to ' +
			'it with a big happy smile. Sunny bright day.',
	},
	{
		page: 5,
		text:
			'chase ran to the farm. the big dogs ran with him.\n\n' +
			'but — a little pig! a little pig was in the strawberries.',
		characters: ['chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma', 'piglet'],
		prompt:
			'Chase and the other five pups run enthusiastically into the strawberry rows, ears ' +
			'flapping, expressions surprised and wide-eyed. Right in the middle of one row the ' +
			'little pink piglet sits happily among the strawberry plants, strawberries already ' +
			'smeared around its mouth, lifting one leafy strawberry to snack on. Bright sunny day.',
	},
	{
		page: 6,
		text:
			'the pig was eating the strawberries! "stop, pig!" said chase.\n\n' +
			'but the pig did not stop. the pig ran into the brush.',
		characters: ['chase', 'piglet', 'marshall', 'skye', 'rubble', 'rocky', 'zuma'],
		prompt:
			'Chase stands at the end of a strawberry row, one paw raised, mouth open as he calls ' +
			'out. The piglet has scampered away toward a thick patch of green leafy brush and tall ' +
			'ferns at the edge of the farm, a strawberry still clutched in its mouth, tail curled ' +
			'mid-run. A trail of tiny strawberry-stained footprints follows behind. Bright sunny ' +
			'farm field, other pups looking on behind Chase.',
	},
	{
		page: 7,
		text:
			'"i can find that pig," said chase. chase went into the brush.\n\n' +
			'he looked and looked. then — here was the pig!',
		characters: ['chase', 'piglet'],
		prompt:
			'Chase crouches low, nose to the ground, pushing gently through thick green leafy brush ' +
			'and ferns. Dappled sunlight filters down. Just ahead in a little hollow, the piglet ' +
			'sits on the mossy ground looking surprised and a little guilty, cheeks still smeared ' +
			'with strawberry juice, tiny eyes wide. Chase\'s face brightens in delighted ' +
			'recognition.',
	},
	{
		page: 8,
		text:
			'"come back, little pig," said chase. "do not eat the strawberries."\n\n' +
			'the pig looked sad. "i like strawberries," said the pig.',
		characters: ['chase', 'piglet'],
		prompt:
			'Chase sits on the mossy forest floor at the piglet\'s level, speaking gently to it, ' +
			'one paw extended kindly. The piglet hangs its head, bottom lip quivering, big ' +
			'glistening eyes looking up sadly at Chase. Soft dappled sunlight, ferns around them, ' +
			'a single dropped strawberry on the ground between them. Tender, understanding mood.',
	},
	{
		page: 9,
		text:
			'"we have lots of strawberries," said chase. "come with us to the farm."\n\n' +
			'the pig and chase went back. the big dogs had a lot of strawberries in a sack.',
		characters: ['chase', 'piglet', 'marshall', 'skye', 'rubble', 'rocky', 'zuma'],
		prompt:
			'Chase and the piglet walk side-by-side back through the strawberry rows, both smiling, ' +
			'the piglet trotting happily beside Chase. Ahead of them, Marshall, Skye, Rubble, ' +
			'Rocky, and Zuma are carrying a big open burlap sack bulging with freshly-picked ' +
			'bright red strawberries, grinning proudly. Sunny afternoon, blue sky, red barn in the ' +
			'distance.',
	},
	{
		page: 10,
		text:
			'the girl made jam. she gave jam to chase and the big dogs.\n\n' +
			'the little pig had jam. it was a fun day!',
		characters: [
			'farmer-girl', 'chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma', 'piglet',
		],
		prompt:
			'A cheerful happy-ending scene at a big wooden picnic table in front of the red barn. ' +
			'The farmer girl stands at the table spooning glossy red strawberry jam from a big pot ' +
			'into little bowls for each pup. Chase, Marshall, Skye, Rubble, Rocky, and Zuma sit in ' +
			'a row at the table, each with a little wooden spoon, tails wagging. The piglet sits ' +
			'beside them with its own tiny bowl of jam, beaming with delight. Warm golden ' +
			'late-afternoon light, strawberry plants and the sunny farm behind them.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Paw Patrol',
	style: STYLE_PAW_PATROL,
	characters: [
		CHAR_CHASE, CHAR_MARSHALL, CHAR_SKYE, CHAR_RUBBLE, CHAR_ROCKY, CHAR_ZUMA,
		CHAR_FARMER_GIRL, CHAR_PIGLET,
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
