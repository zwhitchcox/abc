import { getStylePreset } from '../../data/story-store.server.ts'
import type { CharacterProfile, StorySeries, StylePreset } from '../../data/story-store.server.ts'
import type { CharacterDraft } from './character-ai.server.ts'

export type SeriesChatToolCall =
  | {
      name: 'set_series_brief'
      arguments: {
        name: string | null
        description: string | null
        defaultStyleId: string | null
      }
    }
  | {
      name: 'add_character'
      arguments: CharacterDraft & {
        styleId: string | null
        generatePreview: boolean
      }
    }
  | {
      name: 'update_character'
      arguments: {
        currentName: string
        name: string | null
        role: string | null
        appearance: string | null
        traits: string | null
        backstory: string | null
        styleId: string | null
        generatePreview: boolean
      }
    }
  | {
      name: 'preview_character'
      arguments: {
        currentName: string
      }
    }

export type SeriesChatPlan = {
  assistantMessage: string
  toolCalls: SeriesChatToolCall[]
}

type AddCharacterArguments = Extract<SeriesChatToolCall, { name: 'add_character' }>['arguments']

type NewSeriesInput = {
  message: string
  styles: StylePreset[]
  selectedStyleId?: string
}

type EditSeriesInput = {
  message: string
  series: StorySeries
  characters: CharacterProfile[]
  styles: StylePreset[]
}

type ResponseOutputItem = {
  type?: string
  name?: string
  arguments?: string
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const TEXT_MODEL = process.env.OPENAI_CHARACTER_TEXT_MODEL ?? 'gpt-5.5'

export async function planNewSeriesFromChat(input: NewSeriesInput): Promise<SeriesChatPlan> {
  if (!OPENAI_API_KEY) return fallbackNewSeriesPlan(input)

  try {
    let selectedStyle = input.selectedStyleId
      ? input.styles.find((style) => style.id === input.selectedStyleId)
      : null
    let response = await createToolResponse({
      instructions:
        'You help parents create early-reader picture-book series. Use tool calls only. Call set_series_brief exactly once and add_character three to five times. Use the selected style when one is provided.',
      prompt: [
        `Parent request: ${input.message}`,
        selectedStyle ? `Selected style: ${selectedStyle.id}: ${selectedStyle.name}` : '',
        `Available styles: ${styleCatalog(input.styles)}`,
      ].filter(Boolean).join('\n'),
      tools: seriesTools(input.styles, ['set_series_brief', 'add_character']),
    })
    let toolCalls = completeNewSeriesBrief(input, extractToolCalls(response, input.styles))
    if (!toolCalls.some((toolCall) => toolCall.name === 'set_series_brief')) {
      throw new Error('Model did not set the series brief.')
    }
    if (!toolCalls.some((toolCall) => toolCall.name === 'add_character')) {
      throw new Error('Model did not add characters.')
    }
    return {
      assistantMessage: summarizeToolCalls(toolCalls, 'I created a starter series from your description.'),
      toolCalls,
    }
  } catch (error) {
    console.warn('Series chat creation failed; using fallback plan.', error)
    return fallbackNewSeriesPlan(input)
  }
}

export async function planSeriesEditFromChat(input: EditSeriesInput): Promise<SeriesChatPlan> {
  if (!OPENAI_API_KEY) return fallbackSeriesEditPlan(input)

  try {
    let response = await createToolResponse({
      instructions:
        'You edit an existing early-reader picture-book series by calling available tools. Use set_series_brief for title/description/style changes, add_character for new characters, update_character for cast changes, and preview_character only when the parent asks to generate or refresh a character look. Make no tool call for unrelated requests.',
      prompt: [
        `Parent request: ${input.message}`,
        `Series: ${input.series.name}`,
        `Series description: ${input.series.description}`,
        `Current style: ${getStylePreset(input.series.defaultStyleId).name}`,
        `Available styles: ${styleCatalog(input.styles)}`,
        `Current characters: ${characterCatalog(input.characters)}`,
        `Recent chat: ${input.series.chatMessages.slice(-8).map((message) => `${message.role}: ${message.text}`).join('\n')}`,
      ].join('\n'),
      tools: seriesTools(input.styles, [
        'set_series_brief',
        'add_character',
        'update_character',
        'preview_character',
      ]),
    })
    let toolCalls = extractToolCalls(response, input.styles)
    return {
      assistantMessage: summarizeToolCalls(toolCalls, 'I updated the series.'),
      toolCalls,
    }
  } catch (error) {
    console.warn('Series chat edit failed; using fallback plan.', error)
    return fallbackSeriesEditPlan(input)
  }
}

async function createToolResponse(input: {
  instructions: string
  prompt: string
  tools: Array<Record<string, unknown>>
}) {
  let response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      instructions: input.instructions,
      input: [{ role: 'user', content: input.prompt }],
      tools: input.tools,
      tool_choice: 'required',
    }),
  })

  if (!response.ok) throw new Error(await response.text())
  return (await response.json()) as { output?: ResponseOutputItem[] }
}

function seriesTools(styles: StylePreset[], names: SeriesChatToolCall['name'][]) {
  let styleIds = styles.map((style) => style.id)
  let tools: Array<Record<string, unknown>> = []

  if (names.includes('set_series_brief')) {
    tools.push({
      type: 'function',
      name: 'set_series_brief',
      description: 'Create or update the series title, description, and default style.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description', 'defaultStyleId'],
        properties: {
          name: { type: ['string', 'null'] },
          description: { type: ['string', 'null'] },
          defaultStyleId: { type: ['string', 'null'], enum: [...styleIds, null] },
        },
      },
    })
  }

  if (names.includes('add_character')) {
    tools.push({
      type: 'function',
      name: 'add_character',
      description: 'Add a recurring character to the series cast.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'role', 'appearance', 'traits', 'backstory', 'styleId', 'generatePreview'],
        properties: {
          name: { type: 'string' },
          role: { type: 'string' },
          appearance: { type: 'string' },
          traits: { type: 'string' },
          backstory: { type: 'string' },
          styleId: { type: ['string', 'null'], enum: [...styleIds, null] },
          generatePreview: { type: 'boolean' },
        },
      },
    })
  }

  if (names.includes('update_character')) {
    tools.push({
      type: 'function',
      name: 'update_character',
      description: 'Update an existing recurring character.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: [
          'currentName',
          'name',
          'role',
          'appearance',
          'traits',
          'backstory',
          'styleId',
          'generatePreview',
        ],
        properties: {
          currentName: { type: 'string' },
          name: { type: ['string', 'null'] },
          role: { type: ['string', 'null'] },
          appearance: { type: ['string', 'null'] },
          traits: { type: ['string', 'null'] },
          backstory: { type: ['string', 'null'] },
          styleId: { type: ['string', 'null'], enum: [...styleIds, null] },
          generatePreview: { type: 'boolean' },
        },
      },
    })
  }

  if (names.includes('preview_character')) {
    tools.push({
      type: 'function',
      name: 'preview_character',
      description: 'Generate or refresh a visual preview for an existing character.',
      strict: true,
      parameters: {
        type: 'object',
        additionalProperties: false,
        required: ['currentName'],
        properties: {
          currentName: { type: 'string' },
        },
      },
    })
  }

  return tools
}

function extractToolCalls(response: { output?: ResponseOutputItem[] }, styles: StylePreset[]) {
  let styleIds = new Set(styles.map((style) => style.id))
  return (response.output ?? [])
    .filter((item) => item.type === 'function_call' && item.name && item.arguments)
    .map((item) => normalizeToolCall(item.name!, parseJsonObject(item.arguments!), styleIds))
    .filter((toolCall): toolCall is SeriesChatToolCall => toolCall != null)
}

function normalizeToolCall(
  name: string,
  args: Record<string, unknown>,
  styleIds: Set<string>,
): SeriesChatToolCall | null {
  if (name === 'set_series_brief') {
    return {
      name,
      arguments: {
        name: nullableString(args.name),
        description: nullableString(args.description),
        defaultStyleId: nullableStyle(args.defaultStyleId, styleIds),
      },
    }
  }

  if (name === 'add_character') {
    return {
      name,
      arguments: {
        name: requiredString(args.name, 'New Character'),
        role: requiredString(args.role, 'recurring character'),
        appearance: requiredString(args.appearance, 'Friendly early-reader character.'),
        traits: requiredString(args.traits, 'kind, curious'),
        backstory: requiredString(args.backstory, 'A recurring character in the series.'),
        styleId: nullableStyle(args.styleId, styleIds),
        generatePreview: true,
      },
    }
  }

  if (name === 'update_character') {
    return {
      name,
      arguments: {
        currentName: requiredString(args.currentName, ''),
        name: nullableString(args.name),
        role: nullableString(args.role),
        appearance: nullableString(args.appearance),
        traits: nullableString(args.traits),
        backstory: nullableString(args.backstory),
        styleId: nullableStyle(args.styleId, styleIds),
        generatePreview: args.generatePreview === true,
      },
    }
  }

  if (name === 'preview_character') {
    return {
      name,
      arguments: {
        currentName: requiredString(args.currentName, ''),
      },
    }
  }

  return null
}

function fallbackNewSeriesPlan(input: NewSeriesInput): SeriesChatPlan {
  let style = selectedStyle(input) ?? pickStyle(input.styles, input.message)
  let name = fallbackSeriesName(input.message)
  let toolCalls: SeriesChatToolCall[] = [
    {
      name: 'set_series_brief',
      arguments: {
        name,
        description: input.message.trim() || `A warm early-reader series called ${name}.`,
        defaultStyleId: style.id,
      },
    },
    {
      name: 'add_character',
      arguments: fallbackCharacter(`${name} main character`, 'main character', style.id),
    },
    {
      name: 'add_character',
      arguments: fallbackCharacter(`${name} helper`, 'supporting friend', style.id),
    },
    {
      name: 'add_character',
      arguments: fallbackCharacter(`${name} grown-up`, 'steady grown-up helper', style.id),
    },
  ]
  return {
    assistantMessage: summarizeToolCalls(toolCalls, 'I created a starter series from your description.'),
    toolCalls,
  }
}

function completeNewSeriesBrief(input: NewSeriesInput, toolCalls: SeriesChatToolCall[]) {
  let briefCall = toolCalls.find((toolCall) => toolCall.name === 'set_series_brief')
  let fallbackStyle = selectedStyle(input) ?? pickStyle(input.styles, input.message)
  if (!briefCall || briefCall.name !== 'set_series_brief') return toolCalls
  briefCall.arguments.name = briefCall.arguments.name ?? fallbackSeriesName(input.message)
  briefCall.arguments.description = briefCall.arguments.description ?? input.message
  briefCall.arguments.defaultStyleId = briefCall.arguments.defaultStyleId ?? fallbackStyle.id
  return toolCalls
}

function selectedStyle(input: NewSeriesInput) {
  return input.selectedStyleId
    ? input.styles.find((style) => style.id === input.selectedStyleId) ?? null
    : null
}

function fallbackSeriesEditPlan(input: EditSeriesInput): SeriesChatPlan {
  let lower = input.message.toLowerCase()
  let style = pickStyle(input.styles, input.message, input.series.defaultStyleId)
  let toolCalls: SeriesChatToolCall[] = []
  let matchedCharacter = input.characters.find((character) =>
    lower.includes(character.name.toLowerCase()),
  )

  if (lower.includes('style') || style.id !== input.series.defaultStyleId) {
    toolCalls.push({
      name: 'set_series_brief',
      arguments: {
        name: null,
        description: null,
        defaultStyleId: style.id,
      },
    })
  }

  if (lower.includes('add') || lower.includes('new character') || lower.includes('another character')) {
    toolCalls.push({
      name: 'add_character',
      arguments: fallbackCharacter(input.message, 'new recurring character', style.id),
    })
  } else if (matchedCharacter) {
    toolCalls.push({
      name: 'update_character',
      arguments: {
        currentName: matchedCharacter.name,
        name: null,
        role: null,
        appearance: input.message,
        traits: null,
        backstory: null,
        styleId: style.id,
        generatePreview: lower.includes('preview') || lower.includes('look'),
      },
    })
  } else if (lower.includes('description') || lower.includes('series')) {
    toolCalls.push({
      name: 'set_series_brief',
      arguments: {
        name: null,
        description: input.message,
        defaultStyleId: null,
      },
    })
  }

  if (!toolCalls.length) {
    toolCalls.push({
      name: 'set_series_brief',
      arguments: {
        name: null,
        description: input.message,
        defaultStyleId: null,
      },
    })
  }

  return {
    assistantMessage: summarizeToolCalls(toolCalls, 'I updated the series.'),
    toolCalls,
  }
}

function fallbackCharacter(concept: string, role: string, styleId: string): AddCharacterArguments {
  let name = fallbackCharacterName(concept)
  return {
    name,
    role,
    appearance: `${concept.trim() || name}. Match the same simple proportions, finish, and lighting as the rest of the cast.`,
    traits: 'kind, expressive, curious',
    backstory: 'A recurring character who helps the series feel familiar from book to book.',
    styleId,
    generatePreview: true,
  }
}

function summarizeToolCalls(toolCalls: SeriesChatToolCall[], fallback: string) {
  let added = toolCalls.filter((toolCall) => toolCall.name === 'add_character').length
  let updated = toolCalls.filter((toolCall) => toolCall.name === 'update_character').length
  let previewed = toolCalls.filter((toolCall) => toolCall.name === 'preview_character').length
  let changedSeries = toolCalls.some((toolCall) => toolCall.name === 'set_series_brief')
  let parts = [
    changedSeries ? 'updated the series brief/style' : '',
    added ? `added ${added} character${added === 1 ? '' : 's'}` : '',
    updated ? `updated ${updated} character${updated === 1 ? '' : 's'}` : '',
    previewed ? `queued ${previewed} preview${previewed === 1 ? '' : 's'}` : '',
  ].filter(Boolean)
  return parts.length ? `Done: ${parts.join(', ')}.` : fallback
}

function styleCatalog(styles: StylePreset[]) {
  return styles.map((style) => `${style.id}: ${style.name} - ${style.description}`).join('\n')
}

function characterCatalog(characters: CharacterProfile[]) {
  if (!characters.length) return 'No characters yet.'
  return characters
    .map(
      (character) =>
        `${character.name}: ${character.role}. Appearance: ${character.appearance}. Traits: ${character.traits}. Backstory: ${character.backstory}.`,
    )
    .join('\n')
}

function pickStyle(styles: StylePreset[], text: string, fallbackStyleId = styles[0]?.id ?? 'cozy-watercolor') {
  let lower = text.toLowerCase()
  return (
    styles.find((style) => lower.includes(style.id) || lower.includes(style.name.toLowerCase())) ??
    styles.find((style) => lower.includes('pencil') && style.id === 'colored-pencil') ??
    styles.find((style) => lower.includes('paper') && style.id === 'paper-cutout') ??
    styles.find((style) => lower.includes('cartoon') && style.id === 'bright-cartoon') ??
    styles.find((style) => lower.includes('watercolor') && style.id === 'cozy-watercolor') ??
    styles.find((style) => style.id === fallbackStyleId) ??
    styles[0]
  )
}

function fallbackSeriesName(message: string) {
  let words = message
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !['series', 'story', 'stories', 'about', 'with'].includes(word.toLowerCase()))
    .slice(0, 3)

  if (!words.length) return 'New Picture Book Series'
  return `${words.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ')} Tales`
}

export function draftSeriesNameFromMessage(message: string) {
  return fallbackSeriesName(message)
}

function fallbackCharacterName(concept: string) {
  let words = concept
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !['character', 'friend', 'helper', 'about', 'with'].includes(word.toLowerCase()))
    .slice(0, 2)

  if (!words.length) return 'New Character'
  return words.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join(' ')
}

function parseJsonObject(value: string) {
  let parsed = JSON.parse(value)
  return typeof parsed === 'object' && parsed != null && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : {}
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function nullableStyle(value: unknown, styleIds: Set<string>) {
  return typeof value === 'string' && styleIds.has(value) ? value : null
}

function requiredString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}
