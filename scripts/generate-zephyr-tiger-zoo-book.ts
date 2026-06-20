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

const TITLE = "zephyr tiger goes to the zoo";
const FOLDER = "Zephyr-Tiger-Goes-to-the-Zoo";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const ZOO_GATE = "friendly-zoo-entrance-gate-clean-cartoon";
const ALL_TIGERS_ZOO = [...ALL_TIGERS, ZOO_GATE];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const ZOO_STYLE =
  "Simple sunny friendly zoo with green grass, a blue sky, round trees, wide clean walking paths, and simple low habitat fences or low stone walls. Zoo animals are gentle, rounded, and friendly, always inside their own habitat areas behind a low fence or wall. Keep every object large and easy to read at small printed size. No crowded background, no cages with thick bars, no readable text, no signs with letters, no labels, no logos.";

const ASSET_ZOO_ENTRANCE_GATE_CARTOON: CharacterSpec = {
  id: ZOO_GATE,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable building object reference: one friendly zoo entrance with a " +
    "simple wide arch between two warm stone pillars, a low welcoming green " +
    "gate that stands open, a few round green trees behind it, and clean " +
    "rounded cartoon geometry. The arch is plain with no letters and no " +
    "words. No animals, no tigers, no people, no text, no signs, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one " +
    "friendly zoo entrance: a simple wide arch between two warm stone " +
    "pillars, a low open green gate, and a few round green trees behind it. " +
    "Show the whole entrance with no cropping. The arch is plain with no " +
    "letters, no words, no symbols. Use bold readable outlines, flat " +
    "cheerful colours, crisp edges, high contrast, and minimal texture. No " +
    "animals, no people, no text, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_ZOO,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} The whole tiger family stands happily on the path in front of the zoo entrance. Use the entrance reference exactly: same wide plain arch, same warm stone pillars, same low open green gate, same round trees. Daddy Tiger stands beside Zephyr Tiger, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and Zephyr waves. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text. No extra cubs.`,
  },
  {
    page: 2,
    text: "the tiger family went to the zoo. zephyr tiger was so happy.",
    characters: ALL_TIGERS_ZOO,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} The tiger family walks through the zoo entrance together. Use the entrance reference exactly in the background. Zephyr Tiger skips happily in front with a big smile, Daddy Tiger walks beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no other animals yet, no text.`,
  },
  {
    page: 3,
    text: "zephyr tiger saw a big elephant. the elephant ate green leaves.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${ZOO_STYLE} Zephyr Tiger stands on the zoo path and looks up at one big gentle gray elephant inside its grassy habitat behind a low stone wall. The elephant holds a small bunch of green leaves with its trunk near its mouth. Make the elephant large, round, and friendly, the clear story focus. Draw exactly one tiger: Zephyr. No other tigers, no other animals, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger saw a big tiger. the big tiger looked like daddy.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} Zephyr Tiger stands on the zoo path with Daddy Tiger and looks with delight at one big friendly wild zoo tiger resting on a rock inside its grassy habitat behind a low stone wall. The zoo tiger is large and calm with orange and black stripes, clearly a zoo animal inside the habitat, and it looks a little like Daddy Tiger. Draw exactly three tiger characters total: Zephyr the cub and Daddy on the path, plus the one big zoo tiger inside the habitat. No other tigers, no other animals, no text.`,
  },
  {
    page: 5,
    text: "auggie tiger saw a pink bird. auggie clapped and clapped.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} Auggie Tiger sits safely in Mommy Tiger's arms and claps his little paws with joy while looking at one tall pink flamingo-style bird standing in a shallow blue pool inside its habitat behind a low fence. The pink bird is simple, rounded, and friendly. Auggie is held, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no other animals, no text.`,
  },
  {
    page: 6,
    text: "a turtle swam in the water. zephyr tiger watched it swim.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${ZOO_STYLE} Zephyr Tiger leans gently on a low wall and watches one friendly green turtle swimming in clear blue water in a simple open-top pool habitat. Show the turtle clearly under or at the surface of the water with simple bubble circles. Draw exactly one tiger: Zephyr. No other tigers, no other animals, no text.`,
  },
  {
    page: 7,
    text: "an eagle soared over the trees. zephyr tiger looked up and up.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} Zephyr Tiger and Daddy Tiger stand on the zoo path and look up at one large brown and white eagle soaring high in the blue sky above round green trees with its wings spread wide. The eagle is simple, bold, and easy to read. Draw exactly two tigers: Zephyr and Daddy. No other tigers, no other animals, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger fed a little goat. the goat ate the food fast.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${ZOO_STYLE} In a small friendly petting area with a low wooden fence, Zephyr Tiger holds out one small open paw with simple food pellets toward one little white and brown goat. The goat eagerly eats while Zephyr smiles. Draw exactly one tiger: Zephyr. Exactly one goat. No other tigers, no other animals, no text.`,
  },
  {
    page: 9,
    text: "mommy tiger showed auggie an owl. the owl said hoo hoo.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} Mommy Tiger holds Auggie Tiger safely and points gently toward one round fluffy brown owl sitting on a simple tree branch inside its open habitat. The owl has big friendly round eyes. Auggie looks at the owl with wonder. Auggie is held, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no other animals, no readable text, no music notes.`,
  },
  {
    page: 10,
    text: "the family sat down to eat. zephyr tiger had meat and carrots.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} The tiger family sits together at a simple round picnic table on the zoo path under a round green tree. On the table in front of Zephyr Tiger is one simple plate with a piece of plain cooked meat and a few orange carrots, plus a clear cup of water. Zephyr smiles and eats happily. Daddy Tiger sits beside him, and Mommy Tiger holds Auggie Tiger safely on her lap because Auggie cannot walk yet. Food is only meat, vegetables, and water: no bread, no milk, no ice cream, no candy, no cake, no cookies, no sweets. Exactly four tigers total. No extra cubs, no other animals, no text.`,
  },
  {
    page: 11,
    text: "zephyr tiger saw little fish. the fish swam round and round.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${ZOO_STYLE} Zephyr Tiger stands in front of one big simple aquarium tank window and watches three small bright orange fish swimming in a gentle circle in clear blue water. Simple bubbles rise in the tank. The tank glass is clean with no letters and no signs. Draw exactly one tiger: Zephyr. No other tigers, no other animals outside the tank, no text.`,
  },
  {
    page: 12,
    text: "the tiger family went home. zephyr tiger dreamed of the zoo.",
    characters: ALL_TIGERS_ZOO,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${ZOO_STYLE} The tiger family walks away on the path with the zoo entrance behind them in warm late afternoon light. Use the entrance reference exactly in the background. Zephyr Tiger rides happily on Daddy Tiger's shoulders with sleepy happy eyes, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no other animals, no text.`,
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
    ASSET_ZOO_ENTRANCE_GATE_CARTOON,
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
