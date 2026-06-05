import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import type { CharacterSpec } from "./lib/asset-cache";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger rides the train";
const FOLDER = "Zephyr-Tiger-Rides-the-Train";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const TRAIN = "blue-red-passenger-train-clean-cartoon";

const ALL_TIGERS_TRAIN = [...ALL_TIGERS, TRAIN];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk.";

const TRAIN_STYLE =
  "Simple cheerful train station and countryside train ride. Keep tracks, windows, seats, and train shapes large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos, no numbers.";

const ASSET_BLUE_RED_PASSENGER_TRAIN_CARTOON: CharacterSpec = {
  id: TRAIN,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: a friendly bright blue passenger " +
    "train with a red stripe, rounded front, large clear windows, black " +
    "wheels, simple silver rails, and a clean cartoon shape. No driver, no " +
    "passengers, no tigers, no people, no text, no numbers, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only the single bright blue passenger train with a red stripe, no tigers and no people. Show the entire train in a clean side/front three-quarter view with the rounded front visible, large windows, black wheels, simple rails, and no cropping. Use bold readable outlines, flat cheerful colours, crisp edges, high contrast, and minimal texture. No text, no numbers, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_TRAIN,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} The whole tiger family smiles together beside the bright blue passenger train with a red stripe. Use the train reference exactly for the vehicle: same rounded front, same blue colour, same red stripe, same large windows, and same black wheels. Mommy Tiger holds Auggie Tiger safely, Daddy Tiger stands beside Zephyr Tiger, and Zephyr waves. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the blue train.",
    characters: ["zephyr-tiger-clean-cartoon", TRAIN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TRAIN_STYLE} Zephyr Tiger stands fully visible on a simple station platform beside the bright blue passenger train with a red stripe. Use the train reference exactly: same rounded front, same blue colour, same red stripe, same large windows, same black wheels. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger held zephyr's paw.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} Daddy Tiger holds Zephyr Tiger's paw on the station platform beside the bright blue passenger train with a red stripe. Use the train reference exactly. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "mommy tiger carried auggie up the step.",
    characters: [
      "mommy-tiger-clean-cartoon",
      "auggie-tiger-clean-cartoon",
      TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} Mommy Tiger carefully carries Auggie Tiger up one low train step into the bright blue passenger train with a red stripe. Use the train reference exactly. Auggie is held safely, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 5,
    text: "the family sat by the window.",
    characters: ALL_TIGERS_TRAIN,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} Inside the bright blue passenger train, the tiger family sits together by one large window. Zephyr Tiger sits by the window, Daddy Tiger sits beside him with exactly two visible front paws total, Mommy Tiger holds Auggie Tiger safely on her lap, and Auggie is seated. Exactly four tigers total. Show a simple window view of green trees outside. No extra cubs, no text.`,
  },
  {
    page: 6,
    text: "the train went click clack.",
    characters: ALL_TIGERS_TRAIN,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} The bright blue passenger train with a red stripe moves along simple silver rails through green countryside. Use the train reference exactly. Show the tiger family visible through the large windows: Daddy, Mommy holding Auggie safely, and Zephyr. Exactly four tigers total, all inside the train. Use simple motion lines near the wheels, no written sound words, no text.`,
  },
  {
    page: 7,
    text: "zephyr tiger looked out at the trees.",
    characters: ["zephyr-tiger-clean-cartoon", TRAIN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TRAIN_STYLE} Close view of Zephyr Tiger inside the bright blue train, looking happily out a large window at simple green trees passing by. Use the train reference for the blue window frame and red stripe details. Draw exactly one tiger: Zephyr. Zephyr has matching open friendly eyes, not winking. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "auggie tiger waved from mommy's lap.",
    characters: [
      "auggie-tiger-clean-cartoon",
      "mommy-tiger-clean-cartoon",
      TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} Auggie Tiger sits safely on Mommy Tiger's lap inside the bright blue train and waves one little paw near the window. Mommy holds him securely and smiles. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "daddy tiger found the red seat.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      TRAIN,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} Inside the bright blue train, Daddy Tiger points gently to one simple red passenger seat while Zephyr Tiger looks at it. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. The red seat is large, clear, and easy to see. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home happy.",
    characters: ALL_TIGERS_TRAIN,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${TRAIN_STYLE} The tiger family walks away from the station after the train ride with happy tired smiles. The bright blue passenger train with a red stripe is parked behind them. Use the train reference exactly. Daddy Tiger stands on the left with exactly two visible front paws total, Zephyr Tiger waves in the middle, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
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
    ASSET_BLUE_RED_PASSENGER_TRAIN_CARTOON,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "high",
  imageModel: "gpt-image-2",
  concurrency: 2,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
