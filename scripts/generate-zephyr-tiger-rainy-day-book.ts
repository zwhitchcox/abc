import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger and the rainy day";
const FOLDER = "Zephyr-Tiger-and-the-Rainy-Day";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is a pretty adult mother with her white flower and graceful medium build; Daddy Tiger is the tallest adult father with a relaxed average dad build, not muscular or bulky; Zephyr Tiger is the older cub; Auggie Tiger is the tiny baby brother who sits or is carried and does not walk.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "Zephyr Tiger saw rain on the window.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Cozy morning inside the tiger family den, with soft rain visible on a round window. Zephyr stands near the window looking outside with wonder. Mommy sits nearby holding baby Auggie safely. Daddy stands gently behind them with a warm smile. No readable text.",
  },
  {
    page: 2,
    text: "Mommy Tiger gave Zephyr his yellow rain coat.",
    characters: ["zephyr-tiger", "mommy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Mommy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Mommy Tiger kneels gracefully and helps Zephyr put on a small bright yellow rain coat. Zephyr smiles and lifts his arms. Cozy doorway, soft rainy light, no readable text.",
  },
  {
    page: 3,
    text: "Daddy Tiger found Zephyr's red rain boots.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Daddy Tiger sits by the door and holds out Zephyr's small red rain boots. Zephyr reaches for the boots with a happy face. Daddy has exactly two visible front paws, no extra arms or duplicate paws. Rainy doorway scene, no readable text.",
  },
  {
    page: 4,
    text: "Auggie Tiger watched from Mommy's lap.",
    characters: ["auggie-tiger", "mommy-tiger", "zephyr-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Auggie Tiger, and Zephyr Tiger. ${FAMILY_CONSISTENCY} ` +
      "Mommy Tiger sits on a soft bench holding tiny baby Auggie safely on her lap. Auggie watches Zephyr get ready for rain and claps while sitting. Zephyr stands nearby in his yellow rain coat and red rain boots. No readable text.",
  },
  {
    page: 5,
    text: "Zephyr Tiger stepped into a little puddle.",
    characters: ["zephyr-tiger"],
    prompt:
      "Draw exactly one tiger, fully visible: Zephyr Tiger, the older cub with the same orange-and-cream fur, rosy cheeks, and small red rain boots. Zephyr gently steps into one small shallow puddle outside the den, making a tiny splash. He wears a yellow rain coat and smiles. Soft green grass, gray rain clouds, no readable text.",
  },
  {
    page: 6,
    text: "The puddle went splash under his boots.",
    characters: ["zephyr-tiger"],
    prompt:
      "Draw exactly one tiger, fully visible: Zephyr Tiger, the older cub in a yellow rain coat and red rain boots. Zephyr makes one cheerful splash in a shallow puddle, with water drops around his boots. Keep the splash small and friendly. Rainy garden path, no readable text.",
  },
  {
    page: 7,
    text: "Daddy Tiger held the big blue umbrella.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Daddy Tiger holds one big blue umbrella over himself and Zephyr as they stand in gentle rain. Daddy has exactly two visible front paws total, both holding the umbrella handle naturally, with no extra arms or duplicate paws. Zephyr stands beside him wearing his same bright yellow rain coat and same small red rain boots, smiling. Do not change Zephyr's coat color. No readable text.",
  },
  {
    page: 8,
    text: "Mommy Tiger showed Zephyr a tiny snail.",
    characters: ["zephyr-tiger", "mommy-tiger", "auggie-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Zephyr Tiger, Mommy Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      "Mommy Tiger gently points to a tiny snail on a wet leaf beside the garden path while holding Auggie safely on her hip. Zephyr crouches to look closely while wearing his same bright yellow rain coat and same small red rain boots from the previous pages. Do not give Zephyr a blue coat. The snail is small and cute. Gentle rain, no readable text.",
  },
  {
    page: 9,
    text: "Then the sun came out over the trees.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "The rain stops and warm sun breaks through over green trees. The whole tiger family looks up happily from the garden path. Mommy holds Auggie safely, Daddy stands beside Zephyr, and Zephyr still wears his bright yellow rain coat and small red rain boots. Puddles sparkle around them. No readable text.",
  },
  {
    page: 10,
    text: "Zephyr Tiger saw a rainbow and smiled.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "A soft rainbow arcs over the tiger family's garden after the rain. Zephyr smiles up at the rainbow while still wearing his bright yellow rain coat and small red rain boots. Mommy holds Auggie, Daddy stands warmly beside them, and everyone is calm and happy. Cozy storybook ending, no readable text.",
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
