import path from 'node:path'
import { spawn } from 'node:child_process'
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link, useActionData } from '@remix-run/react'
import { useState } from 'react'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { invariantResponse } from '@epic-web/invariant'

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    invariantResponse(params.storyId, 'Story ID is required')

    const story = await prisma.story.findUnique({
        where: { id: params.storyId },
        include: { tags: true, images: { take: 1 }, audio: true }
    })

    invariantResponse(story, 'Story not found', { status: 404 })

    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })

    return json({ story, tags })
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    invariantResponse(params.storyId, 'Story ID is required')

    type UploadedImage = { buffer: Buffer, type: string, name: string }
    let uploadedImage: UploadedImage | null = null

    const uploadHandler = async (file: FileUpload) => {
        if (file.fieldName !== 'coverImage') return

        const chunks = []
        for await (const chunk of file.stream()) {
            chunks.push(chunk)
        }
        uploadedImage = {
            buffer: Buffer.concat(chunks),
            type: file.type,
            name: file.name
        }
        return "uploaded"
    }

    const formData = await parseFormData(
        request,
        { maxFileSize: 1024 * 1024 * 10 },
        uploadHandler
    )

    const intent = formData.get('intent')

    if (intent === 'split') {
        const scriptPath = path.join(process.cwd(), 'scripts', 'split-m4b.ts')
        console.log(`Spawning split script: ${scriptPath} for story ${params.storyId}`)

        const child = spawn('npx', ['tsx', scriptPath, params.storyId], {
            detached: true,
            stdio: 'ignore'
        })
        child.unref()

        return json({ message: 'Split process started. It may take a few minutes to complete.' })
    }

    const title = String(formData.get('title'))
    const tagIds = formData.getAll('tagIds') as string[]

    await prisma.story.update({
        where: { id: params.storyId },
        data: {
            title,
            tags: {
                set: tagIds.map(id => ({ id }))
            }
        }
    })

    const image = uploadedImage as UploadedImage | null

    if (image && image.buffer.length > 0) {
        const existingImage = await prisma.storyImage.findFirst({ where: { storyId: params.storyId } })
        if (existingImage) {
            await prisma.storyImage.update({
                where: { id: existingImage.id },
                data: {
                    blob: image.buffer,
                    contentType: image.type,
                    altText: title
                }
            })
        } else {
            await prisma.storyImage.create({
                data: {
                    storyId: params.storyId,
                    blob: image.buffer,
                    contentType: image.type,
                    altText: title
                }
            })
        }
    }

    return redirect('/admin/stories')
}

export default function EditStory() {
    const { story, tags } = useLoaderData<typeof loader>()
    const actionData = useActionData<typeof action>()
    const [newCover, setNewCover] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewCover(URL.createObjectURL(file))
        } else {
            setNewCover(null)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Edit Story</h1>

            {actionData && 'message' in actionData && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                    <Icon name="check" className="h-5 w-5" />
                    {actionData.message}
                </div>
            )}

            <Form method="POST" className="space-y-6" encType="multipart/form-data">
                <input type="hidden" name="intent" value="update" />
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={story.title} required />
                </div>

                {story.audio && (
                    <div className="space-y-2">
                        <Label>Admin Preview</Label>
                        <div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                            {story.audio.contentType.startsWith('video') ? (
                                <video
                                    src={`/resources/audio-files/${story.audio.id}`}
                                    controls
                                    className="w-full max-h-[400px] rounded-md bg-black"
                                    preload="metadata"
                                />
                            ) : (
                                <audio
                                    src={`/resources/audio-files/${story.audio.id}`}
                                    controls
                                    className="w-full"
                                    preload="metadata"
                                />
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                                This is a raw preview. Playback progress is not saved and parental controls are not enforced.
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <div className="flex gap-6 items-end mt-2 mb-2">
                        {story.images[0] && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Current</p>
                                <img
                                    src={`/resources/story-images/${story.images[0].id}?t=${new Date(story.images[0].updatedAt).getTime()}`}
                                    className="h-32 w-32 object-cover rounded-lg border"
                                    alt="Current Cover"
                                />
                            </div>
                        )}
                        {newCover && (
                            <div>
                                <p className="text-xs text-muted-foreground mb-1 text-green-600 font-bold">New Preview</p>
                                <img
                                    src={newCover}
                                    className="h-32 w-32 object-cover rounded-lg border-2 border-green-500 shadow-md"
                                    alt="New Cover Preview"
                                />
                            </div>
                        )}
                    </div>
                    <Input id="coverImage" name="coverImage" type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <div>
                    <Label>Tags</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                        {tags.map(tag => {
                            const isChecked = story.tags.some((t: any) => t.id === tag.id)
                            return (
                                <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="tagIds"
                                        value={tag.id}
                                        defaultChecked={isChecked}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span>{tag.name}</span>
                                </label>
                            )
                        })}
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Button type="submit">Save Changes</Button>
                    <Button variant="secondary" asChild>
                        <Link to="/admin/stories">Cancel</Link>
                    </Button>
                </div>
            </Form>

            {story.type === 'audiobook' && (
                <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
                    <h3 className="text-lg font-bold mb-4 text-stone-800 dark:text-stone-100">Advanced Actions</h3>
                    <div className="p-6 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                        <h4 className="font-semibold mb-2 text-stone-700 dark:text-stone-200">Split into Individual Stories</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            This will process the audiobook file and create a new Story entry for each chapter found.
                            It will attempt to download cover art for each chapter. This process runs in the background.
                        </p>
                        <Form method="POST">
                            <input type="hidden" name="intent" value="split" />
                            <Button type="submit" variant="secondary" className="bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                                <Icon name="file-text" className="mr-2 h-4 w-4" />
                                Start Split Process
                            </Button>
                        </Form>
                    </div>
                </div>
            )}
        </div>
    )
}

