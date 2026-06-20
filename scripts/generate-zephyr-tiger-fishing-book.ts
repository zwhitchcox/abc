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

const TITLE = "zephyr tiger goes fishing";
const FOLDER = "Zephyr-Tiger-Goes-Fishing";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const FISHING_ROD = "simple-red-fishing-rod-clean-cartoon";
const ALL_TIGERS_FISHING = [...ALL_TIGERS, FISHING_ROD];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const LAKE_STYLE =
  "Simple sunny lakeside with a calm blue lake, a soft sandy and grassy shore, green reeds at the water edge, round green trees, and a blue sky. Keep every object large and easy to read at small printed size. No crowded background, no boats, no people, no readable text, no labels, no logos.";

const ASSET_RED_FISHING_ROD_CARTOON: CharacterSpec = {
  id: FISHING_ROD,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable object reference: one simple friendly red fishing rod with " +
    "a light brown handle, a small round gray reel, a thin black line, and " +
    "a little round red and white bobber at the end of the line. Clean " +
    "rounded cartoon geometry. No hook detail, no fish, no tigers, no " +
    "people, no text, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one simple " +
    "red fishing rod with a light brown handle, a small round gray reel, a " +
    "thin black line, and a little round red and white bobber at the end of " +
    "the line. Show the whole rod with no cropping. Use bold readable " +
    "outlines, flat cheerful colours, crisp edges, high contrast, and " +
    "minimal texture. No hook detail, no fish, no text, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_FISHING,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} The tiger family stands happily on the sunny lake shore. Daddy Tiger holds one red fishing rod from the rod reference, Zephyr Tiger stands beside him excited, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. The calm blue lake and round green trees are behind them. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text. No extra cubs.`,
  },
  {
    page: 2,
    text: "zephyr tiger went fishing with daddy. mommy and auggie came too.",
    characters: ALL_TIGERS_FISHING,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} The tiger family walks together on a simple path toward the calm blue lake. Daddy Tiger carries one red fishing rod from the rod reference over his shoulder, Zephyr Tiger walks happily beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
  },
  {
    page: 3,
    text: "daddy tiger held a big rod. zephyr tiger held a little rod.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      FISHING_ROD,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} On the lake shore, Daddy Tiger holds one big red fishing rod and Zephyr Tiger proudly holds one smaller matching red fishing rod. Use the rod reference exactly for both rods: same red rod, light brown handle, gray reel, thin line, red and white bobber. Exactly two rods total. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger sat on the shore. the water was still and blue.",
    characters: ["zephyr-tiger-clean-cartoon", FISHING_ROD],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${LAKE_STYLE} Zephyr Tiger sits calmly on the soft grassy shore holding his small red fishing rod from the rod reference, with the line and bobber resting in the calm flat blue water. The lake is still and peaceful with gentle reflections. Draw exactly one tiger: Zephyr. No other tigers, no fish yet, no text.`,
  },
  {
    page: 5,
    text: "a duck swam by the reeds. zephyr tiger said hi to the duck.",
    characters: ["zephyr-tiger-clean-cartoon", FISHING_ROD],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${LAKE_STYLE} Zephyr Tiger sits on the shore with his small red fishing rod and waves hi to one friendly yellow duck swimming near the green reeds. The duck is simple, round, and cheerful. Draw exactly one tiger: Zephyr. Exactly one duck. No other tigers, no other animals, no text.`,
  },
  {
    page: 6,
    text: "mommy tiger sat with auggie. auggie watched the little waves.",
    characters: ["mommy-tiger-clean-cartoon", "auggie-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} Mommy Tiger sits on a simple blue blanket on the grassy shore and holds Auggie Tiger safely on her lap. Auggie looks at gentle little waves lapping the shore. Auggie is seated and held, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 7,
    text: "the little rod went down. zephyr tiger had a fish.",
    characters: ["zephyr-tiger-clean-cartoon", FISHING_ROD],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${LAKE_STYLE} Zephyr Tiger stands up excited on the shore as his small red fishing rod bends down toward the water, with the bobber pulled under and simple ripple circles around the line. Use the rod reference exactly. Zephyr has wide happy surprised eyes. Draw exactly one tiger: Zephyr. The fish is still under the water and not visible yet. No text.`,
  },
  {
    page: 8,
    text: "they pulled and pulled. the fish came up with a splash.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      FISHING_ROD,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} Daddy Tiger stands behind Zephyr Tiger and helps him hold the bending small red fishing rod as one shiny blue fish jumps up out of the water with a big simple splash and round water drops. Use the rod reference exactly. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. Exactly one fish. No text.`,
  },
  {
    page: 9,
    text: "the fish was big and shiny. zephyr tiger smiled and smiled.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} Zephyr Tiger proudly holds up one big shiny blue fish with both paws while Daddy Tiger kneels beside him with a proud happy smile. The fish is large, rounded, and friendly looking with simple shine marks. Draw exactly two tigers: Daddy and Zephyr. Exactly one fish. No fishing rod in this picture, no text.`,
  },
  {
    page: 10,
    text: "auggie tiger clapped for zephyr. mommy tiger smiled too.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} On the grassy shore, Zephyr Tiger shows his big shiny blue fish to Mommy Tiger and Auggie Tiger while Daddy Tiger stands proudly beside him. Auggie claps his little paws with joy from Mommy's arms; Auggie is held, not standing. Exactly four tigers total. Exactly one fish. No extra cubs, no text.`,
  },
  {
    page: 11,
    text: "daddy tiger cooked the fish on the fire. the family ate fish and peas.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} In the warm late afternoon, the tiger family sits on the grassy shore around one small safe contained campfire ring of stones where Daddy Tiger cooks the fish on a simple stick grill. Simple plates with cooked fish and green peas sit nearby. Mommy Tiger holds Auggie Tiger safely on her lap. Food is only fish and peas with water: no bread, no sweets, no other food. Exactly four tigers total. The fire is small, friendly, and contained. No text.`,
  },
  {
    page: 12,
    text: "the sun went down by the water. zephyr tiger dreamed of the big fish.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${LAKE_STYLE} The tiger family walks home along the shore path in warm sunset light, with the sun low over the calm lake and the sky glowing red and gold. Zephyr Tiger walks sleepily holding Daddy Tiger's paw, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no fishing rod, no text.`,
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
    ASSET_RED_FISHING_ROD_CARTOON,
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
