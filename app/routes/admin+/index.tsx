import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { Icon } from '#app/components/ui/icon.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')

    const [storyCount, tagCount, recentStories, totalUsage] = await Promise.all([
        prisma.story.count(),
        prisma.tag.count(),
        prisma.story.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, type: true, createdAt: true }
        }),
        prisma.usageLog.aggregate({ _sum: { secondsPlayed: true } })
    ])

    const totalHours = Math.round((totalUsage._sum.secondsPlayed || 0) / 3600)

    return json({ storyCount, tagCount, recentStories, totalHours })
}

export default function AdminDashboard() {
    const { storyCount, tagCount, recentStories, totalHours } = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-stone-800 dark:text-stone-100">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Stats Cards */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                            <Icon name="file-text" className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Stories</p>
                            <h3 className="text-3xl font-bold">{storyCount}</h3>
                        </div>
                     </div>
                </div>
                 <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                            <Icon name="list" className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Tags</p>
                            <h3 className="text-3xl font-bold">{tagCount}</h3>
                        </div>
                     </div>
                </div>
                 <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            <Icon name="clock" className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Playtime</p>
                            <h3 className="text-3xl font-bold">{totalHours}h</h3>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <Link to="/admin/stories/new" className="group p-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center text-center">
                            <div className="p-3 bg-white/20 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <Icon name="plus" className="h-8 w-8" />
                            </div>
                            <span className="text-lg font-bold">Upload New Story</span>
                            <span className="text-sm text-white/80 mt-1">Add audiobook or video</span>
                         </Link>

                         <div className="grid grid-rows-2 gap-4">
                             <Link to="/admin/tags" className="group p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md rounded-2xl transition-all flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">
                                    <Icon name="list" className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-stone-800 dark:text-stone-100">Manage Tags</span>
                                    <span className="text-xs text-muted-foreground">Organize & Limit</span>
                                </div>
                             </Link>
                              <Link to="/admin/stories" className="group p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md rounded-2xl transition-all flex items-center gap-4">
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full">
                                    <Icon name="file-text" className="h-6 w-6" />
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-stone-800 dark:text-stone-100">Manage Stories</span>
                                    <span className="text-xs text-muted-foreground">Edit & Delete</span>
                                </div>
                             </Link>
                         </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-stone-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Recent Uploads</h2>
                        <Link to="/admin/stories" className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:hover:text-orange-400">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {recentStories.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No stories found.</div>
                        ) : (
                            recentStories.map(story => (
                                <Link
                                    key={story.id}
                                    to={`/admin/stories/${story.id}`}
                                    className="flex items-center gap-3 p-3 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                                >
                                    <div className="h-10 w-10 bg-stone-100 dark:bg-stone-800 rounded-lg flex items-center justify-center shrink-0">
                                        <Icon name={story.type === 'readaloud' ? 'laptop' : 'file-text'} className="h-5 w-5 text-stone-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate text-stone-800 dark:text-stone-100">{story.title}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(story.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Icon name="pencil-1" className="h-4 w-4 text-stone-400" />
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
