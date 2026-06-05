import {
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { createStorySubscriptionCheckout } from '#app/utils/stripe-story-billing.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return null
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const checkoutUrl = await createStorySubscriptionCheckout({
		userId,
		origin: new URL(request.url).origin,
	})
	return redirect(checkoutUrl)
}

export default function StoryBillingRoute() {
	return (
		<div className="mx-auto max-w-xl rounded-lg border bg-white p-6 shadow-sm">
			<h1 className="text-2xl font-bold">Story App subscription</h1>
			<p className="mt-2 text-slate-600">
				The planned subscription is $20/month with an included generation budget
				designed to keep at least $10 margin before extra credits are needed.
			</p>
			<Form method="post" className="mt-6">
				<button className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
					Start checkout
				</button>
			</Form>
		</div>
	)
}
