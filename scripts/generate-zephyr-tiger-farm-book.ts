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

const TITLE = "zephyr tiger visits the farm";
const FOLDER = "Zephyr-Tiger-Visits-the-Farm";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const TRACTOR = "green-farm-tractor-clean-cartoon";
const BARN = "red-farm-barn-clean-cartoon";
const ALL_TIGERS_FARM = [...ALL_TIGERS, TRACTOR, BARN];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk.";

const FARM_STYLE =
  "Simple sunny farm with green grass, a blue sky, a white fence, round trees, hay, and open space. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const ASSET_GREEN_FARM_TRACTOR_CARTOON: CharacterSpec = {
  id: TRACTOR,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: one friendly green farm tractor " +
    "with a yellow seat, two large black rear wheels, two smaller front " +
    "wheels, a simple steering wheel, and a clean rounded cartoon shape. " +
    "No driver, no passengers, no tigers, no people, no text, no numbers, " +
    "no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one green " +
    "farm tractor with a yellow seat, large black rear wheels, smaller front " +
    "wheels, and a simple steering wheel. Show the entire tractor in a clean " +
    "side/front three-quarter view with no cropping. Use bold readable " +
    "outlines, flat cheerful colours, crisp edges, high contrast, and minimal " +
    "texture. No text, no numbers, no logos.",
};

const ASSET_RED_FARM_BARN_CARTOON: CharacterSpec = {
  id: BARN,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable building object reference: one simple red farm barn with a " +
    "white roof trim, a large closed white X door, and clean cartoon " +
    "geometry. No animals, no tigers, no people, no text, no letters, no " +
    "logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one simple " +
    "red farm barn with white trim and one large closed white X door. Show " +
    "the whole barn with no cropping. Use bold readable outlines, flat " +
    "cheerful colours, crisp edges, high contrast, and minimal texture. No " +
    "text, no letters, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_FARM,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} The whole tiger family smiles together at a sunny farm. Use the red barn reference exactly in the background and the green tractor reference exactly beside the barn. Daddy Tiger stands beside Zephyr Tiger, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and Zephyr waves. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the red barn.",
    characters: ["zephyr-tiger-clean-cartoon", BARN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FARM_STYLE} Zephyr Tiger stands fully visible on green grass and looks at the red farm barn. Use the barn reference exactly: same red barn, same white trim, same closed white X door. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no tractor, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger opened the gate.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} Daddy Tiger opens a simple white farm gate while Zephyr Tiger waits beside him on the grass. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "mommy tiger held auggie by the fence.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} Mommy Tiger stands by a simple white fence and holds Auggie Tiger safely in her arms. Auggie is held, not standing and not walking. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger saw the green tractor.",
    characters: ["zephyr-tiger-clean-cartoon", TRACTOR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FARM_STYLE} Zephyr Tiger stands beside the green farm tractor and looks at it happily. Use the tractor reference exactly: same green tractor, yellow seat, large black rear wheels, smaller front wheels, and simple steering wheel. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 6,
    text: "daddy tiger sat on the tractor.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon", TRACTOR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} Daddy Tiger sits calmly on the green farm tractor seat while Zephyr Tiger stands safely on the grass beside the tractor. Use the tractor reference exactly. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. The tractor is still parked, no motion, no text.`,
  },
  {
    page: 7,
    text: "zephyr tiger fed hay to the cow.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FARM_STYLE} Zephyr Tiger holds a small bundle of yellow hay toward one gentle black-and-white cow behind a white fence. The cow is large, friendly, and easy to recognize. Draw exactly one tiger: Zephyr. The cow stays behind the fence. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "auggie tiger saw a little hen.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} Auggie Tiger sits safely on Mommy Tiger's lap on a blue blanket and looks at one little brown hen pecking in the grass nearby. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger put hay in the barn.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon", BARN],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} Zephyr Tiger carries one small bundle of yellow hay toward the red barn door while Daddy Tiger stands nearby. Use the barn reference exactly. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home from the farm.",
    characters: ALL_TIGERS_FARM,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FARM_STYLE} The tiger family walks home from the sunny farm with happy tired smiles. The red barn and green tractor sit behind them; use both references exactly. Daddy Tiger stands on the left with exactly two visible front paws total, Zephyr Tiger walks beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
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
    ASSET_GREEN_FARM_TRACTOR_CARTOON,
    ASSET_RED_FARM_BARN_CARTOON,
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
