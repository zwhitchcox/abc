import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import {
  getContentFile,
  listStoredContentFiles,
  normalizeContentPath,
  readStoredJson,
} from "#app/utils/content-store.server.ts";

export interface PdfStoryMarker {
  page: number;
  startTime: number;
  duration: number;
  text: string;
}

export interface PdfStoryMetadata {
  title?: string;
  series?: string;
  chapter?: number;
  chapterTitle?: string;
  showText?: boolean;
  layout?: "caption" | "split";
}

export interface PdfStorySummary {
  name: string;
  title: string;
  series: string;
  chapter?: number;
  chapterTitle?: string;
  createdAt?: Date;
}

export interface PdfStoryData {
  storyName: string;
  title: string;
  markers: PdfStoryMarker[];
  totalPages: number;
  showText: boolean;
  layout: "caption" | "split";
  imageVersions: Record<string, number>;
  imageStyles: Array<{ id: string; label: string }>;
  imageStyleVersions: Record<string, Record<string, number>>;
  schematicVersions: Record<string, number>;
}

type StoredSummary = Awaited<ReturnType<typeof listStoredContentFiles>>[number];

export const PDF_STORIES_ROOT = "data/processed-pdfs";

export function assertSafeStoryName(storyName: string) {
  if (
    path.isAbsolute(storyName) ||
    storyName.includes("..") ||
    storyName.includes("/") ||
    storyName.includes("\\")
  ) {
    throw new Response("Invalid story name", { status: 400 });
  }
}

export function pdfStoryContentPath(storyName: string, ...parts: string[]) {
  assertSafeStoryName(storyName);
  return normalizeContentPath(
    path.posix.join(PDF_STORIES_ROOT, storyName, ...parts),
  );
}

export function pdfStoryFsPath(storyName: string, ...parts: string[]) {
  assertSafeStoryName(storyName);
  return path.join(
    process.cwd(),
    "data",
    "processed-pdfs",
    storyName,
    ...parts,
  );
}

async function fsStat(filePath: string) {
  try {
    return await fsp.stat(filePath);
  } catch {
    return null;
  }
}

async function readFsJson<T>(filePath: string) {
  try {
    return JSON.parse(await fsp.readFile(filePath, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function readPdfStoryJson<T>(storyName: string, fileName: string) {
  return (
    (await readStoredJson<T>(pdfStoryContentPath(storyName, fileName))) ??
    (await readFsJson<T>(pdfStoryFsPath(storyName, fileName)))
  );
}

export async function pdfStoryExists(storyName: string) {
  assertSafeStoryName(storyName);
  const fsExists = Boolean(await fsStat(pdfStoryFsPath(storyName)));
  if (fsExists) return true;

  const files = await listStoredContentFiles(
    `${pdfStoryContentPath(storyName)}/`,
  );
  return files.length > 0;
}

function pageNumberFromFileName(fileName: string) {
  const match = fileName.match(/^page-(\d+)\./);
  return match?.[1] ? Number.parseInt(match[1], 10) : null;
}

async function listStoryFiles(
  storyName: string,
  subdir: string,
  extensions: string[],
  storedFiles?: StoredSummary[],
) {
  const byName = new Map<
    string,
    { fileName: string; page: number | null; version: number }
  >();
  const dbPrefix = `${pdfStoryContentPath(storyName, subdir)}/`;
  const rows = storedFiles ?? (await listStoredContentFiles(dbPrefix));

  for (const row of rows) {
    if (!row.path.startsWith(dbPrefix)) continue;
    const fileName = path.posix.basename(row.path);
    if (!extensions.some((ext) => fileName.endsWith(ext))) continue;
    byName.set(fileName, {
      fileName,
      page: pageNumberFromFileName(fileName),
      version: Math.round(row.updatedAt.getTime()),
    });
  }

  const fsDir = pdfStoryFsPath(storyName, subdir);
  if (fs.existsSync(fsDir)) {
    const names = await fsp.readdir(fsDir);
    await Promise.all(
      names
        .filter((fileName) => extensions.some((ext) => fileName.endsWith(ext)))
        .filter((fileName) => !byName.has(fileName))
        .map(async (fileName) => {
          const stat = await fsp.stat(path.join(fsDir, fileName));
          byName.set(fileName, {
            fileName,
            page: pageNumberFromFileName(fileName),
            version: Math.round(stat.mtimeMs),
          });
        }),
    );
  }

  return [...byName.values()].sort((a, b) =>
    a.fileName.localeCompare(b.fileName),
  );
}

async function listStoryImageStyleIds(
  storyName: string,
  storedFiles: StoredSummary[],
) {
  const ids = new Set<string>();
  const prefix = `${pdfStoryContentPath(storyName)}/`;

  for (const file of storedFiles) {
    if (!file.path.startsWith(prefix)) continue;
    const subdir = file.path.slice(prefix.length).split("/")[0];
    if (subdir?.startsWith("images-")) {
      ids.add(subdir.slice("images-".length));
    }
  }

  const storyDir = pdfStoryFsPath(storyName);
  if (fs.existsSync(storyDir)) {
    const entries = await fsp.readdir(storyDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("images-")) {
        ids.add(entry.name.slice("images-".length));
      }
    }
  }

  return [...ids].sort();
}

function imageStyleLabel(id: string) {
  if (id === "default") return "Clean cartoon";
  if (id === "cozy-watercolour") return "Original watercolor";
  if (id === "clean-print-cartoon") return "Clean cartoon";
  return id
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

export async function loadPdfStoryData(
  storyName: string,
): Promise<PdfStoryData> {
  if (!(await pdfStoryExists(storyName))) {
    throw new Response("Story not found", { status: 404 });
  }

  const storedFiles = await listStoredContentFiles(
    `${pdfStoryContentPath(storyName)}/`,
  );
  const markers =
    (await readPdfStoryJson<PdfStoryMarker[]>(storyName, "markers.json")) ?? [];
  const metadata =
    (await readPdfStoryJson<PdfStoryMetadata>(storyName, "metadata.json")) ??
    {};
  const imageFiles = await listStoryFiles(
    storyName,
    "images",
    [".jpg"],
    storedFiles,
  );
  const schematicFiles = await listStoryFiles(
    storyName,
    "schematics",
    [".svg", ".png"],
    storedFiles,
  );

  const imageVersions: Record<string, number> = {};
  imageFiles.forEach((file, index) => {
    imageVersions[String(file.page ?? index + 1)] = file.version;
  });

  const imageStyleVersions: Record<string, Record<string, number>> = {};
  const alternateImageStyleIds = await listStoryImageStyleIds(
    storyName,
    storedFiles,
  );
  for (const styleId of alternateImageStyleIds) {
    const styleFiles = await listStoryFiles(
      storyName,
      `images-${styleId}`,
      [".jpg"],
      storedFiles,
    );
    const versions: Record<string, number> = {};
    styleFiles.forEach((file, index) => {
      versions[String(file.page ?? index + 1)] = file.version;
    });
    if (Object.keys(versions).length > 0) {
      imageStyleVersions[styleId] = versions;
    }
  }

  const schematicVersions: Record<string, number> = {};
  schematicFiles.forEach((file, index) => {
    schematicVersions[String(file.page ?? index + 1)] = file.version;
  });

  const imageStyles = [
    { id: "default", label: imageStyleLabel("default") },
    ...alternateImageStyleIds
      .filter((styleId) => imageStyleVersions[styleId])
      .map((styleId) => ({ id: styleId, label: imageStyleLabel(styleId) })),
  ];

  return {
    storyName,
    title: metadata.title ?? storyName.replace(/-/g, " "),
    markers,
    totalPages: imageFiles.length,
    showText: Boolean(metadata.showText),
    layout: metadata.layout === "split" ? "split" : "caption",
    imageVersions,
    imageStyles,
    imageStyleVersions,
    schematicVersions,
  };
}

function storyNameFromStoredPath(contentPath: string) {
  const prefix = `${PDF_STORIES_ROOT}/`;
  if (!contentPath.startsWith(prefix)) return null;
  return contentPath.slice(prefix.length).split("/")[0] || null;
}

export async function listPdfStories(): Promise<PdfStorySummary[]> {
  const names = new Set<string>();
  const createdAtByName = new Map<string, Date>();

  const pdfDir = path.join(process.cwd(), "data", "processed-pdfs");
  if (fs.existsSync(pdfDir)) {
    const dirs = await fsp.readdir(pdfDir, { withFileTypes: true });
    await Promise.all(
      dirs
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          names.add(dirent.name);
          const stat = await fsp.stat(path.join(pdfDir, dirent.name));
          createdAtByName.set(dirent.name, stat.birthtime);
        }),
    );
  }

  const storedFiles = await listStoredContentFiles(`${PDF_STORIES_ROOT}/`);
  for (const file of storedFiles) {
    const name = storyNameFromStoredPath(file.path);
    if (!name) continue;
    names.add(name);
    const existing = createdAtByName.get(name);
    if (!existing || file.createdAt < existing) {
      createdAtByName.set(name, file.createdAt);
    }
  }

  const stories = await Promise.all(
    [...names].map(async (name) => {
      const metadata =
        (await readPdfStoryJson<PdfStoryMetadata>(name, "metadata.json")) ?? {};
      return {
        name,
        title: metadata.title ?? name.replace(/-/g, " "),
        series: metadata.series ?? "Other Stories",
        chapter: metadata.chapter,
        chapterTitle: metadata.chapterTitle,
        createdAt: createdAtByName.get(name),
      };
    }),
  );

  return stories;
}

export async function findPdfStoryContentFile(
  storyName: string,
  subdir: string,
  fileNames: string[],
) {
  for (const fileName of fileNames) {
    const contentPath = pdfStoryContentPath(storyName, subdir, fileName);
    const storedFile = await getContentFile(contentPath);
    if (storedFile) {
      return {
        storedFile,
        fsPath: pdfStoryFsPath(storyName, subdir, fileName),
      };
    }
  }

  for (const fileName of fileNames) {
    const fsPath = pdfStoryFsPath(storyName, subdir, fileName);
    const stat = await fsStat(fsPath);
    if (stat?.isFile()) return { storedFile: null, fsPath, stat };
  }

  return null;
}
