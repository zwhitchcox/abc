import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
  ASSET_RED_GROCERY_CART_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger at the grocery store";
const FOLDER = "Zephyr-Tiger-at-the-Grocery-Store";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is a pretty adult mother with her white flower and graceful medium build; Daddy Tiger is the tallest adult father with a relaxed average dad build, not muscular or bulky; Zephyr Tiger is the older cub; Auggie Tiger is the tiny baby brother who sits or is carried and does not walk.";

const STORE_STYLE =
  "Warm cozy neighborhood grocery store with soft pastel shelves, gentle amber lights, rounded produce bins, and no readable text, no labels, no logos, no brand names.";

const CART_CONSISTENCY =
  "Use the red grocery cart reference exactly whenever the cart appears: same bright red rounded handle, red lower frame, silver wire basket, four small grey wheels, and built-in child seat at the handle end. Do not change its color, size, wheel count, basket shape, or handle shape from page to page.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "Zephyr Tiger went to the grocery store.",
    characters: [
      "zephyr-tiger",
      "auggie-tiger",
      "mommy-tiger",
      "daddy-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} ${CART_CONSISTENCY} The tiger family walks through the grocery store entrance together. Mommy carries Auggie safely, Daddy pushes the empty red grocery cart, and Zephyr walks beside the cart with a happy face.`,
  },
  {
    page: 2,
    text: "Daddy Tiger pushed the cart slowly.",
    characters: [
      "zephyr-tiger",
      "daddy-tiger",
      "auggie-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly three tigers, all fully visible: Zephyr Tiger, Daddy Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} ${CART_CONSISTENCY} Daddy Tiger gently pushes the same red grocery cart down a wide aisle. Auggie sits safely in the child seat of the cart. Zephyr walks beside Daddy and looks into the cart. Daddy has exactly two visible front paws total, no extra arms or duplicate paws.`,
  },
  {
    page: 3,
    text: "Zephyr Tiger saw red strawberries.",
    characters: ["zephyr-tiger", "mommy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Mommy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} Zephyr stands at a low produce bin filled with bright red strawberries and green leaves. Mommy Tiger stands nearby and smiles warmly. The strawberries are clearly visible and look fresh.`,
  },
  {
    page: 4,
    text: "Mommy Tiger put strawberries in the cart.",
    characters: [
      "zephyr-tiger",
      "mommy-tiger",
      "auggie-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Zephyr Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} ${CART_CONSISTENCY} Mommy Tiger gently places a small clear box of red strawberries into the same red grocery cart while holding Auggie safely on her hip. Zephyr watches closely with a proud smile. Auggie is carried, not walking.`,
  },
  {
    page: 5,
    text: "Zephyr Tiger picked yellow bananas.",
    characters: [
      "zephyr-tiger",
      "daddy-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} ${CART_CONSISTENCY} Zephyr reaches toward a low produce bin of bright yellow bananas while Daddy Tiger holds the same red grocery cart nearby. Daddy smiles and watches Zephyr choose carefully. Zephyr has a normal matching pair of eyes with both eyes closed in the same happy curved smile, not winking, not one eye open and one eye closed. No toys, no cars, no trucks, no readable text.`,
  },
  {
    page: 6,
    text: "Daddy Tiger found a loaf of bread.",
    characters: [
      "zephyr-tiger",
      "daddy-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} ${CART_CONSISTENCY} Daddy Tiger gently places one warm-looking loaf of bread into the same red grocery cart. Zephyr looks at the bread with a happy face. Daddy has exactly two visible front paws total, no extra arms or duplicate paws. No toys, no cars, no trucks, no readable text.`,
  },
  {
    page: 7,
    text: "Mommy Tiger found cold milk.",
    characters: [
      "zephyr-tiger",
      "mommy-tiger",
      "auggie-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Zephyr Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${CART_CONSISTENCY} A cozy refrigerated grocery aisle with soft cool light. Mommy Tiger holds one plain bottle of milk with no label and smiles. Zephyr stands beside the same red grocery cart, and Auggie sits safely in the cart seat. No toys, no cars, no trucks, no readable text.`,
  },
  {
    page: 8,
    text: "Auggie Tiger looked at the apples.",
    characters: [
      "zephyr-tiger",
      "mommy-tiger",
      "auggie-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly three tigers, all fully visible: Zephyr Tiger, Mommy Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${STORE_STYLE} ${CART_CONSISTENCY} Auggie sits safely in the same red grocery cart child seat and looks at a round red apple. Mommy Tiger stands beside him with one gentle paw on the cart. Zephyr stands nearby beside the strawberries in the cart. Auggie is sitting, not walking. No toys, no cars, no trucks, no readable text.`,
  },
  {
    page: 9,
    text: "Zephyr Tiger helped put food on the belt.",
    characters: [
      "zephyr-tiger",
      "mommy-tiger",
      "daddy-tiger",
      "red-grocery-cart-clean-cartoon",
    ],
    prompt:
      `Draw exactly three tigers, all fully visible: Zephyr Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${CART_CONSISTENCY} At a simple grocery checkout with no readable text, Zephyr carefully places strawberries and bananas on the checkout belt. Mommy Tiger and Daddy Tiger stand nearby with the same red grocery cart and smile. No cashier is needed. No toys, no cars, no trucks, no readable text.`,
  },
  {
    page: 10,
    text: "Zephyr Tiger ate strawberries at home.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Cozy storybook ending at home near a warm kitchen table. A bowl of bright red strawberries sits on the table. Zephyr eats one strawberry with a happy smile. Mommy holds Auggie safely, Daddy stands beside them with a warm smile, and everyone is calm and happy. No toys, no vehicles, no readable text.",
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
    ASSET_RED_GROCERY_CART_CARTOON,
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
