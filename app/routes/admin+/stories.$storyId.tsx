import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link } from '@remix-run/react'
import { useState } from 'react'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import { Button } from '#app/components/ui/button.tsx'
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
        include: { tags: true, images: { take: 1 } }
    })

    invariantResponse(story, 'Story not found', { status: 404 })

    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })

    return json({ story, tags })
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    invariantResponse(params.storyId, 'Story ID is required')

    let uploadedImage: { buffer: Buffer, type: string, name: string } | null = null

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

    if (uploadedImage && uploadedImage.buffer.length > 0) {
        const existingImage = await prisma.storyImage.findFirst({ where: { storyId: params.storyId } })
        if (existingImage) {
            await prisma.storyImage.update({
                where: { id: existingImage.id },
                data: {
                    blob: uploadedImage.buffer,
                    contentType: uploadedImage.type,
                    altText: title
                }
            })
        } else {
            await prisma.storyImage.create({
                data: {
                    storyId: params.storyId,
                    blob: uploadedImage.buffer,
                    contentType: uploadedImage.type,
                    altText: title
                }
            })
        }
    }

    return redirect('/admin/stories')
}

export default function EditStory() {
    const { story, tags } = useLoaderData<typeof loader>()
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
            <Form method="POST" className="space-y-6" encType="multipart/form-data">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={story.title} required />
                </div>

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

                <div className="flex gap-4">
                    <Button type="submit">Save Changes</Button>
                    <Button variant="secondary" asChild>
                        <Link to="/admin/stories">Cancel</Link>
                    </Button>
                </div>
            </Form>
        </div>
    )
}

