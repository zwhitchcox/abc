import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger rides his bike";
const FOLDER = "Zephyr-Tiger-Rides-His-Bike";

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

const BIKE_STYLE =
  "Simple sunny neighborhood scene with a smooth paved path, green grass, and a few round trees. The bike is a small, simple, bright-red children's bike with clearly visible training wheels on the back and a little bell on the handlebar. Zephyr always wears a snug blue safety helmet while on or near the bike. Keep the bike easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BIKE_STYLE} The whole tiger family smiles together outside. Zephyr Tiger sits proudly on his small red bike with training wheels and a blue helmet, Daddy Tiger stands beside him with a warm smile, and Mommy Tiger stands nearby holding Auggie Tiger safely. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger got a shiny new bike.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BIKE_STYLE} Zephyr Tiger stands fully visible next to his shiny new small red bike with training wheels, looking at it with a big happy smile. Draw exactly one tiger: Zephyr. The bike is simple, red, and easy to recognize, with training wheels and a handlebar bell. No other tigers, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger helped with the helmet.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BIKE_STYLE} Daddy Tiger gently helps fasten Zephyr Tiger's blue safety helmet. Zephyr stands beside the red bike and smiles. Daddy has exactly two visible front paws total, both near the helmet strap. Draw exactly two tigers: Daddy and Zephyr. No extra arms, no duplicate paws, no other tigers, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger sat on the seat.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BIKE_STYLE} Zephyr Tiger sits on the seat of his small red bike with both paws on the handlebars and both feet near the pedals, wearing his blue helmet and a focused happy face. The training wheels keep the bike upright. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 5,
    text: "daddy tiger held the bike steady.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BIKE_STYLE} Daddy Tiger steadies the back of the small red bike while Zephyr Tiger sits on it in his blue helmet, ready to go. Daddy stands behind the bike with exactly two visible front paws total, both lightly holding the seat. Draw exactly two tigers: Daddy and Zephyr. No extra paws, no other tigers, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger pushed the pedals.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BIKE_STYLE} Zephyr Tiger pushes the pedals of his small red bike and begins to roll forward along the smooth path, wearing his blue helmet with a determined happy smile. The training wheels are clearly visible. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "mommy tiger cheered with auggie.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BIKE_STYLE} Mommy Tiger stands at the side of the path and cheers happily while holding Auggie Tiger safely in her arms. Auggie is held, not standing and not walking, and waves a little paw. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger rode down the path.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BIKE_STYLE} Zephyr Tiger rides his small red bike confidently down the smooth sunny path between green grass and a couple of round trees, wearing his blue helmet with a joyful smile. Training wheels visible. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "he rang the little bell. ding!",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BIKE_STYLE} Close, clear view of Zephyr Tiger on his small red bike happily ringing the little silver bell on the handlebar with one paw, the other paw on the grip, wearing his blue helmet. Show the bell clearly. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "the tiger family was so proud.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${BIKE_STYLE} The whole tiger family gathers happily around Zephyr Tiger and his red bike at the end of the path. Zephyr sits proudly on the bike in his blue helmet, Daddy Tiger stands beside him with exactly two visible front paws total, and Mommy Tiger stands close holding Auggie Tiger safely. Exactly four tigers total, all smiling proudly. No other cubs, no readable text.`,
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
  fullPageImages: false,
  concurrency: 2,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
