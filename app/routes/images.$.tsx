import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { join } from "path";
import { type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const imagePath = params["*"];
  if (!imagePath) {
    throw new Response("Not Found", { status: 404 });
  }

  // Construct the full path
  const baseDir =
    process.env.NODE_ENV === "production" ? "/data/images" : "./images";
  const fullPath = join(baseDir, imagePath);

  try {
    // Check if file exists
    const stats = await stat(fullPath);
    if (!stats.isFile()) {
      throw new Response("Not Found", { status: 404 });
    }

    // Determine content type based on extension
    const ext = fullPath.split(".").pop()?.toLowerCase();
    const contentType =
      {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
      }[ext || ""] || "application/octet-stream";

    // Create a read stream and return it
    const stream = createReadStream(fullPath);

    // Convert Node.js stream to Web Stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on('end', () => {
          controller.close();
        });
        stream.on('error', (error) => {
          controller.error(error);
        });
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    throw new Response("Not Found", { status: 404 });
  }
}
