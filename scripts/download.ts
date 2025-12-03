import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline'
import YtDlpWrapImport from 'yt-dlp-wrap'

const YtDlpWrap = (YtDlpWrapImport as any).default ?? YtDlpWrapImport

async function ensureYtDlp() {
    try {
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

async function downloadPlaylist() {
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

    console.log(`Saving to ${outputDir}...`)

    const args = [
        url,
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '-o', path.join(outputDir, '%(title)s.%(ext)s'),

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

    console.log('Running yt-dlp...')

    const child = spawn(binaryPath, args)

    child.stdout.on('data', (data) => process.stdout.write(data))
    child.stderr.on('data', (data) => process.stderr.write(data))

    child.on('close', (code) => {
        console.log(`\nDownload complete! Files saved to: ${outputDir}`)
        console.log(`(Exit code ${code})`)
    })
}

void downloadPlaylist().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
