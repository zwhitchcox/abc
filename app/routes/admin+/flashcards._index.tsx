import path from 'path'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, Form, useFetcher } from '@remix-run/react'
import fs from 'fs-extra'
import { useState } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

interface Topic {
    name: string
    items: string[]
}

interface Config {
    topics: Topic[]
    imagesPerItem: number
}

const configPath = path.join(process.cwd(), 'scripts', 'image-config.json')
const imagesDir = path.join(process.cwd(), 'images')

async function getConfig(): Promise<Config> {
    if (await fs.pathExists(configPath)) {
        return fs.readJSON(configPath)
    }
    return { topics: [], imagesPerItem: 10 }
}

async function saveConfig(config: Config): Promise<void> {
    await fs.writeJSON(configPath, config, { spaces: 2 })
}

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const config = await getConfig()

    const topicsWithCounts = await Promise.all(
        config.topics.map(async (topic) => {
            const topicDir = path.join(imagesDir, topic.name.toLowerCase().replace(/\s+/g, '-'))
            let imageCount = 0
            if (await fs.pathExists(topicDir)) {
                const items = await fs.readdir(topicDir, { withFileTypes: true })
                for (const item of items) {
                    if (item.isDirectory()) {
                        const itemDir = path.join(topicDir, item.name)
                        const files = await fs.readdir(itemDir)
                        imageCount += files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length
                    }
                }
            }
            return {
                name: topic.name,
                itemCount: topic.items.length,
                imageCount
            }
        })
    )

    return json({ topics: topicsWithCounts, imagesPerItem: config.imagesPerItem })
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const formData = await request.formData()
    const intent = formData.get('intent')

    if (intent === 'addTopic') {
        const topicName = formData.get('topicName')
        if (typeof topicName !== 'string' || !topicName.trim()) {
            return json({ error: 'Topic name is required' }, { status: 400 })
        }

        const config = await getConfig()
        if (config.topics.some(t => t.name.toLowerCase() === topicName.toLowerCase())) {
            return json({ error: 'Topic already exists' }, { status: 400 })
        }

        config.topics.push({ name: topicName.trim(), items: [] })
        await saveConfig(config)
        return json({ success: true })
    }

    if (intent === 'deleteTopic') {
        const topicName = formData.get('topicName')
        if (typeof topicName !== 'string') {
            return json({ error: 'Topic name is required' }, { status: 400 })
        }

        const config = await getConfig()
        config.topics = config.topics.filter(t => t.name !== topicName)
        await saveConfig(config)

        const topicDir = path.join(imagesDir, topicName.toLowerCase().replace(/\s+/g, '-'))
        if (await fs.pathExists(topicDir)) {
            await fs.remove(topicDir)
        }

        return json({ success: true })
    }

    return json({})
}

export default function FlashcardsAdmin() {
    const { topics, imagesPerItem } = useLoaderData<typeof loader>()
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTopicName, setNewTopicName] = useState('')
    const fetcher = useFetcher()

    const handleAddTopic = () => {
        if (!newTopicName.trim()) return
        fetcher.submit(
            { intent: 'addTopic', topicName: newTopicName },
            { method: 'post' }
        )
        setNewTopicName('')
        setShowAddForm(false)
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Flashcard Topics</h1>
                    <p className="text-muted-foreground text-sm">{imagesPerItem} images per item</p>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                    <Icon name="plus" className="mr-2 h-4 w-4" />
                    Add Topic
                </Button>
            </div>

            {showAddForm && (
                <div className="mb-6 p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-3">Add New Topic</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            placeholder="Topic name (e.g., minerals, dinosaurs)"
                            className="flex-1 px-3 py-2 border rounded-md bg-background"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                            autoFocus
                        />
                        <Button onClick={handleAddTopic} disabled={!newTopicName.trim()}>
                            Add
                        </Button>
                        <Button variant="ghost" onClick={() => { setShowAddForm(false); setNewTopicName('') }}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {topics.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <Icon name="camera" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No topics yet.</p>
                        <Button onClick={() => setShowAddForm(true)} variant="outline">
                            Create your first topic
                        </Button>
                    </div>
                ) : (
                    topics.map(topic => (
                        <div key={topic.name} className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <Link to={`/admin/flashcards/${encodeURIComponent(topic.name)}`} className="flex-1 flex items-center gap-4">
                                <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow">
                                    {topic.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg capitalize">{topic.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {topic.itemCount} items • {topic.imageCount} images
                                    </p>
                                </div>
                            </Link>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="ghost" size="sm">
                                    <Link to={`/admin/flashcards/${encodeURIComponent(topic.name)}`}>
                                        <Icon name="pencil-1" className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Form method="post" onSubmit={(e) => !confirm(`Delete "${topic.name}" and all its images? This cannot be undone.`) && e.preventDefault()}>
                                    <input type="hidden" name="topicName" value={topic.name} />
                                    <Button type="submit" name="intent" value="deleteTopic" variant="destructive" size="sm">
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

