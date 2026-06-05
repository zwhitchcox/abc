import fs from "node:fs";
import path from "node:path";

export function getFlashcardImagesDir() {
  if (process.env.IMAGES_DIR) return process.env.IMAGES_DIR;

  const mountedImagesDir = "/data/images";
  if (process.env.NODE_ENV === "production" && fs.existsSync(mountedImagesDir)) {
    return mountedImagesDir;
  }

  return path.join(process.cwd(), "images");
}
