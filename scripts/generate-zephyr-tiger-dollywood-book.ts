import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_AUGGIE_TIGER,
  CHAR_MOMMY_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger goes to dollywood";
const FOLDER = "Zephyr-Tiger-Goes-to-Dollywood";

const FAMILY_CONSISTENCY =
  "Mommy Tiger keeps her white flower and same round cuddly body; Daddy Tiger keeps his same largest sturdy round body; Zephyr Tiger is the older cub; Auggie Tiger is the smallest baby and never walks.";

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Book cover. Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "The tiger family stands at the entrance of a warm mountain theme park inspired by Dollywood, with friendly rides, wooden fences, flowers, music, and green Tennessee hills in the background. Include visual hints of a swinging tree ride, frog ride, carousel, scrambler cars, and flying elephant ride in the distance. Zephyr smiles with excitement. Mommy holds Auggie safely. Daddy holds a small park map with no readable text. Do not draw any logos, words, letters, or signs.",
  },
  {
    page: 2,
    text:
      "It was a sunny day. Zephyr Tiger drove to Dollywood with Mommy, Daddy, and Auggie.\n\n" +
      "Zephyr saw big rides and little rides. He jumped up and down.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "There must be exactly two adult tigers and exactly two cubs, no extra tigers. The family arrives at a cheerful mountain theme park after a car ride. Zephyr, the older cub, jumps with excitement on the left. Mommy Tiger is the adult mother with one white flower behind one ear, holding tiny baby Auggie safely. Daddy Tiger is the tallest and largest adult father on the opposite side from Mommy; Daddy has no flower, no eyelashes, no feminine face, and a relaxed dad build. Daddy points toward the rides with one paw. Do not draw a second Mommy. Do not draw a flower on Daddy. Warm sunny day, flowers, wooden railings, green Tennessee hills, no readable text.",
  },
  {
    page: 3,
    text:
      "First they rode the Great Tree Swing. The big swing went back and forth.\n\n" +
      "Zephyr held on. Daddy held on too. The swing went up, then back down.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Daddy Tiger keeps his same largest sturdy round body; Zephyr Tiger is the older cub. ` +
      "Zephyr and Daddy ride the Great Tree Swing, a friendly tree-and-ship-like pendulum ride that swings forward and backward. Daddy Tiger sits on the right side of the swing. Daddy has exactly two visible front paws total: one paw holds the vertical rope on his right side, and one paw rests on the single horizontal safety bar. Do not draw any extra Daddy paws, extra arms, duplicate limbs, or overlapping ghost limbs. Zephyr sits on the left and holds the horizontal safety bar with his two small paws. Both smile. Show the ride high but safe, with green hills and trees behind them. No readable text.",
  },
  {
    page: 4,
    text:
      "Then came Frogs and Fireflies. The frogs went round and round.\n\n" +
      "Zephyr rode a green frog. Mommy waved. Auggie clapped from her lap.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger"],
    referenceImages: ["data/ride-reference-images/frogs-and-fireflies.png"],
    prompt:
      `Draw exactly three tigers, all fully visible: Zephyr Tiger, Auggie Tiger, and Mommy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Use the supplied Frogs and Fireflies ride photo as a structural reference for the ride only, not for the people. Draw the actual ride as big glossy green frog-shaped vehicles with huge round eyes, round white bellies, green spotted backs, side handles, and open seats mounted to metal arms under a covered green-and-yellow ride pavilion. Zephyr rides in one green frog vehicle. Mommy stands nearby waving while holding Auggie safely on her hip; Auggie claps. Bright safe Wildwood Grove ride area, no readable text.",
  },
  {
    page: 5,
    text:
      "After the frogs, the family took a water break.\n\n" +
      "Mommy helped Auggie drink. Daddy gave Zephyr his cup.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "The family sits in the shade at Dollywood taking a water break. There are exactly two adult tigers and exactly two cubs, no extra cubs. Zephyr is the older cub and holds a small cup of water with both paws. Mommy Tiger is an adult mother with her white flower, sitting beside Zephyr while holding tiny baby Auggie safely and helping him drink from a small cup. Daddy Tiger is the largest adult father, clearly much bigger than both cubs and bigger than Mommy, with no flower, sitting on the other side with a water bottle and smiling. Warm sunny rest area, trees, no readable text, no dessert, no candy, no ice cream.",
  },
  {
    page: 6,
    text:
      "Next came Dragonflier. It went fast like a dragonfly in the air.\n\n" +
      "Zephyr rode with Daddy. He felt the wind and gave a big smile.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Daddy Tiger keeps his same largest sturdy round body; Zephyr Tiger is the older cub. ` +
      "Zephyr and Daddy ride Dragonflier, a dragonfly-themed coaster, above a creekside path. Zephyr smiles and feels the wind. Daddy sits close beside him. Show a friendly dragonfly-shaped train, no scary drop, no readable text.",
  },
  {
    page: 7,
    text:
      "Then they found The Mad Mockingbird. The bird ride went up and out.\n\n" +
      "Zephyr rode with Daddy. The bird dipped and soared. Zephyr laughed.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Daddy Tiger keeps his same largest sturdy round body; Zephyr Tiger is the older cub. ` +
      "Zephyr and Daddy ride The Mad Mockingbird, a colorful bird-themed ride. Their bird car swings gently up and outward as the ride turns. Zephyr laughs while holding the safety bar. Daddy smiles beside him. Whimsical bird shapes, green Wildwood Grove mood, no readable text.",
  },
  {
    page: 8,
    text:
      "After that came the merry-go-round. Zephyr sat on a horse that went up and down.\n\n" +
      "Mommy stood by him. Daddy held Auggie. The music went round and round.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "The family rides the Village Carousel, a merry-go-round with painted animals. Zephyr sits on a carousel horse that moves up and down while Mommy stands beside him. Daddy holds Auggie safely nearby. Warm lights, music feeling, no readable text.",
  },
  {
    page: 9,
    text:
      "Next was The Scrambler. The little cars turned this way and that way.\n\n" +
      "Daddy sat with Zephyr. They slid to one side, then back again.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. Daddy Tiger keeps his same largest sturdy round body; Zephyr Tiger is the older cub. ` +
      "Zephyr and Daddy ride The Scrambler in a small rounded ride car. The car spins and slides gently to one side, then back again. Daddy sits close beside Zephyr with the safety bar down. Zephyr laughs. Bright Country Fair ride area, no readable text.",
  },
  {
    page: 10,
    text:
      "Last came the flying elephants. Zephyr went up and down in the sky.\n\n" +
      "Then they drove home. Zephyr was tired and happy. He dreamed about Dollywood.",
    characters: ["zephyr-tiger", "auggie-tiger", "mommy-tiger", "daddy-tiger"],
    referenceImages: [
      "data/ride-reference-images/amazing-flying-elephants.jpg",
    ],
    prompt:
      `Draw exactly four tigers, all fully visible: Zephyr Tiger, Auggie Tiger, Mommy Tiger, and Daddy Tiger. ${FAMILY_CONSISTENCY} ` +
      "Use the supplied Amazing Flying Elephants ride photo as a structural reference for the ride only, not for the people. Make the real ride the main image: several pale gray elephant-shaped ride vehicles with big ears, curled trunks, colored saddle seats, and open bench seats, attached to long angled metal arms radiating from a central rotating hub so the elephants fly up and down around a circle. Zephyr rides in one elephant vehicle with Daddy sitting beside him. Mommy stands safely nearby holding tiny baby Auggie while they watch. Warm evening park light. Do not draw a toy elephant, carousel horse, car, dream bubble, sign, logo, word, letter, readable text, or park name.",
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
  imageModel: "gpt-image-1",
  anchorOnCover: false,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
