import type { BuildAction, Controller } from 'remix/fetch-router'
import { redirect } from 'remix/response/redirect'

import {
  addCharacter,
  addCharacterToSeries,
  addChild,
  addSeriesChatMessages,
  addSeries,
  addWords,
  createDraftStory,
  estimateStoryCost,
  formValues,
  getAccount,
  getStylePreset,
  getStylePresets,
  getUsageSummary,
  parseWordList,
  setSeriesStylePreviews,
  updateCharacter,
  updateSeries,
  updateSeriesGenerationStatus,
  updateStoryDraft,
} from '../../data/story-store.server.ts'
import type {
  Account,
  CharacterProfile,
  SeriesStylePreview,
  StorySeries,
  StylePreset,
} from '../../data/story-store.server.ts'
import { parentAuthCookie, requireAuth, requireParentIdentity } from '../../middleware/auth.ts'
import { routes } from '../../routes.ts'
import { Layout } from '../../ui/layout.tsx'
import { render } from '../../utils/render.tsx'
import {
  createFallbackPreviewImage,
  draftCharacterWithAi,
  previewCharacterWithAi,
} from './character-ai.server.ts'
import {
  draftSeriesNameFromMessage,
  planNewSeriesFromChat,
  planSeriesEditFromChat,
} from './series-chat.server.ts'
import type { SeriesChatToolCall } from './series-chat.server.ts'
import { previewSeriesStyleWithAi } from './style-preview-ai.server.ts'

function credits(cents: number) {
  let amount = Math.max(0, Math.round(cents))
  return `${amount.toLocaleString()} credit${amount === 1 ? '' : 's'}`
}

async function getRequiredAccount() {
  let identity = requireParentIdentity()
  let account = await getAccount(identity.accountId)
  if (!account) throw redirect(routes.auth.index.href())
  return { identity, account, usage: getUsageSummary(account) }
}

function characterNames(account: Awaited<ReturnType<typeof getAccount>>, ids: string[]) {
  if (!account) return ''
  return account.characters
    .filter((character) => ids.includes(character.id))
    .map((character) => character.name)
    .join(', ')
}

function seriesCharacters(account: Account, series: StorySeries) {
  let seriesCharacterIds = new Set(series.characterIds)
  return account.characters.filter((character) => seriesCharacterIds.has(character.id))
}

function characterInputFromForm(formData: FormData) {
  let appearance =
    String(formData.get('appearance') ?? '').trim() ||
    String(formData.get('description') ?? '').trim()
  let replacementReferenceImageUrl = String(formData.get('newReferenceImageUrl') ?? '').trim()
  let referenceImageUrl =
    replacementReferenceImageUrl ||
    String(formData.get('referenceImageUrl') ?? '').trim() ||
    null
  return {
    name: String(formData.get('name') ?? '').trim(),
    role: String(formData.get('role') ?? '').trim(),
    appearance,
    traits: String(formData.get('traits') ?? '').trim(),
    backstory: String(formData.get('backstory') ?? '').trim(),
    styleId: String(formData.get('styleId') ?? ''),
    referenceImageUrl,
  }
}

function characterSubjectFromInput(
  input: ReturnType<typeof characterInputFromForm>,
  options: { id?: string } = {},
) {
  return {
    id: options.id,
    name: input.name,
    role: input.role,
    appearance: input.appearance,
    traits: input.traits,
    backstory: input.backstory,
    referenceImageUrl: input.referenceImageUrl,
    description: input.appearance,
  }
}

function styleChoiceGrid(styles: StylePreset[], selectedStyleId: string, inputName = 'styleId') {
  return (
    <div className="style-grid">
      {styles.map((style) => (
        <label className="style-option">
          <input
            type="radio"
            name={inputName}
            value={style.id}
            defaultChecked={style.id === selectedStyleId}
          />
          <div className="style-preview" style={style.previewCss}></div>
          <strong>{style.name}</strong>
          <span className="muted">{style.description}</span>
        </label>
      ))}
    </div>
  )
}

function characterInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function shortText(value: string, fallback: string) {
  if (!value.trim()) return fallback
  return value.length > 120 ? `${value.slice(0, 117)}...` : value
}

function isGeneratedPreviewUrl(value: string | null) {
  return value?.startsWith('data:image/') ?? false
}

function styleArtworkExampleSrc(style: StylePreset) {
  let hrefByStyleId: Record<string, string> = {
    'cozy-watercolor': routes.stylePreviewCozyWatercolor.href(),
    'bright-cartoon': routes.stylePreviewBrightCartoon.href(),
    'colored-pencil': routes.stylePreviewColoredPencil.href(),
    'paper-cutout': routes.stylePreviewPaperCutout.href(),
  }
  return hrefByStyleId[style.id] ?? hrefByStyleId['cozy-watercolor']
}

function artworkStyleExample(style: StylePreset, imageSrc = styleArtworkExampleSrc(style)) {
  return (
    <div className="art-style-card">
      <img className="art-style-image" src={imageSrc} alt={`${style.name} artwork example`} />
      <div>
        <strong>{style.name}</strong>
        <p className="muted">{style.description}</p>
      </div>
    </div>
  )
}

function artworkStyleChoice(style: StylePreset, selected: boolean, imageSrc = styleArtworkExampleSrc(style)) {
  return (
    <label className="art-style-choice">
      <input type="radio" name="styleId" value={style.id} defaultChecked={selected} required />
      {artworkStyleExample(style, imageSrc)}
    </label>
  )
}

function seriesStylePreviewImage(series: StorySeries, style: StylePreset) {
  return (
    series.stylePreviews.find((preview) => preview.styleId === style.id)?.imageUrl ??
    styleArtworkExampleSrc(style)
  )
}

function seriesListStatus(series: StorySeries) {
  if (series.setupStep === 'style-preview') return 'sampling styles'
  if (series.setupStep === 'style-choice') return 'choose style'
  if (series.generationStatus === 'pending') return 'creating'
  return `${series.characterIds.length} characters`
}

function characterPreviewSrc(character: CharacterProfile) {
  return character.referenceImageUrl ?? createFallbackPreviewImage(character, getStylePreset(character.styleId))
}

function characterPreview(character: CharacterProfile) {
  let style = getStylePreset(character.styleId)
  return (
    <div className="character-preview">
      <img className="character-image" src={characterPreviewSrc(character)} alt={`${character.name} preview`} />
      <div className="character-copy">
        <strong>{character.name}</strong>
        <span className="muted">{character.role}</span>
        <span>{shortText(character.appearance, character.description || 'Appearance not set.')}</span>
        <div className="pill-row">
          <span className="pill">{style.name}</span>
          {character.traits
            .split(',')
            .map((trait) => trait.trim())
            .filter(Boolean)
            .slice(0, 3)
            .map((trait) => (
              <span className="pill">{trait}</span>
            ))}
        </div>
      </div>
    </div>
  )
}

function chatThread(series: StorySeries) {
  let messages = series.chatMessages.length
    ? series.chatMessages
    : [
        {
          id: 'empty',
          role: 'assistant' as const,
          text: 'Tell me what to change about this series.',
          createdAt: series.createdAt,
        },
      ]
  return (
    <div className="chat-thread">
      {messages.slice(-12).map((message) => (
        <div className={`chat-message ${message.role}`}>
          <span>{message.text}</span>
        </div>
      ))}
    </div>
  )
}

async function executeSeriesToolCalls(input: {
  account: Account
  series: StorySeries
  toolCalls: SeriesChatToolCall[]
}) {
  let { account, series, toolCalls } = input
  let currentAccount = account
  let currentSeries = series
  let seriesForPrompt = { ...series }
  async function refreshSeriesContext() {
    let freshAccount = await getAccount(account.id)
    let freshSeries = freshAccount?.series.find((item) => item.id === series.id)
    if (freshAccount && freshSeries) {
      currentAccount = freshAccount
      currentSeries = freshSeries
      seriesForPrompt = { ...seriesForPrompt, ...freshSeries }
    }
    return { account: currentAccount, series: currentSeries }
  }
  let briefCall = [...toolCalls].reverse().find((toolCall) => toolCall.name === 'set_series_brief')

  if (briefCall?.name === 'set_series_brief') {
    let nextName = briefCall.arguments.name ?? series.name
    let nextDescription = briefCall.arguments.description ?? series.description
    let nextStyleId = briefCall.arguments.defaultStyleId ?? series.defaultStyleId
    let updatedSeries = await updateSeries(account.id, series.id, {
      name: nextName,
      description: nextDescription,
      defaultStyleId: nextStyleId,
      characterIds: series.characterIds,
    })
    currentSeries = updatedSeries
    seriesForPrompt = {
      ...updatedSeries,
    }
  }

  for (let toolCall of toolCalls) {
    if (toolCall.name !== 'add_character') continue
    let context = await refreshSeriesContext()
    let style = getStylePreset(toolCall.arguments.styleId ?? seriesForPrompt.defaultStyleId)
    let referenceImageUrl = await previewCharacterWithAi({
      series: seriesForPrompt,
      style,
      existingCharacters: seriesCharacters(context.account, context.series),
      character: toolCall.arguments,
    })
    await addCharacterToSeries(account.id, series.id, {
      name: toolCall.arguments.name,
      role: toolCall.arguments.role,
      appearance: toolCall.arguments.appearance,
      traits: toolCall.arguments.traits,
      backstory: toolCall.arguments.backstory,
      styleId: style.id,
      referenceImageUrl,
    })
    await refreshSeriesContext()
  }

  for (let toolCall of toolCalls) {
    if (toolCall.name !== 'update_character') continue
    let context = await refreshSeriesContext()
    let character = findCharacterForChatTool(context.account, context.series, toolCall.arguments.currentName)
    if (!character) continue
    let style = getStylePreset(toolCall.arguments.styleId ?? character.styleId)
    let nextInput = {
      name: toolCall.arguments.name ?? character.name,
      role: toolCall.arguments.role ?? character.role,
      appearance: toolCall.arguments.appearance ?? character.appearance,
      traits: toolCall.arguments.traits ?? character.traits,
      backstory: toolCall.arguments.backstory ?? character.backstory,
      styleId: style.id,
      referenceImageUrl: character.referenceImageUrl,
    }
    if (toolCall.arguments.generatePreview) {
      nextInput.referenceImageUrl = await previewCharacterWithAi({
        series: seriesForPrompt,
        style,
        existingCharacters: seriesCharacters(context.account, context.series),
        character: characterSubjectFromInput(nextInput, { id: character.id }),
      })
    }
    await updateCharacter(account.id, character.id, nextInput)
    await refreshSeriesContext()
  }

  for (let toolCall of toolCalls) {
    if (toolCall.name !== 'preview_character') continue
    let context = await refreshSeriesContext()
    let character = findCharacterForChatTool(context.account, context.series, toolCall.arguments.currentName)
    if (!character) continue
    let style = getStylePreset(character.styleId)
    let referenceImageUrl = await previewCharacterWithAi({
      series: seriesForPrompt,
      style,
      existingCharacters: seriesCharacters(context.account, context.series),
      character: characterSubjectFromInput(
        {
          name: character.name,
          role: character.role,
          appearance: character.appearance,
          traits: character.traits,
          backstory: character.backstory,
          styleId: character.styleId,
          referenceImageUrl: character.referenceImageUrl,
        },
        { id: character.id },
      ),
    })
    await updateCharacter(account.id, character.id, {
      name: character.name,
      role: character.role,
      appearance: character.appearance,
      traits: character.traits,
      backstory: character.backstory,
      styleId: character.styleId,
      referenceImageUrl,
    })
    await refreshSeriesContext()
  }
}

function findCharacterForChatTool(account: Account, series: StorySeries, name: string) {
  let normalizedName = name.trim().toLowerCase()
  let characters = seriesCharacters(account, series)
  return (
    characters.find((character) => character.name.toLowerCase() === normalizedName) ??
    characters.find((character) => character.name.toLowerCase().includes(normalizedName)) ??
    characters.find((character) => normalizedName.includes(character.name.toLowerCase())) ??
    null
  )
}

const seriesGenerationJobs = new Map<string, Promise<void>>()
const stylePreviewJobs = new Map<string, Promise<void>>()
const MAX_TRANSCRIPTION_FILE_BYTES = 25 * 1024 * 1024

function seriesGenerationJobKey(accountId: string, seriesId: string) {
  return `${accountId}:${seriesId}`
}

function forceToolCallsToStyle(toolCalls: SeriesChatToolCall[], styleId: string) {
  return toolCalls.map((toolCall): SeriesChatToolCall => {
    if (toolCall.name === 'set_series_brief') {
      return {
        ...toolCall,
        arguments: {
          ...toolCall.arguments,
          defaultStyleId: styleId,
        },
      }
    }
    if (toolCall.name === 'add_character') {
      return {
        ...toolCall,
        arguments: {
          ...toolCall.arguments,
          styleId,
          generatePreview: true,
        },
      }
    }
    return toolCall
  })
}

function startSeriesGenerationJob(input: { accountId: string; seriesId: string; message: string; styleId: string }) {
  let key = seriesGenerationJobKey(input.accountId, input.seriesId)
  if (seriesGenerationJobs.has(key)) return
  let job = runSeriesGenerationJob(input).catch((error) => {
    console.warn('Series generation job crashed.', error)
  })
  seriesGenerationJobs.set(key, job)
  void job.finally(() => {
    seriesGenerationJobs.delete(key)
  })
}

function startStylePreviewJob(input: { accountId: string; seriesId: string; message: string }) {
  let key = seriesGenerationJobKey(input.accountId, input.seriesId)
  if (stylePreviewJobs.has(key)) return
  let job = runStylePreviewJob(input).catch((error) => {
    console.warn('Series style preview job crashed.', error)
  })
  stylePreviewJobs.set(key, job)
  void job.finally(() => {
    stylePreviewJobs.delete(key)
  })
}

async function runStylePreviewJob(input: { accountId: string; seriesId: string; message: string }) {
  try {
    await updateSeriesGenerationStatus(
      input.accountId,
      input.seriesId,
      'pending',
      'Creating artwork samples from your series description.',
      'style-preview',
    )

    let styles = getStylePresets()
    let previews = await Promise.all(
      styles.map((style) =>
        previewSeriesStyleWithAi({
          description: input.message,
          style,
        }),
      ),
    )
    await setSeriesStylePreviews(input.accountId, input.seriesId, previews)
    await addSeriesChatMessages(input.accountId, input.seriesId, [
      {
        role: 'assistant',
        text: previews.some((preview) => preview.imageUrl)
          ? 'I made artwork samples from your description. Choose the style you want for the series.'
          : 'I could not generate custom artwork samples, but you can still choose a style and continue.',
      },
    ])
    await updateSeriesGenerationStatus(
      input.accountId,
      input.seriesId,
      'complete',
      'Choose an artwork style.',
      'style-choice',
    )
  } catch (error) {
    console.warn('Series style previews failed.', error)
    let fallbackPreviews: SeriesStylePreview[] = getStylePresets().map((style) => ({
      styleId: style.id,
      imageUrl: null,
      prompt: input.message,
      createdAt: new Date().toISOString(),
    }))
    await setSeriesStylePreviews(input.accountId, input.seriesId, fallbackPreviews)
    await updateSeriesGenerationStatus(
      input.accountId,
      input.seriesId,
      'complete',
      'Choose an artwork style.',
      'style-choice',
    )
  }
}

async function runSeriesGenerationJob(input: {
  accountId: string
  seriesId: string
  message: string
  styleId: string
}) {
  try {
    let style = getStylePreset(input.styleId)
    await updateSeriesGenerationStatus(
      input.accountId,
      input.seriesId,
      'pending',
      `Drafting the ${style.name.toLowerCase()} series brief.`,
      'series-generation',
    )

    let initialContext = await getSeriesContext(input.accountId, input.seriesId)
    if (!initialContext) return

    let plan = await planNewSeriesFromChat({
      message: input.message,
      styles: getStylePresets(),
      selectedStyleId: style.id,
    })
    let toolCalls = forceToolCallsToStyle(plan.toolCalls, style.id)

    await updateSeriesGenerationStatus(
      input.accountId,
      input.seriesId,
      'pending',
      'Creating the recurring cast and character previews.',
    )

    let context = (await getSeriesContext(input.accountId, input.seriesId)) ?? initialContext
    await executeSeriesToolCalls({
      account: context.account,
      series: context.series,
      toolCalls,
    })
    await addSeriesChatMessages(input.accountId, input.seriesId, [
      { role: 'assistant', text: plan.assistantMessage },
    ])
    await updateSeriesGenerationStatus(input.accountId, input.seriesId, 'complete', 'Ready.', 'ready')
  } catch (error) {
    console.warn('Series background generation failed.', error)
    await addSeriesChatMessages(input.accountId, input.seriesId, [
      {
        role: 'assistant',
        text: 'I could not finish the automatic setup. You can edit the series and add characters here.',
      },
    ])
    await updateSeriesGenerationStatus(
      input.accountId,
      input.seriesId,
      'failed',
      'Automatic setup failed. The draft is still editable.',
      'ready',
    )
  }
}

async function getSeriesContext(accountId: string, seriesId: string) {
  let account = await getAccount(accountId)
  let series = account?.series.find((item) => item.id === seriesId) ?? null
  return account && series ? { account, series } : null
}

function seriesStatusEventStream(input: { request: Request; accountId: string; seriesId: string }) {
  let encoder = new TextEncoder()
  let interval: ReturnType<typeof setInterval> | null = null
  let closed = false

  let stream = new ReadableStream({
    start(controller) {
      function send(event: string, data: Record<string, unknown>) {
        if (closed) return
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      function close() {
        if (closed) return
        closed = true
        if (interval) clearInterval(interval)
        input.request.signal.removeEventListener('abort', close)
        controller.close()
      }

      async function pushStatus() {
        let context = await getSeriesContext(input.accountId, input.seriesId)
        if (!context) {
          send('status', { status: 'failed', message: 'Series not found.' })
          close()
          return
        }
        send('status', {
          status: context.series.generationStatus,
          message: context.series.generationMessage,
          updatedAt: context.series.updatedAt,
        })
        if (context.series.generationStatus === 'complete' || context.series.generationStatus === 'failed') {
          close()
        }
      }

      input.request.signal.addEventListener('abort', close)
      interval = setInterval(() => {
        void pushStatus().catch((error) => {
          console.warn('Series status stream failed.', error)
          send('status', { status: 'failed', message: 'Connection lost.' })
          close()
        })
      }, 1000)
      void pushStatus().catch((error) => {
        console.warn('Series status stream failed.', error)
        send('status', { status: 'failed', message: 'Connection lost.' })
        close()
      })
    },
    cancel() {
      closed = true
      if (interval) clearInterval(interval)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

function json(data: unknown, init: ResponseInit = {}) {
  let headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  return new Response(JSON.stringify(data), { ...init, headers })
}

async function transcribeAudioWithWhisper(file: File) {
  let apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.')

  let body = new FormData()
  body.append('model', 'whisper-1')
  body.append('response_format', 'json')
  body.append('file', file, file.name || 'dictation.webm')

  let response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body,
  })

  if (!response.ok) throw new Error(await response.text())
  let result = (await response.json()) as { text?: unknown }
  return typeof result.text === 'string' ? result.text.trim() : ''
}

export default {
  middleware: [requireAuth],
  actions: {
    async index({ request }) {
      let { account, usage } = await getRequiredAccount()
      return render(
        <Layout title="Story App" active="dashboard" accountEmail={account.email} usage={usage}>
          <div className="grid two">
            <section className="card">
              <div className="toolbar">
                <div>
                  <h1>Stories</h1>
                  <p className="muted">
                    Create early-reader books from word lists, reusable characters, style presets,
                    and editable story drafts.
                  </p>
                </div>
                <div className="button-row">
                  <a className="button" href={routes.storyApp.series.index.href()}>
                    New series
                  </a>
                  <a className="button primary" href={routes.storyApp.newStory.index.href()}>
                    New story
                  </a>
                </div>
              </div>
              <div className="list" style="margin-top: 18px;">
                {account.stories.length ? (
                  account.stories.map((story) => (
                    <a className="list-item" href={routes.storyApp.story.index.href({ storyId: story.id })}>
                      <div>
                        <strong>{story.title}</strong>
                        <div className="muted">
                          {story.pageCount} pages · {story.status} · {getStylePreset(story.styleId).name}
                        </div>
                      </div>
                      <span>{credits(story.estimatedCostCents)}</span>
                    </a>
                  ))
                ) : (
                  <p className="muted">No stories yet.</p>
                )}
              </div>
            </section>
            <aside className="card">
              <h2>Library</h2>
              <div className="list">
                <div className="list-item">
                  <strong>Characters</strong>
                  <span>{account.characters.length}</span>
                </div>
                <div className="list-item">
                  <strong>Series</strong>
                  <span>{account.series.length}</span>
                </div>
                <div className="list-item">
                  <strong>Styles</strong>
                  <span>{getStylePresets().length}</span>
                </div>
              </div>
              <p>
                <a className="button" href={routes.storyApp.series.index.href()}>
                  Manage series
                </a>
              </p>
            </aside>
          </div>
        </Layout>,
        request,
      )
    },
    async dictation({ request }) {
      await getRequiredAccount()
      let formData = await request.formData()
      let audio = formData.get('audio')
      if (!(audio instanceof File) || audio.size === 0) {
        return json({ error: 'No audio file received.' }, { status: 400 })
      }
      if (audio.size > MAX_TRANSCRIPTION_FILE_BYTES) {
        return json({ error: 'Audio is too large to transcribe.' }, { status: 413 })
      }

      try {
        let text = await transcribeAudioWithWhisper(audio)
        return json({ text })
      } catch (error) {
        console.warn('Dictation transcription failed.', error)
        return json({ error: 'Transcription failed.' }, { status: 502 })
      }
    },
    words: {
      actions: {
        async index({ request }) {
          let { account, usage } = await getRequiredAccount()
          return render(
            <Layout title="Words" active="words" accountEmail={account.email} usage={usage}>
              <div className="grid two">
                <section className="card">
                  <h1>Known words</h1>
                  <form method="POST" action={routes.storyApp.words.action.href()} className="stack">
                    <input type="hidden" name="intent" value="add-words" />
                    <label className="field">
                      Child
                      <select name="childId" required>
                        {account.children.map((child) => (
                          <option value={child.id}>{child.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Category
                      <input name="category" defaultValue="general" />
                    </label>
                    <label className="field">
                      Words
                      <textarea name="words" rows={7} placeholder="saw, cut, log, tree" />
                    </label>
                    <button className="button primary" type="submit">
                      Add words
                    </button>
                  </form>
                </section>
                <aside className="card">
                  <h2>Child profiles</h2>
                  <form method="POST" action={routes.storyApp.words.action.href()} className="stack">
                    <input type="hidden" name="intent" value="create-child" />
                    <label className="field">
                      Child name
                      <input name="name" placeholder="Zephyr" required />
                    </label>
                    <button className="button primary" type="submit">
                      Add child
                    </button>
                  </form>
                  <div className="list" style="margin-top: 18px;">
                    {account.children.map((child) => (
                      <div className="list-item">
                        <div>
                          <strong>{child.name}</strong>
                          <div className="muted">
                            {child.words.map((word) => word.word).join(', ') || 'No words yet.'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </Layout>,
            request,
          )
        },
        async action({ request }) {
          let { account } = await getRequiredAccount()
          let formData = await request.formData()
          let intent = String(formData.get('intent') ?? '')
          if (intent === 'create-child') {
            let name = String(formData.get('name') ?? '').trim()
            if (name) await addChild(account.id, name)
          }
          if (intent === 'add-words') {
            let childId = String(formData.get('childId') ?? '')
            let category = String(formData.get('category') ?? 'general').trim() || 'general'
            let words = parseWordList(String(formData.get('words') ?? ''))
            if (childId && words.length) await addWords(account.id, childId, words, category)
          }
          return redirect(routes.storyApp.words.index.href(), 303)
        },
      },
    },
    async seriesEvents({ request, params }) {
      let { account } = await getRequiredAccount()
      let series = account.series.find((item) => item.id === params.seriesId)
      if (!series) return new Response('Series not found', { status: 404 })
      return seriesStatusEventStream({
        request,
        accountId: account.id,
        seriesId: series.id,
      })
    },
    series: {
      actions: {
        async index({ request }) {
          let { account, usage } = await getRequiredAccount()
          return render(
            <Layout title="Series" active="series" accountEmail={account.email} usage={usage}>
              <div className="grid two">
                <section className="card chat-card">
                  <div className="toolbar">
                    <div>
                      <h1>What series should we make?</h1>
                    </div>
                  </div>
                  <div className="chat-thread">
                    <div className="chat-message assistant">
                      <span>
                        Describe the series, characters, setting, and story idea. I will turn that into artwork samples in each style.
                      </span>
                    </div>
                  </div>
                  <form method="POST" action={routes.storyApp.series.action.href()} className="stack">
                    <div className="chat-box">
                      <textarea
                        name="message"
                        rows={5}
                        placeholder="A cozy series about a tiger family learning how everyday machines work, with Zephyr, Auggie, Mommy Tiger, and Daddy Tiger solving small problems together."
                        required
                      />
                      <button className="button primary" type="submit">
                        Generate styles
                      </button>
                    </div>
                  </form>
                </section>
                <aside className="card">
                  <h2>Series</h2>
                  <div className="list">
                    {account.series.length ? (
                      account.series.map((series) => (
                        <a
                          className="list-item"
                          href={routes.storyApp.seriesDetail.index.href({ seriesId: series.id })}
                        >
                          <div>
                            <strong>{series.name}</strong>
                            <div className="muted">
                              {getStylePreset(series.defaultStyleId).name} · {seriesListStatus(series)}
                            </div>
                          </div>
                        </a>
                      ))
                    ) : (
                      <p className="muted">No series yet.</p>
                    )}
                  </div>
                </aside>
              </div>
            </Layout>,
            request,
          )
        },
        async action({ request }) {
          let { account } = await getRequiredAccount()
          let formData = await request.formData()
          let message = String(formData.get('message') ?? '').trim()
          if (!message) return redirect(routes.storyApp.series.index.href(), 303)
          let initialStyle = getStylePresets()[0]
          let series = await addSeries(account.id, {
            name: draftSeriesNameFromMessage(message),
            description: message,
            defaultStyleId: initialStyle.id,
            characterIds: [],
            generationStatus: 'pending',
            generationMessage: 'Creating artwork samples from your series description.',
            setupStep: 'style-preview',
          })
          await addSeriesChatMessages(account.id, series.id, [
            { role: 'user', text: message },
            {
              role: 'assistant',
              text: 'I am generating artwork samples for each style from that description.',
            },
          ])
          startStylePreviewJob({
            accountId: account.id,
            seriesId: series.id,
            message,
          })
          return redirect(routes.storyApp.seriesDetail.index.href({ seriesId: series.id }), 303)
        },
      },
    },
    seriesDetail: {
      actions: {
        async index({ request, params }) {
          let { account, usage } = await getRequiredAccount()
          let series = account.series.find((item) => item.id === params.seriesId)
          if (!series) return new Response('Series not found', { status: 404 })
          let styles = getStylePresets()
          let characters = seriesCharacters(account, series)
          if (series.generationStatus === 'pending' && series.setupStep === 'style-preview') {
            startStylePreviewJob({
              accountId: account.id,
              seriesId: series.id,
              message: series.description,
            })
          }
          if (series.generationStatus === 'pending' && series.setupStep === 'series-generation') {
            startSeriesGenerationJob({
              accountId: account.id,
              seriesId: series.id,
              message: series.description,
              styleId: series.defaultStyleId,
            })
          }
          return render(
            <Layout title={series.name} active="series" accountEmail={account.email} usage={usage}>
              <div className="stack">
                <div className="toolbar">
                  <div>
                    <h1>{series.name}</h1>
                    <p className="muted">
                      {getStylePreset(series.defaultStyleId).name} · {characters.length} characters
                    </p>
                  </div>
                  <a className="button" href={routes.storyApp.series.index.href()}>
                    All series
                  </a>
                </div>

                {series.generationStatus === 'pending' ? (
                  <section
                    className="card generation-loading"
                    data-series-events={routes.storyApp.seriesEvents.href({ seriesId: series.id })}
                  >
                    <div className="loading-row">
                      <div className="spinner" aria-hidden="true"></div>
                      <div>
                        <h2>{series.setupStep === 'style-preview' ? 'Creating style samples' : 'Creating series'}</h2>
                        <p className="muted" data-series-status>
                          {series.generationMessage ?? 'Creating the cast and artwork previews.'}
                        </p>
                      </div>
                    </div>
                    {series.setupStep === 'style-preview' ? (
                      <p className="muted">{series.description}</p>
                    ) : (
                      artworkStyleExample(
                        getStylePreset(series.defaultStyleId),
                        seriesStylePreviewImage(series, getStylePreset(series.defaultStyleId)),
                      )
                    )}
                  </section>
                ) : series.setupStep === 'style-choice' ? (
                  <section className="card style-selection-card">
                    <div className="toolbar">
                      <div>
                        <h2>Choose artwork style</h2>
                        <p className="muted">
                          These samples use your series description as the subject, including the characters and setting you described.
                        </p>
                      </div>
                    </div>
                    <form
                      method="POST"
                      action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                      className="stack"
                    >
                      <input type="hidden" name="intent" value="select-style" />
                      <div className="art-style-carousel">
                        {styles.map((style) =>
                          artworkStyleChoice(
                            style,
                            style.id === series.defaultStyleId,
                            seriesStylePreviewImage(series, style),
                          ),
                        )}
                      </div>
                      <button className="button primary" type="submit">
                        Create series in selected style
                      </button>
                    </form>
                    <details className="description-editor">
                      <summary>Edit description and regenerate samples</summary>
                      <form
                        method="POST"
                        action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                        className="stack"
                      >
                        <input type="hidden" name="intent" value="regenerate-style-previews" />
                        <label className="field">
                          Series name
                          <input name="name" defaultValue={series.name} required />
                        </label>
                        <label className="field">
                          Series description
                          <textarea name="description" rows={5} required>
                            {series.description}
                          </textarea>
                        </label>
                        <button className="button" type="submit">
                          Regenerate style samples
                        </button>
                      </form>
                    </details>
                  </section>
                ) : (
                  <>
                {series.generationStatus === 'failed' ? (
                  <section className="card status-card warning">
                    <strong>Automatic setup did not finish.</strong>
                    <p className="muted">{series.generationMessage}</p>
                  </section>
                ) : null}

                <section className="card chat-card">
                  {chatThread(series)}
                  <form
                    method="POST"
                    action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                    className="chat-box"
                  >
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Add a shy robot character, make the art colored pencil, and make the family workshop more important."
                      required
                    />
                    <button className="button primary" name="intent" value="series-chat" type="submit">
                      Send
                    </button>
                  </form>
                </section>

                <section className="card">
                  <div className="toolbar">
                    <div>
                      <h2>Artwork style</h2>
                    </div>
                  </div>
                  {artworkStyleExample(
                    getStylePreset(series.defaultStyleId),
                    seriesStylePreviewImage(series, getStylePreset(series.defaultStyleId)),
                  )}
                </section>

                <details className="card disclosure">
                  <summary>Series brief</summary>
                  <form
                    method="POST"
                    action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                    className="stack"
                  >
                    <input type="hidden" name="intent" value="update-series" />
                    {series.characterIds.map((characterId) => (
                      <input type="hidden" name="characterIds" value={characterId} />
                    ))}
                    <label className="field">
                      Series name
                      <input name="name" defaultValue={series.name} required />
                    </label>
                    <label className="field">
                      Series description
                      <textarea name="description" rows={5} required>
                        {series.description}
                      </textarea>
                    </label>
                    <div className="field">
                      Default style
                      {styleChoiceGrid(styles, series.defaultStyleId)}
                    </div>
                    <button className="button primary" type="submit">
                      Save series
                    </button>
                  </form>
                </details>

                <details className="card disclosure" open={characters.length === 0}>
                  <summary>Characters</summary>
                  <form
                    method="POST"
                    action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                    className="ai-panel"
                  >
                    <div className="stack">
                      <label className="field">
                        Describe a character
                        <textarea
                          name="concept"
                          rows={4}
                          placeholder="A little neighbor who loves maps, wears yellow rain boots, and helps the tiger family find new places."
                          required
                        />
                      </label>
                      <div className="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
                        <label className="field">
                          Optional name
                          <input name="name" placeholder="Mira" />
                        </label>
                        <label className="field">
                          Optional role
                          <input name="role" placeholder="map-loving neighbor" />
                        </label>
                      </div>
                      <label className="field">
                        Style
                        <select name="styleId">
                          {styles.map((style) => (
                            <option value={style.id} selected={style.id === series.defaultStyleId}>
                              {style.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="stack">
                      <button className="button primary" name="intent" value="assist-character" type="submit">
                        AI draft character
                      </button>
                      <button className="button" name="intent" value="assist-character-preview" type="submit">
                        AI draft + preview
                      </button>
                    </div>
                  </form>

                  <div className="grid two-wide">
                    <form
                      method="POST"
                      action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                      className="stack"
                    >
                      <label className="field">
                        Name
                        <input name="name" placeholder="Zephyr Tiger" required />
                      </label>
                      <label className="field">
                        Role
                        <input name="role" placeholder="curious older cub" required />
                      </label>
                      <label className="field">
                        Appearance
                        <textarea
                          name="appearance"
                          rows={4}
                          placeholder="Orange-and-cream tiger cub, red boots, soft round face..."
                          required
                        />
                      </label>
                      <label className="field">
                        Traits
                        <input name="traits" placeholder="curious, careful, kind" />
                      </label>
                      <label className="field">
                        Backstory
                        <textarea name="backstory" rows={3} placeholder="Loves building things with Dad." />
                      </label>
                      <label className="field">
                        Reference image URL
                        <input name="referenceImageUrl" placeholder="Optional" />
                      </label>
                      <label className="field">
                        Character style
                        <select name="styleId">
                          {styles.map((style) => (
                            <option value={style.id} selected={style.id === series.defaultStyleId}>
                              {style.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="button-row">
                        <button className="button primary" name="intent" value="create-character" type="submit">
                          Add character
                        </button>
                        <button className="button" name="intent" value="create-character-preview" type="submit">
                          Add + preview
                        </button>
                      </div>
                    </form>

                    <div className="stack">
                      <form
                        method="POST"
                        action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                        className="stack"
                      >
                        <input type="hidden" name="intent" value="update-series-characters" />
                        <div className="field">
                          Series cast
                          <div className="check-grid">
                            {account.characters.length ? (
                              account.characters.map((character) => (
                                <label className="check-card">
                                  <input
                                    type="checkbox"
                                    name="characterIds"
                                    value={character.id}
                                    defaultChecked={series.characterIds.includes(character.id)}
                                  />
                                  <span>
                                    {character.name}
                                    <br />
                                    <span className="muted">{character.role}</span>
                                  </span>
                                </label>
                              ))
                            ) : (
                              <p className="muted">No characters yet.</p>
                            )}
                          </div>
                        </div>
                        <button className="button" type="submit">
                          Update cast
                        </button>
                      </form>

                      <div className="character-grid">
                        {characters.length ? (
                          characters.map((character) => (
                            <details className="character-panel">
                              <summary>
                                {characterPreview(character)}
                              </summary>
                              <div className="character-detail">
                                <div className="stack">
                                  <img
                                    className="character-large-image"
                                    src={characterPreviewSrc(character)}
                                    alt={`${character.name} preview`}
                                  />
                                  <div>
                                    <strong>Traits</strong>
                                    <p className="muted">{character.traits || 'No traits set.'}</p>
                                  </div>
                                  <div>
                                    <strong>Backstory</strong>
                                    <p className="muted">{character.backstory || 'No backstory set.'}</p>
                                  </div>
                                </div>
                                <form
                                  method="POST"
                                  action={routes.storyApp.seriesDetail.action.href({ seriesId: series.id })}
                                  className="stack"
                                >
                                  <input type="hidden" name="characterId" value={character.id} />
                                  <label className="field">
                                    Name
                                    <input name="name" defaultValue={character.name} required />
                                  </label>
                                  <label className="field">
                                    Role
                                    <input name="role" defaultValue={character.role} required />
                                  </label>
                                  <label className="field">
                                    Appearance
                                    <textarea name="appearance" rows={4} required>
                                      {character.appearance || character.description}
                                    </textarea>
                                  </label>
                                  <label className="field">
                                    Traits
                                    <input name="traits" defaultValue={character.traits} />
                                  </label>
                                  <label className="field">
                                    Backstory
                                    <textarea name="backstory" rows={3}>
                                      {character.backstory}
                                    </textarea>
                                  </label>
                                  <label className="field">
                                    Reference image URL
                                    {isGeneratedPreviewUrl(character.referenceImageUrl) ? (
                                      <input type="hidden" name="referenceImageUrl" value={character.referenceImageUrl ?? ''} />
                                    ) : null}
                                    <input
                                      name={
                                        isGeneratedPreviewUrl(character.referenceImageUrl)
                                          ? 'newReferenceImageUrl'
                                          : 'referenceImageUrl'
                                      }
                                      defaultValue={
                                        isGeneratedPreviewUrl(character.referenceImageUrl)
                                          ? ''
                                          : character.referenceImageUrl ?? ''
                                      }
                                      placeholder={
                                        isGeneratedPreviewUrl(character.referenceImageUrl)
                                          ? 'Generated preview saved. Paste a URL to replace it.'
                                          : 'Optional'
                                      }
                                    />
                                  </label>
                                  <label className="field">
                                    Style
                                    <select name="styleId">
                                      {styles.map((style) => (
                                        <option value={style.id} selected={style.id === character.styleId}>
                                          {style.name}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                  <div className="button-row">
                                    <button className="button primary" name="intent" value="update-character" type="submit">
                                      Save character
                                    </button>
                                    <button className="button" name="intent" value="preview-character" type="submit">
                                      Preview look
                                    </button>
                                  </div>
                                </form>
                              </div>
                            </details>
                          ))
                        ) : (
                          <p className="muted">Add the first character to preview the cast.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </details>

                <details className="card disclosure" open={characters.length > 0}>
                  <summary>Story from this series</summary>
                  <form method="POST" action={routes.storyApp.newStory.action.href()} className="stack">
                    <input type="hidden" name="seriesId" value={series.id} />
                    <label className="field">
                      Title
                      <input name="title" placeholder={`${series.name}: A New Adventure`} required />
                    </label>
                    <div className="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
                      <label className="field">
                        Child word list
                        <select name="childId">
                          <option value="">No child profile</option>
                          {account.children.map((child) => (
                            <option value={child.id}>
                              {child.name} ({child.words.length} words)
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Pages
                        <input name="pageCount" type="number" min="1" max="40" defaultValue="10" />
                      </label>
                    </div>
                    <div className="field">
                      Story style
                      {styleChoiceGrid(styles, series.defaultStyleId)}
                    </div>
                    <div className="field">
                      Characters in this story
                      <div className="check-grid">
                        {characters.length ? (
                          characters.map((character) => (
                            <label className="check-card">
                              <input
                                type="checkbox"
                                name="characterIds"
                                value={character.id}
                                defaultChecked
                              />
                              <span>
                                {character.name}
                                <br />
                                <span className="muted">{character.role}</span>
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="muted">No series characters yet.</p>
                        )}
                      </div>
                    </div>
                    <label className="field">
                      Story description
                      <textarea name="prompt" rows={5} required>
                        {series.description}
                      </textarea>
                    </label>
                    <label className="field">
                      Optional exact story text
                      <textarea name="sourceText" rows={6} placeholder="Paste exact story text to generate images only." />
                    </label>
                    <label className="field">
                      Extra words
                      <input name="extraWords" placeholder="rain, boot, puddle" />
                    </label>
                    <button className="button primary" type="submit">
                      Create draft from series
                    </button>
                  </form>
                </details>
                  </>
                )}
              </div>
            </Layout>,
            request,
          )
        },
        async action({ request, params }) {
          let { account } = await getRequiredAccount()
          let series = account.series.find((item) => item.id === params.seriesId)
          if (!series) return new Response('Series not found', { status: 404 })
          let formData = await request.formData()
          let intent = String(formData.get('intent') ?? '')
          if (intent === 'select-style') {
            let style = getStylePreset(String(formData.get('styleId') ?? series.defaultStyleId))
            await updateSeries(account.id, series.id, {
              name: series.name,
              description: series.description,
              defaultStyleId: style.id,
              characterIds: [],
            })
            await addSeriesChatMessages(account.id, series.id, [
              { role: 'user', text: `Use ${style.name} for this series.` },
              {
                role: 'assistant',
                text: `I am creating the recurring cast and character previews in ${style.name.toLowerCase()} style.`,
              },
            ])
            await updateSeriesGenerationStatus(
              account.id,
              series.id,
              'pending',
              `Starting the ${style.name.toLowerCase()} series setup.`,
              'series-generation',
            )
            startSeriesGenerationJob({
              accountId: account.id,
              seriesId: series.id,
              message: series.description,
              styleId: style.id,
            })
          }
          if (intent === 'regenerate-style-previews') {
            let name = String(formData.get('name') ?? '').trim() || series.name
            let description = String(formData.get('description') ?? '').trim()
            if (description) {
              await updateSeries(account.id, series.id, {
                name,
                description,
                defaultStyleId: series.defaultStyleId,
                characterIds: [],
              })
              await addSeriesChatMessages(account.id, series.id, [
                { role: 'user', text: description },
                { role: 'assistant', text: 'I am regenerating artwork samples from the updated description.' },
              ])
              await updateSeriesGenerationStatus(
                account.id,
                series.id,
                'pending',
                'Creating artwork samples from your series description.',
                'style-preview',
              )
              startStylePreviewJob({
                accountId: account.id,
                seriesId: series.id,
                message: description,
              })
            }
          }
          if (intent === 'series-chat') {
            let message = String(formData.get('message') ?? '').trim()
            if (message) {
              let characters = seriesCharacters(account, series)
              let plan = await planSeriesEditFromChat({
                message,
                series,
                characters,
                styles: getStylePresets(),
              })
              await executeSeriesToolCalls({ account, series, toolCalls: plan.toolCalls })
              await addSeriesChatMessages(account.id, series.id, [
                { role: 'user', text: message },
                { role: 'assistant', text: plan.assistantMessage },
              ])
            }
          }
          if (intent === 'update-series') {
            await updateSeries(account.id, series.id, {
              name: String(formData.get('name') ?? '').trim(),
              description: String(formData.get('description') ?? '').trim(),
              defaultStyleId: String(formData.get('styleId') ?? ''),
              characterIds: formValues(formData, 'characterIds'),
            })
          }
          if (intent === 'update-series-characters') {
            await updateSeries(account.id, series.id, {
              name: series.name,
              description: series.description,
              defaultStyleId: series.defaultStyleId,
              characterIds: formValues(formData, 'characterIds'),
            })
          }
          if (intent === 'assist-character' || intent === 'assist-character-preview') {
            let style = getStylePreset(String(formData.get('styleId') ?? series.defaultStyleId))
            let draft = await draftCharacterWithAi({
              series,
              style,
              existingCharacters: seriesCharacters(account, series),
              concept: String(formData.get('concept') ?? '').trim(),
              name: String(formData.get('name') ?? '').trim(),
              role: String(formData.get('role') ?? '').trim(),
            })
            let referenceImageUrl =
              intent === 'assist-character-preview'
                ? await previewCharacterWithAi({
                    series,
                    style,
                    existingCharacters: seriesCharacters(account, series),
                    character: draft,
                  })
                : null
            await addCharacterToSeries(account.id, series.id, {
              ...draft,
              styleId: style.id,
              referenceImageUrl,
            })
          }
          if (intent === 'create-character' || intent === 'create-character-preview') {
            let input = characterInputFromForm(formData)
            if (input.name && input.role && input.appearance) {
              if (intent === 'create-character-preview') {
                let style = getStylePreset(input.styleId || series.defaultStyleId)
                input.referenceImageUrl = await previewCharacterWithAi({
                  series,
                  style,
                  existingCharacters: seriesCharacters(account, series),
                  character: characterSubjectFromInput(input),
                })
                input.styleId = style.id
              }
              await addCharacterToSeries(account.id, series.id, input)
            }
          }
          if (intent === 'update-character' || intent === 'preview-character') {
            let characterId = String(formData.get('characterId') ?? '')
            let input = characterInputFromForm(formData)
            if (characterId && input.name && input.role && input.appearance) {
              if (intent === 'preview-character') {
                let style = getStylePreset(input.styleId || series.defaultStyleId)
                input.referenceImageUrl = await previewCharacterWithAi({
                  series,
                  style,
                  existingCharacters: seriesCharacters(account, series),
                  character: characterSubjectFromInput(input, { id: characterId }),
                })
                input.styleId = style.id
              }
              await updateCharacter(account.id, characterId, input)
            }
          }
          return redirect(routes.storyApp.seriesDetail.index.href({ seriesId: series.id }), 303)
        },
      },
    },
    library: {
      actions: {
        async index({ request }) {
          let { account, usage } = await getRequiredAccount()
          let styles = getStylePresets()
          return render(
            <Layout title="Library" active="library" accountEmail={account.email} usage={usage}>
              <div className="grid">
                <section className="card">
                  <h1>Style presets</h1>
                  <div className="style-grid">
                    {styles.map((style) => (
                      <div className="style-option">
                        <div className="style-preview" style={style.previewCss}></div>
                        <strong>{style.name}</strong>
                        <div className="muted">{style.description}</div>
                      </div>
                    ))}
                  </div>
                </section>
                <div className="grid two">
                  <section className="card">
                    <h2>Characters</h2>
                    <form method="POST" action={routes.storyApp.library.action.href()} className="stack">
                      <input type="hidden" name="intent" value="create-character" />
                      <label className="field">
                        Name
                        <input name="name" placeholder="Zephyr Tiger" required />
                      </label>
                      <label className="field">
                        Role
                        <input name="role" placeholder="older tiger cub" required />
                      </label>
                      <label className="field">
                        Default style
                        <select name="styleId">
                          {styles.map((style) => (
                            <option value={style.id}>{style.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Description
                        <textarea
                          name="description"
                          rows={5}
                          placeholder="Orange-and-cream tiger cub, gentle smile, red boots..."
                          required
                        />
                      </label>
                      <label className="field">
                        Reference image URL
                        <input name="referenceImageUrl" placeholder="Optional" />
                      </label>
                      <button className="button primary" type="submit">
                        Add character
                      </button>
                    </form>
                    <div className="list" style="margin-top: 18px;">
                      {account.characters.map((character) => (
                        <div className="list-item">
                          <div>
                            <strong>{character.name}</strong>
                            <div className="muted">
                              {character.role} · {getStylePreset(character.styleId).name}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <aside className="card">
                    <h2>Series</h2>
                    <form method="POST" action={routes.storyApp.library.action.href()} className="stack">
                      <input type="hidden" name="intent" value="create-series" />
                      <label className="field">
                        Name
                        <input name="name" placeholder="Tiger Stories" required />
                      </label>
                      <label className="field">
                        Default style
                        <select name="styleId">
                          {styles.map((style) => (
                            <option value={style.id}>{style.name}</option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Description
                        <textarea name="description" rows={4} placeholder="Cozy stories about the tiger family." />
                      </label>
                      <div className="field">
                        Characters
                        <div className="check-grid">
                          {account.characters.map((character) => (
                            <label className="check-card">
                              <input type="checkbox" name="characterIds" value={character.id} />
                              <span>{character.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <button className="button primary" type="submit">
                        Add series
                      </button>
                    </form>
                    <div className="list" style="margin-top: 18px;">
                      {account.series.map((series) => (
                        <a
                          className="list-item"
                          href={routes.storyApp.seriesDetail.index.href({ seriesId: series.id })}
                        >
                          <div>
                            <strong>{series.name}</strong>
                            <div className="muted">
                              {getStylePreset(series.defaultStyleId).name} ·{' '}
                              {characterNames(account, series.characterIds) || 'No default characters'}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </aside>
                </div>
              </div>
            </Layout>,
            request,
          )
        },
        async action({ request }) {
          let { account } = await getRequiredAccount()
          let formData = await request.formData()
          let intent = String(formData.get('intent') ?? '')
          if (intent === 'create-character') {
            let name = String(formData.get('name') ?? '').trim()
            let role = String(formData.get('role') ?? '').trim()
            let description = String(formData.get('description') ?? '').trim()
            let styleId = String(formData.get('styleId') ?? '')
            let referenceImageUrl = String(formData.get('referenceImageUrl') ?? '').trim() || null
            if (name && role && description) {
              await addCharacter(account.id, { name, role, description, styleId, referenceImageUrl })
            }
          }
          if (intent === 'create-series') {
            let name = String(formData.get('name') ?? '').trim()
            let description = String(formData.get('description') ?? '').trim()
            let defaultStyleId = String(formData.get('styleId') ?? '')
            if (name) {
              let series = await addSeries(account.id, {
                name,
                description,
                defaultStyleId,
                characterIds: formValues(formData, 'characterIds'),
              })
              return redirect(routes.storyApp.seriesDetail.index.href({ seriesId: series.id }), 303)
            }
          }
          return redirect(routes.storyApp.library.index.href(), 303)
        },
      },
    },
    newStory: {
      actions: {
        async index({ request }) {
          let { account, usage } = await getRequiredAccount()
          let estimate = estimateStoryCost(10, true)
          let styles = getStylePresets()
          return render(
            <Layout title="New story" active="new" accountEmail={account.email} usage={usage}>
              <section className="card" style="max-width: 880px; margin: 0 auto;">
                <h1>Create a story</h1>
                <p className="muted">
                  Drafts reserve estimated credits before generation spends API budget. A typical
                  10-page story estimates at {credits(estimate.estimatedCostCents)}.
                </p>
                <form method="POST" action={routes.storyApp.newStory.action.href()} className="stack">
                  <label className="field">
                    Title
                    <input name="title" required placeholder="Zephyr Tiger Goes to the Library" />
                  </label>
                  <div className="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
                    <label className="field">
                      Child word list
                      <select name="childId">
                        <option value="">No child profile</option>
                        {account.children.map((child) => (
                          <option value={child.id}>
                            {child.name} ({child.words.length} words)
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Series
                      <select name="seriesId">
                        <option value="">No series</option>
                        {account.series.map((series) => (
                          <option value={series.id}>{series.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="field">
                    Style
                    <div className="style-grid">
                      <label className="style-option">
                        <input type="radio" name="styleId" value="" defaultChecked />
                        <div className="style-preview" style={styles[0].previewCss}></div>
                        <strong>Series default</strong>
                        <span className="muted">Use the selected series style, or cozy watercolor without a series.</span>
                      </label>
                      {styles.map((style) => (
                        <label className="style-option">
                          <input type="radio" name="styleId" value={style.id} />
                          <div className="style-preview" style={style.previewCss}></div>
                          <strong>{style.name}</strong>
                          <span className="muted">{style.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="field">
                    Characters to make available for this story
                    <div className="check-grid">
                      {account.characters.map((character) => (
                        <label className="check-card">
                          <input type="checkbox" name="characterIds" value={character.id} />
                          <span>
                            {character.name}
                            <br />
                            <span className="muted">{character.role}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="field">
                    Story description
                    <textarea
                      name="prompt"
                      required
                      rows={4}
                      placeholder="A gentle story about a tiger family visiting the library."
                    />
                  </label>
                  <label className="field">
                    Optional exact story text
                    <textarea
                      name="sourceText"
                      rows={6}
                      placeholder="Paste exact story text to generate images only."
                    />
                  </label>
                  <div className="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr));">
                    <label className="field">
                      Pages
                      <input name="pageCount" type="number" min="1" max="40" defaultValue="10" />
                    </label>
                    <label className="field">
                      Extra words
                      <input name="extraWords" placeholder="rain, boot, puddle" />
                    </label>
                  </div>
                  <button className="button primary" type="submit">
                    Create draft
                  </button>
                </form>
              </section>
            </Layout>,
            request,
          )
        },
        async action({ request }) {
          let { account } = await getRequiredAccount()
          let formData = await request.formData()
          let story = await createDraftStory({
            accountId: account.id,
            childId: String(formData.get('childId') ?? '') || null,
            seriesId: String(formData.get('seriesId') ?? '') || null,
            styleId: String(formData.get('styleId') ?? ''),
            characterIds: formValues(formData, 'characterIds'),
            title: String(formData.get('title') ?? '').trim(),
            prompt: String(formData.get('prompt') ?? '').trim(),
            sourceText: String(formData.get('sourceText') ?? '').trim() || null,
            pageCount: Number(formData.get('pageCount') ?? 10),
            extraWords: parseWordList(String(formData.get('extraWords') ?? '')),
          })
          return redirect(routes.storyApp.story.index.href({ storyId: story.id }), 303)
        },
      },
    },
    story: {
      actions: {
        async index({ request, params }) {
          let { account, usage } = await getRequiredAccount()
          let story = account.stories.find((item) => item.id === params.storyId)
          if (!story) return new Response('Story not found', { status: 404 })
          let styles = getStylePresets()
          return render(
            <Layout title={story.title} active="dashboard" accountEmail={account.email} usage={usage}>
              <form method="POST" action={routes.storyApp.story.action.href({ storyId: story.id })} className="grid two">
                <section className="card">
                  <div className="toolbar">
                    <div>
                      <h1>Edit story</h1>
                      <p className="muted">
                        {story.pageCount} pages · <span className="status">{story.status}</span>
                      </p>
                    </div>
                    <button className="button primary" type="submit">
                      Save changes
                    </button>
                  </div>
                  <div className="stack" style="margin-top: 18px;">
                    <label className="field">
                      Title
                      <input name="title" defaultValue={story.title} required />
                    </label>
                    <label className="field">
                      Story description
                      <textarea name="prompt" rows={4} required>
                        {story.prompt}
                      </textarea>
                    </label>
                    <div className="list">
                      {story.pages.map((page) => (
                        <div className="page-editor">
                          <strong>Page {page.pageNumber}</strong>
                          <label className="field">
                            Text
                            <textarea name={`pageText:${page.pageNumber}`} rows={3}>
                              {page.text}
                            </textarea>
                          </label>
                          <label className="field">
                            Image prompt
                            <textarea name={`imagePrompt:${page.pageNumber}`} rows={5}>
                              {page.imagePrompt}
                            </textarea>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                <aside className="card">
                  <h2>Story setup</h2>
                  <div className="stack">
                    <label className="field">
                      Style
                      <select name="styleId">
                        {styles.map((style) => (
                          <option value={style.id} selected={style.id === story.styleId}>
                            {style.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Series
                      <select name="seriesId">
                        <option value="">No series</option>
                        {account.series.map((series) => (
                          <option value={series.id} selected={series.id === story.seriesId}>
                            {series.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="field">
                      Characters available
                      <div className="check-grid">
                        {account.characters.map((character) => (
                          <label className="check-card">
                            <input
                              type="checkbox"
                              name="characterIds"
                              value={character.id}
                              checked={story.characterIds.includes(character.id)}
                            />
                            <span>
                              {character.name}
                              <br />
                              <span className="muted">{character.role}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <p>Estimated credits: {credits(story.estimatedCostCents)}</p>
                    <p>Actual credits: {credits(story.actualCostCents)}</p>
                    <p className="muted">Words: {story.words.join(', ') || 'None'}</p>
                    <p className="muted">
                      Image generation should use the saved style, selected character references,
                      and per-page prompts.
                    </p>
                  </div>
                </aside>
              </form>
            </Layout>,
            request,
          )
        },
        async action({ request, params }) {
          let { account } = await getRequiredAccount()
          let story = account.stories.find((item) => item.id === params.storyId)
          if (!story) return new Response('Story not found', { status: 404 })
          let formData = await request.formData()
          await updateStoryDraft(account.id, story.id, {
            title: String(formData.get('title') ?? '').trim(),
            prompt: String(formData.get('prompt') ?? '').trim(),
            styleId: String(formData.get('styleId') ?? ''),
            seriesId: String(formData.get('seriesId') ?? '') || null,
            characterIds: formValues(formData, 'characterIds'),
            pages: story.pages.map((page) => ({
              pageNumber: page.pageNumber,
              text: String(formData.get(`pageText:${page.pageNumber}`) ?? '').trim(),
              imagePrompt: String(formData.get(`imagePrompt:${page.pageNumber}`) ?? '').trim(),
            })),
          })
          return redirect(routes.storyApp.story.index.href({ storyId: story.id }), 303)
        },
      },
    },
    billing: {
      actions: {
        async index({ request }) {
          let { account, usage } = await getRequiredAccount()
          return render(
            <Layout title="Billing" active="billing" accountEmail={account.email} usage={usage}>
              <section className="card" style="max-width: 680px;">
                <h1>Subscription</h1>
                <p>
                  Plan: {credits(account.subscription.priceCents)}/month with{' '}
                  {credits(account.subscription.includedCostCents)} included generation credits.
                </p>
                <p className="muted">1 credit = 1 cent of generation budget.</p>
                <p className="muted">
                  Stripe Checkout is wired as a server-side integration point. Add{' '}
                  <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_STORY_APP_MONTHLY_PRICE_ID</code>, and{' '}
                  <code>STRIPE_STORY_APP_WEBHOOK_SECRET</code> before enabling real payments.
                </p>
                <form method="POST" action={routes.storyApp.billing.action.href()}>
                  <button className="button primary" type="submit">
                    Start checkout
                  </button>
                </form>
              </section>
            </Layout>,
            request,
          )
        },
        async action() {
          return new Response('Stripe checkout is not configured yet.', { status: 501 })
        },
      },
    },
  },
} satisfies Controller<typeof routes.storyApp>

export const logoutAction: BuildAction<'POST', typeof routes.logout> = {
  async handler() {
    return redirect(routes.auth.index.href(), {
      headers: {
        'Set-Cookie': await parentAuthCookie.serialize('', { maxAge: 0 }),
      },
    })
  },
}
