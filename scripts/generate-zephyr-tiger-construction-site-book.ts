import "dotenv/config";
import { type CharacterSpec } from "./lib/asset-cache";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger visits the construction site";
const FOLDER = "Zephyr-Tiger-Visits-the-Construction-Site";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const DIGGER = "yellow-construction-digger-clean-cartoon";
const DUMP_TRUCK = "orange-dump-truck-clean-cartoon";
const ALL_TIGERS_CONSTRUCTION = [...ALL_TIGERS, DIGGER, DUMP_TRUCK];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk.";

const CONSTRUCTION_STYLE =
  "Simple sunny construction site with tan dirt, a few round dirt piles, a blue sky, and open space. Keep every vehicle and character large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos, no warning signs.";

const ASSET_YELLOW_DIGGER_CARTOON: CharacterSpec = {
  id: DIGGER,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: one friendly yellow construction " +
    "digger excavator with a rounded cab, black rubber tracks, one simple " +
    "jointed arm, and one scoop bucket. Clean cartoon shape, no driver, no " +
    "passengers, no tigers, no people, no text, no numbers, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one yellow " +
    "construction digger excavator with a rounded cab, black rubber tracks, " +
    "one simple jointed arm, and one scoop bucket. Show the entire digger in " +
    "a clean side/front three-quarter view with no cropping. Use bold " +
    "readable outlines, flat cheerful colours, crisp edges, high contrast, " +
    "and minimal texture. No text, no numbers, no logos.",
};

const ASSET_ORANGE_DUMP_TRUCK_CARTOON: CharacterSpec = {
  id: DUMP_TRUCK,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable vehicle object reference: one friendly orange dump truck with " +
    "a blue cab window, black wheels, a simple open dump bed, and a clean " +
    "rounded cartoon shape. No driver, no passengers, no tigers, no people, " +
    "no text, no numbers, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one orange " +
    "dump truck with a blue cab window, black wheels, and a simple open dump " +
    "bed. Show the entire truck in a clean side/front three-quarter view " +
    "with no cropping. Use bold readable outlines, flat cheerful colours, " +
    "crisp edges, high contrast, and minimal texture. No text, no numbers, " +
    "no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_CONSTRUCTION,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${CONSTRUCTION_STYLE} The whole tiger family smiles together at a sunny construction site. Use the yellow digger reference exactly on one side and the orange dump truck reference exactly on the other side. Daddy Tiger stands beside Zephyr Tiger, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and Zephyr waves. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the yellow digger.",
    characters: ["zephyr-tiger-clean-cartoon", DIGGER],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${CONSTRUCTION_STYLE} Zephyr Tiger stands fully visible on tan dirt and looks at the yellow construction digger. Use the digger reference exactly: same yellow body, rounded cab, black rubber tracks, jointed arm, and scoop bucket. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no dump truck, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger held zephyr's paw.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${CONSTRUCTION_STYLE} Daddy Tiger holds Zephyr Tiger's paw beside a simple tan dirt path at the construction site. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no vehicles, no text.`,
  },
  {
    page: 4,
    text: "mommy tiger held auggie by the fence.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${CONSTRUCTION_STYLE} Mommy Tiger stands beside a simple low wooden fence and holds Auggie Tiger safely in her arms. Auggie is held, not standing and not walking. Mommy looks pretty and warm with her white flower. Draw exactly two tigers: Mommy and Auggie. No other tigers, no vehicles, no text.`,
  },
  {
    page: 5,
    text: "the yellow digger scooped the dirt.",
    characters: [DIGGER],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${CONSTRUCTION_STYLE} The yellow construction digger scoops one clear pile of tan dirt with its bucket. Use the digger reference exactly: same yellow body, rounded cab, black rubber tracks, jointed arm, and scoop bucket. Draw no tigers and no people. No dump truck, no text.`,
  },
  {
    page: 6,
    text: "zephyr tiger saw the orange truck.",
    characters: ["zephyr-tiger-clean-cartoon", DUMP_TRUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${CONSTRUCTION_STYLE} Zephyr Tiger stands beside the orange dump truck and looks at it happily. Use the dump truck reference exactly: same orange body, blue cab window, black wheels, and open dump bed. Draw exactly one tiger: Zephyr. No other tigers, no extra cubs, no digger, no text.`,
  },
  {
    page: 7,
    text: "the dirt went into the truck.",
    characters: [DIGGER, DUMP_TRUCK],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${CONSTRUCTION_STYLE} The yellow digger pours tan dirt from its bucket into the open bed of the orange dump truck. Use both vehicle references exactly: same yellow digger and same orange dump truck. Make the falling dirt clear and simple. Draw no tigers and no people. No text.`,
  },
  {
    page: 8,
    text: "auggie tiger sat with mommy tiger.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${CONSTRUCTION_STYLE} Auggie Tiger sits safely on Mommy Tiger's lap on a blue blanket near the construction site and looks at a small tan dirt pile. Auggie is seated, not standing and not walking. Mommy holds him securely and smiles. Draw exactly two tigers: Mommy and Auggie. No other tigers, no vehicles, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger patted the smooth dirt.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${CONSTRUCTION_STYLE} Zephyr Tiger gently pats a small smooth patch of tan dirt with one paw while Daddy Tiger watches beside him. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. Make the smooth dirt patch easy to see. No vehicles, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home from the site.",
    characters: ALL_TIGERS_CONSTRUCTION,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${CONSTRUCTION_STYLE} The tiger family walks home from the sunny construction site with happy tired smiles. The yellow digger and orange dump truck sit behind them; use both references exactly. Daddy Tiger stands on the left with exactly two visible front paws total, Zephyr Tiger walks beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
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
    ASSET_YELLOW_DIGGER_CARTOON,
    ASSET_ORANGE_DUMP_TRUCK_CARTOON,
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
