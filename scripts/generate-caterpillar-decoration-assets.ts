import "dotenv/config";

import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import fs from "fs-extra";
import OpenAI, { toFile } from "openai";

const execFileAsync = promisify(execFile);
const openai = new OpenAI();

const ROOT = process.cwd();
const RAW_DIR = path.join(
  ROOT,
  "data",
  "generated-assets",
  "story-decorations",
  "little-garden-caterpillar",
  "raw",
);
const OUT_DIR = path.join(
  ROOT,
  "public",
  "img",
  "story-decorations",
  "little-garden-caterpillar",
);
const REMOVE_BACKGROUND_SCRIPT =
  process.env.REMOVE_CHROMA_KEY_SCRIPT ??
  path.join(
    process.env.HOME ?? "",
    ".codex",
    "skills",
    ".system",
    "imagegen",
    "scripts",
    "remove_chroma_key.py",
  );

const STYLE_REFERENCE = path.join(
  ROOT,
  "data",
  "character-cache",
  "styles",
  "painted-paper-collage",
  "reference.png",
);
const CATERPILLAR_REFERENCE = path.join(
  ROOT,
  "data",
  "character-cache",
  "characters",
  "little-garden-caterpillar-collage",
  "reference.png",
);
const BUTTERFLY_REFERENCE = path.join(
  ROOT,
  "data",
  "character-cache",
  "characters",
  "bright-garden-butterfly-collage",
  "reference.png",
);
const CHRYSALIS_REFERENCE = path.join(
  ROOT,
  "data",
  "character-cache",
  "characters",
  "little-green-chrysalis-collage",
  "reference.png",
);

interface AssetSpec {
  id: string;
  fileName: string;
  prompt: string;
  references: string[];
  size?: "1024x1024" | "1024x1536";
}

const BASE_PROMPT =
  "Story text decoration asset. Create one isolated cut-paper collage " +
  "object for a children's reading booklet. Use bright hand-painted paper " +
  "textures, simple toddler-friendly shapes, clean readable silhouette, " +
  "and no text, no words, no letters. Put the object on a perfectly flat " +
  "pure white background (#ffffff), with no shadow, no scene, and no border. " +
  "Keep the whole object fully visible and fill most of the image.";

const ASSETS: AssetSpec[] = [
  {
    id: "leaf-caterpillar",
    fileName: "leaf-caterpillar.png",
    references: [STYLE_REFERENCE, CATERPILLAR_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Use the caterpillar reference exactly: green segmented body, yellow head, blue antennae, tiny black feet, happy face. Show the caterpillar sitting on one broad green leaf.",
  },
  {
    id: "sleepy-caterpillar",
    fileName: "sleepy-caterpillar.png",
    references: [STYLE_REFERENCE, CATERPILLAR_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Use the caterpillar reference exactly, but make him curled up and sleepy on a broad green leaf. Keep the yellow head, green segmented body, blue antennae, and tiny black feet.",
  },
  {
    id: "butterfly",
    fileName: "butterfly.png",
    references: [STYLE_REFERENCE, BUTTERFLY_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Use the butterfly reference exactly: purple body, blue antennae, bright orange, teal, yellow, and pink painted-paper wings. Show wings open.",
  },
  {
    id: "chrysalis",
    fileName: "chrysalis.png",
    references: [STYLE_REFERENCE, CHRYSALIS_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Use the chrysalis reference exactly. Show one soft green chrysalis hanging from a short brown stem, with a small leaf above it.",
  },
  {
    id: "leaf-stem",
    fileName: "leaf-stem.png",
    references: [STYLE_REFERENCE],
    size: "1024x1536",
    prompt:
      BASE_PROMPT +
      " Make a tall leafy green vine stem designed to run up the side of a page. It should be vertical, gently curved, with five broad leaves alternating left and right from bottom to top.",
  },
  {
    id: "leaf",
    fileName: "leaf.png",
    references: [STYLE_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Make one large soft green leaf with a rounded bite mark on one edge and clear painted-paper veins.",
  },
  {
    id: "strawberry",
    fileName: "strawberry.png",
    references: [STYLE_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Make one bright red strawberry with green paper leaves on top and a small rounded bite mark. Keep it cheerful and simple.",
  },
  {
    id: "pear",
    fileName: "pear.png",
    references: [STYLE_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Make one large yellow pear with a brown stem, one green leaf, and a small rounded bite mark.",
  },
  {
    id: "pea-pod",
    fileName: "pea-pod.png",
    references: [STYLE_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Make one open green pea pod with three round peas inside. One pea has a tiny bite mark.",
  },
  {
    id: "flower",
    fileName: "flower.png",
    references: [STYLE_REFERENCE],
    prompt:
      BASE_PROMPT +
      " Make one cheerful blue flower with layered paper petals, a yellow center, green stem, and two leaves.",
  },
];

async function loadImageFile(filePath: string) {
  const buf = await fs.readFile(filePath);
  return toFile(buf, path.basename(filePath), { type: "image/png" });
}

async function generateAsset(asset: AssetSpec, force: boolean) {
  const rawPath = path.join(RAW_DIR, asset.fileName);
  const outPath = path.join(OUT_DIR, asset.fileName);

  if (!force && (await fs.pathExists(outPath))) {
    console.log(`[skip] ${asset.id}`);
    return;
  }

  await fs.ensureDir(RAW_DIR);
  await fs.ensureDir(OUT_DIR);

  console.log(`[generate] ${asset.id}`);
  const references = await Promise.all(asset.references.map(loadImageFile));
  const result = await openai.images.edit({
    model: "gpt-image-2",
    image: references,
    prompt: asset.prompt,
    size: asset.size ?? "1024x1024",
    quality: "high",
    n: 1,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error(`No image data returned for ${asset.id}`);

  await fs.writeFile(rawPath, Buffer.from(b64, "base64"));

  console.log(`[remove-bg] ${asset.id}`);
  await execFileAsync("python3", [
    REMOVE_BACKGROUND_SCRIPT,
    "--input",
    rawPath,
    "--out",
    outPath,
    "--auto-key",
    "corners",
    "--soft-matte",
    "--transparent-threshold",
    "20",
    "--opaque-threshold",
    "72",
    "--edge-feather",
    "1",
    "--force",
  ]);
}

async function main() {
  const force = process.argv.includes("--force");
  for (const asset of ASSETS) {
    await generateAsset(asset, force);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
