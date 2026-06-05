import { invariantResponse } from "@epic-web/invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import {
  responseFromFilesystemFile,
  responseFromStoredFile,
} from "#app/utils/content-store.server.ts";
import { findPdfStoryContentFile } from "#app/utils/pdf-story-content.server.ts";

export async function loader({ params }: LoaderFunctionArgs) {
  const { storyName, page } = params;
  invariantResponse(storyName && page, "Story name and page are required", {
    status: 400,
  });

  const paddings = [2, 3, 4];
  const fileNames = paddings.flatMap((pad) => {
    const paddedPage = page.padStart(pad, "0");
    return [`page-${paddedPage}.svg`, `page-${paddedPage}.png`];
  });
  const match = await findPdfStoryContentFile(
    storyName,
    "schematics",
    fileNames,
  );

  if (!match) {
    throw new Response("Schematic not found", { status: 404 });
  }

  const headers = {
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  if (match.storedFile) {
    return responseFromStoredFile(match.storedFile, { headers });
  }

  return responseFromFilesystemFile(match.fsPath, match.stat, undefined, {
    headers,
  });
}
