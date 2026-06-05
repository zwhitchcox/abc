import { startOfMonth } from 'date-fns'
import { prisma } from '#app/utils/db.server.ts'

export const STORY_APP_MONTHLY_PRICE_CENTS = Number(
	process.env.STORY_APP_MONTHLY_PRICE_CENTS ?? 2000,
)
export const STORY_APP_INCLUDED_COST_CENTS = Number(
	process.env.STORY_APP_INCLUDED_COST_CENTS ?? 1000,
)
export const STORY_APP_IMAGE_COST_CENTS = Number(
	process.env.STORY_APP_IMAGE_COST_CENTS ?? 12,
)
export const STORY_APP_TEXT_COST_CENTS = Number(
	process.env.STORY_APP_TEXT_COST_CENTS ?? 10,
)

export type StoryGenerationEstimate = {
	pageCount: number
	textGeneration: boolean
	estimatedCostCents: number
}

export function estimateStoryGenerationCost({
	pageCount,
	textGeneration,
}: {
	pageCount: number
	textGeneration: boolean
}): StoryGenerationEstimate {
	const normalizedPageCount = Math.min(Math.max(pageCount, 1), 40)
	return {
		pageCount: normalizedPageCount,
		textGeneration,
		estimatedCostCents:
			normalizedPageCount * STORY_APP_IMAGE_COST_CENTS +
			(textGeneration ? STORY_APP_TEXT_COST_CENTS : 0),
	}
}

export async function getStoryAppUsageSummary(userId: string) {
	const subscription = await prisma.storySubscription.findUnique({
		where: { userId },
	})
	const periodStart =
		subscription?.currentPeriodStart ?? startOfMonth(new Date())
	const periodEnd = subscription?.currentPeriodEnd ?? null
	const usageWhere = {
		userId,
		createdAt: periodEnd
			? { gte: periodStart, lt: periodEnd }
			: { gte: periodStart },
	}
	const [usage, credits] = await Promise.all([
		prisma.storyGenerationUsage.aggregate({
			where: usageWhere,
			_sum: { costCents: true },
		}),
		prisma.storyCreditLedger.aggregate({
			where: {
				userId,
				createdAt: periodEnd
					? { gte: periodStart, lt: periodEnd }
					: { gte: periodStart },
			},
			_sum: { amountCents: true },
		}),
	])
	const includedCostCents =
		subscription?.includedCostCents ?? STORY_APP_INCLUDED_COST_CENTS
	const extraCreditCents = credits._sum.amountCents ?? 0
	const usedCostCents = usage._sum.costCents ?? 0
	const availableCostCents = Math.max(
		includedCostCents + extraCreditCents - usedCostCents,
		0,
	)
	return {
		subscription,
		periodStart,
		periodEnd,
		includedCostCents,
		extraCreditCents,
		usedCostCents,
		availableCostCents,
		minimumGrossMarginCents:
			(subscription?.priceCents ?? STORY_APP_MONTHLY_PRICE_CENTS) -
			includedCostCents,
	}
}

export async function assertCanSpendStoryCost({
	userId,
	estimatedCostCents,
}: {
	userId: string
	estimatedCostCents: number
}) {
	const summary = await getStoryAppUsageSummary(userId)
	if (estimatedCostCents > summary.availableCostCents) {
		return {
			ok: false as const,
			summary,
			reason:
				'This story would exceed the included generation budget for the current billing period.',
		}
	}
	return { ok: true as const, summary }
}
