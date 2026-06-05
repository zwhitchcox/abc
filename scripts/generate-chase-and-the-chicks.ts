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
	CHAR_RYDER,
	CHAR_HATTIE_HEN,
	CHAR_CHICK,
} from './lib/characters'

const TITLE = 'Chase and the Little Lost Chicks'
const FOLDER = 'Chase-and-the-Little-Lost-Chicks'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma', 'hattie-hen', 'chick'],
		prompt:
			'Book cover: Chase sits proudly, the rest of the team grouped behind him. In the ' +
			'background, Hattie the hen stands by a red barn looking worried, and six tiny yellow ' +
			'chicks peek from behind her. Sunny sky, rolling green hills, friendly composition. ' +
			'Leave a clear sky-area at the top for a title.',
	},
	{
		page: 2,
		text:
			'It was a sunny day at the farm. Ryder and the pups were having fun.\n\n' +
			'Chase sat on a rock. Rubble had a lot of sand. Skye went up and back down.',
		characters: ['ryder', 'chase', 'rubble', 'skye'],
		prompt:
			'Ryder stands in front of a big red barn smiling. Chase sits on a small gray rock. ' +
			'Rubble plays next to a pile of golden sand with a toy shovel. Skye hovers in the air ' +
			'above them with her propeller spinning. Green grass, blue sky, white fence.',
	},
	{
		page: 3,
		text:
			'Then Hattie the hen ran up. She had a sad, sad cluck.\n\n' +
			'"My little chicks are gone!" said Hattie. "Ryder, will you help me get them back?"',
		characters: ['ryder', 'chase', 'hattie-hen'],
		prompt:
			'Hattie runs up to Ryder on the farm, wings up in alarm, sad worried face. Chase stands ' +
			'next to Ryder tilting his head in concern. An empty wooden chicken coop with an open ' +
			'door is visible behind Hattie, a few feathers floating in the air.',
	},
	{
		page: 4,
		text:
			'"No chick is too little, and no job is too big!" said Ryder.\n\n' +
			'Chase put his nose to the path. He said, "I can see little chick feet! This way!"',
		characters: ['chase', 'ryder'],
		prompt:
			'Chase crouched low with his nose right against a dirt path, sniffing intently. Tiny ' +
			'yellow chick footprints lead across the farmyard toward a gate. Ryder stands behind ' +
			'him, pointing forward with a determined smile.',
	},
	{
		page: 5,
		text:
			'The tracks went to the park. Rubble came to help dig.\n\n' +
			'Rubble dug in the sand. "Got one!" said Rubble. A little chick sat in an old pot.',
		characters: ['rubble', 'chase', 'chick'],
		prompt:
			'Rubble in a sunny park using his yellow construction scoop to dig in a sandbox. He ' +
			'holds up one happy yellow chick sitting inside a small terracotta flowerpot. Chase ' +
			'watches with a proud smile. Green park trees in the background, a blue park bench.',
	},
	{
		page: 6,
		text:
			'Skye went up in the sky. She saw the pond.\n\n' +
			'"Two chicks!" said Skye. "They are on a leaf in the pond."',
		characters: ['skye', 'chick'],
		prompt:
			'Skye flying high above a small round pond, pointing downward with one paw. Below her ' +
			'on the pond, two tiny yellow chicks sit together on a big green lily pad, floating. ' +
			'Green reeds around the pond, trees in the distance, sunny afternoon.',
	},
	{
		page: 7,
		text:
			'"Zuma, can you get them?" said Ryder.\n\n' +
			'Zuma went — splash! — into the pond. He got the two little chicks and gave them a big hug.',
		characters: ['zuma', 'skye', 'chick'],
		prompt:
			'Zuma mid-splash jumping into a blue pond, water spraying up around him. He gently ' +
			'scoops two tiny yellow chicks into his paws, smiling widely. The lily pad floats nearby. ' +
			'Sunlight sparkles on the water. Skye hovers above watching with a happy grin.',
	},
	{
		page: 8,
		text:
			'Then Marshall ran up. "I see one!" he said.\n\n' +
			'A little chick was stuck in the mud. Marshall gave it a quick rinse with his hose. That chick was happy!',
		characters: ['marshall', 'chick'],
		prompt:
			'Marshall aiming a fire hose gently at a small muddy yellow chick stuck in a brown mud ' +
			'puddle. A soft spray of water cleans the chick, whose fluffy yellow feathers are ' +
			'becoming bright again. Marshall smiles kindly. Green grass around the puddle.',
	},
	{
		page: 9,
		text:
			'"One more chick to find," said Ryder. Rocky went to a pile of old socks and rags.\n\n' +
			'He gave a big tug. The last little chick hopped out! "Got it!" said Rocky.',
		characters: ['rocky', 'ryder', 'chick'],
		prompt:
			'Rocky pulling a rope at a messy little recycling pile made of old brown socks, red ' +
			'rags, and a cardboard box. A tiny surprised yellow chick pops out of the pile mid-hop, ' +
			'small feathers flying. Rocky grins triumphantly. Ryder kneels nearby with a wide smile.',
	},
	{
		page: 10,
		text:
			'Back at the farm, Hattie got all six chicks back. She gave each pup a little peck on the nose.\n\n' +
			'"We did it!" said Chase. The pups cheered. The chicks ran to their mom, safe and happy at home.',
		characters: [
			'chase', 'marshall', 'skye', 'rubble', 'rocky', 'zuma', 'ryder', 'hattie-hen', 'chick',
		],
		prompt:
			'A joyful reunion scene at the red barn. Hattie stands in the centre with six tiny ' +
			'yellow chicks gathered happily at her feet. Around her, all six pups and Ryder cheer ' +
			'with paws and arms raised. Confetti floats in the air, warm golden-hour sunlight, ' +
			'rolling green hills in the background.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Paw Patrol',
	style: STYLE_PAW_PATROL,
	characters: [
		CHAR_CHASE, CHAR_MARSHALL, CHAR_SKYE, CHAR_RUBBLE, CHAR_ROCKY, CHAR_ZUMA,
		CHAR_RYDER, CHAR_HATTIE_HEN, CHAR_CHICK,
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
