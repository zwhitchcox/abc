import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const stories = await prisma.story.findMany({
		select: {
			id: true,
			title: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
				take: 1,
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return json({ stories })
}

export default function StoriesIndex() {
	const { stories } = useLoaderData<typeof loader>()

	return (
		<div className="min-h-screen bg-orange-50 dark:bg-stone-950 p-8 transition-colors">
			<h1 className="mb-8 text-4xl font-extrabold text-orange-800 dark:text-orange-100 text-center font-comic">
				My Audiobooks
			</h1>

			{stories.length === 0 ? (
				<div className="text-center text-xl text-gray-500 dark:text-stone-400">
					No stories yet! Ask your parent to upload some.
				</div>
			) : (
				<div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
					{stories.map((story) => (
						<Link
							key={story.id}
							to={`/stories/${story.id}`}
							className="group relative aspect-square overflow-hidden rounded-3xl border-4 border-white dark:border-stone-800 shadow-xl transition-transform hover:scale-105 hover:rotate-1"
						>
							{story.images[0] ? (
								<img
									src={`/resources/story-images/${story.images[0].id}`}
									alt={story.images[0].altText ?? story.title}
									className="h-full w-full object-cover"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-orange-200 dark:bg-stone-800 text-orange-800 dark:text-orange-200">
									<span className="text-2xl font-bold">{story.title}</span>
								</div>
							)}
							<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
								{/* Hover effect overlay */}
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
