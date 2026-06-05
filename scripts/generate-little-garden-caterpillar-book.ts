import "dotenv/config";
import { type CharacterSpec, type StyleSpec } from "./lib/asset-cache";
import { generateBook, type BookPage } from "./lib/book-generator";

const TITLE = "the little garden caterpillar";
const FOLDER = "The-Little-Garden-Caterpillar";

const STYLE_PAINTED_PAPER_COLLAGE: StyleSpec = {
  id: "painted-paper-collage",
  description:
    "Original children's picture-book illustration made from painted-paper " +
    "collage. Use bright hand-painted paper textures, visible brush streaks, " +
    "cut-paper and torn-paper edges, simple flat layered shapes, bold cheerful " +
    "colors, white or cream negative space, and playful toddler-friendly " +
    "composition. Keep it original; do not copy any existing book page, " +
    "specific character design, or exact artist style. No text, no words, no " +
    "letters.",
  referencePrompt:
    "A sample original children's picture-book illustration in painted-paper " +
    "collage style. A smiling yellow sun, a green leaf, a red strawberry, and " +
    "a blue flower are built from layered painted paper cutouts on a warm " +
    "cream background. Visible brush streaks, torn-paper edges, flat colorful " +
    "shapes, simple cheerful composition, no text, no words, no letters.",
  quality: "high",
  size: "1024x1024",
};

const PRINT_CLEAR =
  "Use an original painted-paper collage picture-book look: hand-painted paper textures, cut-paper/torn-paper edges, flat layered shapes, bright colors, simple cream background, and clear readable silhouettes. Do not copy any existing book page, existing caterpillar character, or exact artist style. No text, no words, no letters.";

const CATERPILLAR = "little-garden-caterpillar-collage";
const CHRYSALIS = "little-green-chrysalis-collage";
const BUTTERFLY = "bright-garden-butterfly-collage";

const ASSET_CATERPILLAR: CharacterSpec = {
  id: CATERPILLAR,
  style: STYLE_PAINTED_PAPER_COLLAGE.id,
  description:
    "A reusable original caterpillar character made from painted paper " +
    "cutouts. Small friendly green segmented body, warm yellow round head, " +
    "two short blue antennae, tiny black feet, simple happy face, and rosy " +
    "cheeks. Not a red-headed caterpillar. Original design, no text.",
  referenceHint:
    "Character reference page on a plain warm cream background. Draw only " +
    "the single caterpillar, side view, fully visible, with a green segmented " +
    "body, yellow head, blue antennae, tiny black feet, and simple happy face. " +
    "Use painted-paper collage textures and cut-paper edges. No food, no " +
    "other characters, no text.",
};

const ASSET_CHRYSALIS: CharacterSpec = {
  id: CHRYSALIS,
  style: STYLE_PAINTED_PAPER_COLLAGE.id,
  description:
    "A reusable chrysalis object made from painted paper cutouts. Small " +
    "soft green hanging chrysalis with simple layered leaf-like shapes, " +
    "gentle curved silhouette, a short brown stem, and no face. Original " +
    "design, no text.",
  referenceHint:
    "Object reference page on a plain warm cream background. Draw only one " +
    "green chrysalis hanging from a short brown stem. Painted-paper collage " +
    "textures, cut-paper edges, simple clear silhouette, no caterpillar, no " +
    "butterfly, no text.",
};

const ASSET_BUTTERFLY: CharacterSpec = {
  id: BUTTERFLY,
  style: STYLE_PAINTED_PAPER_COLLAGE.id,
  description:
    "A reusable original butterfly character made from painted paper cutouts. " +
    "Small friendly butterfly with a purple body, round happy face, two blue " +
    "antennae, and wide bright wings made of orange, teal, yellow, and pink " +
    "paper shapes. Original design, no text.",
  referenceHint:
    "Character reference page on a plain warm cream background. Draw only " +
    "the single butterfly, fully visible, wings open, purple body, blue " +
    "antennae, bright orange teal yellow and pink painted-paper wing shapes. " +
    "Use cut-paper edges and visible brush texture. No caterpillar, no " +
    "flower, no text.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: [CATERPILLAR, BUTTERFLY],
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} The little green-and-yellow caterpillar rests on a big green leaf in a sunny garden. A bright butterfly with orange, teal, yellow, and pink wings flies above a blue flower in the background. Leave clean open cream space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "a little caterpillar sat on a leaf.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the caterpillar reference exactly: green segmented body, yellow head, blue antennae, tiny black feet. The little caterpillar sits on one large green leaf. Simple cream background with one blue flower nearby.`,
  },
  {
    page: 3,
    text: "the caterpillar felt hungry.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the caterpillar reference exactly. The caterpillar looks at a small garden path with a hungry curious face. Around him are simple painted-paper leaves and one tiny red strawberry plant, but he has not eaten yet.`,
  },
  {
    page: 4,
    text: "he ate a red strawberry.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the caterpillar reference exactly. The caterpillar nibbles one bright red strawberry with green leaves. Show one small bite mark made from a cut-paper shape. No other food.`,
  },
  {
    page: 5,
    text: "he ate a yellow pear.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the caterpillar reference exactly. The caterpillar sits beside one yellow pear with a small bite mark. Keep the pear large and clear, with a simple brown stem and green leaf. No other food.`,
  },
  {
    page: 6,
    text: "he ate a green pea.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the caterpillar reference exactly. The caterpillar looks at one open green pea pod with round peas inside. One pea has a small bite mark. Simple garden leaves behind him, no other food.`,
  },
  {
    page: 7,
    text: "he ate a soft leaf.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the caterpillar reference exactly. The caterpillar nibbles one soft green leaf. Show one rounded bite mark in the leaf edge. Calm garden scene, no fruit, no sweets, no extra food.`,
  },
  {
    page: 8,
    text: "now he was big and sleepy.",
    characters: [CATERPILLAR],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Draw the same caterpillar design, but a little bigger and rounder after eating. He curls sleepily on a broad green leaf under a warm yellow sun. Keep the yellow head, green body, blue antennae, and tiny black feet consistent.`,
  },
  {
    page: 9,
    text: "he slept in a little chrysalis.",
    characters: [CHRYSALIS],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the chrysalis reference exactly. A little green chrysalis hangs from a short brown stem under a broad leaf. Peaceful simple garden background with cream negative space. No caterpillar visible, no butterfly visible.`,
  },
  {
    page: 10,
    text: "he came out as a bright butterfly.",
    characters: [BUTTERFLY],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} Use the butterfly reference exactly: purple body, blue antennae, bright orange teal yellow and pink painted-paper wings. The butterfly flies above one blue flower in the sunny garden. No caterpillar visible, no chrysalis visible.`,
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Nature Stories",
  style: STYLE_PAINTED_PAPER_COLLAGE,
  characters: [ASSET_CATERPILLAR, ASSET_CHRYSALIS, ASSET_BUTTERFLY],
  pages: PAGES,
  layout: "caption",
  imageSize: "1024x1536",
  imageQuality: "high",
  imageModel: "gpt-image-2",
  concurrency: 2,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
