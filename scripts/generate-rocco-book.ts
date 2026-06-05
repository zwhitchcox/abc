import 'dotenv/config'
import { generateBook, type BookPage } from './lib/book-generator'
import {
	STYLE_COZY_WATERCOLOUR,
	CHAR_ROCCO_PUP,
	CHAR_ROCCO_MOM,
	CHAR_MEG_SHEPHERD,
	CHAR_ROCCO_DEER,
	CHAR_ROCCO_DUCK,
} from './lib/characters'

const TITLE = 'Rocco and the Long Road Home'
const FOLDER = 'Rocco-and-the-Long-Road-Home'

const PAGES: BookPage[] = [
	{
		page: 1,
		text: '',
		characters: ['rocco-pup', 'rocco-mom'],
		prompt:
			'Book cover. Rocco sitting on a sunny green hillside in front of a big red barn with a ' +
			'white fence, surrounded by a few fluffy sheep. His mother (a golden retriever) stands ' +
			'behind him smiling. Blue sky with soft clouds, cheerful inviting composition. Leave a ' +
			'clear sky-area at the top for a title.',
	},
	{
		page: 2,
		text:
			'Rocco is a little tan pup. He lives on a big farm with his mom and his pals.\n\n' +
			'That farm has a red gate, a green hill, and a lot of sheep. Rocco likes the farm a lot.',
		characters: ['rocco-pup', 'rocco-mom'],
		prompt:
			'Rocco sitting happily on a grassy green hill on a farm. A red wooden gate stands to ' +
			'one side, white fluffy sheep graze in the background, a big red barn is visible ' +
			'further back, his golden retriever mother stands nearby smiling. Warm sunny afternoon.',
	},
	{
		page: 3,
		text:
			'One hot day, a pink moth went past his nose. Rocco had to see it. He ran after that pink moth fast.\n\n' +
			'"Stop!" said his mom. But Rocco did not stop. He ran and ran.',
		characters: ['rocco-pup', 'rocco-mom'],
		prompt:
			'Rocco dashing playfully across a sunny meadow, nose pointed forward, chasing a large ' +
			'pretty pink moth fluttering just out of reach. In the background, his worried mother ' +
			'is barking after him. Bright daisies and tall grass around them.',
	},
	{
		page: 4,
		text:
			'The moth went into the dark woods. Then — poof! — the moth was gone.\n\n' +
			'Rocco sat down on a fat log. He did not see the farm. He did not see his mom. Rocco felt sad.',
		characters: ['rocco-pup'],
		prompt:
			'Rocco sitting all alone on a thick mossy log deep inside a shadowy forest, ears ' +
			'drooping, big sad eyes looking around. Tall dark trees surround him, a few beams of ' +
			'soft light filter through the leaves. No sign of the farm.',
	},
	{
		page: 5,
		text:
			'A tall deer came near. "Are you lost, little pup?" said the deer.\n\n' +
			'"Yes," said Rocco. "I can not see the road home."',
		characters: ['rocco-pup', 'rocco-deer'],
		prompt:
			'Rocco looking up at a tall friendly brown deer with gentle eyes and small antlers, ' +
			'bending its head down kindly toward the puppy. They are in a clearing in the forest ' +
			'with ferns and wildflowers around them, soft dappled sunlight.',
	},
	{
		page: 6,
		text:
			'The deer led Rocco to a pond. A fat duck was in the reeds.\n\n' +
			'"Which way is the big red farm?" said Rocco. "Quack! Go past the rocks and then up the hill," said the duck.',
		characters: ['rocco-pup', 'rocco-deer', 'rocco-duck'],
		prompt:
			'Rocco standing at the edge of a small clear forest pond, next to the tall friendly ' +
			'deer. A plump white duck sits among green reeds in the water, quacking and pointing ' +
			'one wing toward a distant grassy hill visible beyond some gray rocks. Peaceful, ' +
			'reflective water.',
	},
	{
		page: 7,
		text:
			'Rocco went past the rocks. But then came the rain. Big wet drops hit his ears and his back.\n\n' +
			'Fog fell on the land. Rocco sat in the mud. He let out a sad little yip.',
		characters: ['rocco-pup'],
		prompt:
			'Rocco sitting in the mud in a rainy gray landscape, fur wet and flattened, raindrops ' +
			'falling heavily, thick fog blurring the distance, gray rocks around him, mouth ' +
			'slightly open in a small sad whimper. Moody, misty, muted colours but still gentle.',
	},
	{
		page: 8,
		text:
			'"Here, pup! Here, pup!" came a call. It was Meg, the shepherd girl. She had a lamp and a red coat.\n\n' +
			'Meg ran to him. She gave him a big hug. "I came to get you home," said Meg.',
		characters: ['rocco-pup', 'meg-shepherd-girl'],
		prompt:
			'Meg the kind young shepherd girl kneels down in the rain to hug Rocco tightly, ' +
			'holding a warm glowing lantern, relief and joy on her face. The puppy nuzzles into ' +
			'her coat. Rainy, misty forest edge around them.',
	},
	{
		page: 9,
		text:
			'Meg and Rocco went down the road. The rain let up. A fat sun came back. Meg had Rocco in her arms.\n\n' +
			'They went past the pond. They went past the dark woods. Then they went up the green hill.',
		characters: ['rocco-pup', 'meg-shepherd-girl'],
		prompt:
			'Meg in her red raincoat walking along a winding dirt road, carrying Rocco cradled ' +
			'contentedly in her arms. The rain has just stopped, the sun is breaking through the ' +
			'clouds, a rainbow arches over green hills in the distance. The pond and the edge of ' +
			'the dark forest are visible behind them.',
	},
	{
		page: 10,
		text:
			'At the top of the hill, Rocco saw the big red gate! His mom ran to him and gave him lots of licks.\n\n' +
			'Meg sat down with Rocco. She gave him a dish of meat. Rocco ate and ate. Then he fell into a deep, happy sleep.',
		characters: ['rocco-pup', 'rocco-mom', 'meg-shepherd-girl'],
		prompt:
			'A warm happy homecoming scene at the farm. The big red barn and red gate are in the ' +
			'background, Rocco\'s golden retriever mother is licking Rocco joyfully while he wags ' +
			'his tail. Meg in her red coat kneels beside them, smiling, setting down a little blue ' +
			'dish of food. Sheep watch in the background. Late golden-hour sunlight. Cozy and ' +
			'heartwarming.',
	},
]

generateBook({
	title: TITLE,
	folder: FOLDER,
	series: 'Other Stories',
	style: STYLE_COZY_WATERCOLOUR,
	characters: [
		CHAR_ROCCO_PUP, CHAR_ROCCO_MOM, CHAR_MEG_SHEPHERD, CHAR_ROCCO_DEER, CHAR_ROCCO_DUCK,
	],
	pages: PAGES,
	layout: 'split',
	imageSize: '1536x1024',
	imageQuality: 'medium',
}).catch(e => {
	console.error(e)
	process.exit(1)
})
