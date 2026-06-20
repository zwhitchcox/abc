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

const TITLE = "zephyr tiger makes music";
const FOLDER = "Zephyr-Tiger-Makes-Music";

const ALL_TIGERS = [
  "zephyr-tiger-clean-cartoon",
  "auggie-tiger-clean-cartoon",
  "mommy-tiger-clean-cartoon",
  "daddy-tiger-clean-cartoon",
];

const BIG_POT = "big-silver-cooking-pot-clean-cartoon";
const ALL_TIGERS_MUSIC = [...ALL_TIGERS, BIG_POT];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY_CONSISTENCY =
  "Mommy Tiger is pretty with her white flower and a graceful medium build, not fat and not skinny. Only Mommy Tiger has the white flower; no other tiger has a flower. Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the older cub with matching open friendly eyes. Auggie Tiger is the tiny baby brother who is always sitting, held, or carried because he cannot walk. The tigers wear no clothes, no shirts, no hats.";

const HOME_STYLE =
  "Cozy simple tiger family living room: warm cream walls, a soft blue rug, one simple orange couch, a round window with a view of green trees, and a warm wooden floor. Keep every object large and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const MUSIC_MARKS =
  "Show the feeling of sound with simple bold curved motion lines and at most a few large simple round music notes. The notes must be clean simple shapes, never letters, never words, never numbers.";

const ASSET_BIG_POT_CARTOON: CharacterSpec = {
  id: BIG_POT,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable object reference: one big friendly silver cooking pot with " +
    "two small round handles, a simple shiny rounded body, and a flat open " +
    "top with no lid. Clean rounded cartoon geometry. No food inside, no " +
    "tigers, no people, no text, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one big " +
    "friendly silver cooking pot with two small round handles, a simple " +
    "shiny rounded body, and a flat open top with no lid. Show the whole " +
    "pot with no cropping. Use bold readable outlines, flat cheerful " +
    "colours, crisp edges, high contrast, and minimal texture. No food, no " +
    "text, no logos.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL_TIGERS_MUSIC,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} The happy tiger family makes music together in their cozy living room. Zephyr Tiger pats the big silver pot from the pot reference like a drum, Daddy Tiger sings with one paw raised, and Mommy Tiger holds Auggie Tiger safely while Auggie claps. Exactly four tigers total. Leave clear simple space at the top for a title, but do not draw any text or letters. No extra cubs.`,
  },
  {
    page: 2,
    text: "zephyr tiger found a big pot. the pot was his drum.",
    characters: ["zephyr-tiger-clean-cartoon", BIG_POT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${HOME_STYLE} Zephyr Tiger kneels on the soft blue rug and happily pats the flat open top of the big silver cooking pot from the pot reference, using both front paws like a little drummer. Use the pot reference exactly: same silver pot, same two round handles, no lid. Draw exactly one tiger: Zephyr. No other tigers, no text.`,
  },
  {
    page: 3,
    text: "zephyr tiger patted the drum. the drum made a big sound.",
    characters: ["zephyr-tiger-clean-cartoon", BIG_POT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${HOME_STYLE} ${MUSIC_MARKS} Zephyr Tiger laughs with joy as he pats the big silver pot from the pot reference, with big bold curved sound lines bursting up from the pot to show one big happy sound. Use the pot reference exactly. Draw exactly one tiger: Zephyr. No other tigers, no letters, no text.`,
  },
  {
    page: 4,
    text: "mommy tiger rang a little bell. the bell made a little sound.",
    characters: ["mommy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} Mommy Tiger holds up one small golden hand bell and rings it gently while Zephyr Tiger listens closely with delighted wide eyes and one ear turned toward the bell. Show tiny gentle curved sound lines around the little bell. Draw exactly two tigers: Mommy and Zephyr. No other tigers, no letters, no text.`,
  },
  {
    page: 5,
    text: "auggie tiger found a little pot. auggie patted it and clapped.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} Auggie Tiger sits safely on the soft blue rug right beside Mommy Tiger, who sits with him and keeps a gentle paw near him. Auggie pats one small silver pot in front of him and claps his tiny paws with joy. Auggie is seated, not standing and not walking. Draw exactly two tigers: Mommy and Auggie. No other tigers, no letters, no text.`,
  },
  {
    page: 6,
    text: "daddy tiger sang a song. his voice was big and deep.",
    characters: ["daddy-tiger-clean-cartoon", "zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} Daddy Tiger stands tall in the living room and sings happily with his mouth open and one paw on his chest, while Zephyr Tiger looks up at him with admiration. Show big warm curved sound lines coming from Daddy to show a big deep voice. Daddy has exactly two visible front paws total. Draw exactly two tigers: Daddy and Zephyr. No letters, no text.`,
  },
  {
    page: 7,
    text: "zephyr tiger sang with daddy. they sang of the sun and the moon.",
    characters: ["zephyr-tiger-clean-cartoon", "daddy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} Daddy Tiger and Zephyr Tiger sing together side by side with happy open mouths. Above them, show one simple round yellow sun shape and one simple white crescent moon shape floating in their imagination with soft curved lines around them. Draw exactly two tigers: Daddy and Zephyr. No letters, no words, no text.`,
  },
  {
    page: 8,
    text: "zephyr tiger spun round and round. the music made him happy.",
    characters: [...ALL_TIGERS, BIG_POT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} Zephyr Tiger spins joyfully on the blue rug with his arms out and a big happy smile, shown with simple curved spin lines around him. Behind him, Daddy Tiger pats the big silver pot from the pot reference, and Mommy Tiger holds Auggie Tiger safely while Auggie claps. Exactly four tigers total. No extra cubs, no letters, no text.`,
  },
  {
    page: 9,
    text: "auggie tiger clapped for the music. mommy tiger smiled and sang.",
    characters: ["auggie-tiger-clean-cartoon", "mommy-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} Mommy Tiger sings sweetly with a gentle open mouth while Auggie Tiger sits safely on her lap and claps his tiny paws with a huge happy baby smile. Show soft curved sound lines around Mommy. Auggie is seated and held, not standing. Draw exactly two tigers: Mommy and Auggie. No letters, no text.`,
  },
  {
    page: 10,
    text: "the family made music. the music was fun.",
    characters: [...ALL_TIGERS, BIG_POT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} ${MUSIC_MARKS} The whole tiger family makes music together in the cozy living room: Zephyr Tiger pats the big silver pot from the pot reference, Daddy Tiger sings tall and proud, and Mommy Tiger rings the small golden bell while Auggie Tiger claps safely from her arm. Big joyful curved sound lines and a few simple round music notes fill the air. Exactly four tigers total. No extra cubs, no letters, no text.`,
  },
  {
    page: 11,
    text: "then the music got quiet. mommy tiger sang a soft song.",
    characters: ALL_TIGERS,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY_CONSISTENCY} ${HOME_STYLE} The living room is calm and warm in soft evening light from the round window. Mommy Tiger sings a gentle quiet song while holding sleepy Auggie Tiger, and Zephyr Tiger leans against Daddy Tiger on the orange couch with heavy happy eyes. Only one or two tiny soft curved lines near Mommy's mouth. Exactly four tigers total. No extra cubs, no letters, no text.`,
  },
  {
    page: 12,
    text: "zephyr tiger went to sleep. he dreamed of the happy music.",
    characters: ["zephyr-tiger-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${HOME_STYLE} Zephyr Tiger sleeps peacefully in his simple little bed with a soft green blanket and closed happy eyes. Above his head, one soft round dream bubble shows the little family band: a tiny simple pot, a tiny golden bell, and one simple round music note. Draw exactly one tiger: Zephyr, sleeping. No other tigers, no letters, no text.`,
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
    ASSET_BIG_POT_CARTOON,
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
