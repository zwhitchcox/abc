import { spawn } from 'child_process'
import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import { chromium } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

async function downloadImageToBuffer(url: string): Promise<{ buffer: Buffer, contentType: string }> {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http
        const request = protocol.get(url, (response) => {
            const contentType = response.headers['content-type'] || 'image/jpeg'
            const chunks: any[] = []

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download image: ${response.statusCode}`))
                return
            }

            response.on('data', (chunk) => chunks.push(chunk))
            response.on('end', () => {
                resolve({ buffer: Buffer.concat(chunks), contentType })
            })
        })

        request.on('error', reject)
        request.setTimeout(10000, () => {
            request.destroy()
            reject(new Error('Timeout'))
        })
    })
}

async function findImage(page: any, query: string): Promise<{ buffer: Buffer, contentType: string } | null> {
    console.log(`Searching image for: ${query}`)
    try {
        await page.goto(
            `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&FORM=HDRSC2`,
            { timeout: 30000 }
        )

        await page.waitForSelector('img.mimg', { timeout: 5000 })

        // Get first valid image URL
        const imageUrl = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a.iusc'))
            for (const link of links) {
                const m = link.getAttribute('m')
                if (m) {
                    try {
                        const data: any = JSON.parse(m)
                        const url = data.murl || data.turl
                        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                            return url
                        }
                    } catch {}
                }
            }
            return null
        })

        if (imageUrl) {
            console.log(`Found image: ${imageUrl}`)
            return await downloadImageToBuffer(imageUrl)
        }
    } catch (e) {
        console.error('Image search failed:', e)
    }
    return null
}

async function splitAudio(inputPath: string, start: number, end: number, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // -c copy is fast but might be slightly inaccurate on cuts.
        // If issues arise, remove "-c", "copy" to re-encode (slower).
        const duration = end - start
        if (duration <= 0) {
            return reject(new Error('Invalid duration'))
        }

        const args = [
            '-i', inputPath,
            '-ss', String(start),
            '-to', String(end),
            '-c', 'copy',
            '-y', // overwrite
            outputPath
        ]

        const ffmpeg = spawn('ffmpeg', args)

        ffmpeg.on('close', (code) => {
            if (code === 0) resolve()
            else reject(new Error(`ffmpeg exited with code ${code}`))
        })

        ffmpeg.on('error', reject)
    })
}

async function main() {
    const storyId = process.argv[2]
    if (!storyId) {
        console.error('Usage: npx tsx scripts/split-m4b.ts <storyId>')
        process.exit(1)
    }

    console.log(`Fetching story: ${storyId}`)
    const story = await prisma.story.findUnique({
        where: { id: storyId },
        include: { chapters: { orderBy: { order: 'asc' } }, audio: true }
    })

    if (!story || !story.audio?.filepath) {
        console.error('Story or audio file not found')
        process.exit(1)
    }

    const tagName = slugify(story.title)
    let tag = await prisma.tag.findFirst({ where: { name: tagName } })
    if (!tag) {
        console.log(`Creating tag: ${tagName}`)
        tag = await prisma.tag.create({ data: { name: tagName } })
    } else {
        console.log(`Using existing tag: ${tagName}`)
    }

    // Fetch default tags
    const defaultTags = await prisma.tag.findMany({ where: { isDefault: true } })
    const tagsToConnect = [{ id: tag.id }, ...defaultTags.map(t => ({ id: t.id }))]

    // Ensure original story has the tag too?
    await prisma.story.update({
        where: { id: story.id },
        data: { tags: { connect: tagsToConnect } }
    })

    console.log('Launching browser for image search...')
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    const page = await context.newPage()

    const splitDir = path.join(path.dirname(story.audio.filepath), `split_${story.id}`)
    if (!fs.existsSync(splitDir)) {
        fs.mkdirSync(splitDir, { recursive: true })
    }

    console.log(`Processing ${story.chapters.length} chapters...`)

    for (const chapter of story.chapters) {
        console.log(`\nProcessing Chapter ${chapter.order + 1}: ${chapter.title}`)

        // 1. Split Audio
        const safeTitle = slugify(chapter.title)
        const filename = `${String(chapter.order).padStart(2, '0')}-${safeTitle}.m4b`
        const outputPath = path.join(splitDir, filename)

        if (chapter.endTime) {
            try {
                if (!fs.existsSync(outputPath)) {
                    console.log(`Splitting audio (${chapter.startTime} -> ${chapter.endTime})...`)
                    await splitAudio(story.audio.filepath, chapter.startTime, chapter.endTime, outputPath)
                } else {
                    console.log('Audio file already exists, skipping split.')
                }

                // 2. Find Image
                const query = `${chapter.title} ${story.title} illustration`
                const image = await findImage(page, query)

                // 3. Create Story
                console.log('Creating Story record...')
                await prisma.story.create({
                    data: {
                        title: chapter.title,
                        type: 'audiobook',
                        tags: { connect: tagsToConnect },
                        images: image ? {
                            create: {
                                contentType: image.contentType,
                                blob: image.buffer,
                                altText: chapter.title
                            }
                        } : undefined,
                        audio: {
                            create: {
                                contentType: 'audio/mp4',
                                filepath: outputPath
                            }
                        },
                        chapters: {
                            create: {
                                title: chapter.title,
                                order: 0,
                                startTime: 0,
                                endTime: chapter.endTime - chapter.startTime
                            }
                        }
                    }
                })
                console.log('Done.')

            } catch (e) {
                console.error(`Failed to process chapter ${chapter.title}:`, e)
            }
        } else {
            console.warn(`Skipping chapter ${chapter.title}: No end time.`)
        }
    }

    await browser.close()
    console.log('\nAll done!')
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})

