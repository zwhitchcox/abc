import path from 'path'
import { execa } from 'execa'
import fs from 'fs-extra'
import Groq from 'groq-sdk'
import OpenAI from 'openai'

const openai = new OpenAI()
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

async function getAudioDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execa('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', filePath
    ])
    return parseFloat(stdout)
  } catch (e) {
    return 0
  }
}

async function main() {
  const pdfPath = process.argv[2]
  const pageArgIndex = process.argv.indexOf('--page')
  const pageArg = pageArgIndex !== -1 ? process.argv[pageArgIndex + 1] : null

  if (!pdfPath || pdfPath.startsWith('--')) {
    console.error('Usage: npm run process-pdf <path-to-pdf> [--page <number|range>]')
    process.exit(1)
  }

  if (!fs.existsSync(pdfPath)) {
    console.error(`File not found: ${pdfPath}`)
    process.exit(1)
  }

  const filename = path.basename(pdfPath, path.extname(pdfPath))
  const outputDir = path.join(process.cwd(), 'data', 'processed-pdfs', filename)
  await fs.ensureDir(outputDir)

  const imagesDir = path.join(outputDir, 'images')
  await fs.ensureDir(imagesDir)
  const audioDir = path.join(outputDir, 'audio')
  await fs.ensureDir(audioDir)
  const textDir = path.join(outputDir, 'text')
  await fs.ensureDir(textDir)

  console.log(`Processing ${pdfPath}...`)
  console.log(`Output directory: ${outputDir}`)

  // 1. Convert PDF to Images (if needed)
  const existingImages = await fs.readdir(imagesDir).catch(() => [])
  const hasImages = existingImages.some((f) => f.endsWith('.jpg'))

  if (hasImages) {
    console.log('Images already exist, skipping conversion.')
  } else {
    console.log('Converting PDF to images (JPEG)...')
    try {
      await execa('pdftoppm', ['-jpeg', '-r', '300', pdfPath, path.join(imagesDir, 'page')])
    } catch (e) {
      console.error('Error converting PDF to images. Make sure "poppler" is installed (brew install poppler).')
      throw e
    }
  }

  // 2. Get Image Files
  let imageFiles = (await fs.readdir(imagesDir))
    .filter((f) => f.endsWith('.jpg'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/-(\d+)\.jpg$/)?.[1] || '0')
      const numB = parseInt(b.match(/-(\d+)\.jpg$/)?.[1] || '0')
      return numA - numB
    })

  if (pageArg) {
    if (pageArg.includes('-')) {
      const parts = pageArg.split('-').map(Number)
      const start = parts[0] ?? 0
      const end = parts[1] ?? 0
      imageFiles = imageFiles.filter((_, i) => {
        const pageNum = i + 1
        return pageNum >= start && pageNum <= end
      })
    } else {
      const targetPage = parseInt(pageArg)
      imageFiles = imageFiles.filter((_, i) => i + 1 === targetPage)
    }
  }

  console.log(`Processing ${imageFiles.length} pages.`)

  // Load existing markers
  const markersPath = path.join(outputDir, 'markers.json')
  let markers: any[] = []
  if (fs.existsSync(markersPath)) {
      try {
        markers = await fs.readJSON(markersPath)
      } catch (e) {}
  }

  // Helper to save markers safely
  const saveMarkers = async () => {
      // Sort markers by page
      markers.sort((a, b) => a.page - b.page)
      await fs.writeJSON(markersPath, markers, { spaces: 2 })

      // Also save full text
      const fullTextPath = path.join(outputDir, 'full_text.txt')
      const fullTextContent = markers
        .map((m) => `--- Page ${m.page} ---\n${m.text}\n`)
        .join('\n')
      await fs.writeFile(fullTextPath, fullTextContent)
  }

  const CONCURRENCY = 20
  let completed = 0
  const total = imageFiles.length

  const updateProgress = () => {
      const percent = Math.round((completed / total) * 100)
      if (process.stdout.isTTY) {
          process.stdout.write(`\rProgress: [${'='.repeat(Math.floor(percent / 2))}${' '.repeat(50 - Math.floor(percent / 2))}] ${percent}% (${completed}/${total})`)
      } else {
          console.log(`Progress: ${percent}% (${completed}/${total})`)
      }
  }

  async function processPage(imageFile: string) {
        const pageNum = parseInt(imageFile?.match(/-(\d+)\.jpg$/)?.[1] || '0')

        const existingMarker = markers.find(m => m.page === pageNum)
        if (existingMarker && (existingMarker.duration > 0 || existingMarker.text === "")) {
            completed++
            updateProgress()
            return
        }

        const textPath = path.join(textDir, `page-${pageNum}.txt`)
        const audioPath = path.join(audioDir, `page-${pageNum}.mp3`)

        if (fs.existsSync(textPath) && fs.existsSync(audioPath)) {
             const text = await fs.readFile(textPath, 'utf-8')
             // Only skip if we actually have text (or if we determined it's truly empty before? No, let's retry empty ones with new prompt)
             if (text.trim().length > 0) {
                 const duration = await getAudioDuration(audioPath)

                 const mkIndex = markers.findIndex(m => m.page === pageNum)
                 const newMarker = { page: pageNum, startTime: 0, duration, text }
                 if (mkIndex >= 0) markers[mkIndex] = newMarker
                 else markers.push(newMarker)

                 completed++
                 updateProgress()
                 return
             }
        }

        const buffer = await fs.readFile(path.join(imagesDir, imageFile))
        const imageContents = [{
            type: 'image_url' as const,
            image_url: { url: `data:image/jpeg;base64,${buffer.toString('base64')}` },
        }]

        const MAX_RETRIES = 3
        let retries = 0
        let success = false

        while (retries < MAX_RETRIES && !success) {
            try {
              console.time('getting page text for page ' + pageNum)
                const completion = await groq.chat.completions.create({
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                    messages: [{
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Extract all text from this book page that is part of the book content (Title, Author, Story Text, Illustrations Captions). Only exclude technical metadata (ISBN, copyright blocks, barcodes, publication info). If there is absolutely no readable text related to the book content, respond "NO_TEXT". Output only the extracted text.' },
                            ...imageContents,
                        ],
                    }],
                    max_tokens: 4096,
                    temperature: 0,
                })
              console.timeEnd('getting page text for page ' + pageNum)

                let extractedText = (completion.choices[0].message.content as string || '').trim()
                if (extractedText === 'NO_TEXT') extractedText = ''

                let duration = 0
                if (extractedText) {
                    await fs.writeFile(textPath, extractedText)

                    console.time('getting tone analysis for page ' + pageNum)
                    const toneAnalysis = await openai.chat.completions.create({
                        model: 'gpt-5.1',
                        messages: [{
                            role: 'user',
                            content: `Analyze text mood for narrator voice direction. Output instruction only. Text: "${extractedText.substring(0, 500)}"`,
                        }],
                        max_completion_tokens: 50,
                    })
                    console.timeEnd('getting tone analysis for page ' + pageNum)
                    const instructions = toneAnalysis.choices[0].message.content?.trim() || 'Speak in a warm, engaging storytelling voice.'

                    console.time('getting audio for page ' + pageNum)
                    const mp3 = await openai.audio.speech.create({
                        model: 'gpt-4o-mini-tts',
                        voice: 'echo',
                        input: extractedText,
                        instructions,
                    })
                    console.timeEnd('getting audio for page ' + pageNum)
                    const buffer = Buffer.from(await mp3.arrayBuffer())
                    await fs.writeFile(audioPath, buffer)

                    duration = await getAudioDuration(audioPath)
                }

                const mkIndex = markers.findIndex(m => m.page === pageNum)
                const newMarker = { page: pageNum, startTime: 0, duration, text: extractedText }
                if (mkIndex >= 0) markers[mkIndex] = newMarker
                else markers.push(newMarker)

                success = true
            } catch (e: any) {
                if (e.status === 429) {
                    const retryAfter = parseInt(e.headers?.['retry-after'] || '15')
                    const waitTime = (retryAfter * 1000) + 2000 // Add 2s buffer
                    if (process.stdout.isTTY) { process.stdout.clearLine(0); process.stdout.cursorTo(0); }
                    console.error(`  Rate limit hit for page ${pageNum}. Waiting ${waitTime/1000}s...`)
                    await new Promise(resolve => setTimeout(resolve, waitTime))
                    continue
                }

                if (process.stdout.isTTY) { process.stdout.clearLine(0); process.stdout.cursorTo(0); }
                console.error('error getting page text for page ' + pageNum, e)
                retries++
                if (retries === MAX_RETRIES) {
                     console.error(`  Skipping page ${pageNum} due to errors.`)
                }
            }
        }
        completed++
        updateProgress()
  }

  for (let i = 0; i < imageFiles.length; i += CONCURRENCY) {
      const chunk = imageFiles.slice(i, i + CONCURRENCY)
      await Promise.all(chunk.map(file => processPage(file)))
      await saveMarkers()
  }

  let currentOffset = 0
  markers.sort((a, b) => a.page - b.page)
  for (const m of markers) {
      m.startTime = currentOffset
      currentOffset += m.duration
  }
  await saveMarkers()

  console.log('\nDone!')
}

main().catch(console.error)
