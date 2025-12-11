import http from 'http'
import https from 'https'
import path from 'path'
import fs from 'fs-extra'

export async function downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath)
        const protocol = url.startsWith('https') ? https : http

        const request = protocol.get(url, (response) => {
            const contentType = response.headers['content-type'] || ''
            if (!contentType.startsWith('image/')) {
                file.close()
                fs.unlink(filepath, () => {})
                reject(new Error('Not an image'))
                return
            }

            response.pipe(file)
            file.on('finish', () => {
                file.close()
                resolve()
            })
        })

        request.on('error', (err) => {
            fs.unlink(filepath, () => {})
            reject(err)
        })

        request.setTimeout(10000, () => {
            request.destroy()
            fs.unlink(filepath, () => {})
            reject(new Error('Download timeout'))
        })
    })
}

export async function downloadImagesForItem(
    topic: string,
    item: string,
    imagesDir: string,
    count: number
): Promise<{ downloaded: number }> {
    const { chromium } = await import('@playwright/test')

    const topicDir = path.join(imagesDir, topic.toLowerCase().replace(/\s+/g, '-'))
    const itemDir = path.join(topicDir, item.toLowerCase().replace(/\s+/g, '-'))
    await fs.ensureDir(itemDir)

    const existingImages = (await fs.readdir(itemDir)).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    const startIndex = existingImages.length

    let browser
    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled']
        })

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 }
        })

        const page = await context.newPage()
        const searchQuery = `${topic} ${item}`
        await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&FORM=HDRSC2`)
        await page.waitForSelector('img.mimg', { timeout: 10000 })

        for (let i = 0; i < 3; i++) {
            await page.evaluate(() => window.scrollBy(0, window.innerHeight))
            await page.waitForTimeout(500)
        }

        const imageData = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('a.iusc'))
            return images.map(link => {
                try {
                    const m = link.getAttribute('m')
                    if (m) {
                        const data = JSON.parse(m) as { murl?: string; turl?: string }
                        return data.murl || data.turl
                    }
                } catch {}
                return null
            }).filter((url): url is string => url !== null && url !== undefined && (url.startsWith('http://') || url.startsWith('https://')))
        })

        let downloaded = 0
        for (let i = 0; i < imageData.length && downloaded < count; i++) {
            const url = imageData[i]
            if (!url) continue

            try {
                const urlObj = new URL(url)
                const extension = path.extname(urlObj.pathname) || '.jpg'
                const filename = `${item.toLowerCase().replace(/\s+/g, '-')}-${startIndex + downloaded + 1}${extension}`
                const filepath = path.join(itemDir, filename)

                if (!fs.existsSync(filepath)) {
                    await downloadImage(url, filepath)
                    downloaded++
                }
            } catch {}
        }

        await browser.close()
        return { downloaded }
    } catch (error) {
        if (browser) await browser.close()
        throw error
    }
}

export async function downloadImagesForTopic(
    topicName: string,
    items: string[],
    imagesDir: string,
    imagesPerItem: number
): Promise<{ downloaded: number; results: { item: string; downloaded: number }[] }> {
    const { chromium } = await import('@playwright/test')

    const topicDir = path.join(imagesDir, topicName.toLowerCase().replace(/\s+/g, '-'))
    await fs.ensureDir(topicDir)

    const itemsNeedingImages: { name: string; needed: number }[] = []
    for (const itemName of items) {
        const itemDir = path.join(topicDir, itemName.toLowerCase().replace(/\s+/g, '-'))
        await fs.ensureDir(itemDir)
        const files = await fs.readdir(itemDir)
        const existing = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length
        const needed = imagesPerItem - existing
        if (needed > 0) {
            itemsNeedingImages.push({ name: itemName, needed })
        }
    }

    if (itemsNeedingImages.length === 0) {
        return { downloaded: 0, results: [] }
    }

    let browser
    let totalDownloaded = 0
    const results: { item: string; downloaded: number }[] = []

    try {
        browser = await chromium.launch({
            headless: true,
            args: ['--disable-blink-features=AutomationControlled']
        })

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 }
        })

        const page = await context.newPage()

        for (const { name: itemName, needed } of itemsNeedingImages) {
            const itemDir = path.join(topicDir, itemName.toLowerCase().replace(/\s+/g, '-'))
            const existingImages = (await fs.readdir(itemDir)).filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
            const startIndex = existingImages.length

            try {
                const searchQuery = `${topicName} ${itemName}`
                await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(searchQuery)}&FORM=HDRSC2`)
                await page.waitForSelector('img.mimg', { timeout: 10000 })

                for (let i = 0; i < 3; i++) {
                    await page.evaluate(() => window.scrollBy(0, window.innerHeight))
                    await page.waitForTimeout(500)
                }

                const imageData = await page.evaluate(() => {
                    const images = Array.from(document.querySelectorAll('a.iusc'))
                    return images.map(link => {
                        try {
                            const m = link.getAttribute('m')
                            if (m) {
                                const data = JSON.parse(m) as { murl?: string; turl?: string }
                                return data.murl || data.turl
                            }
                        } catch {}
                        return null
                    }).filter((url): url is string => typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')))
                })

                let downloaded = 0
                for (let i = 0; i < imageData.length && downloaded < needed; i++) {
                    const url = imageData[i]
                    if (!url) continue

                    try {
                        const urlObj = new URL(url)
                        const extension = path.extname(urlObj.pathname) || '.jpg'
                        const filename = `${itemName.toLowerCase().replace(/\s+/g, '-')}-${startIndex + downloaded + 1}${extension}`
                        const filepath = path.join(itemDir, filename)

                        if (!fs.existsSync(filepath)) {
                            await downloadImage(url, filepath)
                            downloaded++
                            totalDownloaded++
                        }
                    } catch {}
                }

                results.push({ item: itemName, downloaded })
                await page.waitForTimeout(1000)
            } catch {
                results.push({ item: itemName, downloaded: 0 })
            }
        }

        await browser.close()
        return { downloaded: totalDownloaded, results }
    } catch (error) {
        if (browser) await browser.close()
        throw error
    }
}

