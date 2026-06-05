import { invariantResponse } from '@epic-web/invariant'
import {
	assertCanSpendStoryCost,
	estimateStoryGenerationCost,
} from '#app/utils/commercial-story-limits.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export type CreateStoryInput = {
	userId: string
	childId?: string | null
	title: string
	prompt: string
	sourceText?: string | null
	pageCount: number
	words: string[]
}

function splitSourceText(sourceText: string, pageCount: number) {
	const sentences = sourceText
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter(Boolean)
	if (sentences.length === 0) return []
	return Array.from({ length: pageCount }, (_, index) => {
		const sentence = sentences[index]
		return sentence ?? sentences[sentences.length - 1] ?? ''
	})
}

function buildDraftPages(input: CreateStoryInput) {
	const sourcePages = input.sourceText
		? splitSourceText(input.sourceText, input.pageCount)
		: []
	return Array.from({ length: input.pageCount }, (_, index) => {
		const pageNumber = index + 1
		const text =
			sourcePages[index] ??
			`Page ${pageNumber} will use ${input.words.slice(0, 8).join(', ')}.`
		return {
			pageNumber,
			text,
			imagePrompt:
				`Children's picture-book illustration for page ${pageNumber} of "${input.title}". ` +
				`Story direction: ${input.prompt}. Page text: ${text}. ` +
				'No readable text in the image.',
		}
	})
}

export async function createCommercialStoryDraft(input: CreateStoryInput) {
	invariantResponse(input.title.trim(), 'Title is required', { status: 400 })
	invariantResponse(input.prompt.trim(), 'Story prompt is required', {
		status: 400,
	})
	const pageCount = Math.min(Math.max(input.pageCount, 1), 40)
	const estimate = estimateStoryGenerationCost({
		pageCount,
		textGeneration: !input.sourceText,
	})
	const limit = await assertCanSpendStoryCost({
		userId: input.userId,
		estimatedCostCents: estimate.estimatedCostCents,
	})
	invariantResponse(limit.ok, limit.ok ? '' : limit.reason, { status: 402 })

	const pages = buildDraftPages({ ...input, pageCount })
	return prisma.$transaction(async ($tx) => {
		const story = await $tx.generatedStory.create({
			data: {
				ownerId: input.userId,
				childId: input.childId || null,
				title: input.title.trim(),
				prompt: input.prompt.trim(),
				sourceText: input.sourceText?.trim() || null,
				pageCount,
				wordList: JSON.stringify(input.words),
				modelPlan: JSON.stringify({
					textModel: input.sourceText ? null : 'gpt-5.4-mini',
					imageModel: 'gpt-image-2',
					status: 'draft-only',
				}),
				estimatedCostCents: estimate.estimatedCostCents,
				pages: { create: pages },
			},
			select: { id: true },
		})
		await $tx.storyGenerationUsage.create({
			data: {
				userId: input.userId,
				storyId: story.id,
				kind: 'reservation',
				model: 'draft-estimate',
				quantity: pageCount,
				costCents: estimate.estimatedCostCents,
				metadata: JSON.stringify({ pageCount, textGeneration: !input.sourceText }),
			},
		})
		return story
	})
}
