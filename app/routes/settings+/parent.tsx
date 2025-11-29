import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'

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

    return json({ settings, story, progress })
}

export async function action({ request }: ActionFunctionArgs) {
    const userId = await requireUserId(request)
    const formData = await request.formData()
    const intent = formData.get('intent')

    if (intent === 'updateSettings') {
        const maxChaptersToPlay = Number(formData.get('maxChaptersToPlay'))
        const showFullControls = formData.get('showFullControls') === 'on'

        await prisma.parentSettings.upsert({
            where: { userId },
            update: { maxChaptersToPlay, showFullControls },
            create: { userId, maxChaptersToPlay, showFullControls }
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

export default function ParentSettings() {
    const { settings, story, progress } = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto p-6 max-w-md">
            <div className="flex items-center mb-6">
                {story && (
                    <Link to={`/stories/${story.id}`} className="mr-4 text-orange-600 hover:text-orange-800">
                        <Icon name="arrow-left" className="h-6 w-6" />
                    </Link>
                )}
                <h1 className="text-2xl font-bold">Parent Settings</h1>
            </div>

            <Form method="POST" className="space-y-6 mb-8 border-b pb-8">
                <input type="hidden" name="intent" value="updateSettings" />
                <div className="space-y-2">
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
                    <p className="text-sm text-muted-foreground ml-6">
                        Enables seek bar and chapter skip buttons.
                    </p>
                </div>

                <Button type="submit">Save Global Settings</Button>
            </Form>

            {story && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="rounded-lg bg-orange-50 p-4 border border-orange-100">
                        <h2 className="text-lg font-semibold text-orange-900 mb-4">
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
