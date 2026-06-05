import { invariantResponse } from '@epic-web/invariant'

export function requireStripeStoryBillingConfig() {
	const secretKey = process.env.STRIPE_SECRET_KEY
	const monthlyPriceId = process.env.STRIPE_STORY_APP_MONTHLY_PRICE_ID
	const webhookSecret = process.env.STRIPE_STORY_APP_WEBHOOK_SECRET
	return { secretKey, monthlyPriceId, webhookSecret }
}

export async function createStorySubscriptionCheckout({
	userId,
	origin,
}: {
	userId: string
	origin: string
}) {
	const { secretKey, monthlyPriceId } = requireStripeStoryBillingConfig()
	invariantResponse(secretKey && monthlyPriceId, 'Stripe is not configured', {
		status: 501,
	})

	// This is intentionally a fetch-based seam so we do not need Stripe
	// credentials or a package install to scaffold the product flow.
	const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
		method: 'POST',
		headers: {
			authorization: `Bearer ${secretKey}`,
			'content-type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			mode: 'subscription',
			'line_items[0][price]': monthlyPriceId,
			'line_items[0][quantity]': '1',
			success_url: `${origin}/story-app?checkout=success`,
			cancel_url: `${origin}/story-app?checkout=cancelled`,
			client_reference_id: userId,
		}),
	})
	const data = (await response.json()) as { url?: string; error?: unknown }
	invariantResponse(response.ok && data.url, 'Could not create checkout', {
		status: 502,
	})
	return data.url
}
