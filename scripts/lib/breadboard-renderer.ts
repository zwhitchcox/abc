import path from "path";
import fs from "fs-extra";

type HoleRow = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j";
type Rail = "+top" | "-top" | "+bottom" | "-bottom";
type Hole = `${HoleRow}${number}`;
type Point = Hole | Rail | { x: number; y: number };

type Wire = {
  type: "wire";
  from: Point;
  to: Point;
  color: "red" | "blue" | "black" | "green" | "yellow";
  path?: "arch" | "straight";
};

type Resistor = {
  type: "resistor";
  from: Point;
  to: Point;
};

type Led = {
  type: "led";
  anode: Point;
  cathode: Point;
  color: "red" | "green" | "blue" | "rgb";
  glow?: boolean;
};

type Button = {
  type: "button";
  leftTop: Point;
  rightBottom: Point;
};

type Buzzer = {
  type: "buzzer";
  positive: Point;
  negative: Point;
  sounding?: boolean;
};

type Potentiometer = {
  type: "potentiometer";
  left: Point;
  wiper: Point;
  right: Point;
};

type PowerModule = {
  type: "power";
  positive: Point;
  negative: Point;
};

type Note = {
  type: "note";
  x: number;
  y: number;
  text: string;
};

export type BreadboardPart =
  | Wire
  | Resistor
  | Led
  | Button
  | Buzzer
  | Potentiometer
  | PowerModule
  | Note;

export type BreadboardDiagram = {
  title: string;
  subtitle?: string;
  parts: BreadboardPart[];
};

const W = 1200;
const H = 760;
const board = { x: 130, y: 170, w: 940, h: 430 };
const leftX = board.x + 90;
const colGap = 44;
const rowY: Record<HoleRow, number> = {
  a: board.y + 120,
  b: board.y + 148,
  c: board.y + 176,
  d: board.y + 204,
  e: board.y + 232,
  f: board.y + 292,
  g: board.y + 320,
  h: board.y + 348,
  i: board.y + 376,
  j: board.y + 404,
};
const rails: Record<Rail, { x: number; y: number }> = {
  "+top": { x: board.x + 90, y: board.y + 52 },
  "-top": { x: board.x + 90, y: board.y + 78 },
  "+bottom": { x: board.x + 90, y: board.y + board.h - 78 },
  "-bottom": { x: board.x + 90, y: board.y + board.h - 52 },
};

function esc(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function point(p: Point): { x: number; y: number } {
  if (typeof p === "object") return p;
  if (p in rails) return rails[p as Rail];
  const row = p[0] as HoleRow;
  const col = Number(p.slice(1));
  return { x: leftX + (col - 1) * colGap, y: rowY[row] };
}

function wireColor(color: Wire["color"]) {
  return {
    red: "#e13a2e",
    blue: "#2d70d6",
    black: "#222",
    green: "#2f9d58",
    yellow: "#e7b416",
  }[color];
}

function line(from: Point, to: Point, color: string, width = 10) {
  const a = point(from);
  const b = point(to);
  return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function wire(part: Wire) {
  const a = point(part.from);
  const b = point(part.to);
  const color = wireColor(part.color);
  if (part.path === "arch") {
    const midY = Math.min(a.y, b.y) - 50;
    return `<path d="M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`;
  }
  return line(part.from, part.to, color, 10);
}

function resistor(part: Resistor) {
  const a = point(part.from);
  const b = point(part.to);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  const bodyW = Math.max(70, Math.abs(b.x - a.x) - 26);
  return [
    line(part.from, { x: cx - bodyW / 2, y: cy }, "#555", 6),
    line({ x: cx + bodyW / 2, y: cy }, part.to, "#555", 6),
    `<rect x="${cx - bodyW / 2}" y="${cy - 18}" width="${bodyW}" height="36" rx="18" fill="#d9b75a" stroke="#76552b" stroke-width="4"/>`,
    `<line x1="${cx - 25}" y1="${cy - 17}" x2="${cx - 25}" y2="${cy + 17}" stroke="#7a3e20" stroke-width="6"/>`,
    `<line x1="${cx}" y1="${cy - 17}" x2="${cx}" y2="${cy + 17}" stroke="#b61f2a" stroke-width="6"/>`,
    `<line x1="${cx + 25}" y1="${cy - 17}" x2="${cx + 25}" y2="${cy + 17}" stroke="#111" stroke-width="6"/>`,
  ].join("");
}

function led(part: Led) {
  const a = point(part.anode);
  const c = point(part.cathode);
  const cx = (a.x + c.x) / 2;
  const cy = Math.min(a.y, c.y) - 44;
  const fill =
    part.color === "rgb"
      ? "url(#rgb-led)"
      : part.color === "green"
        ? "#32c45d"
        : part.color === "blue"
          ? "#3b82f6"
          : "#ef3d31";
  return [
    part.glow
      ? `<circle cx="${cx}" cy="${cy}" r="54" fill="${part.color === "blue" ? "#bfdbfe" : "#fee2b3"}" opacity="0.5"/>`
      : "",
    line(part.anode, { x: a.x, y: cy + 28 }, "#555", 5),
    line(part.cathode, { x: c.x, y: cy + 28 }, "#555", 5),
    `<circle cx="${cx}" cy="${cy}" r="34" fill="${fill}" stroke="#8f241b" stroke-width="4"/>`,
  ].join("");
}

function button(part: Button) {
  const a = point(part.leftTop);
  const b = point(part.rightBottom);
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2;
  return [
    `<rect x="${cx - 42}" y="${cy - 28}" width="84" height="56" rx="10" fill="#333" stroke="#111" stroke-width="4"/>`,
    `<circle cx="${cx}" cy="${cy}" r="18" fill="#666"/>`,
    line(part.leftTop, { x: cx - 42, y: cy }, "#555", 5),
    line({ x: cx + 42, y: cy }, part.rightBottom, "#555", 5),
  ].join("");
}

function buzzer(part: Buzzer) {
  const p = point(part.positive);
  const n = point(part.negative);
  const cx = (p.x + n.x) / 2;
  const cy = Math.min(p.y, n.y) - 42;
  return [
    line(part.positive, { x: p.x, y: cy + 32 }, "#555", 5),
    line(part.negative, { x: n.x, y: cy + 32 }, "#555", 5),
    `<circle cx="${cx}" cy="${cy}" r="42" fill="#262626" stroke="#111" stroke-width="5"/>`,
    `<circle cx="${cx}" cy="${cy}" r="9" fill="#0f0f0f"/>`,
    part.sounding
      ? `<path d="M ${cx + 58} ${cy - 26} Q ${cx + 92} ${cy} ${cx + 58} ${cy + 26}" fill="none" stroke="#666" stroke-width="6" stroke-linecap="round"/><path d="M ${cx + 76} ${cy - 42} Q ${cx + 126} ${cy} ${cx + 76} ${cy + 42}" fill="none" stroke="#666" stroke-width="5" stroke-linecap="round"/>`
      : "",
  ].join("");
}

function potentiometer(part: Potentiometer) {
  const l = point(part.left);
  const wiper = point(part.wiper);
  const r = point(part.right);
  const cx = (l.x + r.x) / 2;
  const cy = Math.min(l.y, r.y, wiper.y) - 54;
  return [
    line(part.left, { x: l.x, y: cy + 48 }, "#555", 5),
    line(part.wiper, { x: wiper.x, y: cy + 48 }, "#555", 5),
    line(part.right, { x: r.x, y: cy + 48 }, "#555", 5),
    `<rect x="${cx - 54}" y="${cy + 18}" width="108" height="54" rx="10" fill="#333" stroke="#111" stroke-width="4"/>`,
    `<circle cx="${cx}" cy="${cy}" r="42" fill="#555" stroke="#222" stroke-width="5"/>`,
    `<line x1="${cx}" y1="${cy}" x2="${cx + 26}" y2="${cy - 20}" stroke="#111" stroke-width="6" stroke-linecap="round"/>`,
  ].join("");
}

function power(part: PowerModule) {
  const p = point(part.positive);
  const n = point(part.negative);
  return [
    `<rect x="70" y="635" width="190" height="88" rx="18" fill="#222"/>`,
    `<circle cx="112" cy="690" r="7" fill="#f8c24a"/><circle cx="138" cy="690" r="7" fill="#f8c24a"/><circle cx="164" cy="690" r="7" fill="#f8c24a"/>`,
    `<rect x="310" y="650" width="145" height="62" rx="12" fill="#333"/>`,
    `<circle cx="426" cy="681" r="8" fill="#de3d30"/>`,
    `<line x1="260" y1="680" x2="310" y2="680" stroke="#111" stroke-width="12" stroke-linecap="round"/>`,
    `<path d="M 455 665 C 520 665, 520 ${p.y}, ${p.x} ${p.y}" fill="none" stroke="#e13a2e" stroke-width="10" stroke-linecap="round"/>`,
    `<path d="M 455 700 C 520 700, 520 ${n.y}, ${n.x} ${n.y}" fill="none" stroke="#2d70d6" stroke-width="10" stroke-linecap="round"/>`,
  ].join("");
}

function note(part: Note) {
  return `<text x="${part.x}" y="${part.y}" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#5b3414">${esc(part.text)}</text>`;
}

function boardSvg(title: string, subtitle?: string) {
  const holes: string[] = [];
  for (const y of Object.values(rowY)) {
    for (let col = 1; col <= 19; col++) {
      holes.push(
        `<circle cx="${leftX + (col - 1) * colGap}" cy="${y}" r="7" fill="#cfc5ac"/>`,
      );
    }
  }
  return [
    `<rect width="${W}" height="${H}" fill="#f8f1df"/>`,
    `<text x="${W / 2}" y="56" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#5b3414">${esc(title)}</text>`,
    subtitle
      ? `<text x="${W / 2}" y="94" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="600" fill="#7c4a20">${esc(subtitle)}</text>`
      : "",
    `<rect x="${board.x}" y="${board.y}" width="${board.w}" height="${board.h}" rx="28" fill="#fbfbf2" stroke="#b9aa8e" stroke-width="8"/>`,
    `<line x1="${board.x + 50}" y1="${rails["+top"].y}" x2="${board.x + board.w - 50}" y2="${rails["+top"].y}" stroke="#e13a2e" stroke-width="9"/>`,
    `<line x1="${board.x + 50}" y1="${rails["-top"].y}" x2="${board.x + board.w - 50}" y2="${rails["-top"].y}" stroke="#2d70d6" stroke-width="9"/>`,
    `<line x1="${board.x + 50}" y1="${rails["+bottom"].y}" x2="${board.x + board.w - 50}" y2="${rails["+bottom"].y}" stroke="#e13a2e" stroke-width="9"/>`,
    `<line x1="${board.x + 50}" y1="${rails["-bottom"].y}" x2="${board.x + board.w - 50}" y2="${rails["-bottom"].y}" stroke="#2d70d6" stroke-width="9"/>`,
    `<line x1="${board.x + 50}" y1="${board.y + 260}" x2="${board.x + board.w - 50}" y2="${board.y + 260}" stroke="#ddd4bf" stroke-width="8"/>`,
    holes.join(""),
  ].join("");
}

export function renderBreadboardDiagram(diagram: BreadboardDiagram) {
  const defs = `<defs><linearGradient id="rgb-led" x1="0" x2="1"><stop offset="0%" stop-color="#ef3d31"/><stop offset="50%" stop-color="#32c45d"/><stop offset="100%" stop-color="#3b82f6"/></linearGradient></defs>`;
  const parts = diagram.parts
    .map((part) => {
      switch (part.type) {
        case "wire":
          return wire(part);
        case "resistor":
          return resistor(part);
        case "led":
          return led(part);
        case "button":
          return button(part);
        case "buzzer":
          return buzzer(part);
        case "potentiometer":
          return potentiometer(part);
        case "power":
          return power(part);
        case "note":
          return note(part);
      }
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(diagram.title)}">${defs}${boardSvg(diagram.title, diagram.subtitle)}${parts}</svg>`;
}

export async function writeBreadboardDiagram(
  outPath: string,
  diagram: BreadboardDiagram,
) {
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, renderBreadboardDiagram(diagram));
}
