import 'dotenv/config'
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
  } catch {
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
  const baseDir = path.join(process.cwd(), 'data', 'processed-pdfs')
  await fs.ensureDir(baseDir)

  console.log(`Processing ${pdfPath}...`)

  // Generate clean title and folder name
  let cleanTitle = filename.replace(/-/g, ' ').replace(/\d+/g, '').trim()
  let folderName = filename

  console.log('Generating clean title...')
  try {
    const titleResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Clean up this PDF filename into a proper book title. Remove any numbers, IDs, file extensions, or artifacts. Just output the clean title, nothing else.\n\nFilename: "${filename}"`,
      }],
      max_tokens: 100,
    })
    const aiTitle = titleResponse.choices[0]?.message?.content?.trim()
    if (aiTitle) {
      cleanTitle = aiTitle
      folderName = aiTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')
    }
    console.log(`Title: ${cleanTitle}`)
  } catch {
    console.error('Failed to generate clean title, using filename')
    folderName = filename
  }

  // Check if folder already exists (either with old name or new name)
  let outputDir = path.join(baseDir, folderName)
  const oldOutputDir = path.join(baseDir, filename)

  if (fs.existsSync(oldOutputDir) && !fs.existsSync(outputDir)) {
    console.log(`Renaming folder from "${filename}" to "${folderName}"`)
    await fs.rename(oldOutputDir, outputDir)
  } else if (fs.existsSync(outputDir)) {
    console.log(`Using existing folder: ${folderName}`)
  } else {
    await fs.ensureDir(outputDir)
  }

  const imagesDir = path.join(outputDir, 'images')
  await fs.ensureDir(imagesDir)
  const audioDir = path.join(outputDir, 'audio')
  await fs.ensureDir(audioDir)
  const textDir = path.join(outputDir, 'text')
  await fs.ensureDir(textDir)

  console.log(`Output directory: ${outputDir}`)

  // Save metadata
  const metadataPath = path.join(outputDir, 'metadata.json')
  const metadata = { title: cleanTitle }
  await fs.writeJSON(metadataPath, metadata, { spaces: 2 })

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
      } catch {}
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
                            { type: 'text', text: 'Extract the main body text from this book page. EXCLUDE: page headers (chapter titles/names repeated at the top of every page), page numbers, running headers, technical metadata (ISBN, copyright, barcodes, publication info, price), introductory letters, reading level descriptions, promotional material, "About the Author" sections, back cover content (summaries, reviews, praise quotes, author bios on back). INCLUDE ONLY: the actual story/content text in the body of the page. If there is no body text, respond "NO_TEXT". Output only the extracted text.' },
                            ...imageContents,
                        ],
                    }],
                    max_tokens: 4096,
                    temperature: 0,
                })
              console.timeEnd('getting page text for page ' + pageNum)

                let extractedText = (completion.choices[0]?.message?.content as string || '').trim()
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
                    const instructions = toneAnalysis.choices[0]?.message?.content?.trim() || 'Speak in a warm, engaging storytelling voice.'

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
