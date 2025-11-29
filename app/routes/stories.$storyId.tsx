import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useFetcher, useNavigate } from '@remix-run/react'
import { useState, useRef, useEffect } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from '#app/components/ui/sheet.tsx'
import { getUserId, requireUserId } from '#app/utils/auth.server.ts'
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
    }

	return json({ story, progress, parentSettings })
}

export async function action({ request, params }: ActionFunctionArgs) {
    const userId = await requireUserId(request)
    invariantResponse(params.storyId, 'Story ID is required')

    const formData = await request.formData()
    const currentChapterIndex = Number(formData.get('currentChapterIndex'))
    const currentTime = Number(formData.get('currentTime'))

    await prisma.storyProgress.upsert({
        where: {
            userId_storyId: { userId, storyId: params.storyId }
        },
        update: {
            currentChapterIndex,
            currentTime,
        },
        create: {
            userId,
            storyId: params.storyId,
            currentChapterIndex,
            currentTime,
        }
    })

    return json({ success: true })
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
    const fetcher = useFetcher()
    const navigate = useNavigate()

	const [currentChapterIndex, setCurrentChapterIndex] = useState(progress?.currentChapterIndex ?? 0)
	const [isPlaying, setIsPlaying] = useState(false)
    const [hasRestored, setHasRestored] = useState(false)
    const [currentProgress, setCurrentProgress] = useState(0)

    // Session counter for chapters played (starts at 0, increments when a chapter finishes)
    const [sessionChaptersPlayed, setSessionChaptersPlayed] = useState(0)

    // Secret menu trigger state
    const [, setTitleTapCount] = useState(0)

	const mediaRef = useRef<HTMLMediaElement>(null)

    // Track previous chapter index to detect actual changes
    const prevChapterIndexRef = useRef(progress?.currentChapterIndex ?? 0)

	const currentChapter = story.chapters[currentChapterIndex]
	const hasNextChapter = currentChapterIndex < story.chapters.length - 1
	const hasPrevChapter = currentChapterIndex > 0

    const maxChaptersToPlay = parentSettings?.maxChaptersToPlay ?? 1
    const showFullControls = parentSettings?.showFullControls ?? false

    const chapterDuration = currentChapter ? (currentChapter.endTime ?? 0) - currentChapter.startTime : 0

    const isVideo = story.audio?.contentType?.startsWith('video/')

    // Secret menu trigger
    const handleTitleClick = () => {
        setTitleTapCount(prev => {
            const newCount = prev + 1
            if (newCount >= 5) { // 5 taps to trigger
                navigate(`/settings/parent?storyId=${story.id}`)
                return 0
            }
            return newCount
        })
        // Reset tap count after 2 seconds if not triggered
        setTimeout(() => setTitleTapCount(0), 2000)
    }

	// Effect to handle play/pause
	useEffect(() => {
		if (mediaRef.current) {
			if (isPlaying) {
				mediaRef.current.play().catch(console.error)
			} else {
				mediaRef.current.pause()
			}
		}
	}, [isPlaying])

    // Effect: Restore Progress ONCE
	useEffect(() => {
		if (mediaRef.current && progress && !hasRestored) {
            const time = progress.currentTime
            if (time > 0) {
                mediaRef.current.currentTime = time
            }
            setHasRestored(true)
		} else if (!progress && !hasRestored) {
            setHasRestored(true)
        }
	}, [progress, hasRestored])

    // Effect: Handle Chapter Changes (Navigation)
    useEffect(() => {
        if (!hasRestored) return // Wait for restoration first

        if (prevChapterIndexRef.current !== currentChapterIndex) {
             if (mediaRef.current && currentChapter) {
                 mediaRef.current.currentTime = currentChapter.startTime
             }
             prevChapterIndexRef.current = currentChapterIndex
             // Reset progress bar visual
             setCurrentProgress(0)
        }
    }, [currentChapterIndex, currentChapter, hasRestored])


    // Save progress function
    const saveProgress = () => {
        if (mediaRef.current && story.id) {
            const time = mediaRef.current.currentTime
            fetcher.submit({
                currentChapterIndex: String(currentChapterIndex),
                currentTime: String(time)
            }, { method: 'post' })
        }
    }

    // Auto-save progress periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (isPlaying) {
                saveProgress()
            }
        }, 10000) // Save every 10 seconds
        return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, currentChapterIndex])

	const togglePlay = () => {
        if (isPlaying) {
            saveProgress() // Save when pausing
            setIsPlaying(false)
        } else {
            // Check if we are at the end of the chapter and need to advance manually
            if (mediaRef.current && currentChapter && currentChapter.endTime && mediaRef.current.currentTime >= currentChapter.endTime - 0.5) {
                if (hasNextChapter) {
                    setSessionChaptersPlayed(0)
                    nextChapter()
                } else {
                    mediaRef.current.currentTime = currentChapter.startTime
                    setIsPlaying(true)
                }
            } else {
                setIsPlaying(true)
            }
        }
	}

	const nextChapter = () => {
		if (hasNextChapter) {
            saveProgress() // Save before switching
			setCurrentChapterIndex(currentChapterIndex + 1)
			setIsPlaying(true)
		}
	}

	const prevChapter = () => {
		if (hasPrevChapter) {
            saveProgress() // Save before switching
			setCurrentChapterIndex(currentChapterIndex - 1)
            setIsPlaying(true)
		}
	}

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = Number(e.target.value)
        if (mediaRef.current && currentChapter) {
            const newTime = currentChapter.startTime + seekTime
            mediaRef.current.currentTime = newTime
            setCurrentProgress(seekTime)
        }
    }

	const onTimeUpdate = () => {
		if (!mediaRef.current || !currentChapter) return

        // Update progress bar state
        const relativeTime = mediaRef.current.currentTime - currentChapter.startTime
        // Clamp to 0 and duration
        const clampedTime = Math.max(0, Math.min(relativeTime, chapterDuration))
        setCurrentProgress(clampedTime)

		// Check if we passed the end of the current chapter
		if (currentChapter.endTime && mediaRef.current.currentTime >= currentChapter.endTime) {
            const newSessionCount = sessionChaptersPlayed + 1
            setSessionChaptersPlayed(newSessionCount)

            if (newSessionCount >= maxChaptersToPlay) {
                setIsPlaying(false)
                mediaRef.current.pause()
            } else if (hasNextChapter) {
                nextChapter()
            } else {
                setIsPlaying(false)
                mediaRef.current.pause()
            }
            saveProgress()
		}
	}

    // Render Video Player
    if (isVideo) {
        return (
            <div className="flex min-h-screen flex-col bg-black text-white">
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
                            ref={mediaRef as React.RefObject<HTMLVideoElement>}
                            src={`/resources/audio-files/${story.audio.id}`}
                            onTimeUpdate={onTimeUpdate}
                            controls // Use native controls for video
                            className="max-w-full max-h-screen w-full aspect-video"
                            playsInline
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    )}
                </div>
            </div>
        )
    }

    // Render Audiobook Player
	return (
		<div className="flex min-h-screen flex-col bg-orange-50 dark:bg-stone-950 transition-colors">
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
                                            onClick={() => {
                                                if (currentChapterIndex !== index) {
                                                    setCurrentChapterIndex(index)
                                                    setIsPlaying(true)
                                                    setSessionChaptersPlayed(0)
                                                }
                                            }}
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
						onClick={togglePlay}
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
						onClick={togglePlay}
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

				{story.audio?.id && (
					<audio
						ref={mediaRef as React.RefObject<HTMLAudioElement>}
						src={`/resources/audio-files/${story.audio.id}`}
						onTimeUpdate={onTimeUpdate}
						controls={false}
                        preload="metadata"
					/>
				)}
			</div>
		</div>
	)
}
