import { stat } from "fs/promises";
import { join } from "path";
import { type LoaderFunctionArgs } from "@remix-run/node";
import {
  getContentFile,
  normalizeContentPath,
  responseFromFilesystemFile,
  responseFromStoredFile,
} from "#app/utils/content-store.server.ts";
import { getFlashcardImagesDir } from "#app/utils/content-paths.server.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const imagePath = params["*"];
  if (!imagePath) {
    throw new Response("Not Found", { status: 404 });
  }

  const relativePath = normalizeContentPath(imagePath);
  if (relativePath.startsWith("..") || relativePath.includes("/../")) {
    throw new Response("Not Found", { status: 404 });
  }

  const storedFile = await getContentFile(`images/${relativePath}`);
  if (storedFile) {
    return responseFromStoredFile(storedFile, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Construct the full path
  const baseDir = getFlashcardImagesDir();
  const fullPath = join(baseDir, relativePath);

  try {
    // Check if file exists
    const stats = await stat(fullPath);
    if (!stats.isFile()) {
      throw new Response("Not Found", { status: 404 });
    }

    return responseFromFilesystemFile(fullPath, stats, undefined, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
}
