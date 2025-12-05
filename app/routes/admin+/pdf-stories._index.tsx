import path from 'path'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, Form } from '@remix-run/react'
import fs from 'fs-extra'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const pdfDir = path.join(process.cwd(), 'data', 'processed-pdfs')
    await fs.ensureDir(pdfDir)

    const dirs = await fs.readdir(pdfDir, { withFileTypes: true })
    const stories = await Promise.all(dirs
        .filter(d => d.isDirectory())
        .map(async d => {
            const stats = await fs.stat(path.join(pdfDir, d.name))
            return {
                name: d.name,
                title: d.name.replace(/-/g, ' '),
                createdAt: stats.birthtime
            }
        }))

    return json({ stories })
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const formData = await request.formData()
    const intent = formData.get('intent')
    const storyName = formData.get('storyName')

    if (intent === 'delete' && typeof storyName === 'string') {
        const storyDir = path.join(process.cwd(), 'data', 'processed-pdfs', storyName)
        // Safety check to ensure we are deleting a subdirectory of processed-pdfs
        if (!storyDir.startsWith(path.join(process.cwd(), 'data', 'processed-pdfs'))) {
             return json({ error: 'Invalid path' }, { status: 400 })
        }
        await fs.remove(storyDir)
        return json({ success: true })
    }
    return json({})
}

export default function PdfStoriesAdmin() {
    const { stories } = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage PDF Stories</h1>
                <Button asChild>
                    <Link to="/admin/pdf-stories/new">
                        <Icon name="plus" className="mr-2 h-4 w-4" />
                        Upload New
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {stories.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <p className="text-muted-foreground mb-4">No PDF stories found.</p>
                        <Button asChild variant="outline">
                            <Link to="/admin/pdf-stories/new">Upload your first PDF</Link>
                        </Button>
                    </div>
                ) : (
                    stories.map(story => (
                        <div key={story.name} className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-stone-100 rounded-md overflow-hidden flex items-center justify-center border">
                                    <img
                                        src={`/resources/pdf-images/${story.name}/01`}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                    <Icon name="file-text" className="h-6 w-6 text-stone-400 absolute" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{story.title}</h3>
                                    <p className="text-xs text-muted-foreground">Processed: {new Date(story.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost" size="sm">
                                    <Link to={`/pdf-stories/${story.name}`} target="_blank">
                                        <Icon name="external-link" className="mr-2 h-4 w-4" />
                                        View
                                    </Link>
                                </Button>
                                <Form method="post" onSubmit={(e) => !confirm(`Delete "${story.title}"? This cannot be undone.`) && e.preventDefault()}>
                                    <input type="hidden" name="storyName" value={story.name} />
                                    <Button type="submit" name="intent" value="delete" variant="destructive" size="sm">
                                        <Icon name="trash" className="h-4 w-4" />
                                    </Button>
                                </Form>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

