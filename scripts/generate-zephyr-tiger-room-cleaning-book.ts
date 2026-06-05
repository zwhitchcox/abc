import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger cleans his room";
const FOLDER = "Zephyr-Tiger-Cleans-His-Room";

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

const ROOM_STYLE =
  "Simple sunny child bedroom with a low bed, blue blanket, small red toy bin, small blue wastebasket, low bookshelf, little table, toy blocks, paper scraps, and a soft rug. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} The whole tiger family smiles together in Zephyr Tiger's clean sunny bedroom after the room is finished. The room must look clearly tidy: no loose toys on the floor, no paper scraps, no books on the floor, no clutter. The red toy bin is neatly full, the blue wastebasket is empty, the books are on the shelf, and the blue blanket is folded on the bed. Zephyr Tiger stands proudly beside the red toy bin, Daddy Tiger stands beside him, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and Auggie smiles from Mommy's arms. Exactly four tigers total. Leave clear simple wall space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw toys and trash.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${ROOM_STYLE} Zephyr Tiger stands fully visible in his sunny bedroom and looks at a small messy area: a few toy blocks on the rug, one book on the floor, a blue blanket on the bed, and a few clean paper scraps near a small blue wastebasket. Draw exactly one tiger: Zephyr. The room is only mildly messy, not chaotic, with no dirty food and no gross trash. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger found the red bin.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} Daddy Tiger shows Zephyr Tiger one small red toy bin on the bedroom rug. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Zephyr watches and smiles. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger put toys in the bin.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} Zephyr Tiger puts colorful toy blocks and one small toy car into the small red toy bin on the rug. Daddy Tiger kneels nearby and smiles with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. Make the toys and red bin large and clear. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger picked up the trash.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} Zephyr Tiger picks up clean paper scraps from the bedroom rug and puts them into a small blue wastebasket. Daddy Tiger stands nearby smiling with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. The paper scraps and wastebasket are simple, clean, and easy to see. No dirty food, no gross trash, no other tigers, no text.`,
  },
  {
    page: 6,
    text: "mommy tiger folded the blue blanket.",
    characters: ["mommy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} Mommy Tiger neatly folds one blue blanket on the low bed while Zephyr Tiger watches with a helpful smile. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Zephyr. Keep the bed and folded blanket simple and easy to read. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "auggie tiger sat on the rug.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} Auggie Tiger sits safely on the soft rug with Mommy Tiger sitting close beside him. Auggie holds one plain soft toy block and smiles. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger put books on the shelf.",
    characters: ["zephyr-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} Zephyr Tiger puts two plain picture books onto a low bookshelf. Mommy Tiger stands nearby smiling with her white flower. Draw exactly two tigers: Zephyr and Mommy. The books have simple solid-color covers with no readable text, no letters, and no pictures that look like words. No other tigers.`,
  },
  {
    page: 9,
    text: "the room was clean and bright.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${ROOM_STYLE} Zephyr Tiger stands proudly in his clean bright bedroom. The room must look clearly finished and tidy: no loose toys on the floor, no loose blocks, no paper scraps, no books on the floor, no clutter. The red toy bin is neatly full, the small blue wastebasket is empty, the books are on the shelf, the blue blanket is folded on the bed, and the little table is clear. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 10,
    text: "the tiger family sat in the clean room.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ROOM_STYLE} The whole tiger family sits together in Zephyr Tiger's clean sunny bedroom after the work is done. The room must look clearly tidy: no loose toys on the floor, no loose blocks, no paper scraps, no books on the floor, no clutter. The red toy bin is neatly full, the small blue wastebasket is empty, the books are on the shelf, and the blue blanket is folded on the bed. Zephyr Tiger sits on the rug beside the red toy bin, Daddy Tiger sits nearby with exactly two visible front paws total, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no duplicate tigers, no readable text.`,
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
