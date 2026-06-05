import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger goes back to dollywood";
const FOLDER = "Zephyr-Tiger-Goes-Back-to-Dollywood";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is a pretty adult mother with her white flower and graceful medium build; Daddy Tiger is the tallest adult father with a relaxed average dad build, not muscular or bulky; Zephyr Tiger is the older cub; Auggie Tiger is the tiny baby brother who sits or is carried and does not walk.";

const PARK_STYLE =
  "Warm cozy mountain theme park inspired by Dollywood, with wooden fences, flowers, trees, soft amber lights, green Tennessee hills, and no readable text, no labels, no logos, no brand names.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "Zephyr Tiger drove to Dollywood with his family.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "The tiger family rides together in a cozy car through green Tennessee hills toward a warm mountain theme park. Zephyr looks out the window with a happy face. Mommy sits with Auggie safely in a baby seat, and Daddy drives calmly. No readable text.",
  },
  {
    page: 2,
    text: "Zephyr Tiger rode the big tree swing.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${PARK_STYLE} Zephyr and Daddy ride a friendly tree-and-ship-like pendulum swing that moves back and forth. Daddy sits beside Zephyr with exactly two visible front paws total, no extra arms or duplicate paws. Zephyr holds the safety bar with both small paws and smiles.`,
  },
  {
    page: 3,
    text: "Zephyr Tiger rode a green frog.",
    characters: ["zephyr-tiger", "mommy-tiger", "auggie-tiger"],
    referenceImages: ["data/ride-reference-images/frogs-and-fireflies.png"],
    prompt:
      `Draw exactly three tigers, all fully visible: Zephyr Tiger, Mommy Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      "Use the supplied Frogs and Fireflies ride photo as a structural reference for the ride only, not for the people. Draw big glossy green frog-shaped ride vehicles with huge round eyes, round white bellies, green spotted backs, side handles, and open seats under a covered green-and-yellow pavilion. Zephyr rides in one green frog. Mommy stands nearby holding Auggie safely on her hip while they wave. Auggie is carried, not walking. No readable text.",
  },
  {
    page: 4,
    text: "The tiger family stopped for cold water.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${PARK_STYLE} The family sits in the shade at a small picnic table taking a water break. Zephyr holds a clear water bottle with both paws. Mommy holds Auggie safely and helps him drink from a small cup. Daddy sits on the other side with a water bottle and a simple backpack. There are exactly two adults and exactly two cubs, no extra cubs. No dessert, no candy, no ice cream.`,
  },
  {
    page: 5,
    text: "Zephyr Tiger felt the wind on Dragonflier.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${PARK_STYLE} Zephyr and Daddy ride a friendly dragonfly-themed coaster train above a creekside path. The train has soft dragonfly shapes and wings, with a safe lap bar. Zephyr smiles into the wind, and Daddy sits close beside him. No scary drop and no readable text.`,
  },
  {
    page: 6,
    text: "Zephyr Tiger laughed on the mockingbird ride.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${PARK_STYLE} Zephyr and Daddy ride a colorful bird-themed ride where a small bird car swings gently outward as it turns. Zephyr laughs while holding the safety bar. Daddy smiles beside him with exactly two visible front paws total, no extra arms or duplicate paws. No readable text.`,
  },
  {
    page: 7,
    text: "Zephyr Tiger sat on the merry-go-round.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${PARK_STYLE} The family rides a warm carousel with painted horses and golden lights. Zephyr sits on a carousel horse while Mommy stands beside him. Daddy holds Auggie safely nearby. Auggie is carried, not walking. No readable text.`,
  },
  {
    page: 8,
    text: "Zephyr Tiger spun with Daddy Tiger.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${PARK_STYLE} Zephyr and Daddy ride a gentle scrambler ride in one small rounded car. The car turns this way and that way, with a safe lap bar down. Zephyr laughs, and Daddy sits close beside him with exactly two visible front paws total. No extra arms, no duplicate paws, no readable text.`,
  },
  {
    page: 9,
    text: "Zephyr Tiger flew in an elephant.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    referenceImages: [
      "data/ride-reference-images/amazing-flying-elephants.jpg",
    ],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Use the supplied Amazing Flying Elephants ride photo as a structural reference for the ride only, not for the people. Make the real ride the main image: pale gray elephant-shaped ride vehicles with big ears, curled trunks, colored saddle seats, and open bench seats attached to long angled metal arms around a central hub. Only Zephyr Tiger and Daddy Tiger are inside one flying elephant vehicle. Zephyr sits beside Daddy in the elephant vehicle. Mommy Tiger stands on the ground outside the ride fence holding tiny Auggie safely in her arms while they watch. Auggie is not riding, not sitting in the elephant, not walking, and not separated from Mommy. Do not draw a toy elephant, carousel horse, car, dream bubble, sign, logo, word, letter, or readable text.",
  },
  {
    page: 10,
    text: "Zephyr Tiger went home tired and happy.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Cozy evening car ride home from the mountain theme park. Zephyr sits sleepily in his seat holding a tiny park keepsake with no text. Mommy holds Auggie safely, Daddy drives calmly, and warm sunset light comes through the windows. Everyone looks tired and happy. No readable text.",
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
