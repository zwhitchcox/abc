import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_ZEPHYR_TIGER,
	CHAR_AUGGIE_TIGER,
	CHAR_MOMMY_TIGER,
	CHAR_DADDY_TIGER,
	CHAR_LITTLE_DUCK,
} from './lib/characters'

const TITLE = 'zephyr tiger and the little red toy'
const FOLDER = 'Zephyr-Tiger-and-the-Little-Red-Toy'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Book cover. Zephyr stands proudly smiling. Auggie hugs a small round red toy beside him. ' +
			'Mommy and Daddy sit close behind them. A sunny grassy hillside with wildflowers, a big ' +
			'friendly tree to one side, warm golden afternoon light. Inviting family composition. ' +
			'Leave a clear sky-area at the top for a title (do not draw any text).',
	},
	{
		page: 2,
		text:
			'this is zephyr tiger. he is a big tiger boy.\n\n' +
			'he lives with mommy, daddy, and his little brother auggie.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'A cozy family portrait. Zephyr stands in the middle, grinning. Mommy sits on one side, ' +
			'Daddy on the other, and Auggie peeks out between them. Warm sunlight, a grassy hillside, ' +
			'a small cozy den opening behind them, a few wildflowers at their feet.',
	},
	{
		page: 3,
		text:
			'auggie has a red toy. he likes it a lot. he has it with him.\n\n' +
			'"come, auggie!" said zephyr. "let\'s go!"',
		characters: ['zephyr-tiger', 'auggie-tiger'],
		prompt:
			'Auggie sits on soft grass holding a small round red toy tight with both paws, nuzzling ' +
			'it against his cheek, smiling. Zephyr stands nearby with one paw outstretched, ' +
			'beckoning his little brother with a happy encouraging look. Sunny meadow around them.',
	},
	{
		page: 4,
		text:
			'they went to the big tree. auggie had his toy.\n\n' +
			'then the toy went into the brush. auggie was sad.',
		characters: ['zephyr-tiger', 'auggie-tiger'],
		prompt:
			'Zephyr and Auggie stand at the base of a big friendly oak tree. A small round red toy ' +
			'is rolling away from Auggie into a thick patch of green brush and ferns. Auggie\'s face ' +
			'is scrunched with worry, a tiny tear welling in one eye, paws reaching out. Dappled ' +
			'sunlight, warm afternoon.',
	},
	{
		page: 5,
		text:
			'"do not be sad, auggie," said zephyr. "i can find it. i am a big brother."\n\n' +
			'zephyr went into the brush. he looked and looked.',
		characters: ['zephyr-tiger', 'auggie-tiger'],
		prompt:
			'Zephyr kneels down and gently pats Auggie\'s shoulder with a kind, confident smile. ' +
			'In a second vignette behind them, Zephyr is wading into a thick patch of green brush, ' +
			'peering carefully between the leaves. Warm afternoon light filters through the trees.',
	},
	{
		page: 6,
		text:
			'a little duck came up. "i can see the toy!" said the duck.\n\n' +
			'"it is under that big rock."',
		characters: ['zephyr-tiger', 'little-duck'],
		prompt:
			'A little yellow duckling waddles up to Zephyr in the middle of a brushy forest ' +
			'clearing, pointing one wing toward a large grey mossy rock nearby. Tucked just barely ' +
			'visible under the rock is a small round red toy. Zephyr crouches and listens with ' +
			'wide hopeful eyes. Dappled light, ferns, wildflowers.',
	},
	{
		page: 7,
		text:
			'zephyr looked under the rock. here was the red toy!\n\n' +
			'"i have it!" said zephyr. "let\'s take it to auggie."',
		characters: ['zephyr-tiger', 'little-duck'],
		prompt:
			'Zephyr leans down and reaches a paw under a big grey rock, triumphantly pulling out ' +
			'the small round red toy with a huge delighted grin. The duckling stands beside him ' +
			'cheering, wings raised. Soft mossy clearing, sun streaming through the trees.',
	},
	{
		page: 8,
		text:
			'zephyr ran back with the toy. auggie jumped up and down.\n\n' +
			'"zephyr! you have it!" auggie gave his big brother a hug.',
		characters: ['zephyr-tiger', 'auggie-tiger'],
		prompt:
			'Zephyr runs into a sunny grassy meadow holding up the small round red toy. Auggie is ' +
			'jumping joyfully in the air with both paws raised, mouth open in a big happy gasp. ' +
			'Both brothers are smiling wide. Warm afternoon, wildflowers around them.',
	},
	{
		page: 9,
		text:
			'mommy and daddy came over. "zephyr, we love you!" said mommy.\n\n' +
			'daddy gave zephyr a big hug.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Mommy and Daddy walk warmly into the sunny meadow. Mommy smiles with hands clasped ' +
			'over her heart. Daddy wraps his big arms around Zephyr in a huge warm hug, lifting ' +
			'him slightly off the ground. Auggie hugs the red toy beside them. Golden-hour ' +
			'sunlight, wildflowers, peaceful family moment.',
	},
	{
		page: 10,
		text:
			'then they went home. auggie had his toy.\n\n' +
			'zephyr had mommy and daddy. they went to sleep with a smile.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'A warm cozy nighttime scene inside a soft den under a grassy hillside. Zephyr is ' +
			'snuggled up sleeping between Mommy and Daddy on a big soft blanket. Auggie is curled ' +
			'up beside them hugging the small round red toy tight. Everyone wears a peaceful smile. ' +
			'A small warm lantern glows gently, stars twinkle through the den opening. ' +
			'Heartwarming, restful mood.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Tiger Stories',
	style: STYLE_COZY_WATERCOLOUR,
	characters: [
		CHAR_ZEPHYR_TIGER,
		CHAR_AUGGIE_TIGER,
		CHAR_MOMMY_TIGER,
		CHAR_DADDY_TIGER,
		CHAR_LITTLE_DUCK,
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
