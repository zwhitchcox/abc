import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	invariantResponse(params.storyId, 'Story ID is required', { status: 400 })
	const story = await prisma.generatedStory.findFirst({
		where: { id: params.storyId, ownerId: userId },
		include: {
			child: { select: { name: true } },
			pages: { orderBy: { pageNumber: 'asc' } },
			usage: { orderBy: { createdAt: 'desc' } },
		},
	})
	invariantResponse(story, 'Story not found', { status: 404 })
	return json({ story })
}

export default function GeneratedStoryRoute() {
	const { story } = useLoaderData<typeof loader>()
	const words = JSON.parse(story.wordList) as string[]
	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
			<section className="rounded-lg border bg-white p-6 shadow-sm">
				<div className="mb-5 flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold">{story.title}</h1>
						<p className="text-sm text-slate-600">
							{story.pageCount} pages · {story.status}
							{story.child ? ` · ${story.child.name}` : ''}
						</p>
					</div>
					<Link
						to="/story-app/new"
						className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
					>
						New story
					</Link>
				</div>
				<div className="space-y-4">
					{story.pages.map((page) => (
						<article key={page.id} className="rounded-md border bg-slate-50 p-4">
							<p className="mb-2 text-sm font-bold text-slate-500">
								Page {page.pageNumber}
							</p>
							<p className="text-lg font-semibold">{page.text}</p>
							<p className="mt-3 text-sm text-slate-600">{page.imagePrompt}</p>
						</article>
					))}
				</div>
			</section>
			<aside className="rounded-lg border bg-white p-6 shadow-sm">
				<h2 className="text-lg font-bold">Generation plan</h2>
				<dl className="mt-4 space-y-3 text-sm">
					<div className="flex justify-between gap-4">
						<dt className="text-slate-600">Estimated cost</dt>
						<dd className="font-semibold">
							${(story.estimatedCostCents / 100).toFixed(2)}
						</dd>
					</div>
					<div className="flex justify-between gap-4">
						<dt className="text-slate-600">Actual cost</dt>
						<dd className="font-semibold">
							${(story.actualCostCents / 100).toFixed(2)}
						</dd>
					</div>
					<div>
						<dt className="text-slate-600">Words</dt>
						<dd className="mt-1 leading-6">{words.join(', ') || 'None'}</dd>
					</div>
				</dl>
				<div className="mt-6 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
					OpenAI image generation is intentionally server-side only. This draft
					screen is the handoff point for a background generation worker.
				</div>
			</aside>
		</div>
	)
}
