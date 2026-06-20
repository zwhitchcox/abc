import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

// See scripts/STORY-BOOK-RULES.md:
// - full-page portrait pictures (keep generateBook full-page defaults)
// - two short sentences per page, simple/known words, lowercase
const TITLE = "zephyr tiger goes to space";
const FOLDER = "Zephyr-Tiger-Goes-to-the-Space-Center";

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

const SPACE_STYLE =
  "Simple, cheerful space-center scene: a clean visitor center with a tall white rocket on a launch pad outside, a friendly little moon-rover model, big windows, and a deep blue sky with a few stars. Keep it bright, simple, and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SPACE_STYLE} The whole tiger family smiles together in front of a tall white rocket at the space center. Zephyr Tiger points up at the rocket, Daddy Tiger stands beside him, and Mommy Tiger holds baby Auggie Tiger safely. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "the tiger family went to space camp. zephyr tiger was so happy.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SPACE_STYLE} The whole tiger family walks up to the doors of the bright space center together, smiling and excited. Daddy Tiger with exactly two visible front paws total, Mommy Tiger holding baby Auggie Tiger. Exactly four tigers total. No other tigers, no text.`,
  },
  {
    page: 3,
    text: "zephyr tiger saw a big rocket. it was tall and white.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${SPACE_STYLE} Zephyr Tiger looks up with wide happy eyes at a tall white rocket standing on the launch pad. Draw exactly one tiger: Zephyr, small next to the big rocket. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "daddy tiger showed him a moon rock. zephyr tiger held it.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SPACE_STYLE} Daddy Tiger shows Zephyr Tiger a small grey moon rock, and Zephyr holds it carefully in his paws, smiling. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger put on a space suit. he looked like a real spaceman.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${SPACE_STYLE} Zephyr Tiger wears a simple white space suit with a round clear helmet, standing proudly with a big smile. Draw exactly one tiger: Zephyr in the space suit. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "he sat in the rocket seat. he held the controls.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Simple, bright rocket cockpit with a big round window and a few large friendly buttons. Zephyr Tiger sits in the rocket seat wearing his white space suit, both paws on the controls, smiling with excitement. Draw exactly one tiger: Zephyr. No other tigers, no readable text.`,
  },
  {
    page: 7,
    text: "mommy tiger and auggie waved. they said, go zephyr go!",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SPACE_STYLE} Mommy Tiger waves happily while holding baby Auggie Tiger safely in her arms. Auggie is held, not standing, and waves a little paw. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger saw the stars. he saw the round moon.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Simple, calm view through a big round rocket window: a dark blue sky with bright stars and a friendly round moon. Zephyr Tiger in his white space suit looks out the window with happy, amazed eyes. Draw exactly one tiger: Zephyr. No other tigers, no readable text.`,
  },
  {
    page: 9,
    text: "zephyr tiger flew back home. the family was so proud.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${SPACE_STYLE} The whole tiger family hugs Zephyr Tiger, who is still in his white space suit and holding the helmet, all smiling proudly outside the space center. Daddy Tiger with exactly two visible front paws total, Mommy Tiger holding baby Auggie Tiger. Exactly four tigers total. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "zephyr tiger loved space day. it was the best day.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${SPACE_STYLE} Zephyr Tiger stands happily holding a small toy rocket, beaming after a wonderful day at the space center, with the tall white rocket behind him. Draw exactly one tiger: Zephyr. No other tigers, no readable text.`,
  },
];

// Full-page portrait booklet: keep generateBook's full-page defaults
// (fullPageImages:true -> caption layout + 1024x1536). See STORY-BOOK-RULES.md.
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
  imageQuality: "high",
  imageModel: "gpt-image-2",
  concurrency: 2,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
