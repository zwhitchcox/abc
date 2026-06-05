import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { getStoryAppUsageSummary } from '#app/utils/commercial-story-limits.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const usage = await getStoryAppUsageSummary(userId)
	return json({
		usage: {
			usedCostCents: usage.usedCostCents,
			availableCostCents: usage.availableCostCents,
			includedCostCents: usage.includedCostCents,
			extraCreditCents: usage.extraCreditCents,
			minimumGrossMarginCents: usage.minimumGrossMarginCents,
			subscriptionStatus: usage.subscription?.status ?? 'inactive',
		},
	})
}

export default function StoryAppLayout() {
	const { usage } = useLoaderData<typeof loader>()
	const location = useLocation()
	const links = [
		{ to: '/story-app', label: 'Dashboard' },
		{ to: '/story-app/words', label: 'Words' },
		{ to: '/story-app/new', label: 'New story' },
	]
	return (
		<div className="min-h-screen bg-slate-50 text-slate-950">
			<header className="border-b bg-white">
				<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
					<div>
						<Link to="/story-app" className="text-xl font-bold">
							Story App
						</Link>
						<p className="text-sm text-slate-600">
							Parent-guided picture books from known words.
						</p>
					</div>
					<nav className="flex flex-wrap gap-2">
						{links.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={
									location.pathname === link.to
										? 'rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white'
										: 'rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200'
								}
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>
				<div className="border-t bg-slate-100">
					<div className="mx-auto flex max-w-6xl flex-wrap gap-4 px-6 py-3 text-sm text-slate-700">
						<span>Subscription: {usage.subscriptionStatus}</span>
						<span>Used: ${(usage.usedCostCents / 100).toFixed(2)}</span>
						<span>
							Available: ${(usage.availableCostCents / 100).toFixed(2)}
						</span>
						<span>
							Target margin: ${(usage.minimumGrossMarginCents / 100).toFixed(2)}
						</span>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-6 py-8">
				<Outlet />
			</main>
		</div>
	)
}
