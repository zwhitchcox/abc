import path from "path";
import fs from "fs-extra";
import OpenAI from "openai";
import {
  isServerAiEnabled,
  serverAiDisabledMessage,
} from "./server-ai-policy.server.ts";
import {
  getContentFile,
  upsertContentFile,
} from "#app/utils/content-store.server.ts";

const TTS_PROMPT_VERSION = "3";

function ttsFilename(text: string) {
  const base = text.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `${base}-v${TTS_PROMPT_VERSION}.wav`;
}

function ttsInput(text: string) {
  return `The word is: ${text}.`;
}

function getTtsCacheDir() {
  if (process.env.TTS_DIR) return process.env.TTS_DIR;
  if (process.env.NODE_ENV === "production") return "/data/audio/tts";
  return path.join(process.cwd(), "data", "audio", "tts");
}

function ttsContentPath(filename: string) {
  return `data/audio/tts/${filename}`;
}

export async function generateAudio(text: string): Promise<string | null> {
  const filename = ttsFilename(text);
  const cacheDir = getTtsCacheDir();
  const filePath = path.join(cacheDir, filename);
  const contentPath = ttsContentPath(filename);

  await fs.ensureDir(cacheDir);

  const storedFile = await getContentFile(contentPath);
  if (storedFile) {
    if (!(await fs.pathExists(filePath))) {
      await fs.writeFile(filePath, Buffer.from(storedFile.blob));
    }
    return filePath;
  }

  if (await fs.pathExists(filePath)) {
    const stat = await fs.stat(filePath);
    await upsertContentFile({
      contentPath,
      contentType: "audio/wav",
      buffer: await fs.readFile(filePath),
      fileMtime: stat.mtime,
    });
    return filePath;
  }

  if (!isServerAiEnabled()) {
    console.error(serverAiDisabledMessage());
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY");
    return null;
  }

  const openai = new OpenAI({ apiKey });

  try {
    const wav = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: ttsInput(text),
      response_format: "wav",
    });

    const buffer = Buffer.from(await wav.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    await upsertContentFile({
      contentPath,
      contentType: "audio/wav",
      buffer,
    });
    return filePath;
  } catch (error) {
    console.error("OpenAI TTS Error:", error);
    return null;
  }
}
