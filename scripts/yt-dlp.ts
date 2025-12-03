import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline'
import YtDlpWrapImport from 'yt-dlp-wrap'

const YtDlpWrap = (YtDlpWrapImport as any).default ?? YtDlpWrapImport

async function ensureYtDlp() {
    const binaryPath = path.join(process.cwd(), 'bin', 'yt-dlp')

    if (!fs.existsSync(binaryPath)) {
        console.log('Downloading yt-dlp binary to', binaryPath)
        await fs.promises.mkdir(path.dirname(binaryPath), { recursive: true })
        await YtDlpWrap.downloadFromGithub(binaryPath)
        await fs.promises.chmod(binaryPath, '755')
    } else {
        try {
             console.log('Checking for yt-dlp updates...')
             execSync(`${binaryPath} -U`, { stdio: 'inherit' })
        } catch (e) {
            console.warn('Failed to update yt-dlp, continuing with existing version')
        }
    }
    return binaryPath
}

function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close()
            resolve(ans)
        })
    )
}

async function download() {
    const url = process.argv[2]
    if (!url) {
        console.error('Please provide a video or playlist URL')
        process.exit(1)
    }

    const outputDir = path.join(os.homedir(), 'Downloads')
    await fs.promises.mkdir(outputDir, { recursive: true })

    const binaryPath = await ensureYtDlp()

    // Check if URL contains 'list='
    let isPlaylist = url.includes('list=')
    if (isPlaylist) {
        const answer = await askQuestion('This URL contains a playlist. Download whole playlist? (y/N): ')
        if (answer.toLowerCase().startsWith('y')) {
            isPlaylist = true
            console.log('Downloading full playlist...')
        } else {
            isPlaylist = false
            console.log('Downloading single video...')
        }
    } else {
        console.log('Downloading single video...')
    }

    let playlistStartIndex: string | null = null
    try {
        const urlObj = new URL(url)
        playlistStartIndex = urlObj.searchParams.get('index')
    } catch {
        // ignore invalid url parsing, handled by yt-dlp later
    }

    console.log(`Saving to ${outputDir}...`)

    const outputTemplate = isPlaylist
        ? path.join(outputDir, '%(playlist_title)s', '%(title)s.%(ext)s')
        : path.join(outputDir, '%(title)s.%(ext)s')

    const args = [
        url,
        '-f', 'bestvideo+bestaudio/best',
        '--merge-output-format', 'mp4',
        '-o', outputTemplate,

        // Embed metadata
        '--add-metadata',
        // Put ID in comment just in case, though we hash for dupe check now
        '--parse-metadata', 'id:%(meta_comment)s',
        '--embed-thumbnail',
        '--convert-thumbnails', 'jpg',

        // Playlist handling
        isPlaylist ? '--yes-playlist' : '--no-playlist',
        '--ignore-errors',
    ]

    if (isPlaylist && playlistStartIndex) {
        console.log(`Starting playlist from index ${playlistStartIndex}`)
        args.push('--playlist-items', `${playlistStartIndex}:`)
    }

    console.log('Running yt-dlp...')

    const child = spawn(binaryPath, args)

    child.stdout.on('data', (data) => process.stdout.write(data))
    child.stderr.on('data', (data) => process.stderr.write(data))

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`\n❌ Download failed (Exit code ${code})`)
        } else {
            console.log(`\n✅ Download complete!`)
            console.log(`📂 Files saved to: ${outputDir}`)
            if (isPlaylist) console.log(`   (Inside subfolder matching playlist name)`)
        }
    })
}

void download().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
