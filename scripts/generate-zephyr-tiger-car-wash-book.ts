import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
  ASSET_DIRTY_BLUE_FAMILY_CAR_CARTOON,
  ASSET_CLEAN_BLUE_FAMILY_CAR_CARTOON,
  ASSET_PARTLY_CLEAN_BLUE_FAMILY_CAR_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger goes to the car wash";
const FOLDER = "Zephyr-Tiger-Goes-to-the-Car-Wash";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const DIRTY_CAR = "dirty-blue-family-car-clean-cartoon";
const CLEAN_CAR = "clean-blue-family-car-clean-cartoon";
const PARTLY_CLEAN_CAR = "partly-clean-blue-family-car-clean-cartoon";

const ALL_TIGERS_DIRTY_CAR = [...ALL_TIGERS, DIRTY_CAR];
const ALL_TIGERS_CLEAN_CAR = [...ALL_TIGERS, CLEAN_CAR];
const ALL_TIGERS_PARTLY_CLEAN_CAR = [...ALL_TIGERS, PARTLY_CLEAN_CAR];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_CLEAN_CAR,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} The whole tiger family smiles beside the clean bright blue family car after the car wash. Use the clean car reference exactly for the vehicle: same rounded shape, same blue colour, clean windows, clean wheels, and shiny paint. The car is clean and sparkling, with no mud, no dirt, no leaves, no soap foam, and no brushes touching it. Daddy Tiger holds baby Auggie Tiger safely because Auggie cannot walk yet, Zephyr Tiger waves, and Mommy Tiger smiles with her white flower. A simple cheerful car wash building can be far in the background, but the clean car and family are the focus. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the dirty car.",
    characters: ["zephyr-tiger-clean-cartoon", DIRTY_CAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Zephyr Tiger stands in the driveway beside the dirty bright blue family car before the car wash, looking up at it with a happy curious smile. Use the dirty car reference exactly for the vehicle: same rounded shape, same blue colour, same muddy doors, dusty windows, muddy wheels, and leaf marks. Draw the entire car in the frame in a side/front three-quarter view, with all four wheels visible and no cropping. Simple sunny home driveway, one small tree, plain blue sky, uncluttered background. No car wash building, no brushes, no water sprays, no soap. Exactly one tiger: Zephyr. No other tigers.`,
  },
  {
    page: 3,
    text: "daddy tiger drove the dirty car to the car wash.",
    characters: ALL_TIGERS_DIRTY_CAR,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Daddy Tiger is driving the dirty bright blue family car on a simple road toward a car wash with colourful round brushes visible ahead. Use the dirty car reference exactly for the vehicle: same rounded shape, same blue colour, same muddy doors, dusty windows, muddy wheels, and leaf marks. Show Daddy Tiger inside the driver's seat holding the steering wheel. Mommy Tiger sits in the front passenger seat. Zephyr Tiger sits in the back seat looking out the window. Auggie Tiger sits safely buckled in a baby car seat. Exactly four tigers total, all inside the car; no tigers standing outside the car, no extra cubs, no duplicate tigers.`,
  },
  {
    page: 4,
    text: "the big brushes went round and round.",
    characters: ALL_TIGERS_PARTLY_CLEAN_CAR,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} The bright blue family car moves slowly through the car wash while it is halfway cleaned. Use the partly-clean car reference exactly for the vehicle: same rounded shape, same blue colour, clean shiny front/upper panels, dirty muddy rear/lower panels, and a clear soap-and-water boundary between clean and dirty parts. Two huge soft round brushes spin beside the muddy rear/lower part with clear circular motion lines, visibly scrubbing mud away. The clean blue front should contrast clearly with the dirty muddy back. The tiger family is visible through the windows, all smiling. Exactly four tigers total, all inside the car. Keep the brushes large and easy to read.`,
  },
  {
    page: 5,
    text: "soap went on the car.",
    characters: ALL_TIGERS_PARTLY_CLEAN_CAR,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Thick white soap foam goes onto the bright blue family car while it is halfway cleaned. Use the partly-clean car reference exactly for the vehicle: same rounded shape, same blue colour, clean shiny front/upper panels, dirty muddy lower/rear panels, and a visible soap boundary where mud is disappearing. Put soap foam and bubbles over the dirty muddy sections, but leave some clean blue shiny panels visible so it is clear the car is being cleaned. Zephyr presses his paws near the inside window and smiles. Auggie sits safely in his car seat. Mommy and Daddy are visible in front. Exactly four tigers total, all inside the car. This is the washing step, before the car is fully clean.`,
  },
  {
    page: 6,
    text: "zephyr tiger saw many bubbles.",
    characters: ["zephyr-tiger-clean-cartoon", DIRTY_CAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Close view of Zephyr Tiger inside the dirty bright blue family car during the wash, smiling wide as big round soap bubbles float outside the window. Use the dirty car reference for the visible window shape and blue door edge, but most of the outside is covered by bubbles and soap. Make the bubbles large, simple, and high contrast so they print clearly. No other text or clutter.`,
  },
  {
    page: 7,
    text: "auggie tiger sat in his car seat and clapped.",
    characters: ["auggie-tiger-clean-cartoon", DIRTY_CAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Auggie Tiger sits safely buckled in a baby car seat inside the dirty bright blue family car during the wash, clapping his little paws with a delighted smile. He is seated and cannot walk. Use the dirty car reference for the visible window shape and blue door edge. Soft soap bubbles are visible outside the side window.`,
  },
  {
    page: 8,
    text: "mommy tiger wiped one small spot.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "mommy-tiger-clean-cartoon",
      CLEAN_CAR,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Mommy Tiger stands beside the clean bright blue family car after the wash and wipes one small water spot with a yellow cloth. Use the clean car reference exactly for the vehicle: same rounded shape, same blue colour, clean windows, clean wheels, and shiny paint. Zephyr stands nearby watching proudly. The car is clean and shiny now, with no mud and no dirt. Simple drying area, no readable signs.`,
  },
  {
    page: 9,
    text: "the car was clean and shiny.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      CLEAN_CAR,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} The clean bright blue family car sparkles in the sun, clean and shiny. Use the clean car reference exactly for the vehicle: same rounded shape, same blue colour, clean windows, clean wheels, and shiny paint. Daddy Tiger stands beside the car with one paw near the hood, and Zephyr Tiger stands beside him smiling at the clean car. No reflections of characters in the car door or windows, no see-through duplicate cubs, no extra tigers. No mud, no dirt, no leaves. Use a few simple star-shaped sparkles, no text.`,
  },
  {
    page: 10,
    text: "the tiger family went home with a smile.",
    characters: ALL_TIGERS_CLEAN_CAR,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} The tiger family is home in a sunny driveway after the car wash. Use the clean car reference exactly for the vehicle: same rounded shape, same blue colour, clean windows, clean wheels, and shiny paint. Draw the full clean bright blue family car parked behind them in a clean side/front three-quarter view with generous margin around the car; the entire car must fit inside the frame with all four wheels visible, no cropping, no open doors, no confusing interior details. Daddy Tiger stands on the left holding baby Auggie Tiger safely in his arms because Auggie cannot walk yet. Zephyr Tiger stands in the middle waving. Mommy Tiger stands on the right smiling with her white flower. The car looks clean and shiny with a few simple sparkles. Exactly four tigers total. No extra cubs. No duplicate tigers.`,
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
    ASSET_DIRTY_BLUE_FAMILY_CAR_CARTOON,
    ASSET_CLEAN_BLUE_FAMILY_CAR_CARTOON,
    ASSET_PARTLY_CLEAN_BLUE_FAMILY_CAR_CARTOON,
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
