import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import {
  getContentFile,
  normalizeContentPath,
  upsertContentFile,
} from "#app/utils/content-store.server.ts";

const [styleId, ...storyNames] = process.argv.slice(2);

if (!styleId || storyNames.length === 0) {
  console.error(
    "Usage: tsx scripts/archive-pdf-story-image-style.ts <style-id> <story-name...>",
  );
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(styleId)) {
  console.error(`Invalid style id: ${styleId}`);
  process.exit(1);
}

const root = path.join(process.cwd(), "data", "processed-pdfs");

async function readCurrentImage(storyName: string, fileName: string) {
  const contentPath = normalizeContentPath(
    path.join("data", "processed-pdfs", storyName, "images", fileName),
  );
  const stored = await getContentFile(contentPath);
  if (stored) return Buffer.from(stored.blob);

  const fsPath = path.join(root, storyName, "images", fileName);
  if (await fs.pathExists(fsPath)) return fs.readFile(fsPath);

  return null;
}

async function archiveStory(storyName: string) {
  const outDir = path.join(root, storyName, `images-${styleId}`);
  await fs.ensureDir(outDir);

  let archived = 0;
  for (let page = 1; page <= 100; page++) {
    const fileName = `page-${String(page).padStart(2, "0")}.jpg`;
    const buffer = await readCurrentImage(storyName, fileName);
    if (!buffer) {
      if (page === 1) {
        console.warn(`  [warn] ${storyName}: no current images found`);
      }
      break;
    }

    const outPath = path.join(outDir, fileName);
    await fs.writeFile(outPath, buffer);
    const stat = await fs.stat(outPath);
    await upsertContentFile({
      contentPath: normalizeContentPath(path.relative(process.cwd(), outPath)),
      buffer,
      fileMtime: stat.mtime,
    });
    archived++;
  }

  console.log(`${storyName}: archived ${archived} images as ${styleId}`);
}

for (const storyName of storyNames) {
  await archiveStory(storyName);
}
