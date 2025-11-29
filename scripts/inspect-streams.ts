import ffprobe from 'ffprobe'
import ffprobeStatic from 'ffprobe-static'

async function inspectStreams() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Please provide a file path')
    process.exit(1)
  }

  const filePath = args[0]
  console.log(`Inspecting streams with ffprobe: ${filePath}`)

  try {
    const info = await ffprobe(filePath, { path: ffprobeStatic.path })

    console.log(`Found ${info.streams.length} streams`)
    info.streams.forEach((s, i) => {
        console.log(`Stream ${i}: ${s.codec_type} (${s.codec_name})`)
        if (s.tags) {
            console.log('  Tags:', s.tags)
        }
    })

  } catch (error) {
    console.error('Error parsing with ffprobe:', error)
  }
}

inspectStreams()

