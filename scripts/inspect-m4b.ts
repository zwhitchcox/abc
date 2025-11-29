import path from 'path'
import { parseFile } from 'music-metadata'

async function inspectMetadata() {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Please provide a file path')
    process.exit(1)
  }

  const filePath = args[0]
  console.log(`Inspecting: ${filePath}`)

  try {
    const metadata = await parseFile(filePath, { duration: true, skipCovers: false })

    console.log('--- iTunes Tags ---')
    // Log first few iTunes tags to see structure
    if (metadata.native.iTunes) {
        console.log(JSON.stringify(metadata.native.iTunes.slice(0, 10), null, 2))

        // Check for anything looking like chapter data
        const potentialChapters = metadata.native.iTunes.filter(tag =>
            tag.id.toLowerCase().includes('chap') ||
            tag.id.toLowerCase().includes('track')
        )
        if (potentialChapters.length > 0) {
            console.log('\nPotential Chapter Tags:', JSON.stringify(potentialChapters, null, 2))
        }
    }

  } catch (error) {
    console.error('Error parsing metadata:', error)
  }
}

inspectMetadata()
