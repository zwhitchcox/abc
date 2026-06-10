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

const TITLE = "zephyr tiger goes to church";
const FOLDER = "Zephyr-Tiger-Goes-to-Church";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const CHURCH_BUILDING = "fellowship-campus-building-clean-cartoon";
const CHURCH_STAGE = "fellowship-auditorium-stage-clean-cartoon";
const ALL_TIGERS_CHURCH = [...ALL_TIGERS, CHURCH_BUILDING];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const FELLOWSHIP_STYLE =
  "Modern fellowship church campus setting. For inside scenes use a big dim cozy auditorium with rows of padded dark gray seats, a wide dark stage, one large glowing blank projection screen in the middle, warm white and amber spotlights shining down from above, hanging black speakers, and simple music instruments like guitars and a drum set. For outside scenes use the fellowship campus building: cream and tan walls with warm red-brown brick accents, dark green metal roofs, tall dark green front doors, a tall square tower with a dark green pointed roof and a simple cross shape near its top, a wide light gray parking lot in front, and a few green trees. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const AUDITORIUM_SEATING_GEOMETRY =
  "Seat geometry must make sense: all padded dark gray chairs face forward toward the stage. Use a camera angle from the back or side aisle, looking over or beside the tigers toward the stage. The stage is in front of the tigers, not behind their backs. The nearest visible chair backs face the viewer. The tigers are shown from behind, three-quarter rear, or side profile as they look toward the stage. Do not draw the tigers facing the viewer with the stage behind them. When a tiger sits in a chair, its tail is completely hidden behind or under the chair, or tucked beside its body on the seat. Never draw a tail passing through a chair, a seat back, an armrest, or any solid object. If unsure, do not draw the tail at all.";

const ASSET_FELLOWSHIP_CAMPUS_BUILDING_CARTOON: CharacterSpec = {
  id: CHURCH_BUILDING,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable building object reference: one friendly fellowship church " +
    "campus building with cream and tan walls, warm red-brown brick accents " +
    "along the lower walls, dark green metal roofs, tall dark green front " +
    "doors, and a tall square tower on one side with a dark green pointed " +
    "roof and a simple cross shape near its top. A few small trees and " +
    "shrubs and a hint of light gray parking lot in front. No stained " +
    "glass, no people, no tigers, no readable text, no signs, no letters, " +
    "no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one " +
    "friendly fellowship church campus building: a wide low building with " +
    "cream and tan walls, warm red-brown brick accents along the lower " +
    "walls, dark green metal roofs, tall dark green front doors, and a " +
    "tall square tower on one side with a dark green pointed roof and a " +
    "simple cross shape near its top. Add a few small trees and shrubs and " +
    "a hint of light gray parking lot in front. Show the whole building " +
    "with no cropping. No stained glass, no people, no tigers, no readable " +
    "text, no signs, no letters, no logos. Use bold readable outlines, flat " +
    "cheerful colours, crisp edges, high contrast, and minimal texture.",
};

const ASSET_FELLOWSHIP_AUDITORIUM_STAGE_CARTOON: CharacterSpec = {
  id: CHURCH_STAGE,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable interior setting reference: one big dim cozy fellowship " +
    "auditorium with a wide dark stage, one large glowing blank projection " +
    "screen in the middle above the stage, warm white and amber spotlights " +
    "shining down from above, hanging black speakers, a drum set, guitars " +
    "on stands, and rows of padded dark gray seats in front. Friendly " +
    "simplified clean cartoon style. No people, no tigers, no readable " +
    "text, no letters, no logos.",
  referenceHint:
    "Object/setting reference page. Draw one big dim cozy fellowship " +
    "auditorium inspired by a large modern worship room: rows of padded " +
    "dark gray seats in the foreground, a wide dark stage, one large " +
    "glowing blank projection screen in the middle above the stage, warm " +
    "white and amber spotlights shining down from above, hanging black " +
    "speakers, a drum set, and guitars on stands. The room is dim and " +
    "warm but every shape stays bold and readable. Keep it simplified for " +
    "a children's book. No people, no tigers, no readable text, no " +
    "letters, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_CHURCH,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} The whole tiger family walks on a simple path toward the fellowship church campus building. Use the building reference exactly: same cream and tan walls, same warm brick accents, same dark green metal roofs and tall dark green doors, same tall square tower with the simple cross near its top. Daddy Tiger holds Zephyr Tiger's paw, Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet, and everyone smiles. Exactly four tigers total. Leave clear simple sky space at the top for a title, but do not draw any text. No extra cubs.`,
  },
  {
    page: 2,
    text: "the tiger family went to church. zephyr tiger saw the big door.",
    characters: ALL_TIGERS_CHURCH,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} The tiger family walks across the wide light gray parking lot toward the fellowship church campus building. Zephyr Tiger points happily at the tall dark green front doors. Use the building reference exactly: cream and tan walls, warm brick accents, dark green metal roofs, and the tall square tower with the simple cross near its top. Daddy Tiger walks beside Zephyr, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
  },
  {
    page: 3,
    text: "mommy tiger held auggie. auggie looked at the big door.",
    characters: [
      "mommy-tiger-clean-cartoon",
      "auggie-tiger-clean-cartoon",
      CHURCH_BUILDING,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} Mommy Tiger stands near the tall dark green front doors of the fellowship church and holds Auggie Tiger safely in her arms. Auggie looks at the large door. Use the building reference for the cream and tan wall, the warm brick accents, and the tall dark green door style. Auggie is held, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no text.`,
  },
  {
    page: 4,
    text: "zephyr tiger sat in a big chair. daddy tiger sat beside him.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      CHURCH_STAGE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} ${AUDITORIUM_SEATING_GEOMETRY} Inside the modern church auditorium, Zephyr Tiger sits in one padded dark gray chair. Daddy Tiger sits beside him in another padded dark gray chair with a calm smile and exactly two visible front paws total, no extra arms, no duplicate paws. The fellowship stage is in front of them with the big glowing blank screen and warm spotlights from above. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no readable text.`,
  },
  {
    page: 5,
    text: "the family sang a soft song. zephyr tiger sang too.",
    characters: [...ALL_TIGERS, CHURCH_STAGE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} ${AUDITORIUM_SEATING_GEOMETRY} The tiger family sits together in padded dark gray auditorium chairs and sings a soft song while facing the stage. Zephyr Tiger sings with a small smile, Daddy Tiger sits beside him, and Mommy Tiger holds Auggie Tiger safely on her lap because Auggie cannot walk yet. Show the wide dim stage in front of them with the big glowing blank screen, warm white and amber spotlights shining down, hanging speakers, and simple instruments. Exactly four tigers total. Show gentle music feeling with small curved motion lines only, no music notes, no letters, no readable text.`,
  },
  {
    page: 6,
    text: "zephyr tiger saw big lights. the colors were red and blue.",
    characters: ["zephyr-tiger-clean-cartoon", CHURCH_STAGE],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FELLOWSHIP_STYLE} Zephyr Tiger stands inside the dim church auditorium and looks up at big simple red and blue stage lights shining down above the wide dark stage. Show the big glowing blank screen, hanging speakers, and rows of padded dark gray seats in a simplified readable way. Draw exactly one tiger: Zephyr. No other tigers, no readable text, no symbols.`,
  },
  {
    page: 7,
    text: "mommy tiger folded her paws. zephyr tiger folded his paws too.",
    characters: [
      "mommy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      CHURCH_STAGE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} ${AUDITORIUM_SEATING_GEOMETRY} Mommy Tiger and Zephyr Tiger sit quietly in padded dark gray auditorium chairs with their paws folded while facing the stage. Mommy looks pretty and warm with her white flower, and Zephyr copies her calm pose. The dim stage is softly visible in front of them with the big glowing blank screen and warm spotlights. Draw exactly two tigers: Mommy and Zephyr. No other tigers, no readable text.`,
  },
  {
    page: 8,
    text: "daddy tiger opened a little book. zephyr tiger looked at it.",
    characters: [
      "daddy-tiger-clean-cartoon",
      "zephyr-tiger-clean-cartoon",
      CHURCH_STAGE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} ${AUDITORIUM_SEATING_GEOMETRY} Daddy Tiger opens one small plain book on his lap while Zephyr Tiger looks at the page. They sit in padded dark gray auditorium chairs facing the modern stage. The stage is softly visible in front of them, beyond the row of seats. The book pages are blank or have simple colored line shapes only, with no readable words, letters, numbers, or symbols. Daddy has exactly two visible front paws total, no extra arms, no duplicate paws. Draw exactly two tigers: Daddy and Zephyr. No other tigers, no text.`,
  },
  {
    page: 9,
    text: "auggie tiger sat on mommy's lap. mommy tiger held him close.",
    characters: [
      "auggie-tiger-clean-cartoon",
      "mommy-tiger-clean-cartoon",
      CHURCH_STAGE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} ${AUDITORIUM_SEATING_GEOMETRY} Auggie Tiger sits directly on top of Mommy Tiger's lap, resting on her legs while she sits in a padded dark gray auditorium chair facing the stage. Mommy Tiger wraps both arms around Auggie and holds him close and smiles. Auggie is on her lap, not in his own chair and not beside her. The dim fellowship stage is softly visible in front of them with the big glowing blank screen and warm spotlights. Draw exactly two tigers: Mommy and Auggie. No other tigers, no readable text.`,
  },
  {
    page: 10,
    text: "zephyr tiger picked up a paper. daddy tiger put it in the basket.",
    characters: [
      "zephyr-tiger-clean-cartoon",
      "daddy-tiger-clean-cartoon",
      CHURCH_STAGE,
    ],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} In the modern auditorium aisle beside padded dark gray chairs, Daddy Tiger puts one small plain white paper into a simple woven basket while Zephyr Tiger points toward Daddy's paw. Show exactly one paper total in the whole image: the single paper is in Daddy's paw above the basket. The floor is clean and empty with no paper on the ground. Do not draw extra papers, trash piles, signs, letters, or readable text. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr.`,
  },
  {
    page: 11,
    text: "zephyr tiger went down the big slide. church was fun.",
    characters: ["zephyr-tiger-clean-cartoon", CHURCH_BUILDING],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FELLOWSHIP_STYLE} Outside on simple green grass beside the fellowship church campus building, Zephyr Tiger slides down one big simple playground slide with a happy smile and arms up. The playground is small and friendly: one slide and one simple swing set, with bright cheerful colors. Use the building reference softly in the background. Keep every playground shape large, simple, and readable. Draw exactly one tiger: Zephyr. No other tigers, no other children, no readable text, no letters, no logos.`,
  },
  {
    page: 12,
    text: "the tiger family went home. zephyr tiger said bye to church.",
    characters: ALL_TIGERS_CHURCH,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${FELLOWSHIP_STYLE} The tiger family walks home on the path away from the fellowship church campus building. Use the building reference exactly in the background: cream and tan walls, dark green metal roofs, and the tall square tower with the simple cross near its top. Zephyr Tiger turns and waves bye to church, Daddy Tiger walks beside him, and Mommy Tiger holds Auggie Tiger safely because Auggie cannot walk yet. Exactly four tigers total. No extra cubs, no text.`,
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
    ASSET_FELLOWSHIP_CAMPUS_BUILDING_CARTOON,
    ASSET_FELLOWSHIP_AUDITORIUM_STAGE_CARTOON,
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
