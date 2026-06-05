import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_YOUNG_HARRY,
	CHAR_COUSIN_DUDLEY,
	CHAR_MOTHER_DURSLEY,
	CHAR_FATHER_DURSLEY,
} from './lib/characters'

const TITLE = 'the big day'
const FOLDER = 'The-Big-Day'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['young-harry'],
		prompt:
			'Book cover. A small young boy in a slightly-too-big pale-grey jumper sits quietly on ' +
			'a sunny suburban garden path, holding a tiny grey moth in his cupped hands and looking ' +
			'at it with a gentle peaceful smile. A small tidy hedge and a red front door behind him, ' +
			'soft afternoon light, a few wildflowers. Leave a clear sky-area at the top for a title.',
	},
	{
		page: 2,
		text:
			'this is harry. he lives with his aunt and uncle.\n\n' +
			'he has a cousin. his cousin is dudley.',
		characters: ['young-harry', 'cousin-dudley', 'mother-dursley', 'father-dursley'],
		prompt:
			'Inside a tidy suburban kitchen. Harry stands quietly on one side, hands folded. His ' +
			'cousin Dudley stands beside him, pouty. The aunt and the uncle sit at a wooden table ' +
			'in their morning robes. Soft warm lamp-light, a teapot on the table, a window with ' +
			'pale-blue dawn light outside. Cozy domestic family scene.',
	},
	{
		page: 3,
		text:
			'it is a big day! it is dudley\'s big day.\n\n' +
			'dudley is five. he jumps up and down.',
		characters: ['cousin-dudley', 'mother-dursley', 'father-dursley'],
		prompt:
			'Dudley jumps up and down in the middle of the living room with delight, both fists ' +
			'raised. The aunt and the uncle smile fondly at him. A round table behind them is ' +
			'piled with bright wrapped gifts in red and gold paper, and a chocolate cake with five ' +
			'small candles. Sunny morning light through the window.',
	},
	{
		page: 4,
		text:
			'dudley has lots of toys. he has ten big toys.\n\n' +
			'harry has a sock. inside is one little toy.',
		characters: ['young-harry', 'cousin-dudley'],
		prompt:
			'Two boys side by side on a soft blue rug. Dudley sits in the middle of a huge pile ' +
			'of bright new toys (a red car, a stuffed bear, a yellow truck, a wooden plane), ' +
			'arms wide, beaming. Harry sits to the side holding a single small grey-knitted sock ' +
			'with one tiny wooden mouse toy peeking out, looking at it gently with a small quiet ' +
			'smile, content with what he has. Warm lamp-lit living room.',
	},
	{
		page: 5,
		text:
			'"come, dudley," said his mother. "let\'s go to the zoo."\n\n' +
			'they went in the car. harry came with them.',
		characters: ['young-harry', 'cousin-dudley', 'mother-dursley', 'father-dursley'],
		prompt:
			'A small pale-blue family car parked in a suburban driveway. The uncle stands by the ' +
			'open driver door, the aunt holds Dudley\'s hand, Harry stands quietly at the back ' +
			'door looking up. Sunny morning, a tidy hedge and the red front door of the home ' +
			'behind them. Bright cheerful suburban scene.',
	},
	{
		page: 6,
		text:
			'they went to the zoo. dudley looked at the big cats.\n\n' +
			'harry looked at a little bug on a leaf.',
		characters: ['young-harry', 'cousin-dudley'],
		prompt:
			'A sunny zoo path on a warm afternoon. In the background, Dudley stands on his ' +
			'tiptoes pressing his nose against a glass enclosure, watching a sleepy big cat ' +
			'(a soft tawny lion-like creature, drawn cute and cozy) napping behind the glass. ' +
			'In the foreground, Harry crouches beside a little flowering bush, peering with ' +
			'gentle wonder at a tiny grey moth resting on a green leaf.',
	},
	{
		page: 7,
		text:
			'the bug looked back at harry. it did a little hop.\n\n' +
			'"hi, little bug," said harry. he had a smile.',
		characters: ['young-harry'],
		prompt:
			'Close-up: Harry kneeling on the grass with both hands cupped open. A tiny grey moth ' +
			'has hopped onto his fingertip, fluttering one wing. Harry beams down at it with the ' +
			'softest, most gentle smile. Soft dappled afternoon light, blurred green leaves and ' +
			'tiny pink wildflowers in the background.',
	},
	{
		page: 8,
		text:
			'then dudley ran up. "look at that!" he yelled.\n\n' +
			'the bug went up. it went away into the sun.',
		characters: ['young-harry', 'cousin-dudley'],
		prompt:
			'Dudley dashes up from behind, mouth open wide pointing past Harry. The little grey ' +
			'moth flutters up and away into a beam of warm afternoon sun. Harry watches it go ' +
			'with peaceful eyes and a small wave goodbye. Sunny zoo path with a wooden bench.',
	},
	{
		page: 9,
		text:
			'they all went home in the car. dudley was sleeping.\n\n' +
			'harry looked out at the moon. he had a little smile.',
		characters: ['young-harry', 'cousin-dudley'],
		prompt:
			'Inside the family car on the way home, dusk falling outside. Dudley is fast asleep ' +
			'against the window, mouth open, a stuffed bear on his lap. Harry sits beside him ' +
			'gently looking out the other window at a soft full moon rising over distant rooftops. ' +
			'Warm dusk-blue evening light, small stars above. Tender quiet mood.',
	},
	{
		page: 10,
		text:
			'harry went to bed. he had his little toy.\n\n' +
			'it was a fun day. he went to sleep with a smile.',
		characters: ['young-harry'],
		prompt:
			'A small cozy nighttime bedroom. Harry is tucked into a small bed under a soft warm ' +
			'blanket, the tiny wooden mouse toy held gently in one hand against his cheek. He is ' +
			'fast asleep with a peaceful smile, soft moonlight pooling on his pillow through the ' +
			'window. A small lamp glows warmly on the bedside. Tender, restful, heartwarming.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Harry Potter',
	chapter: 2,
	chapterTitle: 'Chapter 2: The Vanishing Glass',
	style: STYLE_COZY_WATERCOLOUR,
	characters: [
		CHAR_YOUNG_HARRY,
		CHAR_COUSIN_DUDLEY,
		CHAR_MOTHER_DURSLEY,
		CHAR_FATHER_DURSLEY,
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
	imageModel: 'gpt-image-2',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
