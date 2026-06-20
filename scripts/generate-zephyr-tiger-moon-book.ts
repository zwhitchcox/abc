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

const TITLE = "zephyr tiger and the moon";
const FOLDER = "Zephyr-Tiger-and-the-Moon";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const CAMPFIRE = "small-stone-ring-campfire-clean-cartoon";
const ALL_TIGERS_CAMP = [...ALL_TIGERS, CAMPFIRE];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const WOODS_STYLE =
  "Simple friendly woods with round green trees, soft grass, a small open clearing, and gentle rolling ground. Keep every object large and easy to read at small printed size. Even in night scenes keep the tigers bright, clear, and easy to see against the darker background. No crowded background, no scary shapes, no readable text, no labels, no logos.";

const NIGHT_LIGHT =
  "It is a calm friendly night: deep blue sky, soft warm light from the campfire on the tigers, and everything cozy and safe, never scary.";

const ASSET_CAMPFIRE_CARTOON: CharacterSpec = {
  id: CAMPFIRE,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable object reference: one small safe friendly campfire inside a " +
    "ring of round gray stones, with a few brown logs and simple rounded " +
    "orange and yellow flames. Clean rounded cartoon geometry. The fire is " +
    "small and contained, never wild. No smoke clouds, no tigers, no " +
    "people, no text, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one small " +
    "safe friendly campfire: a ring of round gray stones, a few brown logs, " +
    "and simple rounded orange and yellow flames. Show the whole campfire " +
    "with no cropping. Use bold readable outlines, flat cheerful colours, " +
    "crisp edges, high contrast, and minimal texture. No smoke, no text, no " +
    "logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_CAMP,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} The tiger family stands together in a cozy woods clearing at dusk with one big bright full moon rising over the round trees in a deep blue evening sky. The small campfire from the reference glows warmly beside them. Daddy Tiger stands beside Zephyr Tiger, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text. No extra cubs.`,
  },
  {
    page: 2,
    text: "the tiger family walked into the woods. the sun was going down.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} The tiger family walks on a soft path into the friendly woods at sunset, with warm orange and pink light between the round trees. Daddy Tiger carries a simple rolled blue blanket under one arm, Zephyr Tiger walks happily beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger made a little fire. the fire glowed red and gold.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      CAMPFIRE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} In the woods clearing at early night, Daddy Tiger kneels and tends the small safe campfire from the reference while Zephyr Tiger watches from a safe distance with happy wonder. The fire glows warm red and gold on their fur. Use the campfire reference exactly: same stone ring, same logs, same small rounded flames. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "the family sat by the fire. they ate meat and carrots.",
    characters: [...ALL_TIGERS, CAMPFIRE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} The tiger family sits in a cozy circle around the small safe campfire from the reference. Simple plates with plain cooked meat and orange carrots sit in front of them, with clear cups of water. Mommy Tiger holds Auggie Tiger safely on her lap because Auggie cannot walk yet. Food is only meat, carrots, and water: no bread, no sweets, no other food. Use the campfire reference exactly. Exactly four tigers total. No extra cubs, no text.`,
  },
  {
    page: 5,
    text: "auggie tiger sat on the soft blanket. mommy tiger held him close.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} Mommy Tiger sits on a soft blue blanket in the clearing and holds Auggie Tiger close on her lap, wrapped warm and cozy. Auggie is seated and held, not standing and not walking. The warm glow of the fire lights them gently from one side. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 6,
    text: "little fireflies glowed in the dark. zephyr tiger watched the little lights.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${WOODS_STYLE} ${NIGHT_LIGHT} Zephyr Tiger stands in the dark clearing with wide happy eyes, watching many small friendly fireflies glowing soft yellow around him like tiny floating lights. The fireflies are simple round glowing dots with tiny wings. Zephyr stays bright and clearly visible. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "an owl said hoo hoo. zephyr tiger said hoo hoo too.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} One round fluffy brown owl with big friendly eyes sits on a tree branch above while Zephyr Tiger cups his paws around his mouth and happily calls back up at it, copying the owl. Daddy Tiger stands beside Zephyr smiling. Draw exactly two tigers: Zephyr and Daddy. Exactly one owl. No other animals, no readable text, no letters, no music notes.`,
  },
  {
    page: 8,
    text: "the moon came up over the trees. the moon was big and bright.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} The tiger family stands together in the clearing and looks up as one very big bright friendly full moon rises over the round dark trees, glowing soft white and yellow in the deep blue sky. The moon is the clear story focus, large and beautiful. Mommy Tiger holds Auggie Tiger safely. Exactly four tigers total. No extra cubs, no text.`,
  },
  {
    page: 9,
    text: "zephyr tiger looked at the moon. daddy tiger sat beside him.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} Zephyr Tiger and Daddy Tiger sit side by side on a soft log at the edge of the clearing, seen from a gentle three-quarter view, quietly looking up at the big bright full moon together. The moment is calm, warm, and loving. Daddy has exactly two visible front paws total. Draw exactly two tigers: Zephyr and Daddy. No other tigers, no text.`,
  },
  {
    page: 10,
    text: "zephyr tiger slept by mommy and daddy. auggie tiger slept too.",
    characters: [...ALL_TIGERS, CAMPFIRE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} ${NIGHT_LIGHT} The tiger family sleeps cozy and safe on the big soft blue blanket in the clearing, all with closed peaceful eyes. Zephyr Tiger sleeps curled between Mommy Tiger and Daddy Tiger, and tiny Auggie Tiger sleeps tucked in Mommy's arms. The campfire from the reference has burned down to a soft small warm glow. The big moon shines gently above. Exactly four tigers total, all sleeping. No extra cubs, no text.`,
  },
  {
    page: 11,
    text: "the sun came up and the dark went away. a little bird sang a soft song.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} Soft golden morning light fills the woods clearing as the sun rises between the round trees. The tiger family wakes up happy on the blue blanket: Zephyr Tiger stretches with a big yawn, Daddy Tiger sits up, and Mommy Tiger holds Auggie Tiger who rubs his sleepy eyes. One small cheerful bird sits in a tree, singing with simple curved motion lines only, no music notes, no letters. Exactly four tigers total. No extra cubs, no text.`,
  },
  {
    page: 12,
    text: "the tiger family walked home. zephyr tiger dreamed of the big moon.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${WOODS_STYLE} The tiger family walks home out of the woods on the soft path in fresh morning light. Daddy Tiger carries the rolled blue blanket, Zephyr Tiger walks beside him with a happy dreamy smile, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. A faint friendly pale moon is still just visible low in the morning sky. Exactly four tigers total. No extra cubs, no text.`,
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
    ASSET_CAMPFIRE_CARTOON,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "high",
  imageModel: "gpt-image-2",
  concurrency: 10,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
