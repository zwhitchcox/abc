import { type ActionFunctionArgs, json, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import OpenAI from "openai";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 5_000_000, // 5MB
  });

  try {
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return json({ error: "No audio file provided" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    // OpenAI expects a File-like object. The Node File object from Remix works.
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return json({ text: transcription.text });
  } catch (error) {
    console.error("Speech to text error:", error);
    return json({ error: "Failed to transcribe audio" }, { status: 500 });
  }
}

