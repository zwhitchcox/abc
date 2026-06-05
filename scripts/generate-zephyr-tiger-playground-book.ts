import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger goes to the playground";
const FOLDER = "Zephyr-Tiger-Goes-to-the-Playground";

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

const PLAYGROUND_STYLE =
  "Simple sunny neighborhood playground with a red slide, blue swings, a small sandbox, green grass, and a few round trees. Keep equipment easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} The whole tiger family smiles together at the playground. Zephyr Tiger stands near the red slide, Mommy Tiger sits on a bench holding Auggie Tiger safely, and Daddy Tiger stands nearby with a warm smile. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the big slide.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${PLAYGROUND_STYLE} Zephyr Tiger stands fully visible at the bottom of one big red playground slide and looks up with a happy smile. Draw exactly one tiger: Zephyr. The slide is large, simple, red, and easy to recognize. No other tigers, no extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger pushed zephyr on the swing.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} Daddy Tiger gently pushes Zephyr Tiger on one blue playground swing. Zephyr sits safely on the swing and smiles. Daddy stands behind the swing with exactly two visible front paws total, one paw lightly touching the swing rope and one paw relaxed. Draw exactly two tigers: Daddy and Zephyr. No extra arms, no duplicate paws, no other tigers, no text.`,
  },
  {
    page: 4,
    text: "mommy tiger held auggie on the bench.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} Mommy Tiger sits gracefully on a simple park bench and holds Auggie Tiger safely on her lap. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. Mommy looks pretty and warm with her white flower. No extra cubs, no text.`,
  },
  {
    page: 5,
    text: "zephyr tiger climbed up the steps.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${PLAYGROUND_STYLE} Zephyr Tiger climbs the short safe steps up to the red slide platform. Show both of Zephyr's paws on the rail or step, with a happy focused face and matching open eyes. Draw exactly one tiger: Zephyr. Keep the steps, rail, and red slide clear and simple. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger went down the slide.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${PLAYGROUND_STYLE} Zephyr Tiger slides down the big red slide with a happy smile, sitting safely with both paws visible. Draw exactly one tiger: Zephyr. The red slide fills the scene and curves gently toward soft green grass. No other tigers, no duplicate cubs, no text.`,
  },
  {
    page: 7,
    text: "auggie tiger clapped on mommy's lap.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} Auggie Tiger sits safely on Mommy Tiger's lap on the bench and claps his little paws. Mommy holds him securely and smiles. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "the family dug in the sand.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} The whole tiger family plays together in a small sandbox. Zephyr Tiger uses a red shovel, Daddy Tiger kneels beside him with exactly two visible front paws total, Mommy Tiger sits nearby holding Auggie Tiger safely, and Auggie touches the sand from Mommy's lap. Exactly four tigers total. Auggie is not walking. No extra cubs, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger found a red ball.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} Zephyr Tiger finds one bright red ball on the grass beside the playground. Daddy Tiger stands nearby smiling with exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. The red ball is round, simple, and easy to see. No other tigers, no extra balls, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home happy.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${PLAYGROUND_STYLE} The tiger family leaves the playground at sunset with happy tired smiles. Daddy Tiger carries the red ball and has exactly two visible front paws total. Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Zephyr Tiger walks beside them waving. Exactly four tigers total. No extra cubs, no readable text.`,
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
