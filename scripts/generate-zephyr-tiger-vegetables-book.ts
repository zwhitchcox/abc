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

const TITLE = "zephyr tiger eats his vegetables";
const FOLDER = "Zephyr-Tiger-Eats-His-Vegetables";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const VEGETABLE_PLATE = "vegetable-plate-clean-cartoon";
const ALL_TIGERS_VEGETABLES = [...ALL_TIGERS, VEGETABLE_PLATE];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk.";

const DINNER_STYLE =
  "Simple sunny family dining area with a small wooden table, plain plates, one cup of water, a child chair, and a baby high chair. Keep food and table objects large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos, no dessert, no candy, no sweets.";

const ASSET_VEGETABLE_PLATE_CARTOON: CharacterSpec = {
  id: VEGETABLE_PLATE,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable food object reference: one plain white round plate with " +
    "simple vegetables only: orange carrot sticks, green broccoli florets, " +
    "and a small pile of green peas. Clean cartoon shape, bold outline, flat " +
    "cheerful colours. No dessert, no candy, no sweets, no meat, no tigers, " +
    "no people, no text, no letters, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one plain white round plate with orange carrot sticks, green broccoli florets, and green peas. Show the whole plate with no cropping. Use bold readable outlines, flat cheerful colours, crisp edges, high contrast, and minimal texture. No dessert, no candy, no sweets, no text, no letters, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_VEGETABLES,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${DINNER_STYLE} The whole tiger family smiles together at the dinner table with the vegetable plate in the middle. Use the vegetable plate reference exactly: same white round plate, same orange carrot sticks, same green broccoli, same green peas. Zephyr Tiger sits at the table looking curious and happy, Daddy Tiger sits beside him, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and Auggie is seated on Mommy's lap. Exactly four tigers total. Leave clear simple wall space at the top for a title, but do not draw any text. No dessert, no candy, no sweets.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the vegetables.",
    characters: ["zephyr-tiger-clean-cartoon", VEGETABLE_PLATE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${DINNER_STYLE} Zephyr Tiger sits at the small wooden table and looks at the vegetable plate with a curious happy face. Use the vegetable plate reference exactly: same white round plate, orange carrot sticks, green broccoli, and green peas. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 3,
    text: "mommy tiger put carrots on the plate.",
    characters: [
      "mommy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      VEGETABLE_PLATE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${DINNER_STYLE} Mommy Tiger adds orange carrot sticks to Zephyr Tiger's plain white plate while Zephyr watches. Use the vegetable plate reference for the vegetable style: bright orange carrot sticks, green broccoli, and green peas nearby. Draw exactly two tigers: Mommy and Zephyr. Mommy looks pretty and warm with her white flower. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 4,
    text: "daddy tiger gave zephyr a fork.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${DINNER_STYLE} Daddy Tiger gently gives Zephyr Tiger one small plain fork at the dinner table. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Zephyr sits calmly and smiles. Draw exactly two tigers: Daddy and Zephyr. The fork is simple and easy to see. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 5,
    text: "zephyr tiger smelled the broccoli.",
    characters: ["zephyr-tiger-clean-cartoon", VEGETABLE_PLATE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${DINNER_STYLE} Zephyr Tiger sits at the table and gently smells one green broccoli floret from the vegetable plate with a curious calm smile. Use the vegetable plate reference exactly for the plate and vegetables. Draw exactly one tiger: Zephyr. Keep the broccoli large and clear. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 6,
    text: "zephyr tiger took one little bite.",
    characters: ["zephyr-tiger-clean-cartoon", VEGETABLE_PLATE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${DINNER_STYLE} Zephyr Tiger sits at the table and takes one little bite of an orange carrot stick from the vegetable plate, with a brave curious smile. Use the vegetable plate reference exactly. Draw exactly one tiger: Zephyr. Show the bite simply and clearly, not messy. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 7,
    text: "the carrot went crunch crunch.",
    characters: ["zephyr-tiger-clean-cartoon", VEGETABLE_PLATE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${DINNER_STYLE} Zephyr Tiger sits at the table and smiles while eating a crunchy orange carrot stick from the vegetable plate. Use the vegetable plate reference exactly. Draw exactly one tiger: Zephyr. Show a happy chewing expression with matching open eyes, but do not draw sound words or letters. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 8,
    text: "auggie tiger clapped in his chair.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${DINNER_STYLE} Auggie Tiger sits safely in a baby high chair and claps his little paws. Mommy Tiger sits close beside him and smiles warmly with her white flower. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 9,
    text: "zephyr tiger ate the green peas.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      VEGETABLE_PLATE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${DINNER_STYLE} Zephyr Tiger eats green peas from the vegetable plate at the small wooden table and smiles proudly. Use the vegetable plate reference exactly: white plate, orange carrot sticks, green broccoli, and green peas. Daddy Tiger sits beside him smiling with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. No other tigers, no text, no dessert, no candy, no sweets.`,
  },
  {
    page: 10,
    text: "the tiger family had a happy dinner.",
    characters: ALL_TIGERS_VEGETABLES,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${DINNER_STYLE} The whole tiger family sits together at the dinner table with vegetables and cups of water. Use the vegetable plate reference exactly for the center plate: white plate, carrot sticks, broccoli, and peas. Zephyr Tiger sits proudly at the table, Daddy Tiger sits beside him with exactly two visible front paws total, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and Auggie smiles from Mommy's lap. Exactly four tigers total. No extra cubs, no duplicate tigers, no readable text, no dessert, no candy, no sweets.`,
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
    ASSET_VEGETABLE_PLATE_CARTOON,
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
