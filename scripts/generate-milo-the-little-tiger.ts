import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_MILO_TIGER,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "Milo the Little Tiger";
const FOLDER = "Milo-the-Little-Tiger";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: [
      "zephyr-tiger",
      "auggie-tiger",
      "mommy-tiger",
      "daddy-tiger",
      "milo-tiger",
    ],
    prompt:
      "Book cover. Zephyr Tiger and his family meet a small tiger cub named Milo at a sunny park. " +
      "Milo stands beside Zephyr with a shy happy smile. Mommy Tiger holds Auggie Tiger, and " +
      "Daddy Tiger stands nearby waving. Green grass, trees, a walking path, and a bright open sky. " +
      "Leave a clear sky-area at the top for a title, but draw no text.",
  },
  {
    page: 2,
    text:
      "this little tiger is milo.\n\n" +
      "he came to the park with a shy smile.",
    characters: [
      "zephyr-tiger",
      "milo-tiger",
      "mommy-tiger",
      "daddy-tiger",
      "auggie-tiger",
    ],
    prompt:
      "Zephyr Tiger stands at a sunny park with Mommy Tiger, Daddy Tiger, and baby Auggie Tiger. " +
      "A small tiger cub named Milo walks toward them on the path with a shy happy smile and one paw raised. " +
      "Keep all five characters clearly visible. Simple park background with grass, trees, and a bench.",
  },
  {
    page: 3,
    text: 'zephyr said, "hi, milo."\n\n' + 'milo said, "can i play?"',
    characters: ["zephyr-tiger", "milo-tiger"],
    prompt:
      "Zephyr Tiger smiles warmly and waves to Milo Tiger at the park. Milo stands close by with a hopeful shy smile, paws together. " +
      "The two cubs are the focus. Behind them is a simple playground path and green trees. No readable text.",
  },
  {
    page: 4,
    text:
      "zephyr showed milo the big slide.\n\n" +
      "milo looked up and held still.",
    characters: ["zephyr-tiger", "milo-tiger"],
    prompt:
      "Zephyr Tiger points to a big friendly playground slide. Milo Tiger stands beside him at the bottom of the slide, looking up carefully and holding still. " +
      "Make the slide large but safe and cheerful, with simple bold shapes and an uncluttered park background.",
  },
  {
    page: 5,
    text:
      'daddy tiger said, "you can go slow."\n\n' + "milo took one little step.",
    characters: ["zephyr-tiger", "milo-tiger", "daddy-tiger"],
    prompt:
      "Daddy Tiger kneels beside the playground steps and gestures gently. Milo Tiger takes one careful little step up. " +
      "Zephyr Tiger waits nearby with an encouraging smile. Show the slide steps clearly and safely. No other tigers.",
  },
  {
    page: 6,
    text: "milo went down the slide.\n\n" + "zephyr clapped and smiled.",
    characters: ["zephyr-tiger", "milo-tiger"],
    prompt:
      "Milo Tiger slides down a bright playground slide with a surprised happy smile. Zephyr Tiger stands at the bottom clapping and smiling. " +
      "Simple sunny park scene, readable silhouettes, no text.",
  },
  {
    page: 7,
    text: "mommy tiger sat with auggie.\n\n" + "auggie waved at milo.",
    characters: ["milo-tiger", "mommy-tiger", "auggie-tiger", "zephyr-tiger"],
    prompt:
      "Mommy Tiger sits on a park blanket holding baby Auggie Tiger. Auggie waves at Milo Tiger. Zephyr Tiger stands beside Milo. " +
      "Milo smiles back, feeling included. Keep Mommy, Auggie, Zephyr, and Milo visible. Simple park blanket, grass, and trees.",
  },
  {
    page: 8,
    text:
      "zephyr and milo ran on the grass.\n\n" + "they ran fast and then slow.",
    characters: ["zephyr-tiger", "milo-tiger"],
    prompt:
      "Zephyr Tiger and Milo Tiger run across green park grass together. Show a playful moment where they are moving side by side, smiling. " +
      "Use simple motion lines or dust puffs only, no letters. Clear sunny background.",
  },
  {
    page: 9,
    text: "milo felt happy now.\n\n" + "he had a new friend.",
    characters: [
      "zephyr-tiger",
      "milo-tiger",
      "mommy-tiger",
      "daddy-tiger",
      "auggie-tiger",
    ],
    prompt:
      "Milo Tiger and Zephyr Tiger stand together smiling as friends. Mommy Tiger, Daddy Tiger, and Auggie Tiger are nearby on the park path, smiling too. " +
      "Warm afternoon light, trees, grass, and a simple bench. Keep all five characters visible.",
  },
  {
    page: 10,
    text: "zephyr waved bye to milo.\n\n" + '"come play again," said zephyr.',
    characters: [
      "zephyr-tiger",
      "milo-tiger",
      "auggie-tiger",
      "mommy-tiger",
      "daddy-tiger",
    ],
    prompt:
      "At the park path, Zephyr Tiger waves goodbye to Milo Tiger. Milo waves back with a big happy smile. " +
      "Mommy Tiger, Daddy Tiger, and baby Auggie Tiger stand with Zephyr. Warm sunset light, simple trees and grass. No text.",
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Tiger Stories",
  style: STYLE_COZY_WATERCOLOUR,
  characters: [
    CHAR_MILO_TIGER,
    CHAR_ZEPHYR_TIGER,
    CHAR_AUGGIE_TIGER,
    CHAR_MOMMY_TIGER,
    CHAR_DADDY_TIGER,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "medium",
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
