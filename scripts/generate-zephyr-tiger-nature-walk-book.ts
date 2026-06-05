import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger takes a nature walk";
const FOLDER = "Zephyr-Tiger-Takes-a-Nature-Walk";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk.";

const NATURE_STYLE =
  "Simple sunny nature path with green trees, soft grass, a small creek, rocks, leaves, and flowers. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} The whole tiger family smiles together on a simple sunny nature path. Zephyr Tiger stands in front holding one green leaf, Daddy Tiger stands beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the green trees.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${NATURE_STYLE} Zephyr Tiger stands fully visible on a simple dirt path and looks up at two big green trees with a happy curious smile. Draw exactly one tiger: Zephyr. Make the trees large and clear. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger found a smooth rock.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Daddy Tiger kneels on the nature path and shows Zephyr Tiger one smooth gray rock in his paw. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Zephyr watches closely and smiles. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "mommy tiger showed auggie a leaf.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Mommy Tiger sits gracefully on a low log and shows Auggie Tiger one big green leaf. Auggie sits safely on Mommy's lap, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. Mommy looks pretty and warm with her white flower. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger looked at a small bug.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Zephyr Tiger crouches on the path and looks at one small friendly ladybug on a leaf. Daddy Tiger stands nearby smiling with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. Make the ladybug simple, red, round, and easy to see. No other tigers, no scary bug, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger heard the creek.",
    characters: ["zephyr-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Zephyr Tiger and Mommy Tiger sit beside a small clear blue creek. Zephyr listens with a calm happy face while the water flows over simple gray rocks. Mommy sits nearby with her white flower and smiles. Draw exactly two tigers: Zephyr and Mommy. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "daddy tiger helped zephyr step over the log.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Daddy Tiger helps Zephyr Tiger step over one low fallen log on the path. Daddy has exactly two visible front paws total, one holding Zephyr's paw and one relaxed. Zephyr steps carefully and smiles. Draw exactly two tigers: Daddy and Zephyr. Keep the log low and simple. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "auggie tiger clapped at the butterfly.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Auggie Tiger sits safely on Mommy Tiger's lap and claps his little paws while one big yellow butterfly floats nearby. Mommy holds him securely and smiles. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. Make the butterfly simple and clear. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger put leaves in a pile.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} Zephyr Tiger puts red, yellow, and green leaves into one neat pile on the nature path. Daddy Tiger stands nearby smiling with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. The leaf pile is large, colorful, and easy to see. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home happy.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${NATURE_STYLE} The whole tiger family walks home from the nature path with happy tired smiles. Zephyr Tiger carries one green leaf, Daddy Tiger stands on the left with exactly two visible front paws total, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no duplicate tigers, no readable text.`,
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
