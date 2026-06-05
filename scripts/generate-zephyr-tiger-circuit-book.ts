import "dotenv/config";
import { type CharacterSpec } from "./lib/asset-cache";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./lib/characters";

const TITLE = "zephyr tiger builds a circuit";
const FOLDER = "Zephyr-Tiger-Builds-a-Circuit";

const ZEPHYR = "zephyr-tiger-clean-cartoon";
const DADDY = "daddy-tiger-clean-cartoon";
const CIRCUIT_KIT = "breadboard-circuit-kit-clean-cartoon";

const PRINT_CLEAR =
  "Use the clean print-friendly cartoon style: bold readable outlines, flat bright colours, crisp edges, high contrast, simple uncluttered background, minimal texture. No watercolor wash, no grainy pencil texture, no hazy airbrush, no readable text, no signs, no letters.";

const TIGER_CONSISTENCY =
  "Daddy Tiger is tall with a relaxed average dad build, not muscular or bulky, and has exactly two visible front paws total. Zephyr Tiger is the smaller older cub with matching open friendly eyes. Draw exactly two tigers total: Daddy Tiger and Zephyr Tiger.";

const CIRCUIT_TABLE =
  "Simple bright kitchen table or play table with a white solderless breadboard, a small black USB battery pack, a tiny breadboard power module, short red and blue jumper wires, resistors with colored bands, LEDs, one push button, one buzzer, and one small knob. Keep the table clear and the parts large enough to read at small printed booklet size.";

const POWER_SOURCE =
  "Every active circuit must show a visible black USB battery pack connected by a USB cable to a small breadboard power module. The power module has one short red jumper to the red positive rail and one short blue jumper to the blue negative rail. No wall outlet, no sparks, no lightning.";

const NEAT_WIRING =
  "Breadboard wiring must look deliberate and functional, not random decoration: short jumper wires go into real holes, wires are mostly straight or gently arched, components bridge separate rows correctly, and there are no tangled loose wires crossing everywhere.";

const LED_CIRCUIT = `${POWER_SOURCE} ${NEAT_WIRING} Show one simple LED circuit: red positive rail to one end of a resistor, other end of the resistor to the LED long leg, LED short leg back to the blue negative rail. The resistor and LED are in series. Do not put both LED legs in the same row. Do not put both resistor legs in the same row.`;

const ASSET_CIRCUIT_KIT_CARTOON: CharacterSpec = {
  id: CIRCUIT_KIT,
  style: STYLE_CLEAN_PRINT_CARTOON.id,
  description:
    "A reusable electronics kit object reference: a clean white solderless " +
    "breadboard with red and blue rails, a small black USB battery pack, a " +
    "tiny breadboard power module, neatly sorted red and blue jumper wires, " +
    "striped resistors, red green and blue LEDs, one push button, one small " +
    "round buzzer, and one small knob potentiometer. No tigers, no people, " +
    "no text, no letters, no logos.",
  referenceHint:
    "Object reference page on a plain white background. Draw only one tidy " +
    "electronics kit: white solderless breadboard with red and blue rails, " +
    "black USB battery pack, small power module, sorted jumper wires, " +
    "resistors, LEDs, push button, buzzer, and small knob. Show the whole kit " +
    "with no cropping. Use bold readable outlines, flat cheerful colours, " +
    "crisp edges, high contrast, and minimal texture. No text, no letters.",
};

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `Book cover. ${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} Daddy Tiger and Zephyr Tiger sit at the table with the breadboard circuit kit between them. Use the circuit kit reference for the same white breadboard, black battery pack, red and blue rails, tidy jumper wires, resistors, LEDs, button, buzzer, and knob. A simple red LED circuit glows softly on the breadboard. Leave clear simple wall space at the top for a title, but do not draw any text.`,
  },
  {
    page: 2,
    text: "zephyr tiger saw the breadboard.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} Daddy Tiger points to the white solderless breadboard while Zephyr Tiger looks closely at the rows of holes and the center gap. Use the circuit kit reference for the same tidy parts. Nothing is connected yet, no LED is glowing, and no buzzer is sounding.`,
  },
  {
    page: 3,
    text: "daddy tiger showed the red power rail.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${POWER_SOURCE} ${NEAT_WIRING} Daddy Tiger points to the red positive rail on the breadboard. Only the battery pack, power module, red rail wire, and blue rail wire are connected. Zephyr Tiger watches carefully. Nothing is glowing.`,
  },
  {
    page: 4,
    text: "the resistor kept the led safe.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    referenceImages: ["data/circuit-reference-images/resistor-led-series.png"],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} Use the attached circuit reference image for the exact breadboard topology and preserve that topology in clean cartoon style. ${LED_CIRCUIT} Daddy Tiger points to the striped resistor. Zephyr Tiger looks at the glowing red LED. Do not invent extra connected wires.`,
  },
  {
    page: 5,
    text: "the long led leg touched power.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${LED_CIRCUIT} Daddy Tiger gently points to the long leg of the red LED, which is connected toward the resistor and red positive side. The short leg goes back to the blue negative rail. Zephyr Tiger watches the LED glow softly.`,
  },
  {
    page: 6,
    text: "zephyr tiger pushed the button.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${POWER_SOURCE} ${NEAT_WIRING} Zephyr Tiger presses a small push button mounted across the breadboard center gap. Show a button LED circuit: red rail to resistor, resistor to one side of the button, other side of the button to the LED long leg, LED short leg to blue rail. The LED glows because the button is pressed. Daddy Tiger smiles.`,
  },
  {
    page: 7,
    text: "the circuit made one loop.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${POWER_SOURCE} ${NEAT_WIRING} Daddy Tiger traces one complete circuit loop with his paw while Zephyr Tiger follows along. Show a clean loop on the breadboard: red positive rail to resistor, resistor to LED long leg, LED short leg through a button, and button back to blue negative rail. Use a few small glowing dots along the one path only, with no letters or words.`,
  },
  {
    page: 8,
    text: "the buzzer made a sound.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${POWER_SOURCE} ${NEAT_WIRING} Daddy Tiger adds a small round buzzer to the breadboard while Zephyr Tiger presses a button. Show this buzzer circuit: red positive rail to one side of the push button, other side of the push button to the buzzer positive leg, buzzer negative leg to the blue negative rail. Show curved sound lines from the buzzer, but no sound words and no letters. No LED is glowing on this page.`,
  },
  {
    page: 9,
    text: "the little knob changed the light.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${POWER_SOURCE} ${NEAT_WIRING} Zephyr Tiger turns a small knob potentiometer while Daddy Tiger watches. Show this dimmer circuit: red positive rail to one outside leg of the potentiometer, center wiper leg to a resistor, resistor to LED long leg, LED short leg to blue negative rail. Show one LED with a soft glow and a faint brighter halo to suggest dim and bright. No extra second LED circuit.`,
  },
  {
    page: 10,
    text: "red, green, and blue glowed.",
    characters: [ZEPHYR, DADDY, CIRCUIT_KIT],
    anchorOnCover: false,
    prompt: `${PRINT_CLEAR} ${TIGER_CONSISTENCY} ${CIRCUIT_TABLE} ${POWER_SOURCE} ${NEAT_WIRING} Daddy Tiger points to one RGB LED glowing red, green, and blue while Zephyr Tiger smiles. Show an RGB LED with four legs in separate breadboard rows. Three separate resistors connect neatly to three color legs, and the common leg connects back to the blue negative rail. Keep the wiring organized and clearly separated by color. No readable text.`,
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Tiger Stories",
  style: STYLE_CLEAN_PRINT_CARTOON,
  characters: [
    CHAR_ZEPHYR_TIGER_CARTOON,
    CHAR_DADDY_TIGER_CARTOON,
    ASSET_CIRCUIT_KIT_CARTOON,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "high",
  imageModel: "gpt-image-2",
  fullPageImages: false,
  concurrency: 2,
  anchorOnCover: false,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
