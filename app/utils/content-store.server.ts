import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { prisma } from "#app/utils/db.server.ts";

export type StoredContentFile = {
  path: string;
  contentType: string;
  blob: Uint8Array;
  size: number;
  createdAt?: Date;
  updatedAt: Date;
};

export function normalizeContentPath(value: string) {
  return value
    .split(path.sep)
    .join("/")
    .replace(/^\.?\//, "")
    .replace(/\/+/g, "/");
}

export function guessContentType(filePath: string) {
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

export function hashBuffer(buffer: Buffer | Uint8Array) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function getContentFile(contentPath: string) {
  return prisma.contentFile.findUnique({
    where: { path: normalizeContentPath(contentPath) },
    select: {
      path: true,
      contentType: true,
      blob: true,
      size: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function upsertContentFile(params: {
  contentPath: string;
  contentType?: string;
  buffer: Buffer | Uint8Array;
  fileMtime?: Date | null;
}) {
  const contentPath = normalizeContentPath(params.contentPath);
  const blob = Buffer.from(params.buffer);
  const sha256 = hashBuffer(blob);
  const contentType = params.contentType ?? guessContentType(contentPath);

  return prisma.contentFile.upsert({
    where: { path: contentPath },
    update: {
      contentType,
      blob,
      size: blob.length,
      sha256,
      fileMtime: params.fileMtime ?? null,
    },
    create: {
      path: contentPath,
      contentType,
      blob,
      size: blob.length,
      sha256,
      fileMtime: params.fileMtime ?? null,
    },
    select: { id: true },
  });
}

export async function readStoredText(contentPath: string) {
  const file = await getContentFile(contentPath);
  if (!file) return null;
  return Buffer.from(file.blob).toString("utf8");
}

export async function readStoredJson<T>(contentPath: string) {
  const text = await readStoredText(contentPath);
  if (!text) return null;
  return JSON.parse(text) as T;
}

export function responseFromStoredFile(
  file: StoredContentFile,
  init?: ResponseInit,
) {
  const buffer = Buffer.from(file.blob);
  return new Response(buffer, {
    ...init,
    headers: {
      "Content-Length": String(file.size),
      "Content-Type": file.contentType,
      ...init?.headers,
    },
  });
}

export function responseFromStoredFileWithRange(
  file: StoredContentFile,
  rangeHeader: string | null,
  init?: ResponseInit,
) {
  const buffer = Buffer.from(file.blob);
  const fileSize = buffer.length;

  if (rangeHeader) {
    const [startPart, endPart] = rangeHeader.replace(/bytes=/, "").split("-");
    const start = Number.parseInt(startPart || "0", 10);
    const end = endPart ? Number.parseInt(endPart, 10) : fileSize - 1;

    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      start < 0 ||
      end >= fileSize ||
      start > end
    ) {
      return new Response("Invalid range", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
          ...init?.headers,
        },
      });
    }

    return new Response(buffer.subarray(start, end + 1), {
      ...init,
      status: 206,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Type": file.contentType,
        ...init?.headers,
      },
    });
  }

  return new Response(buffer, {
    ...init,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(fileSize),
      "Content-Type": file.contentType,
      ...init?.headers,
    },
  });
}

export function responseFromFilesystemFile(
  filePath: string,
  stat: fs.Stats,
  contentType = guessContentType(filePath),
  init?: ResponseInit,
) {
  const stream = fs.createReadStream(filePath);
  return new Response(createReadableStreamFromReadable(stream), {
    ...init,
    headers: {
      "Content-Length": String(stat.size),
      "Content-Type": contentType,
      ...init?.headers,
    },
  });
}

export function responseFromFilesystemFileWithRange(
  filePath: string,
  stat: fs.Stats,
  rangeHeader: string | null,
  contentType = guessContentType(filePath),
  init?: ResponseInit,
) {
  if (!rangeHeader) {
    return responseFromFilesystemFile(filePath, stat, contentType, {
      ...init,
      headers: {
        "Accept-Ranges": "bytes",
        ...init?.headers,
      },
    });
  }

  const fileSize = stat.size;
  const [startPart, endPart] = rangeHeader.replace(/bytes=/, "").split("-");
  const start = Number.parseInt(startPart || "0", 10);
  const end = endPart ? Number.parseInt(endPart, 10) : fileSize - 1;

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end >= fileSize ||
    start > end
  ) {
    return new Response("Invalid range", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${fileSize}`,
        ...init?.headers,
      },
    });
  }

  const stream = fs.createReadStream(filePath, { start, end });
  return new Response(createReadableStreamFromReadable(stream), {
    ...init,
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Content-Type": contentType,
      ...init?.headers,
    },
  });
}

export async function listStoredContentPaths(prefix: string) {
  const normalizedPrefix = normalizeContentPath(prefix);
  const rows = await prisma.contentFile.findMany({
    where: { path: { startsWith: normalizedPrefix } },
    select: { path: true },
    orderBy: { path: "asc" },
  });
  return rows.map((row) => row.path);
}

export async function listStoredContentFiles(prefix: string) {
  const normalizedPrefix = normalizeContentPath(prefix);
  return prisma.contentFile.findMany({
    where: { path: { startsWith: normalizedPrefix } },
    select: {
      path: true,
      contentType: true,
      size: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { path: "asc" },
  });
}

export async function deleteStoredContentPrefix(prefix: string) {
  const normalizedPrefix = normalizeContentPath(prefix);
  return prisma.contentFile.deleteMany({
    where: { path: { startsWith: normalizedPrefix } },
  });
}
