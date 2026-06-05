import {
  formatCharacterExamplesForAi,
  getStylePreset,
} from '../../data/story-store.server.ts'
import type { CharacterProfile, StorySeries, StylePreset } from '../../data/story-store.server.ts'

export type CharacterDraft = {
  name: string
  role: string
  appearance: string
  traits: string
  backstory: string
}

type CharacterSubject = CharacterDraft & {
  id?: string
  referenceImageUrl?: string | null
  description?: string
}

type CharacterAiInput = {
  series: StorySeries
  style: StylePreset
  existingCharacters: CharacterProfile[]
  concept: string
  name?: string
  role?: string
}

type CharacterPreviewInput = {
  series: StorySeries
  style: StylePreset
  existingCharacters: CharacterProfile[]
  character: CharacterSubject
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const TEXT_MODEL = process.env.OPENAI_CHARACTER_TEXT_MODEL ?? 'gpt-5.5'
const IMAGE_MODEL = process.env.OPENAI_CHARACTER_IMAGE_MODEL ?? 'gpt-image-2'

export async function draftCharacterWithAi(input: CharacterAiInput): Promise<CharacterDraft> {
  if (!OPENAI_API_KEY) return fallbackCharacterDraft(input)

  let prompt = [
    `Series: ${input.series.name}`,
    `Series description: ${input.series.description}`,
    `Default art style: ${input.style.name}. ${input.style.description}`,
    `Existing character examples: ${formatCharacterExamplesForAi(input.existingCharacters)}`,
    `New character concept: ${input.concept}`,
    input.name ? `Requested name: ${input.name}` : '',
    input.role ? `Requested role: ${input.role}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    let response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        input: [
          {
            role: 'system',
            content:
              'You design recurring children-book characters. Return JSON only. Keep the new character visually compatible with the example characters while making the character distinct.',
          },
          { role: 'user', content: prompt },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'character_draft',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['name', 'role', 'appearance', 'traits', 'backstory'],
              properties: {
                name: { type: 'string' },
                role: { type: 'string' },
                appearance: { type: 'string' },
                traits: { type: 'string' },
                backstory: { type: 'string' },
              },
            },
          },
        },
      }),
    })

    if (!response.ok) throw new Error(await response.text())
    return normalizeDraft(JSON.parse(extractResponseText(await response.json())))
  } catch (error) {
    console.warn('AI character draft failed; using fallback draft.', error)
    return fallbackCharacterDraft(input)
  }
}

export async function previewCharacterWithAi(input: CharacterPreviewInput) {
  let prompt = buildCharacterPreviewPrompt(input)

  if (!OPENAI_API_KEY) {
    return createFallbackPreviewImage(input.character, input.style)
  }

  try {
    let body: Record<string, unknown> = {
      model: IMAGE_MODEL,
      prompt,
    }
    if (process.env.OPENAI_CHARACTER_IMAGE_SIZE) {
      body.size = process.env.OPENAI_CHARACTER_IMAGE_SIZE
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
    if (image?.b64_json) return `data:image/png;base64,${image.b64_json}`
    if (image?.url) return image.url
    throw new Error('Image generation response did not include an image.')
  } catch (error) {
    console.warn('AI character preview failed; using fallback preview.', error)
    return createFallbackPreviewImage(input.character, input.style)
  }
}

function buildCharacterPreviewPrompt(input: CharacterPreviewInput) {
  return [
    input.style.promptPrefix,
    `Create a single full-body character preview for a recurring early-reader picture-book cast.`,
    `Series: ${input.series.name}. ${input.series.description}`,
    `Target character: ${input.character.name}, ${input.character.role}.`,
    `Appearance: ${input.character.appearance}.`,
    input.character.traits ? `Traits: ${input.character.traits}.` : '',
    input.character.backstory ? `Backstory: ${input.character.backstory}.` : '',
    `Example characters for consistency: ${formatCharacterExamplesForAi(input.existingCharacters, {
      excludeCharacterId: input.character.id,
    })}`,
    `Match the proportions, finish, lighting, and detail level implied by the examples. Keep the target character distinct and recognizable. No readable text, no labels, no logo.`,
  ]
    .filter(Boolean)
    .join(' ')
}

function fallbackCharacterDraft(input: CharacterAiInput): CharacterDraft {
  let concept = input.concept.trim() || `A friendly recurring character for ${input.series.name}`
  let name = input.name?.trim() || fallbackName(concept)
  let role = input.role?.trim() || `recurring character in ${input.series.name}`
  let examples = formatCharacterExamplesForAi(input.existingCharacters)
  return {
    name,
    role,
    appearance: `${concept}. Render with the same child-friendly proportions, simple silhouette, and ${input.style.name.toLowerCase()} finish as the existing cast. ${examples}`,
    traits: 'kind, expressive, curious',
    backstory: `Belongs naturally in ${input.series.name} and gives the series another warm, repeatable point of view.`,
  }
}

function normalizeDraft(value: unknown): CharacterDraft {
  let draft = value as Partial<CharacterDraft>
  return {
    name: requiredString(draft.name, 'New Character'),
    role: requiredString(draft.role, 'recurring character'),
    appearance: requiredString(draft.appearance, 'Friendly early-reader character.'),
    traits: requiredString(draft.traits, 'kind, expressive'),
    backstory: requiredString(draft.backstory, 'A recurring character in the series.'),
  }
}

function requiredString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function extractResponseText(response: unknown): string {
  let value = response as {
    output_text?: unknown
    output?: Array<{ content?: Array<{ text?: unknown; type?: string }> }>
  }

  if (typeof value.output_text === 'string') return value.output_text

  let parts =
    value.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => typeof text === 'string') ?? []

  if (parts.length) return parts.join('')
  throw new Error('Response did not include output text.')
}

function fallbackName(concept: string) {
  let words = concept
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 2)

  if (!words.length) return 'New Character'
  return words.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ')
}

export function createFallbackPreviewImage(character: CharacterSubject, style: StylePreset) {
  let colors = style.previewCss.match(/#[0-9a-fA-F]{6}/g) ?? ['#0f172a', '#38bdf8', '#facc15']
  let primary = colors[0] ?? '#0f172a'
  let secondary = colors[1] ?? '#38bdf8'
  let accent = colors[2] ?? '#facc15'
  let characterColor = colorFromName(character.name)
  let shirtColor = colors[Math.abs(hashString(character.role)) % colors.length] ?? accent
  let initials = character.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${primary}"/>
          <stop offset="0.55" stop-color="${secondary}"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#bg)"/>
      <circle cx="778" cy="184" r="96" fill="rgba(255,255,255,0.42)"/>
      <path d="M0 760c128-74 228-98 342-68 92 24 154 16 238-28 124-66 284-40 444 92v268H0z" fill="rgba(255,255,255,0.32)"/>
      <ellipse cx="512" cy="832" rx="254" ry="58" fill="rgba(15,23,42,0.18)"/>
      <path d="M374 754c20-138 70-218 138-218s118 80 138 218" fill="${shirtColor}"/>
      <path d="M408 760h76v106h-76zM540 760h76v106h-76z" fill="#1f2937"/>
      <path d="M346 606c-56 56-74 104-54 142 42-12 78-48 108-108zM678 606c56 56 74 104 54 142-42-12-78-48-108-108z" fill="${characterColor}"/>
      <circle cx="512" cy="378" r="158" fill="${characterColor}"/>
      <circle cx="402" cy="238" r="58" fill="${characterColor}"/>
      <circle cx="622" cy="238" r="58" fill="${characterColor}"/>
      <circle cx="458" cy="368" r="18" fill="#0f172a"/>
      <circle cx="566" cy="368" r="18" fill="#0f172a"/>
      <path d="M462 444c36 34 70 34 104 0" fill="none" stroke="#0f172a" stroke-width="18" stroke-linecap="round"/>
      <text x="512" y="706" text-anchor="middle" font-family="Arial, sans-serif" font-size="78" font-weight="800" fill="rgba(255,255,255,0.92)">${escapeSvg(initials)}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function colorFromName(name: string) {
  let colors = ['#f59e0b', '#fb7185', '#38bdf8', '#34d399', '#a78bfa', '#f97316']
  return colors[Math.abs(hashString(name)) % colors.length]
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return hash
}

function escapeSvg(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
