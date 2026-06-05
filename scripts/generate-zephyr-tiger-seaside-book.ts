import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_ZEPHYR_TIGER,
	CHAR_AUGGIE_TIGER,
	CHAR_MOMMY_TIGER,
	CHAR_DADDY_TIGER,
} from './lib/characters'

const TITLE = 'zephyr tiger and the seaside shore'
const FOLDER = 'Zephyr-Tiger-and-the-Seaside-Shore'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Book cover. Draw exactly four tigers, all fully visible and separate: Zephyr Tiger, ' +
			'Auggie Tiger, Mommy Tiger, and Daddy Tiger. Mommy Tiger must have her white flower ' +
			'behind one ear and her same round cuddly body from the reference. Daddy Tiger must ' +
			'be the largest tiger with his same sturdy round body from the reference. Zephyr ' +
			'stands proudly smiling, and Auggie sits in front holding a small red beach toy. ' +
			'They are together on a sunny Seaside beach with gentle ocean waves, warm sand, a few ' +
			'shells, and a bright blue sky. Leave a clear sky-area at the top for a title (do ' +
			'not draw any text).',
	},
	{
		page: 2,
		text:
			'this is zephyr tiger. he is going to Seaside.\n\n' +
			'mommy had auggie. daddy went with them.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. The tiger family ' +
			'arrives at Seaside on a sunny morning. Place Zephyr Tiger on the left walking in ' +
			'front with a big excited smile. Place Mommy Tiger in the center carrying Auggie ' +
			'safely in her arms. Place Daddy Tiger on the far right, fully visible, largest, ' +
			'walking beside them while holding a soft beach bag. Ocean and sandy shore ahead, ' +
			'cheerful vacation feeling. Do not omit Daddy Tiger.',
	},
	{
		page: 3,
		text:
			'at Seaside, the sun was up. the sand was hot.\n\n' +
			'zephyr ran on the sand. auggie sat with mommy.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger'],
		prompt:
			'Draw exactly three tigers, all fully visible: Zephyr Tiger, Auggie Tiger, and Mommy ' +
			'Tiger. Mommy Tiger keeps her white flower and same round cuddly body. Zephyr runs ' +
			'happily across warm golden sand near the shoreline. The sun is bright overhead, ' +
			'small pawprints trail behind him, and gentle blue waves sparkle in the background. ' +
			'Auggie sits safely with Mommy on a beach blanket, watching Zephyr with a happy ' +
			'smile.',
	},
	{
		page: 4,
		text:
			'mommy had a bag. daddy had a big red toy.\n\n' +
			'"let\'s go to the shore," said mommy.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. Mommy Tiger smiles and ' +
			'gestures toward the water while holding a soft beach bag. Daddy Tiger holds a big ' +
			'red beach toy. Zephyr and Auggie look toward the shore with excited faces. Gentle ' +
			'waves roll in nearby, warm family beach scene.',
	},
	{
		page: 5,
		text:
			'the waves came in. the waves went back.\n\n' +
			'zephyr jumped. auggie had fun.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger'],
		prompt:
			'Draw exactly three tigers, all fully visible: Zephyr Tiger, Auggie Tiger, and Mommy ' +
			'Tiger. Mommy Tiger keeps her white flower and same round cuddly body. Zephyr jumps ' +
			'at the edge of the water as tiny waves wash in and pull back. Auggie sits safely on ' +
			'Mommy Tiger\'s lap just above the wet sand, laughing and watching the little ' +
			'splashes. Soft foam, blue water, sunny sand, playful but gentle mood.',
	},
	{
		page: 6,
		text:
			'daddy said, "we can swim." zephyr can swim with daddy.\n\n' +
			'auggie sat with mommy on the sand.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. Daddy Tiger stands in ' +
			'shallow calm water holding Zephyr safely as Zephyr practices a little swim with a ' +
			'proud smile. Nearby on the sand, Mommy Tiger sits with Auggie, who watches happily ' +
			'and claps. Warm, reassuring, very safe shallow beach water.',
	},
	{
		page: 7,
		text:
			'auggie had the red toy. then the toy went into the sand.\n\n' +
			'"i can find it," said zephyr.',
		characters: ['zephyr-tiger', 'auggie-tiger'],
		prompt:
			'Draw exactly two tigers, both fully visible: Zephyr Tiger and Auggie Tiger. Auggie ' +
			'sits on the beach looking worried because the small red toy is partly buried in ' +
			'soft sand near his feet. Zephyr kneels beside him with a kind confident smile, one ' +
			'paw gently pointing at the sand as if ready to help. Ocean behind them.',
	},
	{
		page: 8,
		text:
			'zephyr looked and looked. here was the red toy!\n\n' +
			'"i have it!" said zephyr.',
		characters: ['zephyr-tiger', 'auggie-tiger'],
		prompt:
			'Draw exactly two tigers, both fully visible: Zephyr Tiger and Auggie Tiger. Zephyr ' +
			'digs carefully in the sand with both paws and lifts up the small red beach toy with ' +
			'a triumphant smile. Auggie sits nearby and leans forward with huge delighted eyes. ' +
			'Little grains of sand fall from the toy, sunny shore and soft waves in the ' +
			'background.',
	},
	{
		page: 9,
		text:
			'auggie gave zephyr a hug. mommy gave zephyr a kiss.\n\n' +
			'daddy said, "big brother."',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. A warm family moment on ' +
			'the beach. Auggie hugs Zephyr around the middle, Mommy bends down to give Zephyr a ' +
			'gentle kiss on the head, and Daddy smiles proudly with one paw on Zephyr\'s ' +
			'shoulder. The red toy rests safely beside them in the sand.',
	},
	{
		page: 10,
		text:
			'then they went home. zephyr had sand on his feet.\n\n' +
			'he went to sleep with a smile.',
		characters: ['zephyr-tiger', 'auggie-tiger', 'mommy-tiger', 'daddy-tiger'],
		prompt:
			'Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy ' +
			'Tiger, and Daddy Tiger. Mommy Tiger keeps her white flower and same round cuddly ' +
			'body; Daddy Tiger keeps his same largest sturdy round body. A cozy bedtime scene ' +
			'after the beach trip. Zephyr sleeps peacefully on a soft blanket with a tiny bit of ' +
			'sand still on his feet and a happy smile. Mommy and Daddy sit nearby lovingly, ' +
			'Auggie sleeps curled up with the red toy. Warm lantern light, calm family den, ' +
			'memories of Seaside suggested by a small shell near the blanket.',
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
