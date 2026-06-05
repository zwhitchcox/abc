import type { SeriesStylePreview, StylePreset } from '../../data/story-store.server.ts'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const IMAGE_MODEL =
  process.env.OPENAI_STYLE_PREVIEW_IMAGE_MODEL ??
  process.env.OPENAI_CHARACTER_IMAGE_MODEL ??
  'gpt-image-2'

export async function previewSeriesStyleWithAi(input: {
  description: string
  style: StylePreset
}): Promise<SeriesStylePreview> {
  let prompt = buildSeriesStylePreviewPrompt(input)
  let createdAt = new Date().toISOString()

  if (!OPENAI_API_KEY) {
    return {
      styleId: input.style.id,
      imageUrl: null,
      prompt,
      createdAt,
    }
  }

  try {
    let body: Record<string, unknown> = {
      model: IMAGE_MODEL,
      prompt,
    }
    if (process.env.OPENAI_STYLE_PREVIEW_IMAGE_SIZE) {
      body.size = process.env.OPENAI_STYLE_PREVIEW_IMAGE_SIZE
    }

    let response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) throw new Error(await response.text())
    let json = (await response.json()) as { data?: Array<{ b64_json?: string; url?: string }> }
    let image = json.data?.[0]
    if (image?.b64_json) {
      return {
        styleId: input.style.id,
        imageUrl: `data:image/png;base64,${image.b64_json}`,
        prompt,
        createdAt,
      }
    }
    if (image?.url) {
      return {
        styleId: input.style.id,
        imageUrl: image.url,
        prompt,
        createdAt,
      }
    }
    throw new Error('Image generation response did not include an image.')
  } catch (error) {
    console.warn('AI series style preview failed.', error)
    return {
      styleId: input.style.id,
      imageUrl: null,
      prompt,
      createdAt,
    }
  }
}

function buildSeriesStylePreviewPrompt(input: { description: string; style: StylePreset }) {
  return [
    input.style.promptPrefix,
    'Draw one finished sample illustration for choosing the visual style of a recurring early-reader picture-book series.',
    `Use this exact series description as the subject: ${input.description}`,
    'If the description names or describes characters, include every described character together in one clear scene.',
    'If the description describes a world or recurring situation instead of named characters, show the central recurring cast and setting implied by it.',
    'Make the picture representative of the actual series, not a generic style sample or style chart.',
    'Keep the cast visually distinct, friendly, and readable at preview size.',
    'Wide cover-like composition, no readable text, no labels, no logo, no watermark.',
  ].join(' ')
}
