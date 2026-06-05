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
	CHAR_RACCOON,
} from './lib/characters'

const TITLE = 'rocky and the big trash day'
const FOLDER = 'Rocky-and-the-Big-Trash-Day'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['rocky', 'raccoon'],
		prompt:
			'A warm inviting book-cover illustration. In the foreground, Rocky is cheerfully ' +
			'dragging a full brown burlap sack of recyclables behind him along a sunny street, his ' +
			'tongue out happily. Beside him on the curb sits a neat row of three metal trash cans ' +
			'with lids slightly askew. A little raccoon peeks shyly out from behind one of the cans, ' +
			'tail curled around its feet. In the background, a tidy suburban street with little ' +
			'houses, neatly trimmed hedges, blue sky with fluffy white clouds. Leave a clear ' +
			'sky-area at the top for a title.',
	},
	{
		page: 2,
		text:
			'this is rocky. he is a little dog with a hat.\n\n' +
			'rocky likes to take trash to a big sack. he likes to save old rocks and rags.',
		characters: ['rocky'],
		prompt:
			'Rocky sitting cheerfully on a patch of green grass beside a tidy workshop area at ' +
			'the pups\' home base, with a big brown burlap sack beside him overflowing with a ' +
			'friendly collection of recycled odds-and-ends (some smooth stones, a rolled-up old ' +
			'red rag, a few bottle caps, a wooden plank). A small sorting bench behind him with ' +
			'little bins. Warm sunny afternoon, sky dotted with puffy clouds.',
	},
	{
		page: 3,
		text:
			'it is a hot day. ryder came up to the dogs.\n\n' +
			'"dogs, it is trash day!" said ryder. "we have lots of old cans to take away."',
		characters: ['ryder', 'rocky', 'chase', 'zuma', 'marshall', 'skye', 'rubble'],
		prompt:
			'Ryder standing in a sunny grassy yard holding a small checklist in one hand, cheerfully ' +
			'speaking to Rocky, Chase, Zuma, Marshall, Skye, and Rubble who are all sitting in a ' +
			'semicircle in front of him, ears perked and attentive. Behind Ryder a big bulletin ' +
			'board shows a recycling symbol and a little drawing of a trash can. Warm afternoon ' +
			'light.',
	},
	{
		page: 4,
		text:
			'the dogs ran to the road. big cans sat on the side of the road.\n\n' +
			'"we can do it!" said chase. "let\'s go, dogs!"',
		characters: ['chase', 'rocky'],
		prompt:
			'A cheerful wide view of a sunny suburban street. A row of four big friendly round bins ' +
			'with lids sits on the curb. Chase stands in front with one paw raised cheerfully, and ' +
			'Rocky trots eagerly toward the bins with a wide smile, tail wagging. Blue sky, puffy ' +
			'clouds, little pastel houses in the background. Warm happy storybook mood.',
	},
	{
		page: 5,
		text:
			'rocky had the cans. zuma had the cans. chase had the cans.\n\n' +
			'but — look! the trash was on the road!',
		characters: ['rocky', 'zuma', 'chase'],
		prompt:
			'Rocky, Zuma, and Chase each holding a metal trash can in their paws, about to carry ' +
			'them away. But in front of them, one tipped-over metal trash can lies on its side in ' +
			'the middle of the street with wrappers, banana peels, and bits of paper scattered ' +
			'across the pavement. The three pups look wide-eyed and surprised. Sunny street, ' +
			'afternoon light.',
	},
	{
		page: 6,
		text:
			'"that was not us," said chase.\n\n' +
			'rocky looked into the brush. here was a little raccoon!',
		characters: ['chase', 'rocky', 'raccoon'],
		prompt:
			'Chase stands beside a tipped-over metal trash can, shaking his head with a firm but ' +
			'kind expression. Nearby, Rocky is crouching by a thick patch of green leafy brush at ' +
			'the edge of the sidewalk, peering in curiously. Peeking out between the leaves is the ' +
			'raccoon, wide dark eyes shining, tiny paws clutching an apple core. Dappled sunlight.',
	},
	{
		page: 7,
		text:
			'the raccoon had a lot of trash. he had ham. he had a bit of meat.\n\n' +
			'"i am sad," said the raccoon. "i am hunting for meat. i have no home."',
		characters: ['raccoon', 'rocky'],
		prompt:
			'The raccoon sitting on the grass beside the tipped trash can, surrounded by little ' +
			'bits of scavenged food — a small slice of pink ham, a curled bit of meat, a few ' +
			'crumpled wrappers. The raccoon hangs its head sadly, bottom lip quivering, a single ' +
			'tear in one eye. Rocky kneels down to listen kindly. Soft afternoon light, a few ' +
			'fallen leaves on the ground.',
	},
	{
		page: 8,
		text:
			'"do not be sad," said rocky. "we have lots of ham for you."\n\n' +
			'rocky gave the raccoon a big dish of ham and meat.',
		characters: ['rocky', 'raccoon', 'chase', 'marshall', 'skye', 'rubble', 'zuma'],
		prompt:
			'Rocky setting down a big round blue dish piled with fresh pink ham slices and little ' +
			'chunks of meat in front of the raccoon, who is looking up with grateful wide eyes and ' +
			'a tiny happy smile, tiny paws pressed to its chest. Behind them the other pups watch ' +
			'approvingly. Sunny sidewalk, warm golden afternoon light, a little flowering bush ' +
			'beside them.',
	},
	{
		page: 9,
		text:
			'the raccoon ate and ate. "let\'s go!" he said.\n\n' +
			'the raccoon and rocky ran to the big sack. they can fill it up!',
		characters: ['raccoon', 'rocky'],
		prompt:
			'A joyful teamwork scene. The raccoon and Rocky trot side-by-side down the sunny ' +
			'suburban sidewalk, each carrying a small bundle of tidied trash in their paws. Behind ' +
			'them on the curb, a big open brown burlap sack sits ready to be filled, already half ' +
			'full of neatly collected bottles, papers, and cans. Both characters smile widely, ' +
			'tails up, moving in cheerful step. Bright sunny street, blue sky with puffy clouds.',
	},
	{
		page: 10,
		text:
			'the dogs had a fun day. the road had no more trash.\n\n' +
			'the raccoon had a home with the dogs. they had a big hug.',
		characters: [
			'rocky', 'raccoon', 'chase', 'zuma', 'marshall', 'skye', 'rubble', 'ryder',
		],
		prompt:
			'A warm happy-ending scene at the pups\' home base in the late-afternoon golden light. ' +
			'Rocky is sharing a big warm hug with the raccoon, both beaming. Chase, Zuma, Marshall, ' +
			'Skye, and Rubble gather around them cheering with paws raised. Ryder stands nearby ' +
			'smiling proudly. A big tidied burlap sack of collected recycling sits beside them. ' +
			'The street in the background is perfectly clean, green lawns, blue sky, cozy ' +
			'heartwarming mood.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Paw Patrol',
	style: STYLE_PAW_PATROL,
	characters: [
		CHAR_CHASE, CHAR_MARSHALL, CHAR_SKYE, CHAR_RUBBLE, CHAR_ROCKY, CHAR_ZUMA,
		CHAR_RYDER, CHAR_RACCOON,
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
