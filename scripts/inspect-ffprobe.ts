import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'

async function inspectChapters() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Please provide a file path')
    process.exit(1)
  }

  const filePath = args[0]
  console.log(`Inspecting with ffprobe: ${filePath}`)

  try {
    const info = await ffprobe(filePath, { path: ffprobeStatic.path })
    console.dir(info, { depth: null })

    // console.log(JSON.stringify(info, null, 2))

    const chapters = info.chapters || []
    console.log(`Found ${chapters.length} chapters`)

    if (chapters.length > 0) {
        console.log('Sample chapters:', chapters.slice(0, 3))
    }

  } catch (error) {
    console.error('Error parsing with ffprobe:', error)
  }
}

inspectChapters()

