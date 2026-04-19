import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'

const TITLE = 'Chase and the Little Lost Chicks'
const FOLDER = 'Chase-and-the-Little-Lost-Chicks'

const STYLE_SUFFIX =
	' Bright, cheerful cartoon illustration in the style of a children\'s picture book, ' +
	'colorful, simple shapes, clean composition, no text, no words, no letters, no speech bubbles.'

// Consistent character descriptions so every page looks like the same team.
const CHASE =
	'a friendly cartoon German Shepherd puppy wearing a blue police officer uniform, a blue police cap, and a small blue backpack'
const MARSHALL =
	'a cheerful cartoon Dalmatian puppy with red ears, wearing red firefighter gear and a red fire helmet'
const SKYE =
	'a cute cartoon cream-colored cockapoo puppy girl with a pink hair tuft, wearing pink flight goggles and a purple flight suit with small wings and a pink propeller pack'
const RUBBLE =
	'a happy cartoon tan English Bulldog puppy wearing a yellow construction hardhat and a tool belt'
const ROCKY =
	'a clever cartoon gray-and-white mixed-breed puppy wearing a green recycling vest and a small green cap'
const ZUMA =
	'a cheerful cartoon chocolate Labrador puppy wearing orange water-rescue gear, an orange helmet, and flippers'
const RYDER =
	'a kind cartoon boy about 10 years old with short brown hair, wearing a red and blue vest over a dark blue shirt and jeans'
const HATTIE = 'a plump worried brown mother hen with white-tipped feathers'
const CHICK = 'a tiny fluffy yellow baby chick with big round eyes'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '', // cover
		prompt:
			`Book cover for a children's rescue book. Foreground: ${CHASE} sitting proudly, with the rest of the team ` +
			`(${MARSHALL}, ${SKYE}, ${RUBBLE}, ${ROCKY}, and ${ZUMA}) grouped behind him. In the background, ` +
			`${HATTIE} stands by a red barn looking worried, and six tiny yellow chicks peek from behind her. ` +
			'Sunny sky, rolling green hills, friendly and inviting.' +
			STYLE_SUFFIX,
	},
	{
		page: 2,
		text:
			'It was a sunny day at the farm. Ryder and the pups were having fun.\n\n' +
			'Chase sat on a rock. Rubble had a lot of sand. Skye went up and back down.',
		prompt:
			`${RYDER} standing in front of a big red barn on a sunny day, smiling. ` +
			`${CHASE} sits on a small gray rock. ${RUBBLE} plays next to a small pile of golden sand with a toy shovel. ` +
			`${SKYE} hovers in the air above them with her pink propeller spinning. Green grass, blue sky, white fence.` +
			STYLE_SUFFIX,
	},
	{
		page: 3,
		text:
			'Then Hattie the hen ran up. She had a sad, sad cluck.\n\n' +
			'"My little chicks are gone!" said Hattie. "Ryder, will you help me get them back?"',
		prompt:
			`${HATTIE} running up to ${RYDER} on the farm, wings up in alarm, with a very sad and worried face. ` +
			`${CHASE} stands next to Ryder, tilting his head with concern. An empty wooden chicken coop with an open door ` +
			'is visible behind Hattie, feathers floating in the air.' +
			STYLE_SUFFIX,
	},
	{
		page: 4,
		text:
			'"No chick is too little, and no job is too big!" said Ryder.\n\n' +
			'Chase put his nose to the path. He said, "I can see little chick feet! This way!"',
		prompt:
			`${CHASE} crouched low with his nose right against a dirt path, sniffing intently. Tiny yellow chick footprints ` +
			'lead from the chicken coop across the farmyard toward a gate. ' +
			`${RYDER} stands behind Chase, pointing forward with a determined smile. A magnifying glass icon effect near Chase's nose.` +
			STYLE_SUFFIX,
	},
	{
		page: 5,
		text:
			'The tracks went to the park. Rubble came to help dig.\n\n' +
			'Rubble dug in the sand. "Got one!" said Rubble. A little chick sat in an old pot.',
		prompt:
			`${RUBBLE} in a sunny park, using his yellow construction scoop to dig in a sandbox. He holds up one happy ` +
			`${CHICK} sitting inside a small terracotta flowerpot. ${CHASE} watches with a proud smile. ` +
			'Green park trees, a blue park bench in the background.' +
			STYLE_SUFFIX,
	},
	{
		page: 6,
		text:
			'Skye went up in the sky. She saw the pond.\n\n' +
			'"Two chicks!" said Skye. "They are on a leaf in the pond."',
		prompt:
			`${SKYE} flying high above a small round pond, pink goggles on, pointing downward with one paw. ` +
			`Below her on the pond, two tiny ${CHICK}s sit together on a big green lily pad, floating. ` +
			'Green reeds around the pond, trees in the distance, sunny afternoon.' +
			STYLE_SUFFIX,
	},
	{
		page: 7,
		text:
			'"Zuma, can you get them?" said Ryder.\n\n' +
			'Zuma went — splash! — into the pond. He got the two little chicks and gave them a big hug.',
		prompt:
			`${ZUMA} mid-splash jumping into a blue pond, water spraying up around him. He gently scoops two tiny yellow ` +
			'chicks into his paws, smiling widely. The lily pad floats nearby. Sunlight sparkles on the water. ' +
			`${SKYE} hovers above watching with a happy grin.` +
			STYLE_SUFFIX,
	},
	{
		page: 8,
		text:
			'Then Marshall ran up. "I see one!" he said.\n\n' +
			'A little chick was stuck in the mud. Marshall gave it a quick rinse with his hose. That chick was happy!',
		prompt:
			`${MARSHALL} aiming a fire hose gently at a small muddy ${CHICK} stuck in a brown mud puddle. ` +
			'A soft spray of water cleans the chick, whose fluffy yellow feathers are becoming bright again. ' +
			'Marshall is smiling kindly. Green grass around the puddle.' +
			STYLE_SUFFIX,
	},
	{
		page: 9,
		text:
			'"One more chick to find," said Ryder. Rocky went to a pile of old socks and rags.\n\n' +
			'He gave a big tug. The last little chick hopped out! "Got it!" said Rocky.',
		prompt:
			`${ROCKY} pulling a rope at a messy little recycling pile made of old brown socks, red rags, and a cardboard box. ` +
			`A tiny surprised ${CHICK} pops out of the pile mid-hop, small feathers flying. Rocky grins triumphantly. ` +
			`${RYDER} kneels nearby with a wide smile.` +
			STYLE_SUFFIX,
	},
	{
		page: 10,
		text:
			'Back at the farm, Hattie got all six chicks back. She gave each pup a little peck on the nose.\n\n' +
			'"We did it!" said Chase. The pups cheered. The chicks ran to their mom, safe and happy at home.',
		prompt:
			`A joyful reunion scene at the red barn. ${HATTIE} stands in the center with six tiny yellow chicks gathered ` +
			'happily at her feet. ' +
			`Around her, all six pups (${CHASE}, ${MARSHALL}, ${SKYE}, ${RUBBLE}, ${ROCKY}, ${ZUMA}) and ${RYDER} ` +
			'cheer with their paws and arms raised. Confetti floats in the air, warm golden-hour sunlight, ' +
			'rolling green hills in the background.' +
			STYLE_SUFFIX,
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
