import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
	FormProvider,
	getFormProps,
	useForm,
} from '@conform-to/react'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import {
	json,
	redirect,
    type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import ffprobeStatic from 'ffprobe-static'
import { useState, useRef } from 'react'
import YtDlpWrapImport from 'yt-dlp-wrap'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { getUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { findCoverImage } from '#app/utils/image-search.server.ts'
import { createJob, updateJobProgress, completeJob, failJob } from '#app/utils/jobs.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
// eslint-disable-next-line import/order
import xxhash from 'xxhash-wasm'

const YtDlpWrap = (YtDlpWrapImport as any).default ?? YtDlpWrapImport

const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 2 // 2GB

// Helper to run ffprobe with custom arguments
function probe(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const ffprobe = spawn(ffprobeStatic.path, [
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            '-show_chapters',
            filePath
        ])

        let stdout = ''
        let stderr = ''

        ffprobe.stdout.on('data', (data) => {
            stdout += data
        })

        ffprobe.stderr.on('data', (data) => {
            stderr += data
        })

        ffprobe.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`ffprobe exited with code ${code}: ${stderr}`))
            } else {
                try {
                    resolve(JSON.parse(stdout))
                } catch {
                    reject(new Error('Failed to parse ffprobe JSON output'))
                }
            }
        })
    })
}

function normalizeTime(time: string): string {
    time = time.trim()
    if (time.startsWith(':')) {
        return '0' + time
    }
    return time
}

async function ensureYtDlp() {
    try {
        // Check if yt-dlp is in PATH
        execSync('which yt-dlp', { stdio: 'ignore' })
        return 'yt-dlp'
    } catch {
        const binaryPath = path.join(process.cwd(), 'bin', 'yt-dlp')
        if (!fs.existsSync(binaryPath)) {
            console.log('Downloading yt-dlp binary to', binaryPath)
            await fs.promises.mkdir(path.dirname(binaryPath), { recursive: true })
            await YtDlpWrap.downloadFromGithub(binaryPath)
            await fs.promises.chmod(binaryPath, '755')
        }
        return binaryPath
    }
}

async function expandPlaylist(url: string): Promise<string[]> {
    const binaryPath = await ensureYtDlp()
    const args = [
        '--flat-playlist',
        '--print', 'url',
        url,
        '--force-ipv6',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    ]

    const cookiesPath = path.join(process.cwd(), 'data', 'cookies.txt')
    if (fs.existsSync(cookiesPath)) {
        args.push('--cookies', cookiesPath)
    }

    return new Promise((resolve, reject) => {
        const child = spawn(binaryPath, args)
        let output = ''
        let error = ''

        child.stdout.on('data', d => output += d)
        child.stderr.on('data', d => error += d)

        child.on('close', code => {
             if (code === 0) {
                 const urls = output.split('\n').map(s => s.trim()).filter(Boolean)
                 resolve(urls)
             } else {
                 reject(new Error(`Failed to expand playlist: ${error}`))
             }
        })
    })
}

async function processReadAloud(
    youtubeUrl: string,
    tagIds: string[],
    startTime: string | undefined,
    endTime: string | undefined,
    title: string | undefined
): Promise<boolean> {
    if (startTime) startTime = normalizeTime(startTime)
    if (endTime) endTime = normalizeTime(endTime)

    // Check if story already exists
    const videoIdMatch = youtubeUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)
    const videoId = videoIdMatch ? videoIdMatch[1] : null

    let existingStory = null
    if (videoId) {
        existingStory = await prisma.story.findFirst({
            where: {
                OR: [
                    { originalLink: youtubeUrl },
                    { originalLink: { contains: videoId } }
                ]
            },
            select: { id: true, title: true, tags: { select: { id: true } } }
        })
    } else {
         existingStory = await prisma.story.findFirst({
            where: { originalLink: youtubeUrl },
            select: { id: true, title: true, tags: { select: { id: true } } }
        })
    }

    if (existingStory) {
        console.log(`[processReadAloud] Story already exists: "${existingStory.title}" (${existingStory.id}). Checking tags...`)
        const existingTagIds = existingStory.tags.map(t => t.id)
        const tagsToAdd = tagIds.filter(id => !existingTagIds.includes(id))

        if (tagsToAdd.length > 0) {
             console.log(`[processReadAloud] Adding ${tagsToAdd.length} new tags.`)
             await prisma.story.update({
                 where: { id: existingStory.id },
                 data: {
                     tags: {
                         connect: tagsToAdd.map(id => ({ id }))
                     }
                 }
             })
        } else {
            console.log(`[processReadAloud] No new tags to add.`)
        }
        return false
    }

    const storageDir = process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'uploads', 'audiobooks')
    await fs.promises.mkdir(storageDir, { recursive: true })

    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    const outputBase = path.join(storageDir, uniqueFilename)
    const outputPath = outputBase + '.mp4'

    const binaryPath = await ensureYtDlp()
    // const ytDlpWrap = new YtDlpWrap(binaryPath)

    const args = [
        youtubeUrl,
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '-o', outputPath,
        '--add-metadata',
        '--write-thumbnail',
        '--convert-thumbnails', 'jpg',
        '--force-ipv6',
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        '--no-playlist',
        '--limit-rate', '5M',
        '--sleep-requests', '1.5'
    ]

    const cookiesPath = path.join(process.cwd(), 'data', 'cookies.txt')
    if (fs.existsSync(cookiesPath)) {
        args.push('--cookies', cookiesPath)
    }

    if (startTime || endTime) {
            const section = `*${startTime || ''}-${endTime || ''}`
            args.push('--download-sections', section)
            args.push('--force-keyframes-at-cuts')
    }

    console.log('Executing yt-dlp with args:', args)

    await new Promise<void>((resolve, reject) => {
        const child = spawn(binaryPath, args)

        // Pipe stdout and stderr to console AND capture for error handling
        let stderr = ''

        child.stdout.on('data', (data) => {
            process.stdout.write(data)
        })

        child.stderr.on('data', (data) => {
            process.stderr.write(data)
            stderr += data.toString()
        })

        child.on('error', (error) => {
            console.error('[yt-dlp] Error:', error)
            reject(error)
        })

        child.on('close', (code) => {
            if (code === 0) {
                console.log('[yt-dlp] Finished successfully')
                resolve()
            } else {
                console.error(`[yt-dlp] Process exited with code ${code}`)
                // Pass the captured stderr in the error message so the caller can inspect it
                reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`))
            }
        })
    })

    // Check for thumbnail
    let coverBlob = null
    let coverContentType = 'image/jpeg'
    const potentialExts = ['.jpg', '.jpeg', '.webp', '.png']

    for (const ext of potentialExts) {
            const thumbPath = outputBase + ext
            if (fs.existsSync(thumbPath)) {
                coverBlob = await fs.promises.readFile(thumbPath)
                coverContentType = ext === '.webp' ? 'image/webp' : (ext === '.png' ? 'image/png' : 'image/jpeg')
                // Clean up thumb file
                await fs.promises.unlink(thumbPath)
                break
            }
    }

    // Probe for metadata (duration, title)
    let duration = 0
    let finalTitle = title

    try {
        const info = await probe(outputPath)
        duration = info.format?.duration || 0
        if (!finalTitle && info.format?.tags?.title) finalTitle = info.format.tags.title
    } catch (e) {
        console.error('Probing downloaded file failed:', e)
    }

    if (!finalTitle) finalTitle = 'Downloaded Video'

    // Create DB entry
    await prisma.story.create({
        data: {
            title: finalTitle,
            type: 'readaloud',
            originalLink: youtubeUrl,
            tags: tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
            images: coverBlob ? {
                create: {
                    contentType: coverContentType,
                    blob: coverBlob,
                    altText: finalTitle,
                }
            } : undefined,
            audio: {
                create: {
                    contentType: 'video/mp4',
                    filepath: outputPath,
                }
            },
            chapters: {
                create: {
                    title: 'Full Video',
                    order: 0,
                    startTime: 0,
                    endTime: parseFloat(String(duration)),
                }
            }
        }
    })
    return true
}

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    return json({ tags })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')

	const uploadHandler = async (file: FileUpload) => {
		if (file.fieldName !== 'audiobookFile') {
			return
		}

		const storageDir = process.env.STORAGE_DIR || path.join(process.cwd(), 'data', 'uploads', 'audiobooks')
		await fs.promises.mkdir(storageDir, { recursive: true })

		const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`
		const filepath = path.join(storageDir, uniqueFilename)

		const writeStream = fs.createWriteStream(filepath)

		for await (const chunk of file.stream()) {
			writeStream.write(chunk)
		}
		writeStream.end()

		await new Promise<void>((resolve, reject) => {
			writeStream.on('finish', resolve)
			writeStream.on('error', reject)
		})

		return filepath
	}

	const formData = await parseFormData(
		request,
		{ maxFileSize: MAX_FILE_SIZE },
		uploadHandler
	)

    const storyType = formData.get('storyType')
    const tagIds = formData.getAll('tagIds') as string[]
    const newTagName = formData.get('newTagName') as string

    if (newTagName) {
        const tag = await prisma.tag.create({ data: { name: newTagName } })
        tagIds.push(tag.id)
    }

    if (storyType === 'readaloud') {
        const youtubeUrlsStr = formData.get('youtubeUrl')
        if (typeof youtubeUrlsStr !== 'string' || !youtubeUrlsStr) {
             return json({ error: 'YouTube URL is required' }, { status: 400 })
        }

        const lines = youtubeUrlsStr.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean)
        if (lines.length === 0) {
             return json({ error: 'No valid YouTube URLs provided' }, { status: 400 })
        }

        const globalStartTime = formData.get('startTime') as string
        const globalEndTime = formData.get('endTime') as string
        const title = formData.get('title') as string
        const downloadPlaylist = formData.get('downloadPlaylist') === 'on'
        const playlistWaitTimeStr = formData.get('playlistWaitTime') as string
        const playlistWaitTimeMinutes = playlistWaitTimeStr ? parseInt(playlistWaitTimeStr, 10) : 10

        const userId = await getUserId(request)
        const job = await createJob('import:youtube', userId, {
            urls: lines,
            startTime: globalStartTime,
            endTime: globalEndTime,
            downloadPlaylist
        })

        // Run in background to avoid timeout
        void (async () => {
            let totalVideos = lines.length
            let processedCount = 0
            let succeeded = 0
            let failed = 0
            let skipped = 0
            const results: any[] = []

            try {
                for (const line of lines) {
                    const parts = line.split(/\s+/)
                    const url = parts[0]
                    if (!url) continue

                    let start = globalStartTime
                    let end = globalEndTime

                    // Check for optional start/end times in the line
                    // Format: URL [start] [end]
                    if (parts.length > 1 && /^:?\d/.test(parts[1] ?? '')) {
                        start = parts[1] as string
                        if (parts.length > 2 && /^:?\d/.test(parts[2] ?? '')) {
                            end = parts[2] as string
                        }
                    }

                    const hasPlaylist = url.includes('list=') || url.includes('/playlist')

                    if (downloadPlaylist && hasPlaylist) {
                        try {
                            console.log('Expanding playlist:', url)
                            await updateJobProgress(job.id, `${processedCount}/${totalVideos}`, { message: 'Expanding playlist...', currentUrl: url as string | undefined })

                            const videoUrls = await expandPlaylist(url)
                            console.log(`Found ${videoUrls.length} videos in playlist`)

                            // Adjust total count: remove the playlist entry, add the videos
                            totalVideos = totalVideos - 1 + videoUrls.length

                            for (let i = 0; i < videoUrls.length; i++) {
                                const videoUrl = videoUrls[i]
                                if (typeof videoUrl === 'undefined') continue
                                const progressPercent = Math.round((processedCount / totalVideos) * 100)
                                await updateJobProgress(job.id, `${progressPercent}%`, {
                                    message: `Processing video ${i + 1}/${videoUrls.length} from playlist`,
                                    processed: processedCount,
                                    total: totalVideos,
                                    currentUrl: videoUrl as string | undefined
                                })

                                try {
                                    const downloaded = await processReadAloud(videoUrl, tagIds, start, end, title)
                                    if (downloaded) succeeded++
                                    else skipped++
                                    results.push({ url: videoUrl, status: downloaded ? 'downloaded' : 'skipped' })

                                    // Wait configurable time between downloads
                                    if (downloaded && i < videoUrls.length - 1) {
                                        // Calculate wait time in seconds based on user input
                                        // We'll add a small random variance of +/- 20% to make it look more natural
                                        const baseWaitSeconds = playlistWaitTimeMinutes * 60
                                        const variance = baseWaitSeconds * 0.2
                                        const minWait = Math.max(1, baseWaitSeconds - variance)
                                        const maxWait = baseWaitSeconds + variance

                                        const waitTimeSeconds = Math.floor(Math.random() * (maxWait - minWait + 1) + minWait)

                                        console.log(`Waiting ${waitTimeSeconds} seconds before next download to avoid rate limits...`)
                                        await updateJobProgress(job.id, `${progressPercent}%`, {
                                            message: `Waiting ${Math.round(waitTimeSeconds / 60)}m before next video...`,
                                            processed: processedCount + 1,
                                            total: totalVideos
                                        })
                                        await new Promise(resolve => setTimeout(resolve, waitTimeSeconds * 1000))
                                    }
                                } catch (e) {
                                    console.error(`Failed to download video ${videoUrl}:`, e)
                                    failed++
                                    const errorMsg = String(e)
                                    results.push({ url: videoUrl, status: 'failed', error: errorMsg })

                                    // Abort if bot detection
                                    if (errorMsg.includes('Sign in to confirm') || errorMsg.includes('bot')) {
                                        console.error('Bot detection triggered, aborting playlist.')
                                        await failJob(job.id, new Error(`Bot detection triggered by YouTube. Please update cookies.`))
                                        return // Exit the background function entirely
                                    }

                                    // Check for copyright error
                                    if (errorMsg.includes('copyright claim') || errorMsg.includes('Video unavailable')) {
                                        console.log(`[playlist] Skipping video due to copyright/unavailability: ${videoUrl}`)
                                        // Do not fail the job, just log and continue
                                    } else {
                                         // For other errors, maybe we still want to continue but log it as failed
                                    }
                                }
                                processedCount++
                            }
                        } catch (e) {
                            console.error('Failed to expand playlist, trying as single URL:', e)
                             await updateJobProgress(job.id, `${Math.round((processedCount / totalVideos) * 100)}%`, { message: 'Playlist expansion failed, trying single URL...' })

                            try {
                                const downloaded = await processReadAloud(url, tagIds, start, end, title)
                                if (downloaded) succeeded++
                                else skipped++
                                results.push({ url, status: downloaded ? 'downloaded' : 'skipped' })
                            } catch (singleError) {
                                failed++
                                results.push({ url, status: 'failed', error: String(singleError) })
                            }
                            processedCount++
                        }
                    } else {
                        const progressPercent = Math.round((processedCount / totalVideos) * 100)
                        await updateJobProgress(job.id, `${progressPercent}%`, {
                            message: `Processing video...`,
                            processed: processedCount,
                            total: totalVideos,
                            currentUrl: url as string | undefined
                        })

                        try {
                            const downloaded = await processReadAloud(url, tagIds, start, end, title)
                             if (downloaded) succeeded++
                            else skipped++
                            results.push({ url, status: downloaded ? 'downloaded' : 'skipped' })
                        } catch (e) {
                            failed++
                            const errorMsg = String(e)
                            results.push({ url, status: 'failed', error: errorMsg })

                            // Abort if bot detection
                            if (errorMsg.includes('Sign in to confirm') || errorMsg.includes('bot')) {
                                console.error('Bot detection triggered, aborting batch.')
                                await failJob(job.id, new Error(`Bot detection triggered by YouTube. Please update cookies.`))
                                return // Exit the background function entirely
                            }
                        }
                        processedCount++
                    }
                }
                await completeJob(job.id, { succeeded, failed, skipped, details: results })
            } catch (e: any) {
                console.error('Background download failed:', e)
                await failJob(job.id, e)
            }
        })()

        return redirect(`/admin/jobs`)
    }

    // File Upload Handling (Audiobooks & Videos)
	const filepaths = formData.getAll('audiobookFile')

    // Filter out empty strings or non-strings
    const validFilepaths = filepaths.filter(fp => typeof fp === 'string' && fp.length > 0) as string[]

	if (storyType === 'audiobook' && validFilepaths.length === 0) {
		return json(
			{ error: 'File upload failed' },
			{ status: 400 },
		)
	}

    if (storyType === 'audiobook') {
        const { parseFile } = await import('music-metadata')
        const { create64 } = await xxhash()

        for (const filepath of validFilepaths) {
            try {
                // Calculate hash of the file content
                const fileBuffer = await fs.promises.readFile(filepath)
                const hasher = create64()
                hasher.update(new Uint8Array(fileBuffer))
                const fileHash = hasher.digest().toString(16)

                // Check for existing story with this hash
                // @ts-ignore - prisma client might be stale in editor
                const existingAudio = await prisma.audioFile.findUnique({
                    where: { fileHash },
                    select: { story: { select: { title: true, id: true } } }
                })

                // @ts-ignore
                if (existingAudio && existingAudio.story) {
                    // @ts-ignore
                    console.log(`Skipping duplicate file ${filepath} (matches story: ${existingAudio.story.title})`)
                    // Cleanup duplicate file
                    await fs.promises.unlink(filepath).catch(() => {})
                    continue
                }

                // Determine type based on extension
                const ext = path.extname(filepath).toLowerCase()
                const isVideo = ['.mp4', '.mkv', '.webm', '.mov'].includes(ext)
                const mimeType = isVideo
                    ? (ext === '.webm' ? 'video/webm' : 'video/mp4')
                    : (ext === '.mp3' ? 'audio/mpeg' : 'audio/mp4')

                const type = isVideo ? 'readaloud' : 'audiobook'

                let metadata: any = { common: {}, format: {} }
                try {
                    metadata = await parseFile(filepath)
                } catch (e) {
                    console.warn('Failed to parse metadata for', filepath, e)
                }

                const { common } = metadata

                const originalFilename = path.basename(filepath).split('-').slice(2).join('-')
                const title = common.title ?? originalFilename.replace(/\.[^/.]+$/, "")
                let coverPicture = common.picture?.[0]
                let coverBlob: Buffer | null = coverPicture ? Buffer.from(coverPicture.data) : null
                let coverContentType = coverPicture ? coverPicture.format : 'image/jpeg'

                let originalLink: string | null = null
                if (common.comment && common.comment.length > 0) {
                    // music-metadata might return strings or objects { text: '...' }
                    const comment = common.comment[0] as any
                    const potentialId = typeof comment === 'string' ? comment : comment?.text

                    if (potentialId && /^[a-zA-Z0-9_-]{11}$/.test(potentialId)) {
                        originalLink = `https://www.youtube.com/watch?v=${potentialId}`
                    }
                }

                // If no cover art and it's a video, try to fetch from Bing
                if (!coverBlob) {
                    console.log(`No cover art found for ${title}, searching Bing...`)
                    const bingImage = await findCoverImage(`${title} hardcover`)
                    if (bingImage) {
                        coverBlob = bingImage.blob
                        coverContentType = bingImage.contentType
                    }
                }

                console.log(`[Upload] Processing file: ${originalFilename}`)
                console.log(`[Upload] Title: ${title}`)
                console.log(`[Upload] Original Link: ${originalLink}`)
                console.log(`[Upload] File Hash: ${fileHash}`)
                console.log(`[Upload] Has Cover: ${!!coverBlob} (${coverContentType})`)
                console.log(`[Upload] Comments:`, common.comment)

                const story = await prisma.story.create({
                    data: {
                        title,
                        type,
                        originalLink,
                        tags: tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
                        images: coverBlob ? {
                            create: {
                                contentType: coverContentType,
                                blob: coverBlob,
                                altText: title,
                            },
                        } : undefined,
                        audio: {
                            create: {
                                contentType: mimeType,
                                filepath: filepath,
                                // @ts-ignore
                                fileHash,
                            },
                        },
                    },
                })

                let chapters: any[] = []
                let duration = 0

                try {
                    console.log('Running custom ffprobe on:', filepath)
                    const info = await probe(filepath)
                    // console.log('FFPROBE info chapters:', info.chapters ? info.chapters.length : 'None')
                    chapters = info.chapters || []
                    duration = info.format?.duration || 0
                } catch (e) {
                    console.error('ffprobe failed:', e)
                    duration = metadata.format?.duration || 0
                }

                if (chapters.length > 0) {
                    await prisma.chapter.createMany({
                        data: chapters.map((c: any, i: number) => ({
                            title: c.tags?.title || `Chapter ${i + 1}`,
                            order: i,
                            startTime: parseFloat(c.start_time),
                            endTime: parseFloat(c.end_time),
                            storyId: story.id,
                        })),
                    })
                } else {
                    await prisma.chapter.create({
                        data: {
                            title: isVideo ? "Full Video" : "Full Audiobook",
                            order: 0,
                            startTime: 0,
                            endTime: parseFloat(String(duration)),
                            storyId: story.id,
                        },
                    })
                }
            } catch (error) {
                console.error(`Error processing file ${filepath}:`, error)
                // Continue to next file
            }
        }
    }

	return redirect(`/admin/stories`)
}

export default function NewStory() {
	const actionData = useActionData<typeof action>()
    const { tags } = useLoaderData<typeof loader>()
	const isPending = useIsPending()
    const [storyType, setStoryType] = useState<'audiobook' | 'readaloud'>('audiobook')
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [isUploading, setIsUploading] = useState(false)

	const [form] = useForm({
		id: 'story-editor',
		shouldRevalidate: 'onBlur',
	})
    const playlistCheckboxRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        if (storyType === 'audiobook') {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const fileInput = document.getElementById('audiobookFile') as HTMLInputElement

            if (!fileInput?.files?.length) {
                alert('Please select at least one file')
                return
            }

            setIsUploading(true)
            setUploadProgress(0)

            const xhr = new XMLHttpRequest()
            xhr.open('POST', window.location.href, true)

            // Track upload progress
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100
                    setUploadProgress(Math.round(percentComplete))
                }
            }

            xhr.onload = () => {
                setIsUploading(false)
                if (xhr.status >= 200 && xhr.status < 300) {
                   // If it's a redirect (usually is), we should follow it manually or just reload
                   // Remix actions usually return a redirect or JSON.
                   // If redirected, xhr.responseURL might be the new URL if browser followed it.
                   // But XHR follows redirects transparently.
                   // If the final URL is the stories page, navigate there.
                   if (xhr.responseURL && !xhr.responseURL.includes('stories/new')) {
                       window.location.href = xhr.responseURL
                   } else {
                       // Fallback
                       window.location.href = '/admin/stories'
                   }
                } else {
                    console.error('Upload failed:', xhr.statusText)
                    alert('Upload failed. Check console for details.')
                }
            }

            xhr.onerror = () => {
                setIsUploading(false)
                console.error('XHR Error')
                alert('Network error during upload.')
            }

            xhr.send(formData)
        }
        // For readaloud/youtube, just use default Remix behavior
    }

	return (
		<div className="container mx-auto p-6">
			<h1 className="mb-6 text-2xl font-bold">Add New Story</h1>

            {isUploading && (
                <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow border">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium">Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-orange-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Please wait while files are being uploaded and processed.</p>
                </div>
            )}

			<FormProvider context={form.context}>
				<Form
					method="POST"
					className="flex flex-col gap-y-6"
					{...getFormProps(form)}
					encType="multipart/form-data"
                    onSubmit={storyType === 'audiobook' ? handleUpload : undefined}
				>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <Label>Story Type</Label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="storyType"
                                        value="audiobook"
                                        checked={storyType === 'audiobook'}
                                        onChange={() => setStoryType('audiobook')}
                                        className="w-4 h-4 text-orange-600"
                                    />
                                    Audiobook / Video Upload
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="storyType"
                                        value="readaloud"
                                        checked={storyType === 'readaloud'}
                                        onChange={() => setStoryType('readaloud')}
                                        className="w-4 h-4 text-orange-600"
                                    />
                                    Read Aloud (YouTube)
                                </label>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tags">Tags / Collections</Label>
                            <div className="flex gap-2 mt-2 mb-2">
                                <input
                                    type="text"
                                    name="newTagName"
                                    placeholder="Create New Tag..."
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2 border p-4 rounded-lg bg-slate-50 dark:bg-slate-900 max-h-48 overflow-y-auto">
                                {tags.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No tags available. Create some in Admin.</p>}
                                {tags.map((tag) => (
                                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="tagIds"
                                            value={tag.id}
                                            defaultChecked={tag.isDefault}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                        <span className="text-sm">{tag.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {storyType === 'audiobook' ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors bg-slate-50 dark:bg-slate-900"
                            onDragOver={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                e.currentTarget.classList.add('border-orange-500')
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                e.currentTarget.classList.remove('border-orange-500')
                            }}
                            onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                e.currentTarget.classList.remove('border-orange-500')
                                const files = e.dataTransfer.files
                                if (files && files.length > 0) {
                                    const input = document.getElementById('audiobookFile') as HTMLInputElement
                                    if (input) {
                                        input.files = files
                                        // Trigger change event manually if needed, but setting files usually enough for submission
                                        // Visual update:
                                        const count = files.length
                                        const label = document.getElementById('file-count-label')
                                        if (label) label.innerText = count > 0 ? `${count} files selected` : ''
                                    }
                                }
                            }}
                        >
                            <Label htmlFor="audiobookFile" className="cursor-pointer block w-full h-full">
                                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                                    <span className="text-4xl">📂</span>
                                    <span className="font-medium text-lg">Click to Upload or Drag & Drop</span>
                                    <span className="text-sm text-muted-foreground">Support for Audio (.mp3, .m4b) and Video (.mp4, .mkv, .webm)</span>
                                    <span className="text-xs text-muted-foreground mt-1">Max file size: 5GB (Configured)</span>
                                </div>
                            </Label>
                            <input
                                id="audiobookFile"
                                name="audiobookFile"
                                type="file"
                                accept=".m4b,.mp3,.mp4,.mkv,.webm,audio/*,video/*"
                                required
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    const count = e.target.files?.length || 0
                                    const label = document.getElementById('file-count-label')
                                    if (label) label.innerText = count > 0 ? `${count} files selected` : ''
                                }}
                            />
                            <p id="file-count-label" className="mt-4 text-sm font-medium text-orange-600 h-5"></p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <Label htmlFor="youtubeUrl">YouTube URLs (One per line, optional format: URL [start] [end])</Label>
                                <textarea
                                    id="youtubeUrl"
                                    name="youtubeUrl"
                                    required
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if ((val.includes('list=') || val.includes('/playlist'))) {
                                            // Check if we already prompted or if checked
                                            if (!playlistCheckboxRef.current?.checked) {
                                                 // Use setTimeout to avoid blocking the render/input event immediately
                                                 setTimeout(() => {
                                                     if (window.confirm("Playlist URL detected. Do you want to download the full playlist?")) {
                                                         if (playlistCheckboxRef.current) playlistCheckboxRef.current.checked = true
                                                     }
                                                 }, 100)
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="downloadPlaylist"
                                    name="downloadPlaylist"
                                    ref={playlistCheckboxRef}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <Label htmlFor="downloadPlaylist" className="font-normal">
                                    Download full playlist (if URL is a playlist or contains a list ID)
                                </Label>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="startTime">Start Time (Optional, MM:SS or SS)</Label>
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="text"
                                        placeholder="0:00"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="endTime">End Time (Optional, MM:SS or SS)</Label>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="text"
                                        placeholder="10:00"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="title">Title (Optional)</Label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="My Custom Title"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <Label htmlFor="playlistWaitTime">Playlist Wait Time (minutes, default 10)</Label>
                                <input
                                    id="playlistWaitTime"
                                    name="playlistWaitTime"
                                    type="number"
                                    min="0"
                                    defaultValue="10"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Time to wait between downloading videos in a playlist to avoid bot detection.</p>
                            </div>
                        </>
                    )}

					{actionData?.error && (
						<div className="min-h-[32px] px-4 pb-3 pt-1">
							<p className="text-sm text-red-500">{actionData.error}</p>
						</div>
					)}

					<div className="flex justify-end gap-4">
						<Button type="reset" variant="secondary">
							Reset
						</Button>
						<StatusButton
							type="submit"
							disabled={isPending}
							status={isPending ? 'pending' : 'idle'}
						>
							{storyType === 'audiobook' ? 'Upload & Process Files' : 'Download & Add'}
						</StatusButton>
					</div>
				</Form>
			</FormProvider>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
