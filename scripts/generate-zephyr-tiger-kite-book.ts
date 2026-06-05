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

const TITLE = "zephyr tiger flies a kite";
const FOLDER = "Zephyr-Tiger-Flies-a-Kite";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const KITE = "red-yellow-kite-clean-cartoon";
const ALL_TIGERS_KITE = [...ALL_TIGERS, KITE];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk.";

const PARK_STYLE =
  "Simple sunny grassy park with a wide open field, blue sky, puffy clouds, a few round trees, and a soft blanket. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const ASSET_RED_YELLOW_KITE_CARTOON: CharacterSpec = {
  id: KITE,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable object reference: one bright diamond-shaped kite with red " +
    "and yellow panels, a thin white string, and a blue tail with three " +
    "small blue bows. Clean cartoon shape, bold outline, flat cheerful " +
    "colours. No tigers, no people, no text, no letters, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one bright diamond-shaped kite with red and yellow panels, a thin white string trailing down, and a blue tail with three small blue bows. Show the whole kite and tail with no cropping. Use bold readable outlines, flat cheerful colours, crisp edges, high contrast, and minimal texture. No text, no letters, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_KITE,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} The whole tiger family smiles together in a wide grassy park while the red and yellow kite flies above them. Use the kite reference exactly: same diamond shape, same red and yellow panels, same blue tail bows, same thin white string. Zephyr Tiger holds the kite string, Daddy Tiger stands beside him, and Mommy Tiger sits on the blanket holding Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the red kite.",
    characters: ["zephyr-tiger-clean-cartoon", KITE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${PARK_STYLE} Zephyr Tiger stands fully visible on green grass and looks at the red and yellow kite lying on the grass. Use the kite reference exactly: same diamond shape, same red and yellow panels, same blue tail bows, same thin white string. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger held the kite string.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      KITE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} Daddy Tiger stands beside Zephyr Tiger in the grass and holds the thin white kite string, showing Zephyr how to hold it. The red and yellow kite rests nearby on the grass. Use the kite reference exactly. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "the wind lifted the kite.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      KITE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} A gentle wind lifts the red and yellow kite just above the grass. Use the kite reference exactly, with the blue tail bows trailing behind it. Zephyr Tiger holds the string with a happy surprised face. Daddy Tiger stands close beside him with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. Use simple curved motion lines for the wind, no written words, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger ran on the grass.",
    characters: ["zephyr-tiger-clean-cartoon", KITE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${PARK_STYLE} Zephyr Tiger runs across the open green grass holding the thin white kite string. The red and yellow kite rises behind him in the blue sky, using the kite reference exactly with the same blue tail bows. Draw exactly one tiger: Zephyr. Keep the running pose clear and simple, with matching open friendly eyes. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "mommy tiger held auggie on the blanket.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} Mommy Tiger sits gracefully on a soft blue blanket in the grass and holds Auggie Tiger safely on her lap. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. Mommy looks pretty and warm with her white flower. No kite in this page, no other tigers, no text.`,
  },
  {
    page: 7,
    text: "the kite went high in the sky.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      KITE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} The red and yellow kite flies high in the bright blue sky above the grassy park. Use the kite reference exactly with the same diamond shape, red and yellow panels, blue tail bows, and thin white string. Zephyr Tiger holds the string below and looks up proudly. Daddy Tiger stands nearby with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger pulled the string.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      KITE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} Zephyr Tiger gently pulls the thin white kite string with both paws while the red and yellow kite floats above him. Use the kite reference exactly. Daddy Tiger kneels nearby and smiles with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. Make the string easy to see. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "the kite came back down.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "mommy-tiger-clean-cartoon",
      KITE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} The red and yellow kite comes gently back down onto the soft green grass. Use the kite reference exactly, with the blue tail bows visible and no damage. Zephyr Tiger stands beside it smiling, and Mommy Tiger stands nearby with her white flower and a warm smile. Draw exactly two tigers: Zephyr and Mommy. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home happy.",
    characters: ALL_TIGERS_KITE,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PARK_STYLE} The tiger family walks home from the park with happy tired smiles. Zephyr Tiger carries the red and yellow kite by his side; use the kite reference exactly with the blue tail bows. Daddy Tiger stands on the left with exactly two visible front paws total. Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no duplicate tigers, no readable text.`,
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
    ASSET_RED_YELLOW_KITE_CARTOON,
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
