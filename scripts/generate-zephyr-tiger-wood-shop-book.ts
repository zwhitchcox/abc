import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_ZEPHYR_TIGER,
	CHAR_AUGGIE_TIGER,
	CHAR_MOMMY_TIGER,
	CHAR_DADDY_TIGER,
} from './lib/characters'

const TITLE = 'zephyr tiger and the wood shop'
const FOLDER = 'Zephyr-Tiger-and-the-Wood-Shop'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Book cover. Draw exactly four tigers, all fully visible and separate, with these ' +
			'exact roles: Daddy Tiger is on the far right, the largest tiger, with no flower, ' +
			'standing and holding a board. Mommy Tiger is on the far left, smaller than Daddy, ' +
			'with her white flower behind one ear, sitting beside Auggie. Zephyr Tiger stands in ' +
			'the center, bigger than Auggie but smaller than Mommy and Daddy. Auggie Tiger sits ' +
			'in front as the smallest baby tiger. Do not replace Daddy with another cub. Do not ' +
			'omit Daddy. They are in a warm, safe, cozy woodworking shop with a smooth wooden ' +
			'floor, a small plank, a board, a log, and a friendly covered woodworking machine in ' +
			'the background. No active blades, no danger, no scary tools. Leave a clear wall area ' +
			'at the top for a title (do not draw any text).',
	},
	{
		page: 2,
		text:
			'this is zephyr tiger. he is in the shop.\n\n' +
			'mommy had auggie. daddy had wood.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. Zephyr stands in a warm ' +
			'woodworking shop looking curious. Mommy holds Auggie safely. Daddy holds a small ' +
			'piece of wood. The shop is tidy, cozy, and child-safe, with a wooden floor.',
	},
	{
		page: 3,
		text:
			'daddy had a tree. he had a log. he had saws.\n\n' +
			'the saws cut the log.',
		characters: ['zephyr-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Daddy ' +
			'Tiger shows Zephyr a log and several safe, non-sharp toy-like saws resting on a ' +
			'workbench. Show the log already cut into two pieces, with no active cutting and no ' +
			'danger. Warm cozy woodworking shop, soft sawdust, gentle storybook mood.',
	},
	{
		page: 4,
		text:
			'the machine saws wood. it can cut.\n\n' +
			'zephyr did not go near it.',
		characters: ['zephyr-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. A friendly ' +
			'covered woodworking machine sits far in the background with a piece of wood near ' +
			'it; no exposed blade, no motion, no danger. Daddy stands between Zephyr and the ' +
			'machine, calmly teaching safety. Zephyr stands far away and looks at it with care. ' +
			'Warm tidy shop.',
	},
	{
		page: 5,
		text:
			'the log made a plank. the plank was a board.\n\n' +
			'the board was on the floor.',
		characters: ['zephyr-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Daddy ' +
			'Tiger kneels beside Zephyr and shows him how a log becomes a plank, and the plank ' +
			'is now a board lying on the wooden floor. Include a small round log piece nearby ' +
			'and one flat board on the floor. Cozy safe woodworking shop.',
	},
	{
		page: 6,
		text:
			'the board was jagged. it was not smooth.\n\n' +
			'daddy made it smooth.',
		characters: ['zephyr-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Show a ' +
			'board with one jagged edge beside a second smooth board edge, presented safely on a ' +
			'workbench. Daddy gently sands the board with a soft sanding block while Zephyr ' +
			'watches. No sharp tools, no danger, warm cozy shop.',
	},
	{
		page: 7,
		text:
			'mommy had a shim. the shim went under the board.\n\n' +
			'now the board did not rock.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. Mommy slides a small ' +
			'wooden shim under one end of a board on the floor so it sits flat. Zephyr watches ' +
			'closely. Auggie sits safely with Daddy. Cozy shop, clear view of the shim.',
	},
	{
		page: 8,
		text:
			'the floor was wood. it was a wooden floor.\n\n' +
			'zephyr sat on the smooth board.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger'],
		prompt:
			'Draw exactly three tigers, all fully visible: Zephyr Tiger, Auggie Tiger, and Mommy ' +
			'Tiger. Mommy Tiger keeps her white flower and same round cuddly body. Zephyr sits ' +
			'on a smooth board on a warm wooden floor. Auggie sits safely beside Mommy on a soft ' +
			'blanket. The wood grain of the floor is visible and friendly, cozy shop mood.',
	},
	{
		page: 9,
		text:
			'auggie sat with mommy. zephyr had a board.\n\n' +
			'daddy said, "it is smooth."',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. Zephyr proudly holds a ' +
			'small smooth board. Daddy smiles and points to the smooth edge. Mommy sits nearby ' +
			'with Auggie safely in her lap. Warm cozy woodworking shop.',
	},
	{
		page: 10,
		text:
			'then they went home. zephyr had a smooth board.\n\n' +
			'he went to sleep with a smile.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. Cozy bedtime scene at ' +
			'home after the wood shop. Zephyr sleeps peacefully with a small smooth board nearby ' +
			'as a keepsake. Mommy and Daddy sit lovingly nearby, and Auggie sleeps safely with ' +
			'a tiny wooden block. Warm lantern light, calm family den.',
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
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
	anchorOnCover: false,
}).catch(e => {
	console.error(e)
	process.exit(1)
})
