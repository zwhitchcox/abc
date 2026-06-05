import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_YOUNG_HARRY,
	CHAR_COUSIN_DUDLEY,
	CHAR_MOTHER_DURSLEY,
	CHAR_FATHER_DURSLEY,
	CHAR_BIG_MAN,
	CHAR_SNOWY_OWL,
} from './lib/characters'

const TITLE = 'the letters'
const FOLDER = 'The-Letters'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['young-harry', 'snowy-owl'],
		prompt:
			'Book cover. A small young boy sits at a sunny suburban kitchen table holding a ' +
			'cream-coloured envelope addressed to him. A small plump snowy owl perches on the ' +
			'windowsill behind him, watching gently. Warm morning light, a teapot and toast on ' +
			'the table. Cozy curious mood. Leave a clear sky-area at the top for a title.',
	},
	{
		page: 2,
		text:
			'one day, a letter came for harry.\n\n' +
			'but his uncle had it. his uncle was mad.',
		characters: ['young-harry', 'father-dursley'],
		prompt:
			'Inside a sunny suburban kitchen. Harry stands holding up a cream-coloured envelope ' +
			'with his name on it, eyes wide and curious. The uncle reaches for it with a fussy ' +
			'cross expression, moustache bristling, ready to snatch it away. The aunt looks on ' +
			'from the side. Cozy domestic morning scene.',
	},
	{
		page: 3,
		text:
			'then more letters came. lots and lots of letters!\n\n' +
			'they came in under the door. they came down the chimney.',
		characters: ['young-harry', 'cousin-dudley'],
		prompt:
			'A whirlwind of dozens of cream-coloured envelopes pours through the front door ' +
			'mail-slot, slides under the door, and tumbles down the chimney into the living ' +
			'room. Harry stands in the middle of the room with mouth wide-open in delighted ' +
			'shock, arms up. Dudley sits on the floor beside him, eyes huge, half-buried in a ' +
			'pile of envelopes. Bright morning light, warm cozy chaos.',
	},
	{
		page: 4,
		text:
			'his uncle was mad. his uncle yelled.\n\n' +
			'"no more letters!" he said. "we will go away."',
		characters: ['father-dursley', 'mother-dursley', 'young-harry', 'cousin-dudley'],
		prompt:
			'The uncle stands in the centre of the living room red-faced and waving both arms, ' +
			'a single envelope crumpled in one fist, mouth open in a loud yell. The aunt stands ' +
			'behind him with a worried hand to her mouth. Harry and Dudley peek out from behind ' +
			'the sofa, wide-eyed. Envelopes are scattered all across the floor. Cozy comically-' +
			'flustered family scene.',
	},
	{
		page: 5,
		text:
			'they went in the car. they went far, far away.\n\n' +
			'harry looked out at the dark. he looked at the moon.',
		characters: ['young-harry', 'cousin-dudley', 'father-dursley', 'mother-dursley'],
		prompt:
			'Nighttime car interior scene, seen from inside the back seat of a small pale-blue ' +
			'family car. Draw exactly one Harry, seated safely inside the car by the left rear ' +
			'side window, looking out through the glass at a bright moon in the dark sky. Do not ' +
			'draw Harry outside the car. Do not draw a second Harry or any extra child who looks ' +
			'like Harry. Dudley is asleep on the other side of the back seat, clearly different ' +
			'from Harry. The father drives in the front seat, the mother sits in the front ' +
			'passenger seat. The car travels on a dark country road with soft headlight glow and ' +
			'moonlight through the window. Quiet wistful mood, soft cinematic lighting, no text.',
	},
	{
		page: 6,
		text:
			'they came to a little shack. it sat on a rock in the lake.\n\n' +
			'rain came down. it was dark and cold.',
		characters: [],
		prompt:
			'A tiny weather-beaten wooden shack stands alone on a small rocky island in the ' +
			'middle of a stormy lake. Heavy grey rain pours down. Wind whips the water into ' +
			'small white waves. A warm dim glow flickers in the shack\'s one little window, ' +
			'a thin trail of smoke rising from the stovepipe. Moody dusk-blue palette, warm ' +
			'amber window light. Cinematic, cozy-amid-storm mood.',
	},
	{
		page: 7,
		text:
			'inside the shack, harry sat on the floor.\n\n' +
			'his uncle had no more letters. his uncle had a smile.',
		characters: ['young-harry', 'father-dursley', 'cousin-dudley', 'mother-dursley'],
		prompt:
			'Inside the dim cozy little shack lit by a single warm oil lamp on a rickety wooden ' +
			'table. Harry sits cross-legged on the floor in his pale-grey jumper, a tiny wooden ' +
			'mouse toy in his hand. The uncle sits in a wooden chair with his arms crossed and a ' +
			'smug satisfied smile. The aunt and Dudley are bundled together on a small cot, fast ' +
			'asleep. Soft warm amber lamp-light, deep blue shadows in the corners. Tender, ' +
			'lonely, candle-lit mood.',
	},
	{
		page: 8,
		text:
			'then — a big hit at the door!\n\n' +
			'who is that? it was so late and so dark.',
		characters: ['young-harry', 'father-dursley'],
		prompt:
			'The interior of the shack lit only by the small oil lamp. The wooden door shudders ' +
			'as something pounds on it from the other side. Harry leaps to his feet, eyes wide. ' +
			'The uncle bolts upright in his chair, moustache bristling, gripping the table. ' +
			'Aunt and Dudley peek out from under the cot blanket. Dramatic shadows, cinematic ' +
			'tension, warm amber-and-blue palette. Cozy storybook tension, not scary.',
	},
	{
		page: 9,
		text:
			'the door fell down!\n\n' +
			'a big, big man came in. he had a big bushy beard.',
		characters: ['big-man', 'young-harry', 'father-dursley'],
		prompt:
			'The shack\'s wooden door has fallen flat on the floor. Standing in the open doorway ' +
			'is the very tall, very broad gentle bearded man, drawn in storybook proportions but ' +
			'clearly twice the height of an ordinary adult — his head bumps the doorframe. He ' +
			'wears a long heavy brown travelling coat, his huge soft dark-brown beard surrounding ' +
			'a warm gentle smile, rosy cheeks, rain glistening in his hair. Behind him: dark ' +
			'stormy night sky and lashing rain. Inside: Harry stands wide-eyed and amazed; the ' +
			'uncle cowers behind the wooden table. Cinematic but warm, never scary.',
	},
	{
		page: 10,
		text:
			'the big man looked at harry. he had a big smile.\n\n' +
			'"hi, harry!" he said. "i have come for you."',
		characters: ['big-man', 'young-harry'],
		prompt:
			'The big bearded man kneels down so he is at eye-level with Harry, holding out one ' +
			'huge gentle hand. Harry stands close, looking up at him with wide hopeful eyes and ' +
			'a tiny growing smile. Soft warm amber lamp-light fills the small shack, the storm ' +
			'outside fading. Tender, hopeful, life-changing-moment mood. Cinematic and cozy.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Harry Potter',
	chapter: 3,
	chapterTitle: 'Chapter 3: The Letters from No One',
	style: STYLE_COZY_WATERCOLOUR,
	characters: [
		CHAR_YOUNG_HARRY,
		CHAR_COUSIN_DUDLEY,
		CHAR_MOTHER_DURSLEY,
		CHAR_FATHER_DURSLEY,
		CHAR_BIG_MAN,
		CHAR_SNOWY_OWL,
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
