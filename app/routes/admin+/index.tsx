import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useSubmit, useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { cn } from '#app/utils/misc.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'all'

    let usageWhere = {}
    if (period === 'day') {
        const d = new Date()
        d.setHours(0,0,0,0)
        usageWhere = { createdAt: { gte: d } }
    } else if (period === 'week') {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        usageWhere = { createdAt: { gte: d } }
    }

    const [storyCount, tagCount, recentStories, totalUsage, lastActivity] = await Promise.all([
        prisma.story.count(),
        prisma.tag.count(),
        prisma.story.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, type: true, createdAt: true, images: { take: 1, select: { id: true, updatedAt: true } } }
        }),
        prisma.usageLog.aggregate({ _sum: { secondsPlayed: true }, where: usageWhere }),
        prisma.storyProgress.findFirst({
            orderBy: { updatedAt: 'desc' },
            include: {
                story: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        images: { take: 1, select: { id: true, updatedAt: true } },
                        chapters: {
                            select: { id: true, title: true, order: true },
                            orderBy: { order: 'asc' }
                        }
                    }
                },
                user: { select: { username: true, name: true } }
            }
        })
    ])

    const totalSeconds = totalUsage._sum.secondsPlayed || 0

    // Check activity status
    const diff = lastActivity ? Date.now() - new Date(lastActivity.updatedAt).getTime() : Infinity
    const isRecentlyActive = diff < 30 * 1000 // 30 seconds buffer

    let status = 'Idle'
    let isLive = false

    if (isRecentlyActive && lastActivity) {
        if (lastActivity.isPlaying) {
            status = 'Playing Now'
            isLive = true
        } else {
            status = 'Paused'
        }
    }

    return json({ storyCount, tagCount, recentStories, totalSeconds, lastActivity, isLive, status, period })
}

export default function AdminDashboard() {
    const { storyCount, tagCount, recentStories, totalSeconds, lastActivity, isLive, status, period } = useLoaderData<typeof loader>()
    const submit = useSubmit()
    const { revalidate } = useRevalidator()

    // Auto-refresh for Playing Now status
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                revalidate()
            }
        }, 5000)
        return () => clearInterval(interval)
    }, [revalidate])

    // Helper to format timestamp
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        if (h > 0) return `${h}h ${m}m`
        return `${m}m`
    }

    const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const formData = new FormData()
        formData.set('period', e.target.value)
        submit(formData, { method: 'get', replace: true })
    }

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-stone-800 dark:text-stone-100">Dashboard</h1>

            {/* Last Activity Banner */}
            {lastActivity && (
                 <div className={cn(
                     "mb-10 p-6 rounded-2xl border shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center gap-6",
                     isLive
                        ? "bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-gradient-to-r from-stone-50 to-stone-100 dark:from-stone-800 dark:to-stone-900 border-stone-200 dark:border-stone-700"
                 )}>
                    {/* Cover */}
                    <div className="h-24 w-24 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-black/10 shadow-md relative">
                         {lastActivity.story.images[0] ? (
                             <img src={`/resources/story-images/${lastActivity.story.images[0].id}?t=${new Date(lastActivity.story.images[0].updatedAt).getTime()}`} alt="" className="h-full w-full object-cover" />
                         ) : (
                             <div className="flex h-full w-full items-center justify-center text-stone-400"><Icon name="file-text" className="h-8 w-8" /></div>
                         )}
                         <div className="absolute bottom-0 right-0 p-1 bg-black/50 rounded-tl text-white">
                            <Icon name={lastActivity.story.type === 'readaloud' ? 'camera' : 'file-text'} className="h-3 w-3" />
                         </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {status === 'Playing Now' ? (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full animate-pulse">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                    Playing Now
                                </span>
                            ) : status === 'Paused' ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/50 px-2 py-0.5 rounded-full">
                                    Paused
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-full">
                                    Idle
                                </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                                • {status === 'Playing Now' ? 'Active just now' : `Last active ${new Date(lastActivity.updatedAt).toLocaleString()}`}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 truncate">{lastActivity.story.title}</h2>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-stone-600 dark:text-stone-400">
                             <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md border border-black/5">
                                 <Icon name="list" className="h-3.5 w-3.5 opacity-70" />
                                 <span className="truncate max-w-[200px]">
                                    Ch {lastActivity.currentChapterIndex + 1}: {lastActivity.story.chapters[lastActivity.currentChapterIndex]?.title || 'Unknown'}
                                 </span>
                             </span>
                             <span className="flex items-center gap-1.5 bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md border border-black/5 font-mono">
                                 <Icon name="clock" className="h-3.5 w-3.5 opacity-70" />
                                 {formatTime(lastActivity.currentTime)}
                             </span>
                             <span className="text-xs text-muted-foreground">User: {lastActivity.user.name || lastActivity.user.username}</span>
                        </div>
                    </div>

                    <Button asChild variant="secondary" className="shrink-0 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 hover:bg-orange-50 dark:hover:bg-stone-700 shadow-sm">
                         <Link to={`/stories/${lastActivity.storyId}`}>
                            <Icon name="play" className="mr-2 h-4 w-4 text-orange-600" />
                            Resume
                         </Link>
                    </Button>
                 </div>
            )}

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
                 <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                            <Icon name="clock" className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-muted-foreground">Playtime</p>
                                <select
                                    value={period}
                                    onChange={handlePeriodChange}
                                    className="text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 border-none rounded px-1 py-0.5 cursor-pointer focus:ring-0 text-stone-600"
                                >
                                    <option value="all">All Time</option>
                                    <option value="week">Week</option>
                                    <option value="day">Day</option>
                                </select>
                            </div>
                            <h3 className="text-3xl font-bold">{formatDuration(totalSeconds)}</h3>
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

                                 <div className="grid grid-rows-3 gap-4">
                                     <Link to="/admin/parent" className="group p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md rounded-2xl transition-all flex items-center gap-4">
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full">
                                            <Icon name="lock-closed" className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                    <span className="block font-bold text-stone-800 dark:text-stone-100">Parent Settings</span>
                                    <span className="text-xs text-muted-foreground">Volume & Controls</span>
                                </div>
                             </Link>
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
                                        <Icon name={story.type === 'readaloud' ? 'camera' : 'file-text'} className="h-5 w-5 text-stone-500" />
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
