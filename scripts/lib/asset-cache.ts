/**
 * Asset cache for characters and styles, shared across all books.
 *
 * Layout:
 *   data/character-cache/
 *     styles/
 *       {style-id}/
 *         description.md   — the style description we use in prompts
 *         reference.png    — the generated style reference image
 *         metadata.json    — { id, createdAt, model, quality, size }
 *     characters/
 *       {character-id}/
 *         description.md   — the character description
 *         reference.png    — the generated character reference
 *         metadata.json    — { id, style, createdAt, model, quality, size }
 */

import path from "path";
import fs from "fs-extra";
import OpenAI, { toFile } from "openai";

const openai = new OpenAI();

const CACHE_ROOT = path.join(process.cwd(), "data", "character-cache");
const STYLES_DIR = path.join(CACHE_ROOT, "styles");
const CHARACTERS_DIR = path.join(CACHE_ROOT, "characters");

export type ImageSize =
  | "1024x1024"
  | "1536x1024"
  | "1024x1536"
  | "auto";
export type ImageQuality = "low" | "medium" | "high";
export type ImageModel = "gpt-image-1" | "gpt-image-1.5" | "gpt-image-2";

/** Image model used for all image generation in this project. */
export const DEFAULT_IMAGE_MODEL: ImageModel = "gpt-image-2";

export interface StyleSpec {
  /** Unique id, e.g. 'paw-patrol-cartoon' or 'cozy-watercolour'. */
  id: string;
  /**
   * Short narrative description of the style — plugged into every prompt
   * that uses this style.
   */
  description: string;
  /**
   * A concrete generation prompt used to produce the style's reference
   * image. Should depict a simple neutral scene (no copyrighted characters)
   * rendered in the target style.
   */
  referencePrompt: string;
  quality?: ImageQuality;
  size?: ImageSize;
}

export interface CharacterSpec {
  /** Unique id, e.g. 'zephyr-tiger'. */
  id: string;
  /** Full description — used in prompts that explicitly mention this character. */
  description: string;
  /** Style id the character should be drawn in. */
  style: string;
  /**
   * Extra context for the reference image — e.g. "standing alone on a plain
   * cream background, full body, facing forward, neutral expression". If
   * omitted a sensible default is used.
   */
  referenceHint?: string;
  quality?: ImageQuality;
  size?: ImageSize;
}

export interface AssetPaths {
  dir: string;
  descriptionPath: string;
  referencePath: string;
  metadataPath: string;
}

async function ensureDirs() {
  await fs.ensureDir(STYLES_DIR);
  await fs.ensureDir(CHARACTERS_DIR);
}

function stylePaths(id: string): AssetPaths {
  const dir = path.join(STYLES_DIR, id);
  return {
    dir,
    descriptionPath: path.join(dir, "description.md"),
    referencePath: path.join(dir, "reference.png"),
    metadataPath: path.join(dir, "metadata.json"),
  };
}

function characterPaths(id: string): AssetPaths {
  const dir = path.join(CHARACTERS_DIR, id);
  return {
    dir,
    descriptionPath: path.join(dir, "description.md"),
    referencePath: path.join(dir, "reference.png"),
    metadataPath: path.join(dir, "metadata.json"),
  };
}

async function loadImageFile(p: string) {
  const buf = await fs.readFile(p);
  const ext = path.extname(p).toLowerCase();
  const type =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : "image/png";
  return toFile(buf, path.basename(p), { type });
}

async function writeImageFromB64(outPath: string, b64: string) {
  const buf = Buffer.from(b64, "base64");
  await fs.ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, buf);
}

async function generateFromScratch(
  prompt: string,
  outPath: string,
  size: ImageSize,
  quality: ImageQuality,
  model: ImageModel = DEFAULT_IMAGE_MODEL,
) {
  const result = await openai.images.generate({
    model,
    prompt,
    size: size === "auto" ? undefined : size,
    quality,
    n: 1,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data returned");
  await writeImageFromB64(outPath, b64);
}

async function generateFromReferences(
  prompt: string,
  references: string[],
  outPath: string,
  size: ImageSize,
  quality: ImageQuality,
  model: ImageModel = DEFAULT_IMAGE_MODEL,
) {
  const imageInputs = await Promise.all(references.map(loadImageFile));
  const result = await openai.images.edit({
    model,
    image: imageInputs,
    prompt,
    size: size === "auto" ? undefined : size,
    quality,
    n: 1,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error("No image data returned");
  await writeImageFromB64(outPath, b64);
}

/**
 * Resolve a style — generating its reference image the first time it's
 * requested. Subsequent calls return the cached paths.
 */
export async function resolveStyle(spec: StyleSpec): Promise<AssetPaths> {
  await ensureDirs();
  const paths = stylePaths(spec.id);

  if (!(await fs.pathExists(paths.referencePath))) {
    console.log(`  [style] Generating reference for "${spec.id}"…`);
    await generateFromScratch(
      spec.referencePrompt,
      paths.referencePath,
      spec.size ?? "1024x1024",
      spec.quality ?? "high",
    );
    await fs.writeFile(paths.descriptionPath, spec.description.trim() + "\n");
    await fs.writeJSON(
      paths.metadataPath,
      {
        id: spec.id,
        createdAt: new Date().toISOString(),
        model: DEFAULT_IMAGE_MODEL,
        quality: spec.quality ?? "high",
        size: spec.size ?? "1024x1024",
        referencePrompt: spec.referencePrompt,
      },
      { spaces: 2 },
    );
  } else {
    // Description might have been updated — keep it fresh.
    await fs.writeFile(paths.descriptionPath, spec.description.trim() + "\n");
  }
  return paths;
}

/**
 * Resolve a reusable character/object reference — generating its reference
 * image the first time it's requested, using its style reference as input.
 */
export async function resolveCharacter(
  spec: CharacterSpec,
  styleRef: AssetPaths,
): Promise<AssetPaths> {
  await ensureDirs();
  const paths = characterPaths(spec.id);

  if (!(await fs.pathExists(paths.referencePath))) {
    console.log(`  [character] Generating reference for "${spec.id}"…`);
    const hint =
      spec.referenceHint ??
      "Standing alone on a plain cream background, full body, facing forward, a neutral friendly expression. No text, no words, no letters, no labels. Nothing else in the frame.";
    const prompt =
      `Reusable reference image. Draw this single subject in the exact art style of ` +
      `the reference image supplied (same palette, same line weight, same shading style). ` +
      `Subject: ${spec.description}. ${hint}`;
    await generateFromReferences(
      prompt,
      [styleRef.referencePath],
      paths.referencePath,
      spec.size ?? "1024x1024",
      spec.quality ?? "high",
    );
    await fs.writeFile(paths.descriptionPath, spec.description.trim() + "\n");
    await fs.writeJSON(
      paths.metadataPath,
      {
        id: spec.id,
        style: spec.style,
        createdAt: new Date().toISOString(),
        model: DEFAULT_IMAGE_MODEL,
        quality: spec.quality ?? "high",
        size: spec.size ?? "1024x1024",
      },
      { spaces: 2 },
    );
  } else {
    await fs.writeFile(paths.descriptionPath, spec.description.trim() + "\n");
  }
  return paths;
}

/** Generate a scene using style + character references + optional extras. */
export async function generateScene(params: {
  prompt: string;
  /** Paths to reference images passed to the edit endpoint (style, characters, cover, etc). */
  references: string[];
  outPath: string;
  size: ImageSize;
  quality: ImageQuality;
  model?: ImageModel;
}) {
  await generateFromReferences(
    params.prompt,
    params.references,
    params.outPath,
    params.size,
    params.quality,
    params.model,
  );
}

export const cachePaths = {
  root: CACHE_ROOT,
  styles: STYLES_DIR,
  characters: CHARACTERS_DIR,
  style: stylePaths,
  character: characterPaths,
};
