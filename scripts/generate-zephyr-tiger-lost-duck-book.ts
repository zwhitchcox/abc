import "dotenv/config";
import { type CharacterSpec } from "./lib/asset-cache";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger and the lost duck";
const FOLDER = "Zephyr-Tiger-and-the-Lost-Duck";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const LITTLE_DUCK = "little-duck-clean-cartoon";
const ALL_TIGERS_DUCK = [...ALL_TIGERS, LITTLE_DUCK];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. The artwork fills the whole image edge to edge: no picture frame, no border, no margin. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const MEADOW_STYLE =
  "Simple sunny green meadow with a soft dirt walking path, round green trees, gentle bushes, a small creek, and a calm blue pond with green reeds in the distance. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const DUCK_CONSISTENCY =
  "The little duck is one small round fluffy yellow duckling with a tiny round orange beak and tiny orange feet, matching the duck reference exactly. The mother duck looks like a bigger calm version of the little duck: larger, soft yellow-brown, with the same friendly simple style.";

const GENTLE_EMOTION =
  "Emotions are gentle and child-friendly: sad faces have soft downturned mouths and big eyes, never scary, no tears streaming, at most one tiny teardrop.";

const ASSET_LITTLE_DUCK_CARTOON: CharacterSpec = {
  id: LITTLE_DUCK,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A small yellow duckling with an oversized round head, small rounded " +
    "body, soft fluffy yellow down, a tiny round orange button beak, tiny " +
    "rounded orange feet, and a sweet expression, drawn in the clean " +
    "print-friendly cartoon style with bold readable outlines and flat " +
    "cheerful colours.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_DUCK,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} On the sunny meadow path, Zephyr Tiger kneels and gently looks at the one little yellow duckling from the duck reference standing in front of him. Daddy Tiger stands behind Zephyr, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total and exactly one duckling. Leave clear simple sky space at the top for a title, but do not draw any text. No extra cubs, no other animals.`,
  },
  {
    page: 2,
    text: "the tiger family went for a walk. zephyr tiger heard a little sound.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${MEADOW_STYLE} The tiger family walks together on the sunny meadow path. Zephyr Tiger stops and turns his head with one paw cupped near his ear, listening to something small. Daddy Tiger walks beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No duck visible yet, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "a little duck sat by the path. the duck said quack quack.",
    characters: ["zephyr-tiger-clean-cartoon", LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} Zephyr Tiger crouches low and discovers the one little yellow duckling from the duck reference sitting in the soft grass at the edge of the path, calling out with its tiny beak open. Show small simple curved sound lines near the duckling's beak, no letters, no words. Draw exactly one tiger: Zephyr. Exactly one duck in the whole image: the small duckling, all alone because it is lost. No mother duck, no big duck, no other birds, no other animals, no text.`,
  },
  {
    page: 4,
    text: "the little duck was lost. the duck looked sad.",
    characters: [LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} ${GENTLE_EMOTION} A close gentle view of the one little yellow duckling from the duck reference sitting alone in the big wide meadow grass, looking small with a soft sad face, drooping little wings, and at most one tiny teardrop. The meadow around it looks big and empty to show it is lost, but still friendly and sunny, never scary. No tigers in this picture. Exactly one duckling. No other animals, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger patted the duck. we will help you, he said.",
    characters: ["zephyr-tiger-clean-cartoon", LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} Zephyr Tiger kneels and very gently pats the little yellow duckling from the duck reference on its head with one soft paw, smiling kindly down at it. The duckling looks up at him with hopeful eyes. Draw exactly one tiger: Zephyr. Exactly one duckling. No other animals, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger looked for the nest. the nest was not on the path.",
    characters: ["zephyr-tiger-clean-cartoon", LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} Zephyr Tiger walks along the meadow path looking carefully left and right with one paw shading his eyes, while the little yellow duckling from the duck reference waddles right beside his feet. They are searching together. The path and grass are clearly empty: no nest anywhere in this picture. Draw exactly one tiger: Zephyr. Exactly one duckling. No other animals, no text.`,
  },
  {
    page: 7,
    text: "daddy tiger looked by the trees. mommy tiger looked by the creek.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${MEADOW_STYLE} The whole tiger family helps search the meadow: Daddy Tiger looks behind a round green tree on one side, and Mommy Tiger looks near the small creek on the other side while holding Auggie Tiger safely. Auggie points his tiny paw helpfully. Exactly four tigers total. No duck in this picture, no nest, no extra cubs, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger saw the pond. he saw a nest in the reeds.",
    characters: ["zephyr-tiger-clean-cartoon", LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} Zephyr Tiger stands at the top of a gentle grassy rise and points excitedly toward the calm blue pond, where one simple round brown stick nest sits among the green reeds at the water edge. The little yellow duckling from the duck reference stands beside him looking where he points. Draw exactly one tiger: Zephyr. Exactly one duckling. The nest is empty in this picture, seen from a distance. No other animals, no text.`,
  },
  {
    page: 9,
    text: "the mother duck was in the nest. quack quack, said the mother duck.",
    characters: ["zephyr-tiger-clean-cartoon", LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} At the pond edge, one bigger gentle mother duck sits in the simple round brown stick nest among the green reeds, calling with her beak open and small curved sound lines, no letters. Zephyr Tiger and the little yellow duckling from the duck reference arrive nearby, both looking at her with joy. Draw exactly one tiger: Zephyr. Exactly two ducks: the small duckling and the bigger mother duck. No text.`,
  },
  {
    page: 10,
    text: "the little duck ran to the nest. the little duck was home.",
    characters: [LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} The little yellow duckling from the duck reference runs happily on its tiny orange feet toward the nest in the reeds where the bigger mother duck waits with open wings. Simple curved motion lines behind the duckling show it hurrying. The moment is joyful. Exactly two ducks: the duckling and the mother duck. No tigers in this picture, no text.`,
  },
  {
    page: 11,
    text: "the mother duck held her little duck close. zephyr tiger was so happy.",
    characters: ["zephyr-tiger-clean-cartoon", LITTLE_DUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} At the pond edge, the bigger mother duck wraps one soft wing around the little yellow duckling from the duck reference, holding it close in the nest among the reeds. Zephyr Tiger watches from a few steps away with his paws together and a big warm happy smile. Draw exactly one tiger: Zephyr. Exactly two ducks. No text, no hearts, no symbols.`,
  },
  {
    page: 12,
    text: "bye bye little duck, said zephyr tiger. the duck said quack quack.",
    characters: ALL_TIGERS_DUCK,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${MEADOW_STYLE} ${DUCK_CONSISTENCY} The tiger family walks home on the meadow path in warm late afternoon light while Zephyr Tiger turns and waves bye to the little yellow duckling, who stands by the pond with its mother duck and flaps one tiny wing back at him. Mommy Tiger, clearly wearing her white flower by her ear, holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total and exactly two ducks in the distance. No extra cubs, no text.`,
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Tiger Stories",
  style: STYLE_CLEAN_PRINT_CARTOON,
  characters: [
    CHAR_ZEPHYR_TIGER_CARTOON,
    CHAR_AUGGIE_TIGER_CARTOON,
    CHAR_MOMMY_TIGER_CARTOON,
    CHAR_DADDY_TIGER_CARTOON,
    ASSET_LITTLE_DUCK_CARTOON,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "high",
  imageModel: "gpt-image-2",
  concurrency: 10,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
