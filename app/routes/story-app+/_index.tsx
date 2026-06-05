import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const [children, stories] = await Promise.all([
		prisma.childProfile.findMany({
			where: { ownerId: userId },
			include: { _count: { select: { words: true, stories: true } } },
			orderBy: { createdAt: 'desc' },
		}),
		prisma.generatedStory.findMany({
			where: { ownerId: userId },
			select: {
				id: true,
				title: true,
				status: true,
				pageCount: true,
				estimatedCostCents: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
			take: 8,
		}),
	])
	return json({ children, stories })
}

export default function StoryAppIndex() {
	const { children, stories } = useLoaderData<typeof loader>()
	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
			<section className="rounded-lg border bg-white p-6 shadow-sm">
				<div className="mb-5 flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold">Stories</h1>
						<p className="text-sm text-slate-600">
							Create books from a child&apos;s known word list or supplied text.
						</p>
					</div>
					<Link
						to="/story-app/new"
						className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
					>
						New story
					</Link>
				</div>
				<div className="divide-y">
					{stories.length ? (
						stories.map((story) => (
							<Link
								key={story.id}
								to={`/story-app/stories/${story.id}`}
								className="flex items-center justify-between gap-4 py-4 hover:bg-slate-50"
							>
								<div>
									<p className="font-semibold">{story.title}</p>
									<p className="text-sm text-slate-600">
										{story.pageCount} pages · {story.status}
									</p>
								</div>
								<p className="text-sm text-slate-600">
									${(story.estimatedCostCents / 100).toFixed(2)}
								</p>
							</Link>
						))
					) : (
						<p className="py-8 text-center text-slate-600">
							No generated stories yet.
						</p>
					)}
				</div>
			</section>
			<aside className="rounded-lg border bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-lg font-bold">Children</h2>
				<div className="space-y-3">
					{children.length ? (
						children.map((child) => (
							<div key={child.id} className="rounded-md bg-slate-50 p-3">
								<p className="font-semibold">{child.name}</p>
								<p className="text-sm text-slate-600">
									{child._count.words} words · {child._count.stories} stories
								</p>
							</div>
						))
					) : (
						<p className="text-sm text-slate-600">
							Add a child profile and known words to start.
						</p>
					)}
				</div>
			</aside>
		</div>
	)
}
