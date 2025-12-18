import path from "path";
import { createReadableStreamFromReadable, type LoaderFunctionArgs } from "@remix-run/node";
import fs from "fs-extra";
import OpenAI from "openai";

const TTS_PROMPT_VERSION = "3";

function ttsFilename(text: string) {
  const base = text.toLowerCase().replace(/[^a-z0-9]/g, "-");
  return `${base}-v${TTS_PROMPT_VERSION}.wav`;
}

function ttsInput(text: string) {
  return `*pause* ${text}.`;
}

function getTtsCacheDir() {
  if (process.env.TTS_DIR) return process.env.TTS_DIR;
  if (process.env.NODE_ENV === "production") return "/data/audio/tts";
  return path.join(process.cwd(), "data", "audio", "tts");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const text = url.searchParams.get("text");

  if (!text) {
    return new Response("Missing text parameter", { status: 400 });
  }

  // Sanitize text for filename
  const filename = ttsFilename(text);
  const cacheDir = getTtsCacheDir();
  const filePath = path.join(cacheDir, filename);

  await fs.ensureDir(cacheDir);

  if (await fs.pathExists(filePath)) {
    const fileStats = await fs.stat(filePath);
    const stream = fs.createReadStream(filePath);
    return new Response(createReadableStreamFromReadable(stream), {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(fileStats.size),
        "Cache-Control": "public, max-age=31536000",
      },
    });
  }

  // Generate with OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
      console.error("Missing OPENAI_API_KEY");
      return new Response("Server configuration error", { status: 500 });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const wav = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
      input: ttsInput(text),
      response_format: "wav",
    });

    const buffer = Buffer.from(await wav.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("OpenAI TTS Error:", error);
    return new Response("Error generating audio", { status: 500 });
  }
}





