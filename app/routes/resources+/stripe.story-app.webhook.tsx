import { json, type ActionFunctionArgs } from '@remix-run/node'
import { requireStripeStoryBillingConfig } from '#app/utils/stripe-story-billing.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	const { webhookSecret } = requireStripeStoryBillingConfig()
	if (!webhookSecret) {
		return json({ error: 'Stripe webhook is not configured' }, { status: 501 })
	}

	// TODO: verify Stripe-Signature and update StorySubscription from
	// checkout.session.completed, customer.subscription.updated, and
	// customer.subscription.deleted events.
	await request.text()
	return json({ received: true, implemented: false }, { status: 202 })
}
