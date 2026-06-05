import { invariantResponse } from "@epic-web/invariant";
import { type LoaderFunctionArgs } from "@remix-run/node";
import {
  responseFromFilesystemFileWithRange,
  responseFromStoredFileWithRange,
} from "#app/utils/content-store.server.ts";
import { findPdfStoryContentFile } from "#app/utils/pdf-story-content.server.ts";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { storyName, page } = params;
  invariantResponse(storyName && page, "Story name and page are required", {
    status: 400,
  });

  const paddings = [0, 2, 3, 4];
  const fileNames = paddings.map((pad) =>
    pad === 0 ? `page-${page}.mp3` : `page-${page.padStart(pad, "0")}.mp3`,
  );
  const match = await findPdfStoryContentFile(storyName, "audio", fileNames);

  if (!match) {
    throw new Response("Audio not found", { status: 404 });
  }

  const range = request.headers.get("range");

  if (match.storedFile) {
    return responseFromStoredFileWithRange(match.storedFile, range);
  }

  return responseFromFilesystemFileWithRange(
    match.fsPath,
    match.stat,
    range,
    "audio/mpeg",
  );
}
