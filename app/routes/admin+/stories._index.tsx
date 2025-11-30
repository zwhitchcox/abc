import fs from 'node:fs'
import {
    json,
    type LoaderFunctionArgs,
    type ActionFunctionArgs,
} from '@remix-run/node'
import { Link, useLoaderData, useFetcher } from '@remix-run/react'
import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const stories = await prisma.story.findMany({
        select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
            _count: {
                select: { chapters: true },
            },
            images: {
                take: 1,
                select: { id: true, updatedAt: true }
            },
            tags: {
                select: { id: true, name: true }
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
    return json({ stories })
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const formData = await request.formData()
    const intent = formData.get('intent')
    const storyId = formData.get('storyId')

    if (typeof storyId !== 'string') {
        return json({ error: 'Invalid story ID' }, { status: 400 })
    }

    if (intent === 'delete') {
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            include: { audio: true },
        })

        if (!story) {
            return json({ error: 'Story not found' }, { status: 404 })
        }

        if (story.audio?.filepath) {
            try {
                await fs.promises.unlink(story.audio.filepath)
            } catch (e) {
                console.error('Error deleting audio file:', e)
            }
        }

        await prisma.story.delete({ where: { id: storyId } })
        return json({ success: true })
    }

    return json({ error: 'Invalid intent' }, { status: 400 })
}

export default function StoriesAdminRoute() {
    const { stories } = useLoaderData<typeof loader>()
    const [search, setSearch] = useState('')

    const filteredStories = stories.filter(story =>
        story.title.toLowerCase().includes(search.toLowerCase()) ||
        story.tags.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Manage Stories</h1>
                    <p className="text-muted-foreground mt-1">View, edit, and delete your library content.</p>
                </div>
                <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                    <Link to="new">
                        <Icon name="plus" className="mr-2 h-4 w-4" />
                        Upload New Story
                    </Link>
                </Button>
            </div>

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                    <div className="relative max-w-md">
                        <Icon name="magnifying-glass" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-700"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="divide-y divide-stone-200 dark:divide-stone-800">
                    {filteredStories.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center">
                            <div className="inline-flex p-4 bg-stone-100 dark:bg-stone-800 rounded-full mb-4 text-stone-400">
                                <Icon name="file-text" className="h-8 w-8" />
                            </div>
                            <p className="text-muted-foreground text-lg font-medium">No stories found.</p>
                            {search && <p className="text-sm text-muted-foreground mt-1">Try adjusting your search.</p>}
                        </div>
                    ) : (
                        filteredStories.map((story) => (
                            <div key={story.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-center gap-4 group">
                                {/* Thumbnail */}
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-200 dark:border-stone-700 relative">
                                            {story.images[0] ? (
                                                <img src={`/resources/story-images/${story.images[0].id}?t=${new Date(story.images[0].updatedAt).getTime()}`} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-stone-400">
                                                    <Icon name="camera" className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 right-0 p-0.5 bg-black/50 rounded-tl text-white">
                                        <Icon name={story.type === 'readaloud' ? 'camera' : 'file-text'} className="h-3 w-3" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg truncate text-stone-900 dark:text-stone-100 leading-none">{story.title}</h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <Icon name="list" className="h-3 w-3" />
                                            {story._count.chapters} Ch
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
                                        <span>{new Date(story.createdAt).toLocaleDateString()}</span>

                                        {story.tags.length > 0 && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-stone-300 dark:bg-stone-600" />
                                                <div className="flex gap-1">
                                                    {story.tags.map(tag => (
                                                        <span key={tag.id} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-medium uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                    <Button asChild size="sm" variant="secondary" className="h-8">
                                        <Link to={story.id}>
                                            <Icon name="pencil-1" className="h-3.5 w-3.5 mr-1.5" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <DeleteStoryButton storyId={story.id} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function DeleteStoryButton({ storyId }: { storyId: string }) {
    const fetcher = useFetcher()
    const isDeleting = fetcher.state !== 'idle'

    return (
        <fetcher.Form method="POST">
            <input type="hidden" name="storyId" value={storyId} />
            <input type="hidden" name="intent" value="delete" />
            <Button
                variant="destructive"
                size="sm"
                type="submit"
                disabled={isDeleting}
                className="h-8 px-2"
                onClick={(e) => {
                    if (!confirm('Are you sure you want to delete this story?')) {
                        e.preventDefault()
                    }
                }}
            >
                {isDeleting ? <Icon name="update" className="h-3.5 w-3.5 animate-spin" /> : <Icon name="trash" className="h-3.5 w-3.5" />}
                <span className="sr-only">Delete</span>
            </Button>
        </fetcher.Form>
    )
}
