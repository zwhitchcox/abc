import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger visits the pond";
const FOLDER = "Zephyr-Tiger-Visits-the-Pond";

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

const POND_STYLE =
  "Simple sunny pond setting with blue water, green grass, round trees, reeds, lily pads, smooth rocks, and open space. Keep every animal and object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} The whole tiger family walks on a simple grass path toward a sunny blue pond. Daddy Tiger holds Zephyr Tiger's paw, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and everyone smiles. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text. No extra cubs.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw a blue pond. the water was still.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${POND_STYLE} Zephyr Tiger stands fully visible on green grass and looks at a calm blue pond. The water is still and simple, with a clear reflection of the sky and a few lily pads. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 3,
    text: "mommy tiger held auggie. auggie saw a yellow duck.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} Mommy Tiger stands near the pond and holds Auggie Tiger safely in her arms. Auggie looks at one friendly yellow duck floating on the blue water. Auggie is held, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no extra ducks, no text.`,
  },
  {
    page: 4,
    text: "daddy tiger found a smooth rock. zephyr tiger held the rock.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} Daddy Tiger crouches beside Zephyr Tiger near the pond and points to one smooth gray rock on the grass. Zephyr Tiger holds the smooth rock carefully with both little paws. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger saw green reeds. a dragonfly flew by.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${POND_STYLE} Zephyr Tiger stands beside tall green reeds at the edge of the pond. One large blue dragonfly flies nearby with clear wings, easy to see. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "mommy tiger pointed to a frog. the frog sat on a lily pad.",
    characters: ["mommy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} Mommy Tiger points gently toward one green frog sitting on a round lily pad in the blue pond. Zephyr Tiger stands beside Mommy and looks at the frog. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "daddy tiger sat on the grass. zephyr tiger sat beside him.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} Daddy Tiger sits calmly on green grass beside the pond while Zephyr Tiger sits beside him. They look at the water together. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "auggie tiger clapped for a turtle. mommy tiger held him close.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} Auggie Tiger claps while Mommy Tiger holds him safely on a blue blanket beside the pond. One friendly green turtle sits nearby on a smooth rock. Auggie is held or seated on Mommy's lap, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger saw one wrapper. daddy tiger put it in the bin.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} Zephyr Tiger points toward one small plain white paper wrapper as Daddy Tiger puts that same single wrapper into a simple small green trash bin beside the pond path. Show exactly one wrapper total in the whole image: the wrapper is in Daddy's paw above the bin. Do not draw any wrapper, paper, trash, or litter on the ground. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no messy trash pile, no text.`,
  },
  {
    page: 10,
    text: "the tiger family walked home. zephyr tiger said bye to the pond.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${POND_STYLE} The tiger family walks home on the grass path away from the sunny pond. Zephyr Tiger turns and waves bye to the pond, Daddy Tiger walks beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
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
