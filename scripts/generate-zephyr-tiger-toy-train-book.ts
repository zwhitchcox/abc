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

const TITLE = "zephyr tiger and the toy train";
const FOLDER = "Zephyr-Tiger-and-the-Toy-Train";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const TOY_TRAIN = "little-blue-toy-train-clean-cartoon";
const ALL_TIGERS_TRAIN = [...ALL_TIGERS, TOY_TRAIN];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const HOME_STYLE =
  "Cozy simple tiger family living room: warm cream walls, a soft blue rug, one simple orange couch, a round window with a view of green trees, and a warm wooden floor. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const GENTLE_EMOTION =
  "Emotions are gentle and child-friendly: sad faces have soft downturned mouths and big eyes, mad faces have small simple frowns, never scary, never angry eyebrows, no tears streaming, at most one tiny teardrop.";

const ASSET_TOY_TRAIN_CARTOON: CharacterSpec = {
  id: TOY_TRAIN,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable object reference: one small friendly wooden toy train with " +
    "a blue engine, a red cab roof, a little yellow chimney, four simple " +
    "black wheels, and one small green wagon hooked behind it. Clean " +
    "rounded cartoon geometry, clearly a child's toy, small enough for a " +
    "cub to hold. No tracks, no tigers, no people, no text, no letters, no " +
    "logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one small " +
    "friendly wooden toy train: a blue engine with a red cab roof, a little " +
    "yellow chimney, four simple black wheels, and one small green wagon " +
    "hooked behind it. Show the whole toy with no cropping. Use bold " +
    "readable outlines, flat cheerful colours, crisp edges, high contrast, " +
    "and minimal texture. No tracks, no text, no letters, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_TRAIN,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} In the cozy living room, Zephyr Tiger and Auggie Tiger share a warm happy hug on the soft blue rug while the little blue toy train from the train reference sits beside them. Mommy Tiger and Daddy Tiger stand behind them smiling warmly. Exactly four tigers total. Leave clear simple space at the top for a title, but do not draw any text. No extra cubs.`,
  },
  {
    page: 2,
    text: "zephyr tiger had a little toy train. he loved his train.",
    characters: ["zephyr-tiger-clean-cartoon", TOY_TRAIN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${HOME_STYLE} Zephyr Tiger sits happily on the soft blue rug and holds the little blue toy train from the train reference up with both paws, looking at it with love and a big smile. Use the train reference exactly: blue engine, red cab roof, yellow chimney, green wagon. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 3,
    text: "auggie tiger came to see the train. he picked it up with his little paws.",
    characters: ["auggie-tiger-clean-cartoon", TOY_TRAIN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} Auggie Tiger sits on the soft blue rug and reaches out, picking up the little blue toy train from the train reference with his tiny baby paws, looking at it with curious wide baby eyes. Auggie is seated, not standing and not walking. Use the train reference exactly. Draw exactly one tiger: Auggie. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "the train fell down. the train broke.",
    characters: ["auggie-tiger-clean-cartoon", TOY_TRAIN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${GENTLE_EMOTION} The little blue toy train lies on the wooden floor beside the rug, gently broken into two simple pieces: the blue engine separated from the green wagon, with one wheel rolled a little away. Auggie Tiger sits nearby with a small startled baby face and open paws. The break is simple and clean, not shattered, no sharp pieces. Auggie is seated. Draw exactly one tiger: Auggie. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger was so sad. he was mad at auggie too.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "auggie-tiger-clean-cartoon",
      TOY_TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${GENTLE_EMOTION} Zephyr Tiger stands looking down at his broken toy train on the floor with a soft sad face and a small simple frown, his ears drooping a little. Auggie Tiger sits a little away looking down, small and sorry. The broken train from the train reference lies between them in two clean pieces. Draw exactly two tigers: Zephyr and Auggie. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "auggie tiger looked down. he was little and sad.",
    characters: ["auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${GENTLE_EMOTION} Tiny Auggie Tiger sits alone on the soft blue rug looking down at his little paws with a gentle sorry baby face, soft downturned mouth, big sad eyes, and at most one tiny teardrop. He looks very small and very sorry, never scary or dramatic. Auggie is seated. Draw exactly one tiger: Auggie. No other tigers, no train in this picture, no text.`,
  },
  {
    page: 7,
    text: "mommy tiger held zephyr close. you can love him when you are mad, she said.",
    characters: ["mommy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${GENTLE_EMOTION} Mommy Tiger kneels and holds Zephyr Tiger close in a warm gentle hug while speaking softly to him. Zephyr still has a small sad face but is listening, leaning into her. The moment is tender and safe. Draw exactly two tigers: Mommy and Zephyr. No other tigers, no train in this picture, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger went to auggie. he gave auggie a big hug.",
    characters: ["zephyr-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} Zephyr Tiger kneels on the soft blue rug and wraps tiny Auggie Tiger in a big warm gentle hug. Auggie's small face peeks out, surprised and happy. Auggie is seated and held, not standing. This is the warmest moment of the book. Draw exactly two tigers: Zephyr and Auggie. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "i love you, said zephyr tiger. auggie tiger smiled a big smile.",
    characters: ["zephyr-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} Zephyr Tiger and Auggie Tiger sit face to face on the soft blue rug, paws gently touching. Auggie beams the biggest happiest baby smile while Zephyr smiles warmly at him. Auggie is seated. Draw exactly two tigers: Zephyr and Auggie. No other tigers, no text, no hearts, no symbols.`,
  },
  {
    page: 10,
    text: "daddy tiger helped zephyr. they made the train go again.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      TOY_TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} Daddy Tiger sits on the floor with Zephyr Tiger, gently fitting the little blue toy train back together: the engine and the green wagon joining, with the wheel back in place. Zephyr watches with hopeful happy eyes. Use the train reference exactly for the fixed parts. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no tools, no text.`,
  },
  {
    page: 11,
    text: "zephyr tiger let auggie see the train. the train went round and round.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "auggie-tiger-clean-cartoon",
      TOY_TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} Zephyr Tiger pushes the fixed little blue toy train in a gentle circle on the rug while Auggie Tiger sits beside him watching with delight and clapping. The train from the train reference is whole again, with simple curved motion lines showing it rolling round. Auggie is seated. Draw exactly two tigers: Zephyr and Auggie. No other tigers, no text.`,
  },
  {
    page: 12,
    text: "zephyr tiger loved his train. but he loved auggie more.",
    characters: ALL_TIGERS_TRAIN,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} In warm soft evening light, Zephyr Tiger hugs Auggie Tiger close on the soft blue rug while the little blue toy train sits quietly beside them. Mommy Tiger and Daddy Tiger watch from the couch with proud warm smiles. Exactly four tigers total. No extra cubs, no text, no hearts, no symbols.`,
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
    ASSET_TOY_TRAIN_CARTOON,
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
