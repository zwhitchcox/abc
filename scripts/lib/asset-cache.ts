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

// When OPEN_ROUTER_API_KEY is set, images are generated through OpenRouter
// instead of the OpenAI images API. OpenRouter has no /images endpoint, so
// generation goes through chat completions with an image-output model that
// accepts reference images as inputs.
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY;
// openai/gpt-5.4-image-2 is GPT Image 2 (the model this series was built
// with) exposed through OpenRouter's chat completions API.
const OPENROUTER_IMAGE_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL ?? "openai/gpt-5.4-image-2";
const openrouter = OPENROUTER_API_KEY
  ? new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: OPENROUTER_API_KEY,
      // Image generations are slow and return large base64 payloads — give the
      // socket plenty of time and let the SDK retry transient drops itself.
      timeout: 5 * 60 * 1000,
      maxRetries: 5,
    })
  : null;

/** Retry transient network failures (socket drops, timeouts) with backoff. */
async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const cause =
        err && typeof err === "object" && "cause" in err
          ? String((err as { cause?: unknown }).cause)
          : "";
      const transient =
        /terminated|ETIMEDOUT|ECONNRESET|ENOTFOUND|EAI_AGAIN|socket hang up|fetch failed|aborted|Unexpected end of JSON input|Unexpected token|no image|503|502|429/i.test(
          msg + " " + cause,
        );
      if (i === attempts || !transient) throw err;
      const backoff = Math.min(30000, 2000 * 2 ** (i - 1));
      console.warn(`  [retry] ${label} failed (${msg}); retrying in ${backoff}ms (${i}/${attempts})`);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

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

function aspectRatioForSize(size: ImageSize): string {
  switch (size) {
    case "1536x1024":
      return "3:2";
    case "1024x1536":
      return "2:3";
    default:
      return "1:1";
  }
}

async function loadImageDataUri(p: string) {
  const buf = await fs.readFile(p);
  const ext = path.extname(p).toLowerCase();
  const type =
    ext === ".jpg" || ext === ".jpeg"
      ? "image/jpeg"
      : ext === ".webp"
        ? "image/webp"
        : "image/png";
  return `data:${type};base64,${buf.toString("base64")}`;
}

/**
 * Generate an image via OpenRouter chat completions. Reference images (if
 * any) are passed as image_url content parts; the model returns the image
 * as a base64 data URI in message.images.
 */
async function generateViaOpenRouter(
  prompt: string,
  references: string[],
  outPath: string,
  size: ImageSize,
) {
  if (!openrouter) throw new Error("OpenRouter client not configured");
  const aspect = aspectRatioForSize(size);
  const content: Array<Record<string, unknown>> = [
    {
      type: "text",
      text:
        `${prompt}\n\nRender exactly one image in a ${aspect} aspect ratio.` +
        (references.length
          ? " Match the art style of the supplied reference images exactly: same palette, same line weight, same shading style. The supplied images are style and character references, not content to copy verbatim."
          : ""),
    },
  ];
  for (const ref of references) {
    content.push({
      type: "image_url",
      image_url: { url: await loadImageDataUri(ref) },
    });
  }
  const result = (await openrouter.chat.completions.create({
    model: OPENROUTER_IMAGE_MODEL,
    messages: [{ role: "user", content }],
    modalities: ["image", "text"],
    image_config: { aspect_ratio: aspect },
  } as never)) as unknown as {
    choices?: Array<{
      message?: {
        content?: string;
        images?: Array<{ image_url?: { url?: string } }>;
      };
    }>;
  };
  const message = result.choices?.[0]?.message;
  const url = message?.images?.[0]?.image_url?.url;
  if (!url) {
    const text = message?.content?.slice(0, 200);
    throw new Error(
      `OpenRouter returned no image${text ? ` (model said: ${text})` : ""}`,
    );
  }
  const b64 = url.startsWith("data:") ? url.split(",", 2)[1] : null;
  if (!b64) throw new Error(`OpenRouter image is not a data URI: ${url.slice(0, 80)}`);
  await writeImageFromB64(outPath, b64);
}

async function generateFromScratch(
  prompt: string,
  outPath: string,
  size: ImageSize,
  quality: ImageQuality,
  model: ImageModel = DEFAULT_IMAGE_MODEL,
) {
  if (openrouter) {
    await withRetry(`generate ${path.basename(outPath)}`, () =>
      generateViaOpenRouter(prompt, [], outPath, size),
    );
    return;
  }
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
  if (openrouter) {
    await withRetry(`generate ${path.basename(outPath)}`, () =>
      generateViaOpenRouter(prompt, references, outPath, size),
    );
    return;
  }
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
