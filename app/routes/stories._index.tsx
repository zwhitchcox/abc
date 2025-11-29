import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'
import { cn } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url)
    const filter = url.searchParams.get('filter') || 'all'

    const where = filter !== 'all' ? { type: filter } : {}

	const stories = await prisma.story.findMany({
        where,
		select: {
			id: true,
			title: true,
            type: true,
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

	return json({ stories, filter })
}

export default function StoriesIndex() {
	const { stories, filter } = useLoaderData<typeof loader>()

	return (
		<div className="min-h-screen bg-orange-50 dark:bg-stone-950 p-8 transition-colors">
			<h1 className="mb-8 text-4xl font-extrabold text-orange-800 dark:text-orange-100 text-center font-comic">
				My Stories
			</h1>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-4 mb-8">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'audiobook', label: 'Audiobooks' },
                    { id: 'readaloud', label: 'Read Alouds' },
                ].map((tab) => (
                    <Link
                        key={tab.id}
                        to={tab.id === 'all' ? '.' : `?filter=${tab.id}`}
                        className={cn(
                            "px-6 py-2 rounded-full font-bold transition-all shadow-sm",
                            filter === tab.id
                                ? "bg-orange-500 text-white shadow-md scale-105"
                                : "bg-white dark:bg-stone-800 text-orange-700 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-stone-700"
                        )}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

			{stories.length === 0 ? (
				<div className="text-center text-xl text-gray-500 dark:text-stone-400">
					No stories found. Ask your parent to upload some!
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
									<span className="text-2xl font-bold p-4 text-center">{story.title}</span>
								</div>
							)}
							<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
								{/* Hover effect overlay */}
							</div>
                            {/* Type Badge */}
                            {story.type === 'readaloud' && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                    VIDEO
                                </div>
                            )}
                            {story.type === 'audiobook' && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                    AUDIO
                                </div>
                            )}
						</Link>
					))}
				</div>
			)}
		</div>
	)
}
