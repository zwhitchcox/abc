import { invariantResponse } from '@epic-web/invariant'
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useNavigate } from '@remix-run/react'
import { useState, useEffect, useRef } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from '#app/components/ui/sheet.tsx'
import { usePlayer } from '#app/context/player.tsx'
import { getUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { cn } from '#app/utils/misc.tsx'

export async function loader({ request, params }: LoaderFunctionArgs) {
	invariantResponse(params.storyId, 'Story ID is required')

    const userId = await getUserId(request)

	const story = await prisma.story.findUnique({
		where: { id: params.storyId },
		select: {
			id: true,
			title: true,
            type: true,
            tags: true,
			images: {
				select: {
					id: true,
					altText: true,
				},
				take: 1,
			},
			audio: {
				select: {
					id: true,
                    contentType: true,
				},
			},
			chapters: {
				select: {
					id: true,
					title: true,
					startTime: true,
					endTime: true,
				},
				orderBy: {
					order: 'asc',
				},
			},
		},
	})

	invariantResponse(story, 'Story not found', { status: 404 })

    let progress = null
    let parentSettings = null
    if (userId) {
        progress = await prisma.storyProgress.findUnique({
            where: {
                userId_storyId: { userId, storyId: params.storyId }
            }
        })
        parentSettings = await prisma.parentSettings.findUnique({
            where: { userId }
        })

        // Check Global Limit
        if (parentSettings?.globalLimitSeconds) {
             const now = new Date()
             const windowStart = new Date(now.getTime() - parentSettings.globalIntervalSeconds * 1000)
             const globalLogs = await prisma.usageLog.findMany({
                 where: {
                     userId,
                     createdAt: { gt: windowStart }
                 }
             })
             const globalTotal = globalLogs.reduce((acc, log) => acc + log.secondsPlayed, 0)

             if (globalTotal >= parentSettings.globalLimitSeconds) {
                  throw redirect(`/timeout?reason=Global Time Limit Reached`)
             }
        }

        // Hybrid Restriction Check
        if (!story.tags || story.tags.length === 0) {
            throw redirect(`/timeout?reason=No Tags Assigned`)
        }

        const timeZone = parentSettings?.timeZone || 'UTC'
        const now = new Date()

        let hasEnabledTag = false
        let blockingReason: string | null = null

        for (const tag of story.tags) {
            if (tag.enabled) hasEnabledTag = true

            // Check Hours (Restrictive)
            if (tag.restrictedHoursStart !== null && tag.restrictedHoursEnd !== null) {
                try {
                    const formatter = new Intl.DateTimeFormat('en-US', {
                        timeZone,
                        hour: 'numeric',
                        hour12: false
                    })
                    const hour = parseInt(formatter.format(now)) % 24

                    let inRange = false
                    if (tag.restrictedHoursStart < tag.restrictedHoursEnd) {
                        inRange = hour >= tag.restrictedHoursStart && hour < tag.restrictedHoursEnd
                    } else if (tag.restrictedHoursStart > tag.restrictedHoursEnd) {
                         inRange = hour >= tag.restrictedHoursStart || hour < tag.restrictedHoursEnd
                    }

                    if (inRange) blockingReason = `Restricted Hours`
                } catch (e) {
                    console.error('Timezone check failed:', e)
                }
            }

            // Check Limits (Restrictive)
            if (!blockingReason && tag.limitSeconds) {
                const windowStart = new Date(now.getTime() - tag.intervalSeconds * 1000)
                const logs = await prisma.usageLog.findMany({
                    where: {
                        userId,
                        story: { tags: { some: { id: tag.id } } },
                        createdAt: { gt: windowStart }
                    }
                })
                const total = logs.reduce((acc, log) => acc + log.secondsPlayed, 0)
                if (total >= tag.limitSeconds) blockingReason = `Time Limit (${tag.name})`
            }

            if (blockingReason) break
        }

        if (blockingReason) {
            throw redirect(`/timeout?reason=${encodeURIComponent(blockingReason)}`)
        }

        if (!hasEnabledTag) {
            throw redirect(`/timeout?reason=Restricted`)
        }
    }

	return json({ story, progress, parentSettings })
}

// Helper to format seconds into MM:SS
function formatTime(seconds: number) {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function StoryPlayer() {
	const { story, progress, parentSettings } = useLoaderData<typeof loader>()
    const navigate = useNavigate()
    const {
        play, pause, resume, seek, nextChapter, prevChapter,
        currentTime, currentStory, isPlaying,
        setMaxVolume, setVolume, volume,
        currentChapterIndex
    } = usePlayer()

    const videoRef = useRef<HTMLVideoElement>(null)
    const [, setTitleTapCount] = useState(0)

    // Sync Max Volume
    useEffect(() => {
        if (parentSettings?.maxVolume) setMaxVolume(parentSettings.maxVolume)
    }, [parentSettings, setMaxVolume])

    // Init Player
    useEffect(() => {
        if (currentStory?.id !== story.id) {
            play(story as any, progress?.currentChapterIndex ?? 0, progress?.currentTime)

            // Safety net: Ensure seek happens even if race condition occurs
            if (progress?.currentTime) {
                const t = progress.currentTime
                setTimeout(() => seek(t), 100)
                setTimeout(() => seek(t), 500) // Double tap to be sure
            }
        }
    }, [story, play, currentStory, progress, seek])

    // Secret menu trigger
    const handleTitleClick = () => {
        setTitleTapCount(prev => {
            const newCount = prev + 1
            if (newCount >= 5) {
                navigate(`/admin/parent?storyId=${story.id}`)
                return 0
            }
            return newCount
        })
        setTimeout(() => setTitleTapCount(0), 2000)
    }

	const currentChapter = story.chapters[currentChapterIndex] || story.chapters[0]
	const hasNextChapter = currentChapterIndex < story.chapters.length - 1
	const hasPrevChapter = currentChapterIndex > 0

    const showFullControls = parentSettings?.showFullControls ?? false

    const chapterDuration = currentChapter ? (currentChapter.endTime ?? 0) - currentChapter.startTime : 0
    const currentProgress = Math.max(0, currentTime - (currentChapter?.startTime || 0))

    const isVideo = story.audio?.contentType?.startsWith('video/')

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = Number(e.target.value)
        if (currentChapter) {
            const newTime = currentChapter.startTime + seekTime
            seek(newTime)
        }
    }

    // Sync Video Time with Context (to trigger progress saves)
    const onVideoTimeUpdate = () => {
        if (videoRef.current) {
            const t = videoRef.current.currentTime
            // Ignore 0 if we are restoring a saved time
            if (t === 0 && progress?.currentTime && progress.currentTime > 1) {
                return
            }
            seek(t)
        }
    }

    // Force Video Restore
    useEffect(() => {
        const video = videoRef.current
        const savedTime = progress?.currentTime

        if (!video || !savedTime || savedTime < 1) return

        const restore = () => {
             if (Math.abs(video.currentTime - savedTime) > 1) {
                 video.currentTime = savedTime
             }
        }

        if (video.readyState >= 1) {
            restore()
        } else {
            video.addEventListener('loadedmetadata', restore, { once: true })
        }

        return () => {
            video.removeEventListener('loadedmetadata', restore)
        }
    }, [progress?.currentTime]) // Re-run if progress changes (unlikely unless nav)

    // Effect to sync video play/pause state with context
    useEffect(() => {
        if (isVideo && videoRef.current) {
            if (isPlaying) videoRef.current.play().catch(console.error)
            else videoRef.current.pause()
        }
    }, [isPlaying, isVideo])

            // Render Video Player
            if (isVideo) {
                return (
                    <div className="flex min-h-screen flex-col bg-black text-white relative">
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-50 flex items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
                    <Link
                        to="/stories"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors"
                    >
                        <Icon name="arrow-left" className="h-6 w-6 text-white" />
                        <span className="sr-only">Back</span>
                    </Link>
                    <h1
                        className="ml-4 text-lg font-bold text-white drop-shadow-md cursor-pointer select-none"
                        onClick={handleTitleClick}
                    >
                        {story.title}
                    </h1>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 flex items-center justify-center relative">
                    {story.audio?.id && (
                        <video
                            key={story.id}
                            ref={videoRef}
                            src={`/resources/audio-files/${story.audio.id}`}
                            onTimeUpdate={onVideoTimeUpdate}
                            controls
                            className="max-w-full max-h-screen w-full aspect-video"
                            playsInline
                            onPlay={resume}
                            onPause={pause}
                        />
                    )}
                </div>
            </div>
        )
    }

            // Render Audiobook Player
            return (
                <div className="flex min-h-screen flex-col bg-orange-50 dark:bg-stone-950 transition-colors relative">
			{/* Header */}
			<div className="flex items-center p-4 relative">
				<Link
					to="/stories"
					className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-stone-900 shadow-lg transition-transform hover:scale-110"
				>
					<Icon name="arrow-left" className="h-6 w-6 text-orange-600 dark:text-orange-400" />
					<span className="sr-only">Back</span>
				</Link>
				<h1
                    className="ml-4 text-xl font-bold text-orange-900 dark:text-orange-100 select-none cursor-pointer active:scale-95 transition-transform"
                    onClick={handleTitleClick}
                >
                    {story.title}
                </h1>

                <div className="ml-auto">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="rounded-full bg-white dark:bg-stone-900 p-3 shadow-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors">
                                <Icon name="list" className="h-6 w-6" />
                                <span className="sr-only">Chapters</span>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto p-0 dark:bg-stone-950 dark:border-stone-800">
                            <SheetHeader className="p-4 pb-2 sticky top-0 bg-white dark:bg-stone-950 z-10 border-b dark:border-stone-800">
                                <SheetTitle className="text-xl font-bold text-orange-900 dark:text-orange-100">Chapters</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col p-2">
                                {story.chapters.map((chapter, index) => (
                                    <SheetClose key={chapter.id} asChild>
                                        <button
                                            onClick={() => play(story as any, index)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-xl transition-all text-base font-medium border mb-2 dark:border-transparent",
                                                index === currentChapterIndex
                                                    ? "bg-orange-100 border-orange-200 text-orange-900 shadow-sm dark:bg-orange-900/30 dark:border-orange-900/50 dark:text-orange-100"
                                                    : "bg-white border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{index + 1}. {chapter.title}</span>
                                                {index === currentChapterIndex && <Icon name="play" className="h-4 w-4 opacity-50" />}
                                            </div>
                                        </button>
                                    </SheetClose>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
			</div>

			{/* Main Content */}
			<div className="flex flex-1 flex-col items-center justify-center p-6">
				{/* Cover Art */}
				<div className="relative aspect-square w-full max-w-md overflow-hidden rounded-3xl shadow-2xl">
					{story.images[0] ? (
						<img
							src={`/resources/story-images/${story.images[0].id}`}
							alt={story.images[0].altText ?? story.title}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-orange-200 dark:bg-stone-800">
							<Icon name="file-text" className="h-24 w-24 text-orange-400 dark:text-stone-600" />
						</div>
					)}

					{/* Play/Pause Overlay Button */}
					<button
						onClick={isPlaying ? pause : resume}
						className={cn(
							"absolute inset-0 flex items-center justify-center bg-black/20 transition-all active:scale-95",
							!isPlaying && "bg-black/40"
						)}
					>
						{isPlaying ? (
							<Icon name="pause" className="h-32 w-32 text-white opacity-0 transition-opacity hover:opacity-80 active:opacity-100" />
						) : (
							<Icon name="play" className="h-32 w-32 text-white drop-shadow-lg" />
						)}
					</button>
				</div>

				{/* Chapter Info */}
				<div className="mt-8 text-center w-full max-w-md">
					<h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 font-comic">
						{currentChapter?.title || `Chapter ${currentChapterIndex + 1}`}
					</h2>
					<p className="text-orange-700 dark:text-orange-200">
						{currentChapterIndex + 1} of {story.chapters.length}
					</p>

                    {/* Progress Bar (Conditional) */}
                    {showFullControls && (
                        <div className="mt-4 w-full">
                            <input
                                type="range"
                                min={0}
                                max={chapterDuration}
                                value={currentProgress}
                                onChange={handleSeek}
                                className="w-full h-2 bg-orange-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-600 dark:accent-orange-500"
                            />
                            <div className="flex justify-between text-xs text-orange-800 dark:text-orange-300 mt-1 font-mono">
                                <span>{formatTime(currentProgress)}</span>
                                <span>{formatTime(chapterDuration)}</span>
                            </div>
                        </div>
                    )}
				</div>

				{/* Navigation Controls */}
				<div className="mt-8 flex gap-8 items-center">
                    {/* Prev Button (Conditional) */}
                    {showFullControls && (
                        <button
                            onClick={prevChapter}
                            disabled={!hasPrevChapter}
                            className="rounded-full bg-white dark:bg-stone-900 p-4 shadow-lg disabled:opacity-30 text-orange-600 dark:text-orange-400 transition-transform hover:scale-105"
                        >
                            <Icon name="arrow-left" className="h-8 w-8" />
                            <span className="sr-only">Previous Chapter</span>
                        </button>
                    )}

					<button
						onClick={isPlaying ? pause : resume}
						className="rounded-full bg-orange-500 dark:bg-orange-600 p-6 shadow-lg text-white transition-transform hover:scale-105 active:scale-95"
					>
						{isPlaying ? (
							<Icon name="pause" className="h-10 w-10" />
						) : (
							<Icon name="play" className="h-10 w-10" />
						)}
					</button>

                    {/* Next Button (Conditional) */}
                    {showFullControls && (
                        <button
                            onClick={nextChapter}
                            disabled={!hasNextChapter}
                            className="rounded-full bg-white dark:bg-stone-900 p-4 shadow-lg disabled:opacity-30 text-orange-600 dark:text-orange-400 transition-transform hover:scale-105"
                        >
                            <Icon name="arrow-right" className="h-8 w-8" />
                            <span className="sr-only">Next Chapter</span>
                        </button>
                    )}
				</div>

                {/* Volume Control */}
                <div className="mt-6 w-full max-w-[240px] flex items-center gap-3 bg-white/50 dark:bg-stone-900/50 p-3 rounded-xl backdrop-blur-sm shadow-sm">
                    <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mr-1">Vol</div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 h-2 bg-orange-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-orange-600 dark:accent-orange-500"
                    />
                    <div className="text-xs font-mono text-orange-600 dark:text-orange-400 w-8 text-right">{volume}%</div>
                </div>
			</div>
		</div>
	)
}
