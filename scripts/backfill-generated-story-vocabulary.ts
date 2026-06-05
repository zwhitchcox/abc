import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import { addStoryTextToVocabulary } from "./lib/vocabulary";

const SCRIPT_DIR = path.join(process.cwd(), "scripts");
const PROCESSED_DIR = path.join(process.cwd(), "data", "processed-pdfs");

async function main() {
  let folders = await getGeneratedBookFolders();
  let textChunks: string[] = [];

  for (let folder of folders) {
    let fullTextPath = path.join(PROCESSED_DIR, folder, "full_text.txt");
    if (!(await fs.pathExists(fullTextPath))) continue;
    textChunks.push(await fs.readFile(fullTextPath, "utf8"));
  }

  await addStoryTextToVocabulary(textChunks.join("\n"));
  console.log(`Backfilled vocabulary from ${textChunks.length} generated books.`);
}

async function getGeneratedBookFolders() {
  let files = (await fs.readdir(SCRIPT_DIR))
    .filter((file) => /^generate-.+\.ts$/.test(file))
    .filter((file) => file !== "generate-electricity-schematics.ts");
  let folders = new Set<string>();

  for (let file of files) {
    let source = await fs.readFile(path.join(SCRIPT_DIR, file), "utf8");
    let match = source.match(/const\s+FOLDER\s*=\s*["']([^"']+)["']/);
    let folder = match?.[1];
    if (folder) folders.add(folder);
  }

  return Array.from(folders).sort();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
