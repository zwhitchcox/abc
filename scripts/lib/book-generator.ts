import path from "path";
import fs from "fs-extra";
import {
  normalizeContentPath,
  upsertContentFile,
} from "#app/utils/content-store.server.ts";
import {
  resolveStyle,
  resolveCharacter,
  generateScene,
  type StyleSpec,
  type CharacterSpec,
  type ImageSize,
  type ImageQuality,
  type ImageModel,
} from "./asset-cache";
import {
  STYLE_COZY_WATERCOLOUR,
  STYLE_CLEAN_PRINT_CARTOON,
  CHAR_ZEPHYR_TIGER_CARTOON,
  CHAR_AUGGIE_TIGER_CARTOON,
  CHAR_MOMMY_TIGER_CARTOON,
  CHAR_DADDY_TIGER_CARTOON,
} from "./characters";
import { addStoryTextToVocabulary } from "./vocabulary";

export interface BookPage {
  page: number;
  text: string;
  prompt: string;
  /** Which cached character ids appear on this page. Used to anchor the page
   *  by passing those characters' reference images to the edit call. */
  characters?: string[];
  /** Additional page-specific visual references, such as a real ride photo. */
  referenceImages?: string[];
  /** Set false when the cover composition would pull the page off-scene. */
  anchorOnCover?: boolean;
}

export interface BookConfig {
  title: string;
  folder: string;

  /** Style spec (resolved + cached on first use). */
  style: StyleSpec;
  /** All characters that might appear in this book. Resolved + cached. */
  characters: CharacterSpec[];

  pages: BookPage[];

  series?: string;
  chapter?: number;
  chapterTitle?: string;

  layout?: "caption" | "split";
  imageSize?: ImageSize;
  imageQuality?: ImageQuality;
  imageModel?: ImageModel;
  concurrency?: number;
  /**
   * Default true. New storybooks should generate portrait art for the
   * full-page reader/print layout. Set false for special split/schematic books.
   */
  fullPageImages?: boolean;

  /**
   * Whether to include the cover image as an anchor reference for later
   * pages (after it has been generated). Default true — this keeps the
   * overall mood / composition consistent throughout the book.
   */
  anchorOnCover?: boolean;
}

const DEFAULT_STYLE_INSTRUCTION =
  "Match the art style, colour palette, line weight, shading, and character designs shown in the reference images EXACTLY. Keep every character on-model: same face, same fur/skin colour, same outfit, same accessories. Only the scene / action should change. No text, no words, no letters, no speech bubbles.";

const FULL_PAGE_IMAGE_INSTRUCTION =
  "Compose as a vertical full-page children's book illustration for a portrait fold-and-staple booklet page. Use the full 11:17 portrait frame. The art must fit a tall page, not a landscape panel. Fill the portrait frame with meaningful scene art, with no blank side panels. Keep important faces, hands/paws, vehicles, and story objects comfortably inside the page area so the image can print without cropping.";

const CLEAN_CARTOON_BY_OLD_ID = new Map<string, CharacterSpec>([
  ["zephyr-tiger", CHAR_ZEPHYR_TIGER_CARTOON],
  ["auggie-tiger", CHAR_AUGGIE_TIGER_CARTOON],
  ["mommy-tiger", CHAR_MOMMY_TIGER_CARTOON],
  ["daddy-tiger", CHAR_DADDY_TIGER_CARTOON],
]);

function cleanCartoonVersion(spec: CharacterSpec): CharacterSpec {
  const explicit = CLEAN_CARTOON_BY_OLD_ID.get(spec.id);
  if (explicit) return explicit;
  if (spec.style !== STYLE_COZY_WATERCOLOUR.id) return spec;

  return {
    ...spec,
    id: `${spec.id}-clean-cartoon`,
    style: STYLE_CLEAN_PRINT_CARTOON.id,
    description:
      "A clean print-friendly cartoon version of this story subject. Use " +
      "bold readable outlines, flat cheerful colours, crisp edges, high " +
      "contrast, and minimal texture. Subject details: " +
      spec.description,
    referenceHint:
      "Full-body or whole-object reference page on a plain white background. " +
      "Use clean bold outlines, flat cheerful colours, crisp edges, high " +
      "contrast, and minimal texture. Show the whole subject with no cropping, " +
      "no text, no letters, and no logos.",
    quality: "high",
  };
}

function applyArtworkOverride(config: BookConfig): BookConfig {
  if (process.env.BOOK_ARTWORK_STYLE !== "clean-print-cartoon") {
    return config;
  }

  const characterByOldId = new Map<string, CharacterSpec>();
  const nextCharacters: CharacterSpec[] = [];
  for (const character of config.characters) {
    const nextCharacter = cleanCartoonVersion(character);
    characterByOldId.set(character.id, nextCharacter);
    if (!nextCharacters.some((existing) => existing.id === nextCharacter.id)) {
      nextCharacters.push(nextCharacter);
    }
  }

  const mapCharacterId = (id: string) => {
    return characterByOldId.get(id)?.id ?? id;
  };

  return {
    ...config,
    style: STYLE_CLEAN_PRINT_CARTOON,
    characters: nextCharacters,
    pages: config.pages.map((page) => ({
      ...page,
      characters: page.characters?.map(mapCharacterId),
    })),
    imageQuality: config.imageQuality === "low" ? "medium" : "high",
    imageModel: "gpt-image-2",
    anchorOnCover: false,
  };
}

async function storeGeneratedFile(filePath: string) {
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) return;
  await upsertContentFile({
    contentPath: normalizeContentPath(path.relative(process.cwd(), filePath)),
    buffer: await fs.readFile(filePath),
    fileMtime: stat.mtime,
  });
}

async function storeGeneratedDirectory(dir: string) {
  if (!(await fs.pathExists(dir))) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".DS_Store" || entry.name.startsWith("._")) continue;
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await storeGeneratedDirectory(entryPath);
    } else if (entry.isFile()) {
      await storeGeneratedFile(entryPath);
    }
  }
}

export async function generateBook(config: BookConfig) {
  config = applyArtworkOverride(config);
  const {
    title,
    folder,
    style,
    characters,
    pages,
    series,
    chapter,
    chapterTitle,
    layout: requestedLayout = "caption",
    imageSize: requestedImageSize = "1024x1024",
    imageQuality = "medium",
    imageModel = "gpt-image-1",
    concurrency = 3,
    fullPageImages = true,
    anchorOnCover = true,
  } = config;
  const layout = fullPageImages ? "caption" : requestedLayout;
  const imageSize = fullPageImages ? "1056x1632" : requestedImageSize;

  // --- book folder ---
  const baseDir = path.join(process.cwd(), "data", "processed-pdfs", folder);
  const imagesDir = path.join(baseDir, "images");
  const textDir = path.join(baseDir, "text");
  await fs.ensureDir(imagesDir);
  await fs.ensureDir(textDir);

  await fs.writeJSON(
    path.join(baseDir, "metadata.json"),
    {
      title,
      showText: true,
      layout,
      ...(series ? { series } : {}),
      ...(chapter !== undefined ? { chapter } : {}),
      ...(chapterTitle ? { chapterTitle } : {}),
    },
    { spaces: 2 },
  );

  const markers = pages.map((p) => ({
    page: p.page,
    startTime: 0,
    duration: 0,
    text: p.text,
  }));
  await fs.writeJSON(path.join(baseDir, "markers.json"), markers, {
    spaces: 2,
  });

  const fullText = pages
    .map((p) => `--- Page ${p.page} ---\n${p.text}\n`)
    .join("\n");
  await fs.writeFile(path.join(baseDir, "full_text.txt"), fullText);
  await addStoryTextToVocabulary(pages.map((p) => p.text).join("\n"));

  for (const p of pages) {
    await fs.writeFile(path.join(textDir, `page-${p.page}.txt`), p.text);
  }

  // --- resolve style + characters (generates + caches if missing) ---
  console.log("Resolving style + character assets from global cache…");
  const stylePaths = await resolveStyle(style);
  const characterPathsById = new Map<string, string>();
  for (const char of characters) {
    const cp = await resolveCharacter(char, stylePaths);
    characterPathsById.set(char.id, cp.referencePath);
  }
  const characterDescById = new Map(
    characters.map((c) => [c.id, c.description]),
  );
  console.log("Assets ready.\n");

  // --- determine which pages to generate ---
  const pageArgs = process.argv
    .slice(2)
    .filter((arg) => /^\d+$/.test(arg.trim()))
    .map((arg) => parseInt(arg, 10));
  const onlyPages = new Set(pageArgs);
  const force = process.argv.includes("--force");

  const toGenerate = pages.filter((p) => {
    if (onlyPages.size > 0 && !onlyPages.has(p.page)) return false;
    const outPath = path.join(
      imagesDir,
      `page-${String(p.page).padStart(2, "0")}.jpg`,
    );
    if (!force && fs.existsSync(outPath)) {
      console.log(`  Skipping page ${p.page} (already exists)`);
      return false;
    }
    return true;
  });

  console.log(`Generating ${toGenerate.length} page images…`);

  // --- sort so cover (page 1) is generated first if requested ---
  const coverPath = path.join(imagesDir, `page-01.jpg`);
  const coverNeeded = toGenerate.some((p) => p.page === 1);
  if (coverNeeded) {
    // Pull page 1 out and do it first (synchronously), then do the rest.
    const cover = toGenerate.find((p) => p.page === 1)!;
    const rest = toGenerate.filter((p) => p.page !== 1);
    await generatePage(cover, {
      imagesDir,
      stylePath: stylePaths.referencePath,
      characterPathsById,
      characterDescById,
      imageSize,
      imageQuality,
      imageModel,
      coverPath: null, // cover doesn't anchor on itself
      style: style.description,
      fullPageImages,
    });
    // If the cover failed, don't try to anchor other pages on it.
    const coverExists = await fs.pathExists(coverPath);
    if (!coverExists && anchorOnCover) {
      console.warn(
        "  [warn] cover generation failed — subsequent pages will use style + characters only (no cover anchor).",
      );
    }
    await generatePagesConcurrent(rest, concurrency, {
      imagesDir,
      stylePath: stylePaths.referencePath,
      characterPathsById,
      characterDescById,
      imageSize,
      imageQuality,
      imageModel,
      coverPath: anchorOnCover && coverExists ? coverPath : null,
      style: style.description,
      fullPageImages,
    });
  } else {
    const coverExists = await fs.pathExists(coverPath);
    await generatePagesConcurrent(toGenerate, concurrency, {
      imagesDir,
      stylePath: stylePaths.referencePath,
      characterPathsById,
      characterDescById,
      imageSize,
      imageQuality,
      imageModel,
      coverPath: anchorOnCover && coverExists ? coverPath : null,
      style: style.description,
      fullPageImages,
    });
  }

  await storeGeneratedDirectory(baseDir);

  console.log("\nDone!");
  console.log(`Visit /pdf-stories/${folder} to see the book.`);
}

interface PageGenContext {
  imagesDir: string;
  stylePath: string;
  characterPathsById: Map<string, string>;
  characterDescById: Map<string, string>;
  imageSize: ImageSize;
  imageQuality: ImageQuality;
  imageModel: ImageModel;
  coverPath: string | null;
  style: string;
  fullPageImages: boolean;
}

async function generatePage(page: BookPage, ctx: PageGenContext) {
  const outPath = path.join(
    ctx.imagesDir,
    `page-${String(page.page).padStart(2, "0")}.jpg`,
  );

  // Collect reference images: style first, then cover (if used), then any
  // characters appearing on this page.
  const references: string[] = [ctx.stylePath];
  if (ctx.coverPath && page.anchorOnCover !== false) {
    references.push(ctx.coverPath);
  }
  const pageChars = page.characters ?? [];
  for (const id of pageChars) {
    const p = ctx.characterPathsById.get(id);
    if (!p) {
      console.warn(
        `  [warn] page ${page.page} references unknown character "${id}"`,
      );
      continue;
    }
    references.push(p);
  }
  for (const ref of page.referenceImages ?? []) {
    references.push(path.resolve(process.cwd(), ref));
  }

  // Build a prompt that names each reusable character/object reference so
  // the model binds the visual identity to the textual role in this scene.
  const charLines = pageChars
    .map((id) => {
      const desc = ctx.characterDescById.get(id);
      return desc ? `- ${id}: ${desc}` : `- ${id}`;
    })
    .join("\n");

  const fullPrompt =
    `${DEFAULT_STYLE_INSTRUCTION}\n\n` +
    `Art style: ${ctx.style}\n\n` +
    (charLines
      ? `Reusable visual references in this scene (draw each exactly as shown in its reference image):\n${charLines}\n\n`
      : "") +
    (ctx.fullPageImages ? `${FULL_PAGE_IMAGE_INSTRUCTION}\n\n` : "") +
    `Scene: ${page.prompt}`;

  const extraRefCount = page.referenceImages?.length ?? 0;
  const hasCoverRef = Boolean(ctx.coverPath && page.anchorOnCover !== false);
  console.log(
    `  page ${page.page}: ${references.length} refs (style + ${hasCoverRef ? "cover + " : ""}${pageChars.length} chars + ${extraRefCount} extras)`,
  );
  try {
    await generateScene({
      prompt: fullPrompt,
      references,
      outPath,
      size: ctx.imageSize,
      quality: ctx.imageQuality,
      model: ctx.imageModel,
    });
  } catch (e) {
    console.error(`  FAILED page ${page.page}:`, e);
  }
}

async function generatePagesConcurrent(
  pages: BookPage[],
  concurrency: number,
  ctx: PageGenContext,
) {
  for (let i = 0; i < pages.length; i += concurrency) {
    const chunk = pages.slice(i, i + concurrency);
    await Promise.all(chunk.map((p) => generatePage(p, ctx)));
  }
}
