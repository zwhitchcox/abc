import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import { STYLE_CLEAN_PRINT_CARTOON } from "./lib/characters";
import { type CharacterSpec } from "./lib/asset-cache";

const TITLE = "zephyr zebra goes to the beach";
const FOLDER = "Zephyr-Zebra-Goes-to-the-Beach";

// --- A new mixed-animal family, drawn in the same clean print cartoon style. ---
const CHAR_ZEPHYR_ZEBRA: CharacterSpec = {
  id: "zephyr-zebra-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A little boy zebra cub named Zephyr, about 3-and-a-half years old, in a clean " +
    "print-friendly cartoon picture-book style. Rounded head, small child body, crisp " +
    "black-and-white stripes, a short tidy dark mane, big friendly open dark oval eyes, " +
    "rosy cheeks, a small soft muzzle, and a sweet smile. He is the older sibling. Bold " +
    "readable outline, flat cheerful colours, minimal texture.",
  referenceHint:
    "Full-body character page on a plain white background. Clean bold outlines, flat cheerful colours, crisp edges, open friendly dark oval eyes. Centered, front-facing, standing, arms relaxed, no text.",
};

const CHAR_AUGGIE_OCTOPUS: CharacterSpec = {
  id: "auggie-octopus-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A tiny baby octopus named Auggie, the little brother, in clean print-friendly " +
    "cartoon style. A small round soft-purple octopus with a big rounded head, eight " +
    "short stubby curled legs, big cute friendly eyes, rosy cheeks, and a gentle smile. " +
    "He is very small and babyish and is always in water, in a little bucket, or gently " +
    "held, because he cannot walk on land. Bold readable outline, flat colours.",
  referenceHint:
    "Full-body character page on a plain white background. Small round purple cartoon octopus, eight short curled legs, big cute eyes, centered, front-facing, no text.",
};

const CHAR_DADDY_DINOSAUR: CharacterSpec = {
  id: "daddy-dinosaur-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A friendly dad dinosaur named Daddy Dinosaur in clean print-friendly cartoon style. " +
    "A tall, gentle, rounded green cartoon dinosaur (a soft brontosaurus-meets-friendly-" +
    "lizard look) with a relaxed average dad build, a long gentle neck, small soft back " +
    "ridges, big warm friendly eyes, and a kind smile. Exactly two arms total. Bold " +
    "readable outline, flat cheerful colours.",
  referenceHint:
    "Full-body character page on a plain white background. Tall friendly green cartoon dinosaur, two arms, warm smile, centered, front-facing, standing, no text.",
};

const CHAR_MOMMY_MOLERAT: CharacterSpec = {
  id: "mommy-molerat-clean-cartoon",
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A mom naked mole-rat named Mommy Molerat in clean print-friendly cartoon style, drawn " +
    "to look like a REAL naked mole-rat — homely and a little funny-looking, NOT pretty or " +
    "glamorous. Wrinkly, hairless, loose pinkish-tan skin with skin folds; a chubby tubular " +
    "body and short stubby legs; two prominent buck front teeth sticking out past the lips; " +
    "tiny squinty beady eyes; a few sparse whiskers; almost no visible ears; and big " +
    "digging paws. No fur, no hair, no flower, no rosy cheeks, no eyelashes, no makeup. " +
    "Friendly and motherly in expression but realistic to a real mole-rat's looks. Bold " +
    "readable outline, flat colours.",
  referenceHint:
    "Full-body character page on a plain white background. A realistic naked mole-rat: wrinkly hairless pinkish-tan skin with folds, chubby tubular body, two big buck front teeth, tiny squinty eyes, sparse whiskers, almost no ears, big digging paws. Plain and homely, NOT pretty. No hair, no flower, no eyelashes. Centered, front-facing, standing, no text.",
};

const ALL = [
  "zephyr-zebra-clean-cartoon",
  "auggie-octopus-clean-cartoon",
  "daddy-dinosaur-clean-cartoon",
  "mommy-molerat-clean-cartoon",
];

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const FAMILY =
  "Zephyr Zebra is the older cub: small young zebra with crisp black-and-white stripes, short dark mane, big friendly dark eyes, happy smile. Auggie Octopus is the tiny baby brother: a small round purple octopus with eight short legs and big cute eyes, always in water, in a bucket, or gently held because he cannot walk on land. Daddy Dinosaur is a tall gentle friendly green dinosaur dad with exactly two arms total and a warm smile. Mommy Molerat is a REAL-looking naked mole-rat mom — homely and funny-looking, not pretty: wrinkly hairless pinkish-tan skin with folds, a chubby tubular body, two big buck front teeth, tiny squinty eyes, sparse whiskers, almost no ears, and big digging paws. No hair, no flower.";

const BEACH =
  "Simple sunny beach scene: golden sand, gentle blue-green sea with small friendly waves, clear blue sky, a beach umbrella and a little bucket. Keep it uncluttered and easy to read at small printed size. No crowded background, no readable text, no labels, no logos.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ALL,
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${FAMILY} ${BEACH} The whole family smiles together at the beach. Zephyr Zebra stands on the sand, Daddy Dinosaur stands tall beside him, Mommy Molerat sits on the sand, and Auggie Octopus peeks happily out of a little blue bucket of water. Exactly four characters total. Leave clear simple sky space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr zebra ran to the sea. the waves went up and down.",
    characters: ["zephyr-zebra-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BEACH} Zephyr Zebra runs happily across the golden sand toward the gentle blue-green sea, arms out and a big smile. Draw exactly one character: Zephyr Zebra. No others, no text.`,
  },
  {
    page: 3,
    text: "daddy dinosaur put up the umbrella. it made cool shade.",
    characters: ["zephyr-zebra-clean-cartoon", "daddy-dinosaur-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY} ${BEACH} Daddy Dinosaur gently pushes a big striped beach umbrella into the sand while Zephyr Zebra watches and smiles. Daddy has exactly two arms total, both holding the umbrella pole. Draw exactly two characters: Daddy Dinosaur and Zephyr Zebra. No extra arms, no others, no text.`,
  },
  {
    page: 4,
    text: "mommy molerat dug in the sand. she made a big hole.",
    characters: ["mommy-molerat-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY} ${BEACH} Mommy Molerat digs a hole in the golden sand with her big digging paws, sand flying, a happy motherly look. She is a real-looking naked mole-rat: wrinkly hairless pinkish-tan skin, two big buck front teeth, tiny squinty eyes, no hair and no flower. Draw exactly one character: Mommy Molerat. No others, no text.`,
  },
  {
    page: 5,
    text: "auggie octopus splashed in a pool. he was so happy.",
    characters: ["auggie-octopus-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY} ${BEACH} Auggie Octopus splashes happily in a shallow little tide pool of clear water in the sand, his eight short legs wiggling and big cute eyes shining. Auggie is small and in the water, not walking on land. Draw exactly one character: Auggie Octopus. No others, no text.`,
  },
  {
    page: 6,
    text: "zephyr zebra built a sandcastle. it was big and tall.",
    characters: ["zephyr-zebra-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BEACH} Zephyr Zebra proudly builds a small simple sandcastle with a little bucket and shovel, kneeling in the golden sand with a happy focused smile. Draw exactly one character: Zephyr Zebra. No others, no text.`,
  },
  {
    page: 7,
    text: "a wave brought a shell. zephyr zebra picked it up.",
    characters: ["zephyr-zebra-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${BEACH} A gentle wave washes up onto the sand and leaves one pretty spiral seashell near Zephyr Zebra, who reaches for it with a delighted smile. Show one clear simple shell. Draw exactly one character: Zephyr Zebra. No others, no text.`,
  },
  {
    page: 8,
    text: "the family ate by the sea. the food was good.",
    characters: ALL,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY} ${BEACH} The whole family sits together on a picnic blanket on the sand under the beach umbrella, sharing a simple healthy picnic of sandwiches and fruit. Daddy Dinosaur with exactly two arms total, Mommy Molerat beside him, Zephyr Zebra eating happily, and Auggie Octopus in his little bucket of water nearby. Exactly four characters total. No others, no text.`,
  },
  {
    page: 9,
    text: "zephyr zebra jumped the waves. daddy held his hand.",
    characters: ["zephyr-zebra-clean-cartoon", "daddy-dinosaur-clean-cartoon"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY} ${BEACH} Zephyr Zebra joyfully jumps over the small friendly waves at the edge of the sea while Daddy Dinosaur stands close beside him, smiling and ready to help, with exactly two arms total. Draw exactly two characters: Zephyr Zebra and Daddy Dinosaur. No others, no text.`,
  },
  {
    page: 10,
    text: "the sun went down. it was a fun day.",
    characters: ALL,
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${FAMILY} ${BEACH} The whole family sits together on the sand watching a warm golden sunset over the calm sea. Daddy Dinosaur with exactly two arms total, Mommy Molerat leaning happily beside him, Zephyr Zebra between them, and Auggie Octopus in his little bucket of water. Exactly four characters total, all content and smiling. No others, no readable text.`,
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Animal Friends",
  style: STYLE_CLEAN_PRINT_CARTOON,
  characters: [CHAR_ZEPHYR_ZEBRA, CHAR_AUGGIE_OCTOPUS, CHAR_DADDY_DINOSAUR, CHAR_MOMMY_MOLERAT],
  pages: PAGES,
  imageQuality: "high",
  imageModel: "gpt-image-2",
  concurrency: 2,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
