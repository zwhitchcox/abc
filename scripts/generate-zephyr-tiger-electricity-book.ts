import "dotenv/config";
import { generateBook, type BookPage } from "./lib/book-generator";
import {
  STYLE_COZY_WATERCOLOUR,
  CHAR_ZEPHYR_TIGER,
  CHAR_DADDY_TIGER,
} from "./lib/characters";

const TITLE = "zephyr tiger learns about electricity";
const FOLDER = "Zephyr-Tiger-Learns-About-Electricity";

const TIGER_CONSISTENCY =
  "Keep both characters on-model from the reference images with balanced storybook proportions. Daddy Tiger is the taller adult with a relaxed average dad build, not muscular, not bulky, and not huge. Zephyr Tiger is the smaller cub.";

const BREADBOARD_WIRING =
  "The breadboard wiring must look deliberate and functional, not random decoration. Show a horizontal breadboard with red positive rail along the near edge and blue negative rail along the far edge. Use short jumper wires that enter actual holes. Keep wires mostly straight or gently arched, with no tangled loose wires crossing everywhere. Components must bridge separate rows correctly, and each page should show only the parts needed for that experiment plus a few neatly sorted unused parts off to the side.";

const VISIBLE_POWER_SOURCE =
  "Every active circuit must show its power source clearly: a black USB battery pack on the table, a USB cable plugged into a small breadboard power module, the power module plugged into the breadboard rails, one red jumper from the power module positive output to the red positive rail, and one blue jumper from the power module negative output to the blue negative rail. If a light glows or a buzzer sounds, this visible power source must be present in the picture.";

const SIMPLE_LED_CIRCUIT =
  `${VISIBLE_POWER_SOURCE} Show this exact simple LED circuit: a red jumper goes from the positive rail to one end of a resistor; the other end of the resistor goes to the LED long leg in a different row; the LED short leg connects by a blue jumper back to the negative rail. The resistor and LED are in series. Do not put both LED legs in the same row. Do not put both resistor legs in the same row.`;

const PAGES: BookPage[] = [
  {
    page: 1,
    text: "",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Book cover. Draw exactly two tigers, both fully visible and separate: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Daddy Tiger sits beside Zephyr at a low table, pointing to a real solderless breadboard kit. Zephyr looks curious and ready to help. On the breadboard, show one neat finished LED circuit using a resistor in series with a glowing red LED. Keep extra jumper wires, LEDs, resistors, push buttons, a small buzzer, and a knob potentiometer arranged neatly in a parts tray beside the breadboard. Cozy den, warm lamplight, no other tigers, no wall outlet, no sparks, no readable text.`,
  },
  {
    page: 2,
    text:
      "zephyr saw the breadboard.\n\n" +
      "it had rows for little parts.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} Daddy Tiger sits beside Zephyr at a low table and points to a large solderless breadboard with clear rows of small holes and an obvious center gap. Zephyr looks closely at the rows. Do not connect a circuit yet. No LEDs are glowing and no buzzer is sounding on this page. Show jumper wires, LEDs, resistors, and push buttons sorted beside the board, not plugged in. Cozy den, no wall outlet, no readable text.`,
  },
  {
    page: 3,
    text:
      "red was for power.\n\n" +
      "blue went back again.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Daddy Tiger connects only the power source and two rail wires. Zephyr watches the two colored rails. Do not add LEDs, buzzers, resistors, or extra connected parts on this page. Nothing is glowing. No wall outlet, no readable text.`,
  },
  {
    page: 4,
    text:
      "a resistor slowed the power.\n\n" +
      "the led did not get too much.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    referenceImages: ["data/circuit-reference-images/resistor-led-series.png"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} Use the attached circuit reference image for the exact breadboard topology and preserve that topology in storybook style. Daddy Tiger sits beside Zephyr and points to the resistor in the circuit. ${SIMPLE_LED_CIRCUIT} Make the resistor with colored bands clearly visible between the red positive rail and the LED long leg. The LED can glow softly. Do not invent extra connected wires. Do not leave the resistor floating. Cozy table scene, no other tigers, no wall outlet, no readable text.`,
  },
  {
    page: 5,
    text:
      "the led was a little light.\n\n" +
      "the long leg got power.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} Daddy Tiger shows Zephyr the LED legs. ${SIMPLE_LED_CIRCUIT} Make the LED large enough to see, with the long leg visibly connected toward the resistor and red positive side, and the short leg connected toward the blue negative side. The LED glows softly. Cozy den, no wall outlet, no readable text.`,
  },
  {
    page: 6,
    text:
      "zephyr pushed the button.\n\n" +
      "the light went on.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Zephyr presses a small push button mounted across the breadboard center gap. Show this exact button LED circuit: red rail to resistor, resistor to one side of the button, other side of the button to the LED long leg, LED short leg to blue rail. The button must straddle the center gap with its legs in separate rows. The LED glows brightly because the button is pressed. Daddy Tiger points to the button and smiles. No wall outlet, no readable text.`,
  },
  {
    page: 7,
    text: "the circuit made a loop.\n\n" + "power went out and back.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Daddy Tiger points to the complete loop on the breadboard. Show one clean loop: red positive rail to resistor, resistor to LED long leg, LED short leg to push button, push button back to blue negative rail. Use small glowing dots or arrows along that one path only, but no letters or readable text. Zephyr traces the loop in the air. Cozy den, no wall outlet.`,
  },
  {
    page: 8,
    text: "daddy added a buzzer.\n\n" + "buzz buzz went the sound.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Daddy Tiger adds a small round buzzer component to the breadboard. Show this exact buzzer circuit: red positive rail to one side of a push button, other side of the push button to the buzzer positive leg, buzzer negative leg to the blue negative rail. The push button straddles the breadboard center gap. Zephyr presses the button and smiles at the sound. Show curved sound lines coming from the buzzer, with no letters or readable text. No LEDs are glowing on this buzzer page. No wall outlet.`,
  },
  {
    page: 9,
    text:
      "daddy turned the little knob.\n\n" +
      "the light got dim and bright.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Daddy Tiger turns a small potentiometer knob on the breadboard while Zephyr watches one LED changing brightness. Show this exact dimmer idea: red positive rail to one outside leg of the potentiometer, center wiper leg to a resistor, resistor to LED long leg, LED short leg to blue negative rail. Use one LED with a soft glow, plus a faint brighter glow halo to suggest it can get dim and bright. No extra second LED circuit. Cozy den, no other tigers, no wall outlet, no readable text.`,
  },
  {
    page: 10,
    text:
      "zephyr saw the color light.\n\n" +
      "red, green, and blue glowed.",
    characters: ["zephyr-tiger", "daddy-tiger"],
    prompt:
      `Draw exactly two tigers, both fully visible: Zephyr Tiger and Daddy Tiger. ${TIGER_CONSISTENCY} ` +
      `${BREADBOARD_WIRING} ${VISIBLE_POWER_SOURCE} Daddy Tiger points to an RGB LED glowing with red, green, and blue colors. Show an RGB LED with four legs in separate breadboard rows. Three separate resistors connect from the red positive rail to three different color legs using three neat short jumper wires; the common leg connects back to the blue negative rail. Keep the wiring organized and clearly separated by color. Zephyr watches the color light closely. Cozy den, no other tigers, no wall outlet, no readable text.`,
  },
];

generateBook({
  title: TITLE,
  folder: FOLDER,
  series: "Tiger Stories",
  style: STYLE_COZY_WATERCOLOUR,
  characters: [
    CHAR_ZEPHYR_TIGER,
    CHAR_DADDY_TIGER,
  ],
  pages: PAGES,
  layout: "split",
  imageSize: "1536x1024",
  imageQuality: "medium",
  imageModel: "gpt-image-2",
  fullPageImages: false,
  anchorOnCover: false,
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
