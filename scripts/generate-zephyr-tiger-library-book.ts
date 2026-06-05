import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger goes to the library";
const FOLDER = "Zephyr-Tiger-Goes-to-the-Library";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is a pretty adult mother with her white flower and graceful medium build; Daddy Tiger is the tallest adult father with a relaxed average dad build, not muscular or bulky; Zephyr Tiger is the older cub; Auggie Tiger is the tiny baby brother who sits or is carried and does not walk.";

const LIBRARY_STYLE =
  "Warm cozy children's library with soft wooden shelves, low book bins, small reading chairs, gentle amber lamps, round rugs, pastel colors, and no readable text, no labels, no logos, no brand names.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "Zephyr Tiger went to the library.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} The tiger family walks through the library doors together. Mommy carries Auggie safely, Daddy holds a small book bag with no text, and Zephyr walks in front with a happy face.`,
  },
  {
    page: 2,
    text: "Mommy Tiger showed Zephyr the books.",
    characters: ["zephyr-tiger", "mommy-tiger", "auggie-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Zephyr Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} Mommy Tiger kneels beside a low shelf and points to colorful picture books. Zephyr looks closely at the books. Auggie sits safely on Mommy's lap or is held safely by Mommy, not walking. No readable text on any book.`,
  },
  {
    page: 3,
    text: "Zephyr Tiger picked a red book.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} Zephyr gently pulls one plain red picture book from a low book bin. Daddy Tiger stands nearby and smiles. Daddy has exactly two visible front paws total, no extra arms or duplicate paws. The book cover has no readable text.`,
  },
  {
    page: 4,
    text: "Daddy Tiger found a train book.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} Daddy Tiger shows Zephyr one picture book with a simple train illustration on the cover but no words or letters. Zephyr looks excited. Daddy has exactly two visible front paws total, no extra arms or duplicate paws.`,
  },
  {
    page: 5,
    text: "Auggie Tiger looked at a baby book.",
    characters: ["auggie-tiger", "mommy-tiger", "zephyr-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Auggie Tiger, Mommy Tiger, and Zephyr Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} Auggie sits safely on a soft rug with Mommy close beside him and looks at a sturdy baby board book with simple shapes and no readable text. Zephyr sits nearby watching gently. Auggie is sitting, not walking.`,
  },
  {
    page: 6,
    text: "Zephyr Tiger sat on a soft rug.",
    characters: ["zephyr-tiger"],
    prompt:
      "Draw exactly one tiger, fully visible: Zephyr Tiger, the older cub with the same orange-and-cream fur, rosy cheeks, and small pink-orange button nose. " +
      `${LIBRARY_STYLE} Zephyr sits cross-legged on a round soft rug with a small stack of picture books beside him. He has matching peaceful closed happy eyes, not winking, not one eye open and one eye closed. No readable text.`,
  },
  {
    page: 7,
    text: "Mommy Tiger read the red book.",
    characters: ["zephyr-tiger", "mommy-tiger", "auggie-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Zephyr Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} Mommy Tiger sits in a small reading chair and reads the plain red book aloud. Zephyr sits beside her listening. Auggie sits safely on Mommy's lap, not walking. The open book pages show simple pictures only, no readable text.`,
  },
  {
    page: 8,
    text: "Zephyr Tiger used his quiet voice.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} Zephyr stands beside Daddy Tiger between quiet library shelves and holds one finger gently near his mouth in a quiet gesture. Daddy smiles softly and holds a small book bag. Daddy has exactly two visible front paws total. No readable text.`,
  },
  {
    page: 9,
    text: "The family took books home.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${LIBRARY_STYLE} The family stands at a simple checkout desk with a small stack of picture books and a book bag. Zephyr carefully puts a book into the bag. Mommy holds Auggie safely, and Daddy stands nearby smiling. No library card details, no barcode, no readable text.`,
  },
  {
    page: 10,
    text: "Zephyr Tiger read a book at home.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Cozy storybook ending at home under warm lamp light. Zephyr sits on a soft couch holding the plain red library book. Mommy holds Auggie safely beside him, Daddy sits nearby with a warm smile, and everyone looks calm and happy. The book has no readable text.",
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Tiger Stories",
  style: STYLE_COZY_WATERCOLOUR,
  characters: [
    CHAR_ZEPHYR_TIGER,
    CHAR_AUGGIE_TIGER,
    CHAR_MOMMY_TIGER,
    CHAR_DADDY_TIGER,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "medium",
  imageModel: "gpt-image-2",
  anchorOnCover: false,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
