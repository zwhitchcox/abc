import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useFetcher, useNavigate } from '@remix-run/react'
import { useState, useRef, useEffect } from 'react'
import { Icon } from '#app/components/ui/icon.tsx'
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

export default function StoryPlayer() {
	const { story, progress, parentSettings } = useLoaderData<typeof loader>()
    const fetcher = useFetcher()
    const navigate = useNavigate()

	const [currentChapterIndex, setCurrentChapterIndex] = useState(progress?.currentChapterIndex ?? 0)
	const [isPlaying, setIsPlaying] = useState(false)
    const [hasRestored, setHasRestored] = useState(false)

    // Session counter for chapters played (starts at 0, increments when a chapter finishes)
    const [sessionChaptersPlayed, setSessionChaptersPlayed] = useState(0)

    // Secret menu trigger state
    const [titleTapCount, setTitleTapCount] = useState(0)

	const audioRef = useRef<HTMLAudioElement>(null)

    // Track previous chapter index to detect actual changes
    const prevChapterIndexRef = useRef(progress?.currentChapterIndex ?? 0)

	const currentChapter = story.chapters[currentChapterIndex]
	const hasNextChapter = currentChapterIndex < story.chapters.length - 1
	const hasPrevChapter = currentChapterIndex > 0

    const maxChaptersToPlay = parentSettings?.maxChaptersToPlay ?? 1

    // Secret menu trigger
    const handleTitleClick = () => {
        setTitleTapCount(prev => {
            const newCount = prev + 1
            if (newCount >= 5) { // 5 taps to trigger
                // Pass storyId to settings page so parent can edit THIS story's progress
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
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.play().catch(console.error)
			} else {
				audioRef.current.pause()
			}
		}
	}, [isPlaying])

    // Effect: Restore Progress ONCE
	useEffect(() => {
		if (audioRef.current && progress && !hasRestored) {
            const time = progress.currentTime
            if (time > 0) {
                audioRef.current.currentTime = time
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
             if (audioRef.current) {
                 audioRef.current.currentTime = currentChapter.startTime
             }
             prevChapterIndexRef.current = currentChapterIndex
        }
    }, [currentChapterIndex, currentChapter, hasRestored])


    // Save progress function
    const saveProgress = () => {
        if (audioRef.current && story.id) {
            const time = audioRef.current.currentTime
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
    }, [isPlaying, currentChapterIndex])

	const togglePlay = () => {
        if (isPlaying) {
            saveProgress() // Save when pausing
            setIsPlaying(false)
        } else {
            // Check if we are at the end of the chapter and need to advance manually
            if (audioRef.current && currentChapter && audioRef.current.currentTime >= currentChapter.endTime - 0.5) {
                if (hasNextChapter) {
                    // Manually advancing after pause limit reached: reset session counter
                    setSessionChaptersPlayed(0)
                    nextChapter()
                } else {
                    // End of book, restart chapter?
                    audioRef.current.currentTime = currentChapter.startTime
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

	const onTimeUpdate = () => {
		if (!audioRef.current || !currentChapter) return

		// Check if we passed the end of the current chapter
		if (currentChapter.endTime && audioRef.current.currentTime >= currentChapter.endTime) {
            // Chapter ended
            const newSessionCount = sessionChaptersPlayed + 1
            setSessionChaptersPlayed(newSessionCount)

            if (newSessionCount >= maxChaptersToPlay) {
                // Limit reached, stop
                setIsPlaying(false)
                audioRef.current.pause()
                // Optional: Reset session count so if they press play again it starts a new session?
                // setSessionChaptersPlayed(0)
            } else if (hasNextChapter) {
                // Continue to next chapter
                nextChapter()
            } else {
                // End of book
                setIsPlaying(false)
                audioRef.current.pause()
            }
            saveProgress()
		}
	}

	return (
		<div className="flex min-h-screen flex-col bg-orange-50">
			{/* Header */}
			<div className="flex items-center p-4">
				<Link
					to="/stories"
					className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
				>
					<Icon name="arrow-left" className="h-6 w-6 text-orange-600" />
					<span className="sr-only">Back</span>
				</Link>
				<h1
                    className="ml-4 text-xl font-bold text-orange-900 select-none cursor-pointer active:scale-95 transition-transform"
                    onClick={handleTitleClick}
                >
                    {story.title}
                </h1>
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
						<div className="flex h-full w-full items-center justify-center bg-orange-200">
							<Icon name="file-text" className="h-24 w-24 text-orange-400" />
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
				<div className="mt-8 text-center">
					<h2 className="text-2xl font-bold text-orange-900 font-comic">
						{currentChapter?.title || `Chapter ${currentChapterIndex + 1}`}
					</h2>
					<p className="text-orange-700">
						{currentChapterIndex + 1} of {story.chapters.length}
					</p>
				</div>

				{/* Navigation Controls */}
				<div className="mt-8 flex gap-8">
                    {/* Buttons hidden as requested */}

					<button
						onClick={togglePlay}
						className="rounded-full bg-orange-500 p-6 shadow-lg text-white transition-transform hover:scale-105 active:scale-95"
					>
						{isPlaying ? (
							<Icon name="pause" className="h-10 w-10" />
						) : (
							<Icon name="play" className="h-10 w-10" />
						)}
					</button>
				</div>

				{story.audio?.id && (
					<audio
						ref={audioRef}
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
