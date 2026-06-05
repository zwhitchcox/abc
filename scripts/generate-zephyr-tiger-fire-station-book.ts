import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger visits the fire station";
const FOLDER = "Zephyr-Tiger-Visits-the-Fire-Station";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is a pretty adult mother with her white flower and graceful medium build; Daddy Tiger is the tallest adult father with a relaxed average dad build, not muscular or bulky; Zephyr Tiger is the older cub; Auggie Tiger is the tiny baby brother who sits or is carried and does not walk.";

const FIRE_STATION_STYLE =
  "Warm cozy small-town fire station with a shiny red fire truck, clean garage floor, soft amber lights, friendly rounded equipment, pastel colors, and no readable text, no labels, no logos, no brand names.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "Zephyr Tiger went to the fire station.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} The tiger family walks into a friendly fire station together. Mommy carries Auggie safely, Daddy holds Zephyr's paw, and Zephyr looks excited. No readable text.`,
  },
  {
    page: 2,
    text: "Zephyr Tiger saw a red fire truck.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} Zephyr stands beside Daddy Tiger and looks up at a shiny red fire truck with rounded headlights, big wheels, and a ladder on top. Daddy has exactly two visible front paws total, no extra arms or duplicate paws. No readable text.`,
  },
  {
    page: 3,
    text: "Daddy Tiger showed Zephyr the hose.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} Daddy Tiger points to a neatly coiled fire hose on the side of the truck while Zephyr watches closely. Daddy has exactly two visible front paws total, no extra arms or duplicate paws. No readable text.`,
  },
  {
    page: 4,
    text: "Mommy Tiger found a yellow helmet.",
    characters: ["zephyr-tiger", "mommy-tiger", "auggie-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Mommy Tiger, Zephyr Tiger, and Auggie Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} Mommy Tiger holds one bright yellow firefighter helmet for Zephyr to see. Zephyr looks at the helmet with a smile. Auggie sits safely in Mommy's other arm or on her lap, not walking. The helmet has no readable text.`,
  },
  {
    page: 5,
    text: "Zephyr Tiger sat in the truck.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} Zephyr sits safely in the open cab of the parked red fire truck and holds the steering wheel gently. Daddy Tiger stands beside the open door watching warmly. The truck is parked and calm. No readable text.`,
  },
  {
    page: 6,
    text: "Auggie Tiger looked at the bell.",
    characters: ["auggie-tiger", "mommy-tiger", "zephyr-tiger"],
    prompt:
      `Draw exactly three tigers, all fully visible: Auggie Tiger, Mommy Tiger, and Zephyr Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} Auggie sits safely on Mommy Tiger's lap and looks at a small shiny brass bell on a low table. Zephyr sits nearby and smiles. Auggie is sitting, not walking. No readable text.`,
  },
  {
    page: 7,
    text: "Zephyr Tiger rang the little bell.",
    characters: ["zephyr-tiger", "mommy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Mommy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} Zephyr gently rings a small brass bell on a low table while Mommy Tiger watches. Zephyr has matching happy eyes, not winking, not one eye open and one eye closed. The bell is small and friendly. No readable text.`,
  },
  {
    page: 8,
    text: "The truck light went blink blink.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} A soft red light on top of the parked fire truck glows gently. Zephyr watches the light with wonder while Daddy Tiger stands beside him. Daddy has exactly two visible front paws total. No emergency, no smoke, no fire, no readable text.`,
  },
  {
    page: 9,
    text: "The family waved to the truck.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      `${FIRE_STATION_STYLE} The tiger family stands in front of the parked red fire truck and waves. Mommy holds Auggie safely, Daddy stands beside Zephyr, and everyone is calm and happy. No readable text.`,
  },
  {
    page: 10,
    text: "Zephyr Tiger went home happy.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Cozy storybook ending at home under warm lamp light. Zephyr holds a small plain red toy fire truck with no text. Mommy holds Auggie safely, Daddy sits nearby smiling, and everyone looks calm and happy. No readable text.",
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
