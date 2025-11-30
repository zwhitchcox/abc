import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link } from '@remix-run/react'
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
        include: { tags: true }
    })

    invariantResponse(story, 'Story not found', { status: 404 })

    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })

    return json({ story, tags })
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    invariantResponse(params.storyId, 'Story ID is required')

    const formData = await request.formData()
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

    return redirect('/admin/stories')
}

export default function EditStory() {
    const { story, tags } = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Edit Story</h1>
            <Form method="POST" className="space-y-6">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={story.title} required />
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

