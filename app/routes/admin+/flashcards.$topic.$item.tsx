import path from 'path'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useFetcher, useParams, useRevalidator } from '@remix-run/react'
import fs from 'fs-extra'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { downloadImagesForItem } from '#app/utils/download-images.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

const imagesDir = path.join(process.cwd(), 'images')

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const { topic, item } = params
    if (!topic || !item) throw new Response('Not found', { status: 404 })

    const itemDir = path.join(imagesDir, topic.toLowerCase().replace(/\s+/g, '-'), item.toLowerCase().replace(/\s+/g, '-'))
    await fs.ensureDir(itemDir)

    const files = await fs.readdir(itemDir)
    const images = files
        .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
        .map(f => ({
            filename: f,
            url: `/images/${topic.toLowerCase().replace(/\s+/g, '-')}/${item.toLowerCase().replace(/\s+/g, '-')}/${f}`
        }))

    return json({ topic, item, images })
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const { topic, item } = params
    if (!topic || !item) return json({ error: 'Not found' }, { status: 404 })

    const formData = await request.formData()
    const intent = formData.get('intent')

    const itemDir = path.join(imagesDir, topic.toLowerCase().replace(/\s+/g, '-'), item.toLowerCase().replace(/\s+/g, '-'))

    if (intent === 'deleteImage') {
        const filename = formData.get('filename')
        if (typeof filename !== 'string') return json({ error: 'Filename required' }, { status: 400 })

        const filepath = path.join(itemDir, filename)
        if (filepath.startsWith(itemDir) && await fs.pathExists(filepath)) {
            await fs.remove(filepath)
        }
        return json({ success: true })
    }

    if (intent === 'downloadImages') {
        const countStr = formData.get('count')
        const count = parseInt(countStr as string, 10) || 5

        try {
            const result = await downloadImagesForItem(topic, item, imagesDir, count)
            return json({ success: true, ...result })
        } catch (error) {
            return json({ error: 'Failed to download images', details: String(error) }, { status: 500 })
        }
    }

    return json({})
}

export default function FlashcardsItemAdmin() {
    const { topic, item, images } = useLoaderData<typeof loader>()
    const params = useParams()
    const fetcher = useFetcher<{ success?: boolean; downloaded?: number; error?: string }>()
    const deleteFetcher = useFetcher()
    const { revalidate } = useRevalidator()
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const isDownloading = fetcher.state === 'submitting'

    const handleDownload = (count: number) => {
        fetcher.submit({ intent: 'downloadImages', count: String(count) }, { method: 'post' })
    }

    const openLightbox = (index: number) => setLightboxIndex(index)
    const closeLightbox = () => setLightboxIndex(null)

    const goToPrev = useCallback(() => {
        if (lightboxIndex !== null && images.length > 0) {
            setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
        }
    }, [lightboxIndex, images.length])

    const goToNext = useCallback(() => {
        if (lightboxIndex !== null && images.length > 0) {
            setLightboxIndex((lightboxIndex + 1) % images.length)
        }
    }, [lightboxIndex, images.length])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') goToPrev()
            if (e.key === 'ArrowRight') goToNext()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxIndex, goToPrev, goToNext])

    useEffect(() => {
        if (fetcher.data?.success) {
            revalidate()
        }
    }, [fetcher.data, revalidate])

    return (
        <div className="container mx-auto p-8 max-w-5xl">
            <div className="mb-6">
                <Link to={`/admin/flashcards/${encodeURIComponent(params.topic!)}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
                    <Icon name="arrow-left" className="h-4 w-4" />
                    Back to {topic}
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold capitalize">{item}</h1>
                        <p className="text-muted-foreground text-sm">{images.length} images</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleDownload(5)} variant="outline" disabled={isDownloading}>
                            <Icon name="download" className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Download 5'}
                        </Button>
                        <Button onClick={() => handleDownload(10)} disabled={isDownloading}>
                            <Icon name="download" className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Downloading...' : 'Download 10'}
                        </Button>
                    </div>
                </div>
            </div>

            {fetcher.data?.success && fetcher.data.downloaded !== undefined && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                    Downloaded {fetcher.data.downloaded} new images
                </div>
            )}

            {fetcher.data?.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                    {fetcher.data.error}
                </div>
            )}

            {images.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                    <Icon name="camera" className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">No images yet for {item}</p>
                    <Button onClick={() => handleDownload(10)} disabled={isDownloading}>
                        {isDownloading ? 'Downloading...' : 'Download Images from Web'}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={img.filename} className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shadow-sm hover:shadow-lg transition-all">
                            <button
                                onClick={() => openLightbox(index)}
                                className="w-full h-full cursor-zoom-in"
                            >
                                <img src={img.url} alt={item} className="h-full w-full object-cover" />
                            </button>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <deleteFetcher.Form method="post">
                                    <input type="hidden" name="filename" value={img.filename} />
                                    <Button
                                        type="submit"
                                        name="intent"
                                        value="deleteImage"
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => { e.stopPropagation(); if (!confirm('Delete this image?')) e.preventDefault() }}
                                    >
                                        <Icon name="trash" className="h-4 w-4" />
                                    </Button>
                                </deleteFetcher.Form>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                                <p className="text-white text-xs truncate">{img.filename}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lightboxIndex !== null && images[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                    >
                        <Icon name="cross-1" className="h-8 w-8" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrev() }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext() }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                        {lightboxIndex + 1} / {images.length}
                    </div>

                    <img
                        src={images[lightboxIndex].url}
                        alt={item}
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    )
}
