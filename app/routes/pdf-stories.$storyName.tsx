import fs from 'node:fs'
import path from 'node:path'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate, useSearchParams, isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '#app/utils/misc.tsx'

interface Marker {
	page: number
	startTime: number
	duration: number
	text: string
}

export async function loader({ params }: LoaderFunctionArgs) {
	const { storyName } = params
	if (!storyName) throw new Response('Story name required', { status: 400 })

	const storyDir = path.join(process.cwd(), 'data', 'processed-pdfs', storyName)

	if (!fs.existsSync(storyDir)) {
		throw new Response('Story not found', { status: 404 })
	}

	const markersPath = path.join(storyDir, 'markers.json')
	const markers: Marker[] = fs.existsSync(markersPath)
		? (JSON.parse(await fs.promises.readFile(markersPath, 'utf-8')) as Marker[])
		: []

	const imagesDir = path.join(storyDir, 'images')
	const imageFiles = fs.existsSync(imagesDir)
		? (await fs.promises.readdir(imagesDir)).filter(f => f.endsWith('.jpg')).sort()
		: []

	const totalPages = imageFiles.length

	// Get clean title from metadata
	const metadataPath = path.join(storyDir, 'metadata.json')
	let title = storyName.replace(/-/g, ' ')
	try {
		if (fs.existsSync(metadataPath)) {
			const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf-8'))
			if (metadata.title) title = metadata.title
		}
	} catch {}

	return json({
		storyName,
		title,
		markers,
		totalPages,
	})
}

export default function PdfStoryPlayer() {
	const data = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()

	// Initialize from URL or default to 1
	const initialPageParam = searchParams.get('page')
	const initialPage = initialPageParam ? parseInt(initialPageParam, 10) : 1
	const [currentPage, setCurrentPage] = useState(initialPage)
	const [totalPages, setTotalPages] = useState(1)
	const [hasRestoredProgress, setHasRestoredProgress] = useState(false)

	// Update state when data is available
	useEffect(() => {
		if (data) {
			setTotalPages(data.totalPages)

			// If URL param exists, use it
			if (initialPageParam) {
				const p = parseInt(initialPageParam, 10)
				if (p >= 1 && p <= data.totalPages) {
					setCurrentPage(p)
				}
				setHasRestoredProgress(true)
			}
			// Otherwise try to restore from localStorage
			else if (!hasRestoredProgress) {
				const saved = localStorage.getItem(`pdf-progress-${data.storyName}`)
				if (saved) {
					const p = parseInt(saved, 10)
					if (p >= 1 && p <= data.totalPages) {
						setCurrentPage(p)
					}
				}
				setHasRestoredProgress(true)
			}
		}
	}, [data, initialPageParam, hasRestoredProgress])

    // Save progress
	useEffect(() => {
        if (data?.storyName) {
		    localStorage.setItem(`pdf-progress-${data.storyName}`, currentPage.toString())
        }
	}, [currentPage, data?.storyName])

	const audioRef = useRef<HTMLAudioElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [showControls, setShowControls] = useState(true)
	const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')

	const { storyName, title, markers } = data

	const currentMarker = markers.find(m => m.page === currentPage)
	const hasAudio = currentMarker && currentMarker.duration > 0

	const pageStr = String(currentPage).padStart(2, '0')
	const audioSrc = hasAudio ? `/resources/pdf-audio/${storyName}/${currentPage}` : undefined

	// Sync URL with state
	useEffect(() => {
		setSearchParams({ page: currentPage.toString() }, { replace: true })
	}, [currentPage, setSearchParams])

	const goToPage = useCallback((page: number) => {
		if (page >= 1 && page <= totalPages) {
			setSlideDirection(page > currentPage ? 'right' : 'left')
			setCurrentPage(page)
		}
	}, [currentPage, totalPages])

	const toggleControls = useCallback(() => {
		setShowControls(prev => !prev)
	}, [])

	const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
		const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX
		const x = clientX - rect.left
		const width = rect.width

		// Left 30% -> Previous
		if (x < width * 0.3) {
			goToPage(currentPage - 1)
		}
		// Right 30% -> Next
		else if (x > width * 0.7) {
			goToPage(currentPage + 1)
		}
		// Center 40% -> Toggle Controls
		else {
			toggleControls()
		}
	}, [currentPage, goToPage, toggleControls])

	useEffect(() => {
		if (audioRef.current) {
			// Reset audio for new page
			audioRef.current.load()
			if (hasAudio) {
				const playPromise = audioRef.current.play()
				if (playPromise !== undefined) {
					void playPromise.catch(() => {
						setIsPlaying(false)
					})
				}
				setIsPlaying(true)
			} else {
				setIsPlaying(false)
			}
		}
	}, [currentPage, hasAudio])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight' || e.key === ' ') {
				e.preventDefault()
				goToPage(currentPage + 1)
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault()
				goToPage(currentPage - 1)
			} else if (e.key === 'Escape') {
				navigate('/pdf-stories')
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [currentPage, goToPage, navigate])

	return (
		<div className="fixed inset-0 flex flex-col bg-black text-white overflow-hidden">
			{/* Main Content Area */}
			<div
				className="relative flex-1 flex items-center justify-center h-full w-full cursor-pointer select-none"
				onClick={handleTap}
			>
				{/* Image Container */}
				<div
					key={currentPage}
					className={cn(
						"relative max-h-[100dvh] max-w-full p-2 transition-all duration-300 ease-out",
						slideDirection === 'right' ? 'animate-in slide-in-from-right-8 fade-in' : 'animate-in slide-in-from-left-8 fade-in'
					)}
				>
					<img
						src={`/resources/pdf-images/${storyName}/${pageStr}`}
						alt={`Page ${currentPage}`}
						className="max-h-[calc(100dvh-2rem)] max-w-full object-contain shadow-2xl"
						draggable={false}
					/>
				</div>
			</div>

			{/* Top Control Bar */}
			<div
				className={cn(
					"absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300 z-10",
					showControls ? "opacity-100" : "opacity-0 pointer-events-none"
				)}
			>
				<div className="flex items-center justify-between max-w-4xl mx-auto">
					<button
						onClick={(e) => { e.stopPropagation(); navigate('/pdf-stories'); }}
						className="rounded-full bg-black/40 px-4 py-2 text-sm font-medium backdrop-blur-md hover:bg-white/20 transition-colors"
					>
						← Back
					</button>
					<h1 className="text-lg font-serif font-bold text-shadow-sm truncate px-4">{title}</h1>
					<div className="w-16"></div> {/* Spacer */}
				</div>
			</div>

			{/* Bottom Control Bar */}
			<div
				className={cn(
					"absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pb-8 transition-opacity duration-300 z-10",
					showControls ? "opacity-100" : "opacity-0 pointer-events-none"
				)}
			>
				<div className="max-w-2xl mx-auto flex flex-col gap-4">
					{/* Progress Bar */}
					<div className="flex flex-col items-center w-full gap-1">
						<span className="text-xs font-medium opacity-70">
							Page {currentPage} of {totalPages}
						</span>
						<div className="flex items-center w-full gap-3">
							<span className="text-[10px] opacity-50">1</span>
							<input
								type="range"
								min={1}
								max={totalPages}
								value={currentPage}
								onChange={(e) => goToPage(parseInt(e.target.value, 10))}
								onKeyDown={(e) => e.stopPropagation()} // Prevent arrow keys from double-triggering
								className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-amber-400 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50"
							/>
							<span className="text-[10px] opacity-50">{totalPages}</span>
						</div>
					</div>

					{/* Controls */}
					<div className="flex items-center justify-center gap-8">
						<button
							onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
							disabled={currentPage === 1}
							className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
						>
							<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						<button
							onClick={(e) => {
								e.stopPropagation()
								if (audioRef.current) {
									if (isPlaying) {
										audioRef.current.pause()
										setIsPlaying(false)
									} else {
										void audioRef.current.play()
										setIsPlaying(true)
									}
								}
							}}
							className="p-4 rounded-full bg-white text-black hover:scale-105 transition-transform shadow-lg"
						>
							{isPlaying ? (
								<svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
									<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
								</svg>
							) : (
								<svg className="w-8 h-8 fill-current pl-1" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
							)}
						</button>

						<button
							onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
							disabled={currentPage === totalPages}
							className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
						>
							<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			<audio
				ref={audioRef}
				src={audioSrc}
				onEnded={() => setIsPlaying(false)}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
				onError={(e) => console.error("Audio Error", e)}
				playsInline
			/>
		</div>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	return (
		<div className="flex min-h-screen items-center justify-center bg-black text-white p-4 text-center">
			<div>
				<h1 className="text-2xl font-bold text-red-500 mb-4">Story Error</h1>
				<p className="mb-4 text-gray-300">
					{isRouteErrorResponse(error)
						? `${error.status}: ${error.data}`
						: 'An unexpected error occurred.'}
				</p>
				<a href="/pdf-stories" className="text-blue-400 hover:underline">Back to Stories</a>
			</div>
		</div>
	)
}
