import path from 'path'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useFetcher, useParams, useRevalidator } from '@remix-run/react'
import fs from 'fs-extra'
import OpenAI from 'openai'
import { useState, useEffect } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { downloadImagesForTopic, downloadImagesForItem } from '#app/utils/download-images.server.ts'
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

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const topicName = params.topic
    if (!topicName) throw new Response('Topic not found', { status: 404 })

    const config = await getConfig()
    const topic = config.topics.find(t => t.name === topicName)
    if (!topic) throw new Response('Topic not found', { status: 404 })

    const topicDir = path.join(imagesDir, topicName.toLowerCase().replace(/\s+/g, '-'))

    const itemsWithCounts = await Promise.all(
        topic.items.map(async (itemName) => {
            const itemDir = path.join(topicDir, itemName.toLowerCase().replace(/\s+/g, '-'))
            let imageCount = 0
            let thumbnail: string | null = null
            if (await fs.pathExists(itemDir)) {
                const files = await fs.readdir(itemDir)
                const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
                imageCount = images.length
                if (images.length > 0) {
                    thumbnail = `/images/${topicName.toLowerCase().replace(/\s+/g, '-')}/${itemName.toLowerCase().replace(/\s+/g, '-')}/${images[0]}`
                }
            }
            return { name: itemName, imageCount, thumbnail }
        })
    )

    return json({ topic: topic.name, items: itemsWithCounts, imagesPerItem: config.imagesPerItem })
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const topicName = params.topic
    if (!topicName) return json({ error: 'Topic not found' }, { status: 404 })

    const formData = await request.formData()
    const intent = formData.get('intent')

    if (intent === 'suggestItems') {
        const openai = new OpenAI()
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{
                role: 'user',
                content: `Generate a list of 30 different ${topicName} that would be good for a children's educational flashcard quiz. Include a mix of common and interesting ones. Output ONLY a JSON array of strings with the names, nothing else. Example: ["item1", "item2", "item3"]`
            }],
            max_tokens: 1000,
        })

        const content = response.choices[0]?.message?.content?.trim() || '[]'
        console.log('AI Response:', content)
        try {
            const jsonMatch = content.match(/\[[\s\S]*\]/)
            if (!jsonMatch) {
                console.error('No JSON array found in response:', content)
                return json({ suggestions: [], error: `No JSON array in response: ${content.substring(0, 100)}` })
            }
            const suggestions = JSON.parse(jsonMatch[0]) as string[]
            return json({ suggestions })
        } catch (e) {
            console.error('Failed to parse AI response:', content, e)
            return json({ suggestions: [], error: `Failed to parse: ${content.substring(0, 100)}` })
        }
    }

    if (intent === 'addItems') {
        const itemsJson = formData.get('items')
        if (typeof itemsJson !== 'string') return json({ error: 'Items required' }, { status: 400 })

        const newItems = JSON.parse(itemsJson) as string[]
        const config = await getConfig()
        const topic = config.topics.find(t => t.name === topicName)
        if (!topic) return json({ error: 'Topic not found' }, { status: 404 })

        const existingLower = new Set(topic.items.map(i => i.toLowerCase()))
        const toAdd = newItems.filter(i => !existingLower.has(i.toLowerCase()))
        topic.items.push(...toAdd)
        await saveConfig(config)

        return json({ success: true, added: toAdd.length })
    }

    if (intent === 'addItem') {
        const itemName = formData.get('itemName')
        if (typeof itemName !== 'string' || !itemName.trim()) {
            return json({ error: 'Item name required' }, { status: 400 })
        }

        const config = await getConfig()
        const topic = config.topics.find(t => t.name === topicName)
        if (!topic) return json({ error: 'Topic not found' }, { status: 404 })

        if (topic.items.some(i => i.toLowerCase() === itemName.toLowerCase())) {
            return json({ error: 'Item already exists' }, { status: 400 })
        }

        topic.items.push(itemName.trim())
        await saveConfig(config)
        return json({ success: true })
    }

    if (intent === 'deleteItem') {
        const itemName = formData.get('itemName')
        if (typeof itemName !== 'string') return json({ error: 'Item name required' }, { status: 400 })

        const config = await getConfig()
        const topic = config.topics.find(t => t.name === topicName)
        if (!topic) return json({ error: 'Topic not found' }, { status: 404 })

        topic.items = topic.items.filter(i => i !== itemName)
        await saveConfig(config)

        const itemDir = path.join(imagesDir, topicName.toLowerCase().replace(/\s+/g, '-'), itemName.toLowerCase().replace(/\s+/g, '-'))
        if (await fs.pathExists(itemDir)) {
            await fs.remove(itemDir)
        }

        return json({ success: true })
    }

    if (intent === 'downloadAllImages') {
        const config = await getConfig()
        const topic = config.topics.find(t => t.name === topicName)
        if (!topic) return json({ error: 'Topic not found' }, { status: 404 })

        try {
            const result = await downloadImagesForTopic(topicName, topic.items, imagesDir, config.imagesPerItem)
            return json({ success: true, ...result })
        } catch (error) {
            return json({ error: 'Failed to download images', details: String(error) }, { status: 500 })
        }
    }

    if (intent === 'downloadItemImages') {
        const itemName = formData.get('itemName')
        if (typeof itemName !== 'string') return json({ error: 'Item name required' }, { status: 400 })

        const config = await getConfig()
        const needed = config.imagesPerItem

        try {
            const result = await downloadImagesForItem(topicName, itemName, imagesDir, needed)
            return json({ success: true, ...result, item: itemName })
        } catch (error) {
            return json({ error: 'Failed to download images', details: String(error) }, { status: 500 })
        }
    }

    return json({})
}

export default function FlashcardsTopicAdmin() {
    const { topic, items, imagesPerItem } = useLoaderData<typeof loader>()
    const params = useParams()
    const suggestFetcher = useFetcher<{ suggestions?: string[]; error?: string }>()
    const addFetcher = useFetcher()
    const deleteFetcher = useFetcher()
    const downloadFetcher = useFetcher<{ success?: boolean; downloaded?: number; error?: string; results?: { item: string; downloaded: number }[] }>()
    const itemDownloadFetcher = useFetcher<{ success?: boolean; downloaded?: number; item?: string }>()
    const { revalidate } = useRevalidator()
    const [showAddForm, setShowAddForm] = useState(false)
    const [newItemName, setNewItemName] = useState('')
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())

    const suggestions = suggestFetcher.data?.suggestions || []
    const isLoadingSuggestions = suggestFetcher.state === 'submitting'
    const existingItems = new Set(items.map(i => i.name.toLowerCase()))
    const isDownloading = downloadFetcher.state === 'submitting'
    const isDownloadingItem = itemDownloadFetcher.state === 'submitting'

    useEffect(() => {
        if (downloadFetcher.data?.success || itemDownloadFetcher.data?.success) {
            revalidate()
        }
    }, [downloadFetcher.data, itemDownloadFetcher.data, revalidate])

    const handleGetSuggestions = () => {
        suggestFetcher.submit({ intent: 'suggestItems' }, { method: 'post' })
        setSelectedSuggestions(new Set())
    }

    const toggleSuggestion = (item: string) => {
        const newSet = new Set(selectedSuggestions)
        if (newSet.has(item)) {
            newSet.delete(item)
        } else {
            newSet.add(item)
        }
        setSelectedSuggestions(newSet)
    }

    const selectAllSuggestions = () => {
        const newItems = suggestions.filter(s => !existingItems.has(s.toLowerCase()))
        setSelectedSuggestions(new Set(newItems))
    }

    const handleAddSelected = () => {
        if (selectedSuggestions.size === 0) return
        addFetcher.submit(
            { intent: 'addItems', items: JSON.stringify([...selectedSuggestions]) },
            { method: 'post' }
        )
        setSelectedSuggestions(new Set())
    }

    const handleAddItem = () => {
        if (!newItemName.trim()) return
        addFetcher.submit({ intent: 'addItem', itemName: newItemName }, { method: 'post' })
        setNewItemName('')
        setShowAddForm(false)
    }

    const handleDownloadAll = () => {
        downloadFetcher.submit({ intent: 'downloadAllImages' }, { method: 'post' })
    }

    const handleDownloadItem = (itemName: string) => {
        itemDownloadFetcher.submit({ intent: 'downloadItemImages', itemName }, { method: 'post' })
    }

    const itemsNeedingImages = items.filter(i => i.imageCount < imagesPerItem).length
    const totalImages = items.reduce((sum, i) => sum + i.imageCount, 0)
    const totalNeeded = items.length * imagesPerItem

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="mb-6">
                <Link to="/admin/flashcards" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                    <Icon name="arrow-left" className="h-4 w-4" />
                    Back to Topics
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold capitalize">{topic}</h1>
                        <p className="text-muted-foreground text-sm">
                            {items.length} items • {totalImages} / {totalNeeded} images
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {itemsNeedingImages > 0 && (
                            <Button onClick={handleDownloadAll} variant="default" disabled={isDownloading}>
                                <Icon name="download" className="mr-2 h-4 w-4" />
                                {isDownloading ? 'Downloading...' : `Download All (${itemsNeedingImages} items)`}
                            </Button>
                        )}
                        <Button onClick={handleGetSuggestions} variant="outline" disabled={isLoadingSuggestions}>
                            <Icon name="avatar" className="mr-2 h-4 w-4" />
                            {isLoadingSuggestions ? 'Thinking...' : 'AI Suggest'}
                        </Button>
                        <Button onClick={() => setShowAddForm(true)} variant="outline">
                            <Icon name="plus" className="mr-2 h-4 w-4" />
                            Add
                        </Button>
                    </div>
                </div>
            </div>

            {downloadFetcher.data?.success && downloadFetcher.data.downloaded !== undefined && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                    Downloaded {downloadFetcher.data.downloaded} images
                </div>
            )}

            {downloadFetcher.data?.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {downloadFetcher.data.error}
                </div>
            )}

            {suggestFetcher.data?.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    AI Error: {suggestFetcher.data.error}
                </div>
            )}

            {showAddForm && (
                <div className="mb-6 p-4 border rounded-lg bg-card">
                    <h3 className="font-semibold mb-3">Add New Item</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={`Item name (e.g., quartz, amethyst)`}
                            className="flex-1 px-3 py-2 border rounded-md bg-background"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            autoFocus
                        />
                        <Button onClick={handleAddItem} disabled={!newItemName.trim()}>Add</Button>
                        <Button variant="ghost" onClick={() => { setShowAddForm(false); setNewItemName('') }}>Cancel</Button>
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="mb-6 p-4 border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">AI Suggestions</h3>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={selectAllSuggestions}>Select All New</Button>
                            <Button size="sm" onClick={handleAddSelected} disabled={selectedSuggestions.size === 0}>
                                Add {selectedSuggestions.size} Selected
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(item => {
                            const exists = existingItems.has(item.toLowerCase())
                            const selected = selectedSuggestions.has(item)
                            return (
                                <button
                                    key={item}
                                    onClick={() => !exists && toggleSuggestion(item)}
                                    disabled={exists}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                        exists
                                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed line-through'
                                            : selected
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white dark:bg-stone-800 border hover:border-amber-400'
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="grid gap-3">
                {items.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <Icon name="camera" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No items yet.</p>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={handleGetSuggestions} variant="outline" disabled={isLoadingSuggestions}>
                                Get AI Suggestions
                            </Button>
                            <Button onClick={() => setShowAddForm(true)}>
                                Add Manually
                            </Button>
                        </div>
                    </div>
                ) : (
                    items.map(item => {
                        const needsImages = item.imageCount < imagesPerItem
                        return (
                            <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                <Link to={`/admin/flashcards/${encodeURIComponent(params.topic!)}/${encodeURIComponent(item.name)}`} className="flex-1 flex items-center gap-3">
                                    <div className="h-10 w-10 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden flex items-center justify-center">
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <Icon name="camera" className="h-5 w-5 text-stone-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-medium capitalize">{item.name}</h3>
                                        <p className={`text-xs ${item.imageCount >= imagesPerItem ? 'text-green-600' : item.imageCount > 0 ? 'text-amber-600' : 'text-stone-400'}`}>
                                            {item.imageCount} / {imagesPerItem} images
                                        </p>
                                    </div>
                                </Link>
                                <div className="flex items-center gap-2">
                                    {needsImages && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDownloadItem(item.name)}
                                            disabled={isDownloadingItem}
                                        >
                                            <Icon name="download" className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Link
                                        to={`/admin/flashcards/${encodeURIComponent(params.topic!)}/${encodeURIComponent(item.name)}`}
                                        className="p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                    >
                                        <Icon name="pencil-1" className="h-4 w-4" />
                                    </Link>
                                    <deleteFetcher.Form method="post" onSubmit={(e) => !confirm(`Delete "${item.name}"?`) && e.preventDefault()}>
                                        <input type="hidden" name="itemName" value={item.name} />
                                        <Button type="submit" name="intent" value="deleteItem" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                            <Icon name="trash" className="h-4 w-4" />
                                        </Button>
                                    </deleteFetcher.Form>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
