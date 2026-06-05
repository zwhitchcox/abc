import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const prune = args.has("--prune");

const DEFAULT_ROOTS = [
  "data/processed-pdfs",
  "data/audio",
  "data/words",
  "data/character-cache",
  "data/ride-reference-images",
  "data/circuit-reference-images",
  "images",
];

function argValues(name: string) {
  const prefix = `${name}=`;
  return process.argv
    .slice(2)
    .filter((arg) => arg.startsWith(prefix))
    .map((arg) => arg.slice(prefix.length));
}

function normalizeContentPath(value: string) {
  return value
    .split(path.sep)
    .join("/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/");
}

function guessContentType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".json": "application/json; charset=utf-8",
      ".txt": "text/plain; charset=utf-8",
      ".md": "text/markdown; charset=utf-8",
      ".pdf": "application/pdf",
    }[ext] ?? "application/octet-stream"
  );
}

function hashBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function pathExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(root: string) {
  const files: string[] = [];
  if (!(await pathExists(root))) return files;

  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".DS_Store" || entry.name.startsWith("._")) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  await walk(root);
  return files;
}

async function importFile(filePath: string) {
  const relativePath = normalizeContentPath(
    path.relative(process.cwd(), filePath),
  );
  const stat = await fs.stat(filePath);
  const buffer = await fs.readFile(filePath);
  const sha256 = hashBuffer(buffer);

  const existing = await prisma.contentFile.findUnique({
    where: { path: relativePath },
    select: { sha256: true, size: true },
  });
  if (existing?.sha256 === sha256 && existing.size === buffer.length) {
    return { path: relativePath, status: "unchanged" as const };
  }

  if (!dryRun) {
    await prisma.contentFile.upsert({
      where: { path: relativePath },
      update: {
        contentType: guessContentType(relativePath),
        blob: buffer,
        size: buffer.length,
        sha256,
        fileMtime: stat.mtime,
      },
      create: {
        path: relativePath,
        contentType: guessContentType(relativePath),
        blob: buffer,
        size: buffer.length,
        sha256,
        fileMtime: stat.mtime,
      },
    });
  }

  return {
    path: relativePath,
    status: existing ? ("updated" as const) : ("created" as const),
  };
}

async function main() {
  const roots = argValues("--root");
  const rootPaths = (roots.length ? roots : DEFAULT_ROOTS).map((root) =>
    path.resolve(root),
  );
  const rootExists = new Map(
    await Promise.all(
      rootPaths.map(async (root) => [root, await pathExists(root)] as const),
    ),
  );

  const files = (
    await Promise.all(rootPaths.map((root) => walkFiles(root)))
  ).flat();
  const seenPaths = new Set(
    files.map((filePath) =>
      normalizeContentPath(path.relative(process.cwd(), filePath)),
    ),
  );

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const filePath of files) {
    const result = await importFile(filePath);
    if (result.status === "created") created++;
    if (result.status === "updated") updated++;
    if (result.status === "unchanged") unchanged++;
  }

  let pruned = 0;
  if (prune) {
    for (const root of rootPaths) {
      if (!rootExists.get(root)) {
        console.warn(
          `Skipping prune for missing root: ${path.relative(process.cwd(), root)}`,
        );
        continue;
      }
      const relativeRoot = `${normalizeContentPath(path.relative(process.cwd(), root))}/`;
      const stored = await prisma.contentFile.findMany({
        where: { path: { startsWith: relativeRoot } },
        select: { path: true },
      });
      const stalePaths = stored
        .map((row) => row.path)
        .filter((storedPath) => !seenPaths.has(storedPath));
      pruned += stalePaths.length;

      if (!dryRun && stalePaths.length) {
        await prisma.contentFile.deleteMany({
          where: { path: { in: stalePaths } },
        });
      }
    }
  }

  console.log(
    `${dryRun ? "Would import" : "Imported"} ${files.length} files into ContentFile ` +
      `(${created} created, ${updated} updated, ${unchanged} unchanged` +
      `${prune ? `, ${pruned} pruned` : ""}).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
