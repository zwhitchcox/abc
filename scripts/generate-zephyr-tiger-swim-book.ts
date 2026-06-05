import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger learns to swim";
const FOLDER = "Zephyr-Tiger-Learns-to-Swim";

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

const SWIM_STYLE =
  "Simple sunny shallow swimming pool with clear blue water, wide pool steps, a pale pool deck, one yellow kickboard, and a few round trees in the background. Keep the water, steps, and swimming action large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const ZEPHYR_SWIM_GEAR =
  "Zephyr Tiger wears the same simple bright blue swim shorts on every swim page. Keep his tiger fur, face, size, stripes, rosy cheeks, and pink-orange button nose exactly like the reference.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} The whole tiger family smiles together beside the shallow pool. Zephyr Tiger stands on the pool step in his blue swim shorts, Daddy Tiger stands in the shallow water beside him, Mommy Tiger sits on the pool deck holding Auggie Tiger safely, and Auggie is seated in Mommy's lap. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the blue pool.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Zephyr Tiger stands fully visible on the pale pool deck and looks at the clear blue shallow swimming pool with a happy curious smile. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger held zephyr in the water.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Daddy Tiger stands chest-deep in the shallow blue pool and gently holds Zephyr Tiger under the arms while Zephyr floats on his belly and smiles. Daddy has exactly two visible front paws total, both supporting Zephyr. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no extra arms, no duplicate paws, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger kicked his feet.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Zephyr Tiger floats on his belly in the shallow blue pool and kicks his feet, making small clear splashes behind him. Daddy Tiger stands beside him with exactly two visible front paws total, one paw lightly supporting Zephyr. Draw exactly two tigers: Daddy and Zephyr. Keep the kicking action clear and simple. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "mommy tiger held auggie by the pool.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} Mommy Tiger sits gracefully on the pale pool deck and holds Auggie Tiger safely on her lap near the shallow pool. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. Mommy looks pretty and warm with her white flower. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger blew bubbles.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Zephyr Tiger is in the shallow blue water with his mouth close to the surface, gently blowing big round bubbles. Daddy Tiger kneels in the water beside him with exactly two visible front paws total and smiles. Draw exactly two tigers: Zephyr and Daddy. Make the bubbles large, simple, and easy to see. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "zephyr tiger held the yellow board.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Zephyr Tiger holds one bright yellow kickboard with both paws in the shallow blue pool and kicks his feet behind him. Daddy Tiger stands beside him with exactly two visible front paws total, watching warmly. Draw exactly two tigers: Zephyr and Daddy. The yellow kickboard is large, simple, and clear. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger swam a little way.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Zephyr Tiger swims a short little way across the shallow blue pool with a proud smile, arms forward and feet kicking. Daddy Tiger stands very close beside him with exactly two visible front paws total, ready to help. Draw exactly two tigers: Zephyr and Daddy. Make the short swimming distance clear, calm, and successful. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger climbed up the steps.",
    characters: ["zephyr-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} Zephyr Tiger climbs up the wide pool steps from the shallow blue water with a happy proud smile. Mommy Tiger waits on the pool deck nearby and smiles warmly with her white flower. Draw exactly two tigers: Zephyr and Mommy. Keep the pool steps large and easy to understand. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home happy.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SWIM_STYLE} ${ZEPHYR_SWIM_GEAR} The tiger family leaves the pool with happy tired smiles. Zephyr Tiger walks in the middle in his bright blue swim shorts and carries the yellow kickboard. Daddy Tiger stands on the left with exactly two visible front paws total. Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no duplicate tigers, no readable text.`,
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
