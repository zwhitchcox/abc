import path from "path";
import fs from "fs-extra";
import {
  normalizeContentPath,
  upsertContentFile,
} from "#app/utils/content-store.server.ts";
import {
  writeBreadboardDiagram,
  type BreadboardDiagram,
} from "./lib/breadboard-renderer";

const FOLDER = process.argv[2] ?? "Zephyr-Tiger-Learns-About-Electricity";
const OUT_DIR = path.join(
  process.cwd(),
  "data",
  "processed-pdfs",
  FOLDER,
  "schematics",
);

const power = {
  type: "power" as const,
  positive: "+bottom" as const,
  negative: "-bottom" as const,
};

const ledCircuit = [
  power,
  {
    type: "wire" as const,
    color: "red" as const,
    from: "+bottom" as const,
    to: "a8" as const,
  },
  { type: "resistor" as const, from: "a8" as const, to: "a12" as const },
  {
    type: "wire" as const,
    color: "red" as const,
    from: "a12" as const,
    to: "d13" as const,
  },
  {
    type: "led" as const,
    color: "red" as const,
    anode: "d13" as const,
    cathode: "g13" as const,
    glow: true,
  },
  {
    type: "wire" as const,
    color: "blue" as const,
    from: "g13" as const,
    to: "-bottom" as const,
  },
];

const diagrams: Record<number, BreadboardDiagram> = {
  2: {
    title: "Breadboard Rows",
    subtitle: "Put parts in holes. Rows connect side to side.",
    parts: [
      { type: "note", x: 330, y: 655, text: "parts go here" },
      { type: "note", x: 760, y: 655, text: "rails run long ways" },
    ],
  },
  3: {
    title: "Power Rails",
    subtitle: "Red is power. Blue goes back.",
    parts: [
      power,
      { type: "wire", color: "red", from: "+bottom", to: "+top", path: "arch" },
      {
        type: "wire",
        color: "blue",
        from: "-bottom",
        to: "-top",
        path: "arch",
      },
    ],
  },
  4: {
    title: "Resistor And LED",
    subtitle: "Power goes through the resistor, then the LED.",
    parts: ledCircuit,
  },
  5: {
    title: "LED Legs",
    subtitle: "Long leg to resistor. Short leg back to blue.",
    parts: [
      ...ledCircuit,
      { type: "note", x: 755, y: 250, text: "long leg" },
      { type: "note", x: 875, y: 510, text: "short leg" },
    ],
  },
  6: {
    title: "Button Light",
    subtitle: "The button closes the circuit.",
    parts: [
      power,
      { type: "wire", color: "red", from: "+bottom", to: "a5" },
      { type: "resistor", from: "a5", to: "a9" },
      { type: "button", leftTop: "d10", rightBottom: "g12" },
      { type: "wire", color: "red", from: "a9", to: "d10" },
      { type: "wire", color: "red", from: "g12", to: "d14" },
      { type: "led", color: "green", anode: "d14", cathode: "g14", glow: true },
      { type: "wire", color: "blue", from: "g14", to: "-bottom" },
    ],
  },
  7: {
    title: "Circuit Loop",
    subtitle: "Power goes out and back.",
    parts: [
      power,
      { type: "wire", color: "red", from: "+bottom", to: "a5" },
      { type: "resistor", from: "a5", to: "a9" },
      { type: "wire", color: "red", from: "a9", to: "d11" },
      { type: "led", color: "red", anode: "d11", cathode: "g11", glow: true },
      { type: "wire", color: "blue", from: "g11", to: "g15" },
      { type: "button", leftTop: "d15", rightBottom: "g17" },
      { type: "wire", color: "blue", from: "g17", to: "-bottom" },
      { type: "note", x: 620, y: 655, text: "one complete loop" },
    ],
  },
  8: {
    title: "Buzzer Button",
    subtitle: "Press the button to make sound.",
    parts: [
      power,
      { type: "wire", color: "red", from: "+bottom", to: "d8" },
      { type: "button", leftTop: "d8", rightBottom: "g10" },
      { type: "wire", color: "red", from: "g10", to: "d14" },
      { type: "buzzer", positive: "d14", negative: "g14", sounding: true },
      { type: "wire", color: "blue", from: "g14", to: "-bottom" },
    ],
  },
  9: {
    title: "Knob Dimmer",
    subtitle: "The knob changes how bright the LED is.",
    parts: [
      power,
      { type: "wire", color: "red", from: "+bottom", to: "d6" },
      { type: "potentiometer", left: "d6", wiper: "d8", right: "d10" },
      { type: "wire", color: "red", from: "d8", to: "a12" },
      { type: "resistor", from: "a12", to: "a15" },
      { type: "wire", color: "red", from: "a15", to: "d16" },
      { type: "led", color: "red", anode: "d16", cathode: "g16", glow: true },
      { type: "wire", color: "blue", from: "g16", to: "-bottom" },
    ],
  },
  10: {
    title: "Color LED",
    subtitle: "Three resistors feed red, green, and blue.",
    parts: [
      power,
      { type: "wire", color: "red", from: "+bottom", to: "a5" },
      { type: "resistor", from: "a5", to: "a8" },
      { type: "wire", color: "red", from: "a8", to: "d12" },
      { type: "wire", color: "red", from: "+bottom", to: "b5" },
      { type: "resistor", from: "b5", to: "b8" },
      { type: "wire", color: "green", from: "b8", to: "d13" },
      { type: "wire", color: "red", from: "+bottom", to: "c5" },
      { type: "resistor", from: "c5", to: "c8" },
      { type: "wire", color: "blue", from: "c8", to: "d14" },
      { type: "led", color: "rgb", anode: "d13", cathode: "g13", glow: true },
      { type: "wire", color: "blue", from: "g13", to: "-bottom" },
    ],
  },
};

for (const [page, diagram] of Object.entries(diagrams)) {
  const outPath = path.join(
    OUT_DIR,
    `page-${String(page).padStart(2, "0")}.svg`,
  );
  await writeBreadboardDiagram(outPath, diagram);
  const stat = await fs.stat(outPath);
  await upsertContentFile({
    contentPath: normalizeContentPath(path.relative(process.cwd(), outPath)),
    buffer: await fs.readFile(outPath),
    fileMtime: stat.mtime,
  });
}

console.log(`Wrote ${Object.keys(diagrams).length} schematic diagrams.`);
