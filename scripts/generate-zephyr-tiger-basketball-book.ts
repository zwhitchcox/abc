import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

// See scripts/ZEPHYR-TIGER-BOOK-RULES.md:
// - full-page portrait pictures (keep generateBook full-page defaults)
// - two short sentences per page, simple/known words, lowercase
const TITLE = "zephyr tiger plays ball";
const FOLDER = "Zephyr-Tiger-Plays-Basketball";

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

const BALL_STYLE =
  "Simple sunny outdoor scene on a smooth driveway or little court with green grass and a couple of round trees. There is a small, simple, child-height basketball hoop with a white net on a single post. The ball is a clearly recognizable orange basketball with curved black lines. Keep everything easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BALL_STYLE} The whole tiger family smiles together by the little hoop. Zephyr Tiger holds the orange ball, Daddy Tiger stands beside him, and Mommy Tiger holds baby Auggie Tiger safely. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger has a ball. the ball is orange.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BALL_STYLE} Zephyr Tiger stands on the driveway and happily holds his orange basketball with both paws, smiling. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger can help. they look at the hoop.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BALL_STYLE} Daddy Tiger stands next to Zephyr Tiger and they both look up at the small basketball hoop, smiling. Zephyr holds the orange ball. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger taps the ball. it goes up and down.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BALL_STYLE} Zephyr Tiger bounces the orange ball on the driveway with one paw, the ball moving up and down beside him, with a happy smile. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "daddy lifts zephyr up high. now he can reach.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BALL_STYLE} Daddy Tiger happily lifts Zephyr Tiger up high toward the small hoop so he can reach it, while Zephyr holds the orange ball and smiles. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger throws the ball. the ball goes up.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BALL_STYLE} Zephyr Tiger throws the orange ball up toward the small hoop with both paws, looking up hopefully. Show the ball in the air near the hoop. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "the ball did not go in. zephyr tiger tries again.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BALL_STYLE} Zephyr Tiger runs after the orange ball as it rolls on the driveway, still smiling and not giving up. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "this time the ball goes in. zephyr tiger did it!",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BALL_STYLE} Zephyr Tiger cheers with both paws up as the orange ball drops through the white net of the small hoop. Show the ball going through the hoop. Draw exactly one tiger: Zephyr, looking delighted. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "mommy and auggie clap. they yell, yay zephyr!",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BALL_STYLE} Mommy Tiger claps and cheers while holding baby Auggie Tiger safely in her arms. Auggie is held, not standing, and waves a little paw. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family plays ball. it was a fun day.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BALL_STYLE} The whole tiger family plays happily together by the small hoop. Zephyr Tiger holds the orange ball, Daddy Tiger stands beside him with exactly two visible front paws total, and Mommy Tiger stands close holding baby Auggie Tiger safely. Exactly four tigers total, all smiling. No other cubs, no readable text.`,
  },
];

// Full-page portrait booklet: keep generateBook's full-page defaults
// (fullPageImages:true -> caption layout + 1024x1536). See ZEPHYR-TIGER-BOOK-RULES.md.
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
