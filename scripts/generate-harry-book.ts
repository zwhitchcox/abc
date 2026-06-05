import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_BABY_HARRY,
	CHAR_MAGICIAN,
	CHAR_BIG_MAN,
	CHAR_SNOWY_OWL,
	CHAR_MOTHER_DURSLEY,
	CHAR_FATHER_DURSLEY,
} from './lib/characters'

const TITLE = 'the little boy who lived'
const FOLDER = 'The-Little-Boy-Who-Lived'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['baby-harry', 'magician'],
		prompt:
			'Book cover. Baby Harry is sleeping peacefully in a small woven basket on a cobblestone ' +
			'doorstep at night, with a short folded letter tucked into the blanket. The elderly ' +
			'magician stands protectively to one side holding a lit lantern that casts a warm ' +
			'golden glow. A starry night sky above, the silhouette of a quiet little suburban ' +
			'street. Soft, magical, reassuring mood. Leave a clear sky-area at the top for a title.',
	},
	{
		page: 2,
		text:
			'this is harry. he is a little baby boy.\n\n' +
			'his mommy and daddy can not come back. harry is sad.',
		characters: ['baby-harry'],
		prompt:
			'Close-up of baby Harry lying in a cozy woven basket on a soft cushion, one tiny tear ' +
			'on his cheek. Around the basket are gentle memories of his parents shown as two soft ' +
			'glowing silhouettes holding hands, fading into a warm halo of light. Tender, ' +
			'melancholy but comforting mood.',
	},
	{
		page: 3,
		text:
			'it is dark. an old man came down the road.\n\n' +
			'he is dumbledore. he is an old wizard.',
		characters: ['magician'],
		prompt:
			'A quiet cobblestone suburban street at night with softly glowing lampposts. The ' +
			'elderly magician walks slowly down the street with his lit lantern raised, cloak ' +
			'trailing behind him, stars twinkling overhead, small neat houses lining the street. ' +
			'Calm, mysterious, magical mood.',
	},
	{
		page: 4,
		text:
			'then a big man came down the road. he has a big bike.\n\n' +
			'the bike can fly! the big man is hagrid. he has little harry with him.',
		characters: ['big-man', 'magician', 'baby-harry'],
		prompt:
			'The big bearded man has just landed a sturdy large copper-and-green motorbike on the ' +
			'dark cobblestone street, the wheels just touching down with soft glowing sparkles of ' +
			'gentle magic around them and a wispy cloud trail fading in the night sky above. ' +
			'Tucked carefully in one of his enormous arms is baby Harry, still swaddled and ' +
			'peacefully asleep. The magician stands on the sidewalk with his lantern, smiling ' +
			'kindly. Friendly, magical, safe feeling.',
	},
	{
		page: 5,
		text:
			'hagrid gave little harry to dumbledore.\n\n' +
			'harry was sleeping. dumbledore looked at him with a smile.',
		characters: ['big-man', 'magician', 'baby-harry'],
		prompt:
			'The big bearded man gently handing baby Harry into the magician\'s careful arms. ' +
			'Both men look down with soft tender smiles. The baby is fast asleep, one tiny hand ' +
			'poking out of the blanket. A lantern glows warmly on the ground beside them. ' +
			'Nighttime, cobblestones, a quiet street behind them.',
	},
	{
		page: 6,
		text:
			'"he will live here," said dumbledore.\n\n' +
			'they came to a little home. a mommy and a daddy lived here.',
		characters: ['magician', 'big-man', 'baby-harry'],
		prompt:
			'The magician and the big man standing on the neat front walk of a small tidy ' +
			'suburban house at night, a warm golden light glowing in one upstairs window, a tidy ' +
			'garden with a trimmed hedge. The magician cradles the blanket-wrapped baby, the big ' +
			'man stands respectfully behind him. A friendly-looking house with a red front door ' +
			'and flowerpots beside the step.',
	},
	{
		page: 7,
		text:
			'dumbledore gave baby harry a little kiss.\n\n' +
			'then he went away. little harry was sleeping.',
		characters: ['magician', 'baby-harry'],
		prompt:
			'The magician kneeling down and gently kissing the forehead of baby Harry, who is now ' +
			'resting peacefully in a small woven basket on the front doorstep, swaddled in the ' +
			'blue blanket, with a short folded letter tucked under the edge. The lantern glows ' +
			'beside them. Tender, loving goodbye moment. Night sky with soft stars.',
	},
	{
		page: 8,
		text:
			'an old owl sat in a tree. the owl looked at little harry.\n\n' +
			'"hoo, hoo," said the owl. "you will be a big boy."',
		characters: ['snowy-owl', 'baby-harry'],
		prompt:
			'The snowy owl perched on a branch of a small neat garden tree overlooking the ' +
			'doorstep, head tilted lovingly, watching the sleeping baby Harry in the basket below. ' +
			'A soft sliver of moon in the starry sky, faint warm light from the porch lamp. ' +
			'Peaceful, watchful, dreamlike mood.',
	},
	{
		page: 9,
		text:
			'the sun came up. the mommy came out of the home.\n\n' +
			'"a little baby!" she yelled. "come, let\'s take him in."',
		characters: ['mother-dursley', 'baby-harry'],
		prompt:
			'Early morning sunrise scene. The red front door of the suburban house is open and ' +
			'the mother has just stepped outside onto the doorstep. She is bending down, hands to ' +
			'her cheeks, eyes wide, looking at baby Harry still asleep in the little woven basket ' +
			'on the doorstep with the letter tucked in the blanket. Gentle golden sunrise light, ' +
			'dew on the flowerpots.',
	},
	{
		page: 10,
		text:
			'the mommy and the daddy gave little harry a big hug. harry had a home.\n\n' +
			'he looked up at the sun. he gave a little smile.',
		characters: ['mother-dursley', 'father-dursley', 'baby-harry'],
		prompt:
			'A warm family welcome scene on the front step of the same suburban house in soft ' +
			'morning light. The mother and father are holding baby Harry snugly together, both ' +
			'smiling down at him with tender love. The baby, awake now, looks up toward the ' +
			'golden sun with wide happy eyes and a tiny sweet smile. The basket sits beside them. ' +
			'Heartwarming, hopeful, safe feeling.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Harry Potter',
	chapter: 1,
	chapterTitle: 'Chapter 1: The Boy Who Lived',
	style: STYLE_COZY_WATERCOLOUR,
	characters: [
		CHAR_BABY_HARRY, CHAR_MAGICIAN, CHAR_BIG_MAN, CHAR_SNOWY_OWL,
		CHAR_MOTHER_DURSLEY, CHAR_FATHER_DURSLEY,
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
