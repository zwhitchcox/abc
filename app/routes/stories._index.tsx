import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { useState, useEffect } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import { getUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { cn } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await getUserId(request)

    const tags = await prisma.tag.findMany({
        include: {
            stories: {
                include: {
                    images: { take: 1 },
                    tags: { select: { id: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: { name: 'asc' }
    })

    const uncategorizedStories = await prisma.story.findMany({
        where: { tags: { none: {} } },
        include: {
            images: { take: 1 },
            tags: { select: { id: true } }
        },
        orderBy: { createdAt: 'desc' }
    })

    const parentSettings = userId ? await prisma.parentSettings.findUnique({ where: { userId } }) : null
    const timeZone = parentSettings?.timeZone || 'UTC'

    const tagStatus: Record<string, { restricted: boolean, availableAt: string | null, reason?: string }> = {}

    if (userId) {
        const now = new Date()

        for (const tag of tags) {
            // 1. Availability Check
            if (!tag.enabled) {
                tagStatus[tag.id] = { restricted: true, availableAt: null, reason: 'Disabled' }
                continue
            }

            // 2. Time Restriction Check
            if (tag.restrictedHoursStart !== null && tag.restrictedHoursEnd !== null) {
                try {
                    const formatter = new Intl.DateTimeFormat('en-US', {
                        timeZone,
                        hour: 'numeric',
                        hour12: false
                    })
                    const hourStr = formatter.format(now)
                    const hour = parseInt(hourStr) % 24

                    let inRange = false
                    if (tag.restrictedHoursStart < tag.restrictedHoursEnd) {
                        inRange = hour >= tag.restrictedHoursStart && hour < tag.restrictedHoursEnd
                    } else if (tag.restrictedHoursStart > tag.restrictedHoursEnd) {
                         inRange = hour >= tag.restrictedHoursStart || hour < tag.restrictedHoursEnd
                    }

                    if (inRange) {
                        tagStatus[tag.id] = { restricted: true, availableAt: null, reason: 'Restricted Hours' }
                        continue
                    }
                } catch (e) {
                    console.error('Timezone check failed:', e)
                }
            }

            // 3. Usage Limits Check
            if (tag.limitSeconds) {
                const windowStart = new Date(now.getTime() - tag.intervalSeconds * 1000)

                const logs = await prisma.usageLog.findMany({
                    where: {
                        userId,
                        story: { tags: { some: { id: tag.id } } },
                        createdAt: { gt: windowStart }
                    },
                    orderBy: { createdAt: 'asc' }
                })

                const total = logs.reduce((acc, log) => acc + log.secondsPlayed, 0)

                if (total >= tag.limitSeconds) {
                    const oldest = logs[0]
                    const availableAt = oldest ? new Date(oldest.createdAt.getTime() + tag.intervalSeconds * 1000) : null
                    tagStatus[tag.id] = {
                        restricted: true,
                        availableAt: availableAt ? availableAt.toISOString() : null,
                        reason: 'Limit Reached'
                    }
                }
            }
        }
    }

    return json({ tags, uncategorizedStories, tagStatus })
}

function CountdownOverlay({ availableAt, reason }: { availableAt: string | null, reason?: string }) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!availableAt) return

        const target = new Date(availableAt).getTime()

        const update = () => {
            const now = Date.now()
            const diff = target - now
            if (diff <= 0) {
                setTimeLeft('Ready!')
                return
            }

            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)

            setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [availableAt])

    if (!availableAt) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-white p-4 backdrop-blur-sm z-10">
                <Icon name="lock-closed" className="h-12 w-12 mb-2 text-white/80" />
                <span className="text-xl font-bold font-mono uppercase text-center">{reason || 'Locked'}</span>
            </div>
        )
    }

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white p-4 backdrop-blur-sm z-10">
            <Icon name="clock" className="h-12 w-12 mb-2 text-white/80" />
            <span className="text-xl font-bold font-mono">{timeLeft}</span>
            <span className="text-xs text-white/70 mt-1 uppercase tracking-widest">{reason || 'Locked'}</span>
        </div>
    )
}

function StoryCard({ story, tagStatus }: { story: any, tagStatus: Record<string, { restricted: boolean, availableAt: string | null, reason?: string }> }) {
    let isRestricted = true
    let restrictionReason = 'No Tags'
    let restrictionAvailableAt: string | null = null

    if (story.tags.length > 0) {
        // Permissive Mode: Access granted if ANY tag is open (not restricted)
        const openTag = story.tags.find((tag: any) => !tagStatus[tag.id]?.restricted)

        if (openTag) {
            isRestricted = false
            restrictionReason = ''
        } else {
            // All tags restricted. Pick status from first tag as representative
            const firstStatus = tagStatus[story.tags[0].id]
            restrictionReason = firstStatus?.reason || 'Restricted'
            restrictionAvailableAt = firstStatus?.availableAt || null
        }
    }

    return (
        <Link
            to={isRestricted ? '#' : `/stories/${story.id}`}
            onClick={(e) => isRestricted && e.preventDefault()}
            className={cn(
                "group relative aspect-square overflow-hidden rounded-3xl border-4 shadow-xl transition-all",
                isRestricted
                    ? "border-gray-300 dark:border-stone-700 grayscale cursor-not-allowed"
                    : "border-white dark:border-stone-800 hover:scale-105 hover:rotate-1 cursor-pointer"
            )}
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

            {/* Badges */}
            {!isRestricted && (
                <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10" />
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
                </>
            )}

            {isRestricted && (
                <CountdownOverlay availableAt={restrictionAvailableAt} reason={restrictionReason} />
            )}
        </Link>
    )
}

export default function StoriesIndex() {
    const { tags, uncategorizedStories, tagStatus } = useLoaderData<typeof loader>()

    return (
        <div className="min-h-screen bg-orange-50 dark:bg-stone-950 p-8 transition-colors pb-32">
            <h1 className="mb-8 text-4xl font-extrabold text-orange-800 dark:text-orange-100 text-center font-comic">
                My Library
            </h1>

            <div className="space-y-12">
                {/* Tags Sections */}
                {tags.map(tag => {
                    if (tag.stories.length === 0) return null

                    const status = tagStatus[tag.id]

                    return (
                        <div key={tag.id}>
                            <div className="flex items-center gap-4 mb-4 px-4">
                                <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                                    {tag.name}
                                </h2>
                                {status?.restricted && (
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                        status?.reason === 'Disabled' ? "bg-gray-200 text-gray-700" : "bg-red-100 text-red-700"
                                    )}>
                                        {status?.reason || 'Restricted'}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                                {tag.stories.map(story => (
                                    <StoryCard
                                        key={story.id}
                                        story={story}
                                        tagStatus={tagStatus}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* Uncategorized (Always Restricted now) */}
                {uncategorizedStories.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-4 px-4">
                            Uncategorized (Restricted)
                        </h2>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                            {uncategorizedStories.map(story => (
                                <StoryCard key={story.id} story={story} tagStatus={tagStatus} />
                            ))}
                        </div>
                    </div>
                )}

                {tags.every(t => t.stories.length === 0) && uncategorizedStories.length === 0 && (
                    <div className="text-center text-xl text-gray-500 dark:text-stone-400 mt-12">
                        No stories found. Ask your parent to upload some!
                    </div>
                )}
            </div>
        </div>
    )
}
