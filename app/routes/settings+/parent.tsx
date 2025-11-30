import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { ThemeSwitch, useOptionalTheme } from '#app/routes/resources+/theme-switch.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney"
]

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await requireUserId(request)
    const url = new URL(request.url)
    const storyId = url.searchParams.get('storyId')

    const settings = await prisma.parentSettings.findUnique({
        where: { userId }
    })

    let story = null
    let progress = null

    if (storyId) {
        story = await prisma.story.findUnique({
            where: { id: storyId },
            include: { chapters: { orderBy: { order: 'asc' } } }
        })
        if (story) {
            progress = await prisma.storyProgress.findUnique({
                where: { userId_storyId: { userId, storyId } }
            })
        }
    }

    // Fetch Usage Stats for Today using UsageLog
    const now = new Date()
    const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const logs = await prisma.usageLog.findMany({
        where: {
            userId,
            createdAt: { gt: windowStart }
        },
        include: { story: { select: { title: true, type: true } } }
    })

    const usageMap = new Map<string, { seconds: number, title: string, type: string }>()

    for (const log of logs) {
        const existing = usageMap.get(log.storyId) || { seconds: 0, title: log.story.title, type: log.story.type }
        existing.seconds += log.secondsPlayed
        usageMap.set(log.storyId, existing)
    }

    const usageWithDetails = Array.from(usageMap.entries()).map(([storyId, data]) => ({
        storyId,
        secondsPlayed: data.seconds,
        title: data.title,
        type: data.type
    }))

    return json({ settings, story, progress, usageWithDetails })
}

export async function action({ request }: ActionFunctionArgs) {
    const userId = await requireUserId(request)
    const formData = await request.formData()
    const intent = formData.get('intent')

    if (intent === 'updateSettings') {
        const maxChaptersToPlay = Number(formData.get('maxChaptersToPlay'))
        const showFullControls = formData.get('showFullControls') === 'on'
        const timeZone = String(formData.get('timeZone'))

        await prisma.parentSettings.upsert({
            where: { userId },
            update: { maxChaptersToPlay, showFullControls, timeZone },
            create: { userId, maxChaptersToPlay, showFullControls, timeZone }
        })
        return json({ success: true })
    }

    if (intent === 'updateProgress') {
        const storyId = String(formData.get('storyId'))
        const chapterIndex = Number(formData.get('chapterIndex'))

        await prisma.storyProgress.upsert({
            where: { userId_storyId: { userId, storyId } },
            update: { currentChapterIndex: chapterIndex, currentTime: 0 },
            create: { userId, storyId, currentChapterIndex: chapterIndex, currentTime: 0 }
        })
        return json({ success: true })
    }

    return json({ error: 'Invalid intent' }, { status: 400 })
}

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    return `${m} mins`
}

export default function ParentSettings() {
    const { settings, story, progress, usageWithDetails } = useLoaderData<typeof loader>()
    const theme = useOptionalTheme()

    return (
        <div className="container mx-auto p-6 max-w-md pb-20">
            <div className="flex items-center mb-6">
                {story ? (
                    <Link to={`/stories/${story.id}`} className="mr-4 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300">
                        <Icon name="arrow-left" className="h-6 w-6" />
                    </Link>
                ) : (
                    <Link to={`/stories`} className="mr-4 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300">
                        <Icon name="arrow-left" className="h-6 w-6" />
                    </Link>
                )}
                <h1 className="text-2xl font-bold">Parent Settings</h1>
            </div>

            <Form method="POST" className="space-y-6 mb-8 border-b pb-8">
                <input type="hidden" name="intent" value="updateSettings" />

                <div className="space-y-2">
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <select
                        id="timeZone"
                        name="timeZone"
                        defaultValue={settings?.timeZone || 'UTC'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                    <p className="text-xs text-muted-foreground">
                        Used for scheduling restricted hours.
                    </p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="maxChaptersToPlay">Max Chapters to Play Consecutively</Label>
                    <Input
                        type="number"
                        id="maxChaptersToPlay"
                        name="maxChaptersToPlay"
                        defaultValue={settings?.maxChaptersToPlay ?? 1}
                        min={1}
                        max={100}
                    />
                    <p className="text-sm text-muted-foreground">
                        Set to 1 to pause after every chapter.
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="showFullControls"
                            name="showFullControls"
                            defaultChecked={settings?.showFullControls ?? false}
                        />
                        <Label htmlFor="showFullControls">Show Full Player Controls</Label>
                    </div>
                </div>

                <Button type="submit" className="w-full">Save Global Settings</Button>
            </Form>

            {/* Usage Stats */}
            <div className="space-y-4 mb-8 border-b pb-8">
                <h3 className="font-semibold text-lg">Usage Today</h3>
                {usageWithDetails.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No usage recorded today.</p>
                ) : (
                    <div className="space-y-2">
                        {usageWithDetails.map(u => (
                            <div key={u.storyId} className="flex justify-between text-sm p-2 bg-slate-50 dark:bg-slate-900 rounded">
                                <span className="truncate pr-2">{u.title}</span>
                                <span className="font-mono whitespace-nowrap">{formatDuration(u.secondsPlayed)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-4 border-b pb-8 mb-8">
                <Label>App Theme</Label>
                <div className="flex items-center gap-4">
                    <ThemeSwitch userPreference={theme} />
                </div>
            </div>

            {story && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-lg bg-orange-50 p-4 border border-orange-100 dark:bg-stone-900 dark:border-stone-800">
                        <h2 className="text-lg font-semibold text-orange-900 mb-4 dark:text-orange-100">
                            Settings for: <span className="italic">{story.title}</span>
                        </h2>
                        <Form method="POST" className="space-y-4">
                            <input type="hidden" name="intent" value="updateProgress" />
                            <input type="hidden" name="storyId" value={story.id} />

                            <div className="space-y-2">
                                <Label htmlFor="chapterIndex">Set Current Chapter</Label>
                                <select
                                    id="chapterIndex"
                                    name="chapterIndex"
                                    defaultValue={progress?.currentChapterIndex ?? 0}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {story.chapters.map((chapter: any, index: number) => (
                                        <option key={chapter.id} value={index}>
                                            {index + 1}. {chapter.title}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    Setting the chapter will reset playback to the beginning of that chapter.
                                </p>
                            </div>
                            <Button type="submit" variant="secondary" className="w-full">
                                Update Progress
                            </Button>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    )
}
