import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { ThemeSwitch, useOptionalTheme } from '#app/routes/resources+/theme-switch.tsx'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { toast } from 'sonner'

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

const ACTIVITIES = [
    { name: 'Home', path: '/' },
    { name: 'Stories', path: '/stories' },
    { name: 'Picture Books', path: '/pdf-stories' },
    { name: 'Flashcards', path: '/flashcards' },
    { name: 'ABC', path: '/abc' },
    { name: 'Words', path: '/words' },
    { name: 'Colors', path: '/colors' },
]

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
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

    return json({ settings, story, progress, usageWithDetails, origin: new URL(request.url).origin })
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const userId = await requireUserId(request)
    const formData = await request.formData()
    const intent = formData.get('intent')

    if (intent === 'updateSettings') {
        const maxChaptersToPlay = Number(formData.get('maxChaptersToPlay'))
        const showFullControls = formData.get('showFullControls') === 'on'
        const timeZone = String(formData.get('timeZone'))
        const maxVolume = Number(formData.get('maxVolume'))
        const pinCode = String(formData.get('pinCode')).slice(0, 4)

        const globalLimitMinutes = Number(formData.get('globalLimitMinutes'))
        const globalIntervalHours = Number(formData.get('globalIntervalHours'))
        const globalLimitSeconds = globalLimitMinutes > 0 ? globalLimitMinutes * 60 : null
        const globalIntervalSeconds = globalIntervalHours > 0 ? globalIntervalHours * 3600 : 86400

        // Audiobooks
        const audiobookLimitMinutes = Number(formData.get('audiobookLimitMinutes'))
        const audiobookIntervalHours = Number(formData.get('audiobookIntervalHours'))
        const audiobookRestrictedStart = formData.get('audiobookRestrictedStart') ? Number(formData.get('audiobookRestrictedStart')) : null
        const audiobookRestrictedEnd = formData.get('audiobookRestrictedEnd') ? Number(formData.get('audiobookRestrictedEnd')) : null
        const audiobookLimitSeconds = audiobookLimitMinutes > 0 ? audiobookLimitMinutes * 60 : null
        const audiobookIntervalSeconds = audiobookIntervalHours > 0 ? audiobookIntervalHours * 3600 : 86400

        // Readalouds
        const readaloudLimitMinutes = Number(formData.get('readaloudLimitMinutes'))
        const readaloudIntervalHours = Number(formData.get('readaloudIntervalHours'))
        const readaloudRestrictedStart = formData.get('readaloudRestrictedStart') ? Number(formData.get('readaloudRestrictedStart')) : null
        const readaloudRestrictedEnd = formData.get('readaloudRestrictedEnd') ? Number(formData.get('readaloudRestrictedEnd')) : null
        const readaloudLimitSeconds = readaloudLimitMinutes > 0 ? readaloudLimitMinutes * 60 : null
        const readaloudIntervalSeconds = readaloudIntervalHours > 0 ? readaloudIntervalHours * 3600 : 86400

        await prisma.parentSettings.upsert({
            where: { userId },
            update: {
                maxChaptersToPlay, showFullControls, timeZone, maxVolume, pinCode,
                globalLimitSeconds, globalIntervalSeconds,
                audiobookLimitSeconds, audiobookIntervalSeconds, audiobookRestrictedStart, audiobookRestrictedEnd,
                readaloudLimitSeconds, readaloudIntervalSeconds, readaloudRestrictedStart, readaloudRestrictedEnd
            },
            create: {
                userId, maxChaptersToPlay, showFullControls, timeZone, maxVolume, pinCode: pinCode || '0000',
                globalLimitSeconds, globalIntervalSeconds,
                audiobookLimitSeconds, audiobookIntervalSeconds, audiobookRestrictedStart, audiobookRestrictedEnd,
                readaloudLimitSeconds, readaloudIntervalSeconds, readaloudRestrictedStart, readaloudRestrictedEnd
            }
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
    const { settings, story, progress, usageWithDetails, origin } = useLoaderData<typeof loader>()
    const theme = useOptionalTheme()
    const [selectedActivity, setSelectedActivity] = useState(ACTIVITIES[0].path)

    const copyLockLink = () => {
        const url = `${origin}${selectedActivity}?lock=true`
        navigator.clipboard.writeText(url)
        toast.success('Locked URL copied to clipboard')
    }

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
                    <Label htmlFor="pinCode">Parent PIN Code</Label>
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            id="pinCode"
                            name="pinCode"
                            defaultValue={settings?.pinCode ?? '0000'}
                            maxLength={4}
                            minLength={4}
                            className="font-mono text-lg tracking-widest text-center"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        4-digit PIN to access the parent menu. Default is 0000.
                    </p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <select
                        id="timeZone"
                        name="timeZone"
                        defaultValue={settings?.timeZone || 'UTC'}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
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
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center">
                         <Label htmlFor="maxVolume">Max Volume Limit</Label>
                         <span className="text-sm font-mono font-bold text-orange-600">{settings?.maxVolume ?? 100}%</span>
                    </div>
                    <input
                        type="range"
                        id="maxVolume"
                        name="maxVolume"
                        min="0"
                        max="100"
                        defaultValue={settings?.maxVolume ?? 100}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        onChange={(e) => {
                             const span = e.target.parentElement?.querySelector('span');
                             if (span) span.textContent = e.target.value + '%';
                        }}
                    />
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-medium text-sm">Lock to Activity</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                        Generate a link that locks the interface to a specific activity.
                    </p>
                    <div className="flex gap-2">
                        <select
                            value={selectedActivity}
                            onChange={(e) => setSelectedActivity(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            {ACTIVITIES.map(a => <option key={a.path} value={a.path}>{a.name}</option>)}
                        </select>
                        <Button type="button" onClick={copyLockLink} variant="outline" className="shrink-0">
                            Copy Link
                        </Button>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                    <h3 className="font-medium text-sm">Global Time Limit</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <Label htmlFor="globalLimitMinutes">Limit (Minutes)</Label>
                             <Input
                                type="number"
                                id="globalLimitMinutes"
                                name="globalLimitMinutes"
                                defaultValue={settings?.globalLimitSeconds ? Math.floor(settings.globalLimitSeconds / 60) : ''}
                                placeholder="Unlimited"
                                min="0"
                            />
                        </div>
                        <div>
                             <Label htmlFor="globalIntervalHours">Reset Every (Hours)</Label>
                             <Input
                                type="number"
                                id="globalIntervalHours"
                                name="globalIntervalHours"
                                defaultValue={settings?.globalIntervalSeconds ? Math.floor(settings.globalIntervalSeconds / 3600) : 24}
                                min="1"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
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
