import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), 'db', 'story-app.json')

export type Subscription = {
  status: 'inactive' | 'active'
  priceCents: number
  includedCostCents: number
}

export type Account = {
  id: string
  email: string
  subscription: Subscription
  creditsCents: number
  children: ChildProfile[]
  characters: CharacterProfile[]
  series: StorySeries[]
  stories: GeneratedStory[]
  usage: StoryUsage[]
}

export type ChildProfile = {
  id: string
  name: string
  words: ChildWord[]
}

export type ChildWord = {
  id: string
  word: string
  category: string
  createdAt: string
}

export type CharacterProfile = {
  id: string
  name: string
  role: string
  description: string
  appearance: string
  traits: string
  backstory: string
  styleId: string
  referenceImageUrl: string | null
  createdAt: string
}

export type StorySeries = {
  id: string
  name: string
  description: string
  defaultStyleId: string
  characterIds: string[]
  setupStep: SeriesSetupStep
  stylePreviews: SeriesStylePreview[]
  chatMessages: SeriesChatMessage[]
  generationStatus: SeriesGenerationStatus
  generationMessage: string | null
  createdAt: string
  updatedAt: string
}

export type SeriesSetupStep = 'style-preview' | 'style-choice' | 'series-generation' | 'ready'

export type SeriesStylePreview = {
  styleId: string
  imageUrl: string | null
  prompt: string
  createdAt: string
}

export type SeriesChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
}

export type SeriesGenerationStatus = 'pending' | 'complete' | 'failed'

export type StylePreset = {
  id: string
  name: string
  description: string
  previewCss: string
  promptPrefix: string
}

export type GeneratedStory = {
  id: string
  childId: string | null
  seriesId: string | null
  styleId: string
  characterIds: string[]
  title: string
  prompt: string
  sourceText: string | null
  pageCount: number
  status: 'draft' | 'generating' | 'complete' | 'failed'
  words: string[]
  estimatedCostCents: number
  actualCostCents: number
  pages: StoryPage[]
  createdAt: string
  updatedAt: string
}

export type StoryPage = {
  pageNumber: number
  text: string
  imagePrompt: string
  imageUrl: string | null
  status: 'draft' | 'generating' | 'complete' | 'failed'
}

export type StoryUsage = {
  id: string
  storyId: string
  kind: 'reservation' | 'image' | 'text' | 'credit'
  model: string
  costCents: number
  quantity: number
  createdAt: string
}

type Store = {
  accounts: Account[]
}

export const MONTHLY_PRICE_CENTS = Number(process.env.STORY_APP_MONTHLY_PRICE_CENTS ?? 2000)
export const INCLUDED_COST_CENTS = Number(process.env.STORY_APP_INCLUDED_COST_CENTS ?? 1000)
export const IMAGE_COST_CENTS = Number(process.env.STORY_APP_IMAGE_COST_CENTS ?? 12)
export const TEXT_COST_CENTS = Number(process.env.STORY_APP_TEXT_COST_CENTS ?? 10)

const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cozy-watercolor',
    name: 'Cozy watercolor',
    description: 'Soft bedtime-story art with warm lights, grain, rounded characters, and gentle color.',
    previewCss: 'background: linear-gradient(135deg, #2f3f6d 0%, #755a7a 45%, #f4b86a 100%);',
    promptPrefix:
      'Classic cozy children’s picture-book watercolor and pastel illustration, warm grainy texture, rounded gentle characters, soft amber light, no readable text.',
  },
  {
    id: 'bright-cartoon',
    name: 'Bright cartoon',
    description: 'Clean cheerful picture-book cartoon art with bold shapes and sunny colors.',
    previewCss: 'background: linear-gradient(135deg, #38bdf8 0%, #facc15 48%, #fb7185 100%);',
    promptPrefix:
      'Bright cheerful children’s picture-book cartoon illustration, clean rounded shapes, friendly outlines, sunny colors, no readable text.',
  },
  {
    id: 'colored-pencil',
    name: 'Colored pencil',
    description: 'Hand-drawn early-reader art with visible pencil texture and calm classroom warmth.',
    previewCss: 'background: linear-gradient(135deg, #f8e7b7 0%, #8fb996 52%, #d9895b 100%);',
    promptPrefix:
      'Hand-drawn colored-pencil children’s book illustration, visible paper texture, gentle natural colors, simple readable composition, no readable text.',
  },
  {
    id: 'paper-cutout',
    name: 'Paper cutout',
    description: 'Layered paper shapes with simple silhouettes and tactile nursery-book charm.',
    previewCss: 'background: linear-gradient(135deg, #fef3c7 0%, #86efac 50%, #93c5fd 100%);',
    promptPrefix:
      'Layered paper-cutout children’s book illustration, simple tactile shapes, soft shadows, playful nursery-book composition, no readable text.',
  },
]

export function getStylePresets() {
  return STYLE_PRESETS
}

export function getStylePreset(styleId: string) {
  return STYLE_PRESETS.find((style) => style.id === styleId) ?? STYLE_PRESETS[0]
}

async function readStore(): Promise<Store> {
  try {
    let raw = await fs.readFile(DB_PATH, 'utf8')
    return normalizeStore(JSON.parse(raw) as Partial<Store>)
  } catch {
    return { accounts: [] }
  }
}

async function writeStore(store: Store) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
  await fs.writeFile(DB_PATH, JSON.stringify(store, null, 2))
}

async function updateStore<T>(fn: (store: Store) => T | Promise<T>) {
  let store = await readStore()
  let result = await fn(store)
  await writeStore(store)
  return result
}

function normalizeStore(store: Partial<Store>): Store {
  return {
    accounts: (store.accounts ?? []).map((account) => normalizeAccount(account as Partial<Account>)),
  }
}

function normalizeAccount(account: Partial<Account>): Account {
  return {
    id: account.id ?? randomUUID(),
    email: account.email ?? 'parent@example.com',
    subscription: account.subscription ?? {
      status: 'inactive',
      priceCents: MONTHLY_PRICE_CENTS,
      includedCostCents: INCLUDED_COST_CENTS,
    },
    creditsCents: account.creditsCents ?? 0,
    children: account.children ?? [],
    characters: (account.characters ?? []).map((character) =>
      normalizeCharacter(character as Partial<CharacterProfile>),
    ),
    series: (account.series ?? []).map((series) => normalizeSeries(series as Partial<StorySeries>)),
    stories: (account.stories ?? []).map((story) => ({
      ...story,
      seriesId: story.seriesId ?? null,
      styleId: story.styleId ?? 'cozy-watercolor',
      characterIds: story.characterIds ?? [],
      updatedAt: story.updatedAt ?? story.createdAt ?? new Date().toISOString(),
    })),
    usage: account.usage ?? [],
  }
}

function normalizeCharacter(character: Partial<CharacterProfile>): CharacterProfile {
  let appearance = character.appearance ?? character.description ?? ''
  let traits = character.traits ?? ''
  let backstory = character.backstory ?? ''
  return {
    id: character.id ?? randomUUID(),
    name: character.name ?? 'Unnamed character',
    role: character.role ?? 'supporting character',
    description: character.description ?? buildCharacterDescription({ appearance, traits, backstory }),
    appearance,
    traits,
    backstory,
    styleId: getStylePreset(character.styleId ?? 'cozy-watercolor').id,
    referenceImageUrl: character.referenceImageUrl ?? null,
    createdAt: character.createdAt ?? new Date().toISOString(),
  }
}

function normalizeSeries(series: Partial<StorySeries>): StorySeries {
  let createdAt = series.createdAt ?? new Date().toISOString()
  return {
    id: series.id ?? randomUUID(),
    name: series.name ?? 'Untitled series',
    description: series.description ?? '',
    defaultStyleId: getStylePreset(series.defaultStyleId ?? 'cozy-watercolor').id,
    characterIds: series.characterIds ?? [],
    setupStep: normalizeSeriesSetupStep(series.setupStep, series.generationStatus),
    stylePreviews: (series.stylePreviews ?? []).map((preview) =>
      normalizeSeriesStylePreview(preview as Partial<SeriesStylePreview>),
    ),
    chatMessages: (series.chatMessages ?? []).map((message) =>
      normalizeSeriesChatMessage(message as Partial<SeriesChatMessage>),
    ),
    generationStatus: normalizeSeriesGenerationStatus(series.generationStatus),
    generationMessage: series.generationMessage ?? null,
    createdAt,
    updatedAt: series.updatedAt ?? createdAt,
  }
}

function normalizeSeriesGenerationStatus(status: unknown): SeriesGenerationStatus {
  return status === 'pending' || status === 'failed' ? status : 'complete'
}

function normalizeSeriesSetupStep(step: unknown, status: unknown): SeriesSetupStep {
  if (
    step === 'style-preview' ||
    step === 'style-choice' ||
    step === 'series-generation' ||
    step === 'ready'
  ) {
    return step
  }
  return status === 'pending' ? 'series-generation' : 'ready'
}

function normalizeSeriesStylePreview(preview: Partial<SeriesStylePreview>): SeriesStylePreview {
  return {
    styleId: getStylePreset(preview.styleId ?? 'cozy-watercolor').id,
    imageUrl: typeof preview.imageUrl === 'string' && preview.imageUrl ? preview.imageUrl : null,
    prompt: preview.prompt ?? '',
    createdAt: preview.createdAt ?? new Date().toISOString(),
  }
}

function normalizeSeriesChatMessage(message: Partial<SeriesChatMessage>): SeriesChatMessage {
  return {
    id: message.id ?? randomUUID(),
    role: message.role === 'assistant' ? 'assistant' : 'user',
    text: message.text ?? '',
    createdAt: message.createdAt ?? new Date().toISOString(),
  }
}

export async function findOrCreateAccount(input: { id?: string; email?: string }) {
  return updateStore((store) => {
    let account =
      (input.id ? store.accounts.find((a) => a.id === input.id) : null) ??
      (input.email ? store.accounts.find((a) => a.email === input.email) : null)
    if (account) return account
    account = {
      id: input.id ?? randomUUID(),
      email: input.email ?? 'parent@example.com',
      subscription: {
        status: 'inactive',
        priceCents: MONTHLY_PRICE_CENTS,
        includedCostCents: INCLUDED_COST_CENTS,
      },
      creditsCents: 0,
      children: [],
      characters: [],
      series: [],
      stories: [],
      usage: [],
    }
    store.accounts.push(account)
    return account
  })
}

export async function getAccount(accountId: string) {
  let store = await readStore()
  return store.accounts.find((account) => account.id === accountId) ?? null
}

export function estimateStoryCost(pageCount: number, generateText: boolean) {
  let normalizedPageCount = Math.min(Math.max(pageCount, 1), 40)
  return {
    pageCount: normalizedPageCount,
    estimatedCostCents: normalizedPageCount * IMAGE_COST_CENTS + (generateText ? TEXT_COST_CENTS : 0),
  }
}

export function getUsageSummary(account: Account) {
  let usedCents = account.usage.reduce((sum, item) => sum + item.costCents, 0)
  let includedCents = account.subscription.includedCostCents
  let availableCents = Math.max(includedCents + account.creditsCents - usedCents, 0)
  return {
    usedCents,
    includedCents,
    availableCents,
    marginCents: account.subscription.priceCents - includedCents,
    status: account.subscription.status,
  }
}

export async function addChild(accountId: string, name: string) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let child = { id: randomUUID(), name, words: [] }
    account.children.push(child)
    return child
  })
}

export async function addWords(accountId: string, childId: string, words: string[], category: string) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let child = mustFindChild(account, childId)
    let existing = new Set(child.words.map((item) => item.word))
    for (let word of words) {
      let normalized = word.trim().toLowerCase()
      if (!normalized || existing.has(normalized)) continue
      child.words.push({
        id: randomUUID(),
        word: normalized,
        category,
        createdAt: new Date().toISOString(),
      })
      existing.add(normalized)
    }
    return child
  })
}

export type CharacterInput = {
  name: string
  role: string
  description?: string
  appearance?: string
  traits?: string
  backstory?: string
  styleId: string
  referenceImageUrl: string | null
}

export async function addCharacter(accountId: string, input: CharacterInput) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let character = createCharacter(input)
    account.characters.push(character)
    return character
  })
}

export async function addCharacterToSeries(accountId: string, seriesId: string, input: CharacterInput) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let series = mustFindSeries(account, seriesId)
    let character = createCharacter(input)
    account.characters.push(character)
    series.characterIds = Array.from(new Set([...series.characterIds, character.id]))
    series.updatedAt = new Date().toISOString()
    return character
  })
}

export async function updateCharacter(accountId: string, characterId: string, input: CharacterInput) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let character = mustFindCharacter(account, characterId)
    let appearance = (input.appearance ?? input.description ?? '').trim()
    let traits = (input.traits ?? '').trim()
    let backstory = (input.backstory ?? '').trim()
    character.name = input.name
    character.role = input.role
    character.appearance = appearance
    character.traits = traits
    character.backstory = backstory
    character.description = buildCharacterDescription({
      description: input.description,
      appearance,
      traits,
      backstory,
    })
    character.styleId = getStylePreset(input.styleId).id
    character.referenceImageUrl = input.referenceImageUrl
    return character
  })
}

export async function addSeries(
  accountId: string,
  input: {
    name: string
    description: string
    defaultStyleId: string
    characterIds: string[]
    setupStep?: SeriesSetupStep
    stylePreviews?: SeriesStylePreview[]
    generationStatus?: SeriesGenerationStatus
    generationMessage?: string | null
  },
) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let characterIds = filterKnownCharacterIds(account, input.characterIds)
    let now = new Date().toISOString()
    let series: StorySeries = {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      defaultStyleId: getStylePreset(input.defaultStyleId).id,
      characterIds,
      setupStep: input.setupStep ?? 'ready',
      stylePreviews: input.stylePreviews ?? [],
      chatMessages: [],
      generationStatus: input.generationStatus ?? 'complete',
      generationMessage: input.generationMessage ?? null,
      createdAt: now,
      updatedAt: now,
    }
    account.series.push(series)
    return series
  })
}

export async function updateSeries(
  accountId: string,
  seriesId: string,
  input: {
    name: string
    description: string
    defaultStyleId: string
    characterIds: string[]
  },
) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let series = mustFindSeries(account, seriesId)
    series.name = input.name
    series.description = input.description
    series.defaultStyleId = getStylePreset(input.defaultStyleId).id
    series.characterIds = filterKnownCharacterIds(account, input.characterIds)
    series.updatedAt = new Date().toISOString()
    return series
  })
}

export async function updateSeriesGenerationStatus(
  accountId: string,
  seriesId: string,
  status: SeriesGenerationStatus,
  message: string | null = null,
  setupStep?: SeriesSetupStep,
) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let series = mustFindSeries(account, seriesId)
    series.generationStatus = status
    series.generationMessage = message
    if (setupStep) series.setupStep = setupStep
    series.updatedAt = new Date().toISOString()
    return series
  })
}

export async function setSeriesStylePreviews(
  accountId: string,
  seriesId: string,
  previews: SeriesStylePreview[],
) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let series = mustFindSeries(account, seriesId)
    series.stylePreviews = previews.map(normalizeSeriesStylePreview)
    series.updatedAt = new Date().toISOString()
    return series
  })
}

export async function addSeriesChatMessages(
  accountId: string,
  seriesId: string,
  messages: Array<{ role: SeriesChatMessage['role']; text: string }>,
) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let series = mustFindSeries(account, seriesId)
    let now = new Date().toISOString()
    for (let message of messages) {
      let text = message.text.trim()
      if (!text) continue
      series.chatMessages.push({
        id: randomUUID(),
        role: message.role,
        text,
        createdAt: now,
      })
    }
    series.updatedAt = now
    return series
  })
}

function createCharacter(input: CharacterInput): CharacterProfile {
  let appearance = (input.appearance ?? input.description ?? '').trim()
  let traits = (input.traits ?? '').trim()
  let backstory = (input.backstory ?? '').trim()
  return {
    id: randomUUID(),
    name: input.name,
    role: input.role,
    description: buildCharacterDescription({
      description: input.description,
      appearance,
      traits,
      backstory,
    }),
    appearance,
    traits,
    backstory,
    styleId: getStylePreset(input.styleId).id,
    referenceImageUrl: input.referenceImageUrl,
    createdAt: new Date().toISOString(),
  }
}

function buildCharacterDescription(input: {
  description?: string
  appearance?: string
  traits?: string
  backstory?: string
}) {
  let description = input.description?.trim()
  if (description) return description
  return [
    input.appearance?.trim(),
    input.traits?.trim() ? `Traits: ${input.traits.trim()}` : '',
    input.backstory?.trim() ? `Backstory: ${input.backstory.trim()}` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

export async function createDraftStory(input: {
  accountId: string
  childId: string | null
  seriesId: string | null
  styleId: string
  characterIds: string[]
  title: string
  prompt: string
  sourceText: string | null
  pageCount: number
  extraWords: string[]
}) {
  return updateStore((store) => {
    let account = mustFindAccount(store, input.accountId)
    let child = input.childId ? mustFindChild(account, input.childId) : null
    let series = input.seriesId ? account.series.find((item) => item.id === input.seriesId) ?? null : null
    let style = getStylePreset(input.styleId || series?.defaultStyleId || 'cozy-watercolor')
    let selectedCharacterIds = filterKnownCharacterIds(account, input.characterIds)
    if (!selectedCharacterIds.length && series) selectedCharacterIds = filterKnownCharacterIds(account, series.characterIds)
    let selectedCharacters = account.characters.filter((character) => selectedCharacterIds.includes(character.id))
    let childWords = child?.words.map((word) => word.word) ?? []
    let words = Array.from(new Set([...childWords, ...input.extraWords.map((word) => word.toLowerCase())]))
    let estimate = estimateStoryCost(input.pageCount, !input.sourceText)
    let usage = getUsageSummary(account)
    if (estimate.estimatedCostCents > usage.availableCents) {
      throw new Error('This story exceeds the included generation budget. Add credits before generating.')
    }
    let pages = buildPages({
      title: input.title,
      prompt: input.prompt,
      sourceText: input.sourceText,
      pageCount: estimate.pageCount,
      words,
      style,
      characters: selectedCharacters,
    })
    let now = new Date().toISOString()
    let story: GeneratedStory = {
      id: randomUUID(),
      childId: child?.id ?? null,
      seriesId: series?.id ?? null,
      styleId: style.id,
      characterIds: selectedCharacterIds,
      title: input.title,
      prompt: input.prompt,
      sourceText: input.sourceText,
      pageCount: estimate.pageCount,
      status: 'draft',
      words,
      estimatedCostCents: estimate.estimatedCostCents,
      actualCostCents: 0,
      pages,
      createdAt: now,
      updatedAt: now,
    }
    account.stories.unshift(story)
    account.usage.push({
      id: randomUUID(),
      storyId: story.id,
      kind: 'reservation',
      model: 'draft-estimate',
      quantity: estimate.pageCount,
      costCents: estimate.estimatedCostCents,
      createdAt: now,
    })
    return story
  })
}

export async function updateStoryDraft(
  accountId: string,
  storyId: string,
  input: {
    title: string
    prompt: string
    styleId: string
    seriesId: string | null
    characterIds: string[]
    pages: Array<{ pageNumber: number; text: string; imagePrompt: string }>
  },
) {
  return updateStore((store) => {
    let account = mustFindAccount(store, accountId)
    let story = mustFindStory(account, storyId)
    story.title = input.title
    story.prompt = input.prompt
    story.styleId = getStylePreset(input.styleId).id
    story.seriesId = input.seriesId && account.series.some((series) => series.id === input.seriesId) ? input.seriesId : null
    story.characterIds = filterKnownCharacterIds(account, input.characterIds)
    for (let pageUpdate of input.pages) {
      let page = story.pages.find((item) => item.pageNumber === pageUpdate.pageNumber)
      if (!page) continue
      page.text = pageUpdate.text
      page.imagePrompt = pageUpdate.imagePrompt
      page.status = 'draft'
    }
    story.pageCount = story.pages.length
    story.status = 'draft'
    story.updatedAt = new Date().toISOString()
    return story
  })
}

function buildPages(input: {
  title: string
  prompt: string
  sourceText: string | null
  pageCount: number
  words: string[]
  style: StylePreset
  characters: CharacterProfile[]
}): StoryPage[] {
  let sourceSentences =
    input.sourceText
      ?.split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  let characterSummary = formatCharacterExamplesForAi(input.characters)
  return Array.from({ length: input.pageCount }, (_, index) => {
    let pageNumber = index + 1
    let text =
      sourceSentences[index] ??
      `Page ${pageNumber} will use ${input.words.slice(0, 8).join(', ') || 'known words'}.`
    return {
      pageNumber,
      text,
      imagePrompt:
        `${input.style.promptPrefix} Illustrate page ${pageNumber} of "${input.title}" for an early-reader picture book. ` +
        `Story: ${input.prompt}. Page text: ${text}. Character consistency examples: ${characterSummary} Preserve character consistency only for characters used on this page. No readable text.`,
      imageUrl: null,
      status: 'draft',
    }
  })
}

export function formatCharacterExamplesForAi(
  characters: CharacterProfile[],
  options: { excludeCharacterId?: string } = {},
) {
  let examples = characters.filter((character) => character.id !== options.excludeCharacterId)
  if (!examples.length) return 'No existing character examples yet.'
  return examples.map(formatCharacterForPrompt).join(' ')
}

export function formatCharacterForPrompt(character: CharacterProfile) {
  return [
    `${character.name}: ${character.role}.`,
    character.appearance ? `Appearance: ${character.appearance}.` : '',
    character.traits ? `Traits: ${character.traits}.` : '',
    character.backstory ? `Backstory: ${character.backstory}.` : '',
    character.description ? `Notes: ${character.description}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function filterKnownCharacterIds(account: Account, characterIds: string[]) {
  let known = new Set(account.characters.map((character) => character.id))
  return Array.from(new Set(characterIds.filter((id) => known.has(id))))
}

function mustFindAccount(store: Store, accountId: string) {
  let account = store.accounts.find((item) => item.id === accountId)
  if (!account) throw new Error('Account not found')
  return account
}

function mustFindChild(account: Account, childId: string) {
  let child = account.children.find((item) => item.id === childId)
  if (!child) throw new Error('Child not found')
  return child
}

function mustFindSeries(account: Account, seriesId: string) {
  let series = account.series.find((item) => item.id === seriesId)
  if (!series) throw new Error('Series not found')
  return series
}

function mustFindCharacter(account: Account, characterId: string) {
  let character = account.characters.find((item) => item.id === characterId)
  if (!character) throw new Error('Character not found')
  return character
}

function mustFindStory(account: Account, storyId: string) {
  let story = account.stories.find((item) => item.id === storyId)
  if (!story) throw new Error('Story not found')
  return story
}

export function parseWordList(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[\n,]+/)
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

export function formValues(formData: FormData, name: string) {
  return formData.getAll(name).map((value) => String(value)).filter(Boolean)
}
