import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger plants a garden";
const FOLDER = "Zephyr-Tiger-Plants-a-Garden";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is a pretty adult mother with her white flower and graceful medium build; Daddy Tiger is the tallest adult father with a relaxed average dad build, not muscular or bulky; Zephyr Tiger is the older cub; Auggie Tiger is the tiny baby brother who sits or is carried and does not walk.";

const GARDEN_STYLE =
  "Warm cozy backyard garden with soft green grass, small garden beds, gentle flowers, wooden edges, amber sunlight, pastel colors, and no readable text, no labels, no logos, no brand names.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "Zephyr Tiger found a little seed.",
    characters: ["zephyr-tiger", "mommy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Mommy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} Zephyr holds one tiny seed carefully in his small paw while Mommy Tiger kneels beside him and smiles. The seed is visible and simple. No readable text.`,
  },
  {
    page: 2,
    text: "Daddy Tiger dug a soft hole.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} Daddy Tiger uses a small rounded garden trowel to dig one soft hole in a little garden bed while Zephyr watches closely. Daddy has exactly two visible front paws total, no extra arms or duplicate paws. No readable text.`,
  },
  {
    page: 3,
    text: "Zephyr Tiger put the seed in.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} Zephyr gently drops the tiny seed into the soft hole in the garden bed. Daddy Tiger sits beside him and watches warmly. Daddy has exactly two visible front paws total, no extra arms or duplicate paws. No readable text.`,
  },
  {
    page: 4,
    text: "Mommy Tiger covered the seed.",
    characters: ["zephyr-tiger", "mommy-tiger", "auggie-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Zephyr Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} Mommy Tiger gently pats soft dirt over the seed while Zephyr watches. Auggie sits safely on a blanket beside Mommy, not walking. The garden bed is small and tidy. No readable text.`,
  },
  {
    page: 5,
    text: "Zephyr Tiger gave it water.",
    characters: ["zephyr-tiger"],
    prompt:
      "Draw exactly one tiger, fully visible: Zephyr Tiger, the older cub with the same orange-and-cream fur, rosy cheeks, and small pink-orange button nose. " +
      `${GARDEN_STYLE} Zephyr carefully pours a small stream of water from a little blue watering can onto the garden bed. Zephyr has matching peaceful happy eyes, not winking, not one eye open and one eye closed. No readable text.`,
  },
  {
    page: 6,
    text: "Auggie Tiger watched from the blanket.",
    characters: ["auggie-tiger", "mommy-tiger", "zephyr-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Auggie Tiger, Mommy Tiger, and Zephyr Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} Auggie sits safely on a soft picnic blanket and watches Zephyr water the garden. Mommy Tiger sits beside Auggie with one gentle paw near him. Auggie is sitting, not walking, not standing. No readable text.`,
  },
  {
    page: 7,
    text: "A green sprout came up.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} A tiny green sprout pokes up from the garden bed. Zephyr points at the sprout with wonder. Mommy holds Auggie safely, and Daddy stands nearby smiling. The sprout is clearly visible. No readable text.`,
  },
  {
    page: 8,
    text: "The sprout grew yellow flowers.",
    characters: ["zephyr-tiger", "mommy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Mommy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} The small plant has several bright yellow flowers. Zephyr smells one flower gently while Mommy Tiger smiles beside him. Keep the flowers simple and cheerful. No readable text.`,
  },
  {
    page: 9,
    text: "A butterfly came to the flowers.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${GARDEN_STYLE} A small orange butterfly lands near the yellow flowers. Zephyr watches quietly with delight. Daddy Tiger kneels beside him with exactly two visible front paws total, no extra arms or duplicate paws. No readable text.`,
  },
  {
    page: 10,
    text: "Zephyr Tiger loved his garden.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Cozy storybook ending in the backyard garden at warm sunset. Zephyr sits proudly beside his little plant with yellow flowers. Mommy holds Auggie safely, Daddy stands beside them with a warm smile, and everyone looks calm and happy. No readable text.",
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
