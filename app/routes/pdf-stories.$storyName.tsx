import fs from 'node:fs'
import path from 'node:path'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useNavigate, useSearchParams, isRouteErrorResponse, useRouteError } from '@remix-run/react'
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
			const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf-8')) as { title?: string }
			if (metadata.title) title = metadata.title
		}
	} catch {}

	// Check for showText / layout flags in metadata (for hand-authored books)
	let showText = false
	let layout: 'caption' | 'split' = 'caption'
	try {
		if (fs.existsSync(metadataPath)) {
			const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf-8')) as {
				showText?: boolean
				layout?: 'caption' | 'split'
			}
			if (metadata.showText) showText = true
			if (metadata.layout === 'split') layout = 'split'
		}
	} catch {}

	return json({
		storyName,
		title,
		markers,
		totalPages,
		showText,
		layout,
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

	const { storyName, title, markers, showText, layout } = data

	const currentMarker = markers.find(m => m.page === currentPage)
	const hasAudio = currentMarker && currentMarker.duration > 0
	const hasAnyAudio = markers.some(m => m.duration > 0)

	const pageStr = String(currentPage).padStart(2, '0')
	const audioSrc = hasAudio ? `/resources/pdf-audio/${storyName}/${currentPage}` : undefined

	// Sync URL with state
	useEffect(() => {
		setSearchParams({ page: currentPage.toString() }, { replace: true })
	}, [currentPage, setSearchParams])

	const goToPage = useCallback((page: number) => {
		let targetPage = page
		if (page > totalPages) targetPage = 1
		else if (page < 1) targetPage = totalPages
		setSlideDirection(page > currentPage ? 'right' : 'left')
		setCurrentPage(targetPage)
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

	const hasCaption = Boolean(showText && currentMarker?.text && layout === 'caption')
	const isSplit = layout === 'split' && Boolean(showText && currentMarker?.text)

	return (
		<div className={cn(
			"fixed inset-0 flex flex-col overflow-hidden",
			isSplit ? "bg-amber-50 text-stone-900" : "bg-black text-white"
		)}>
			{/* Image / Content Area (tap target for navigation) — also hosts top + bottom overlays */}
			<div
				className="relative flex-1 min-h-0 flex items-center justify-center cursor-pointer select-none"
				onClick={handleTap}
			>
				{isSplit ? (
					<div
						key={currentPage}
						className={cn(
							"relative h-full w-full px-4 md:px-8 lg:px-12 py-16 md:py-20 transition-all duration-300 ease-out",
							"flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-10 lg:gap-16",
							slideDirection === 'right' ? 'animate-in slide-in-from-right-8 fade-in' : 'animate-in slide-in-from-left-8 fade-in'
						)}
					>
						{/* Text panel (left) */}
						<div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
							<div className="max-w-xl w-full space-y-5 md:space-y-7 font-comic text-stone-900 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug">
								{currentMarker!.text.split(/\n\n+/).map((para, i) => (
									<p key={i}>{para}</p>
								))}
							</div>
						</div>
						{/* Image panel (right) */}
						<div className="flex-1 flex items-center justify-center min-h-0 min-w-0">
							<img
								src={`/resources/pdf-images/${storyName}/${pageStr}`}
								alt={`Page ${currentPage}`}
								className="max-h-full max-w-full object-contain rounded-3xl shadow-2xl"
								draggable={false}
							/>
						</div>
					</div>
				) : (
					<div
						key={currentPage}
						className={cn(
							"relative flex items-center justify-center h-full w-full p-2 transition-all duration-300 ease-out",
							slideDirection === 'right' ? 'animate-in slide-in-from-right-8 fade-in' : 'animate-in slide-in-from-left-8 fade-in'
						)}
					>
						<img
							src={`/resources/pdf-images/${storyName}/${pageStr}`}
							alt={`Page ${currentPage}`}
							className="max-h-full max-w-full object-contain shadow-2xl"
							draggable={false}
						/>
					</div>
				)}

				{/* Top Control Bar */}
				<div
					className={cn(
						"absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 z-10 print:hidden",
						isSplit
							? "bg-gradient-to-b from-amber-50 to-transparent"
							: "bg-gradient-to-b from-black/80 to-transparent",
						showControls ? "opacity-100" : "opacity-0 pointer-events-none"
					)}
				>
					<div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
						<button
							onClick={(e) => { e.stopPropagation(); navigate('/pdf-stories'); }}
							className={cn(
								"rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors shrink-0",
								isSplit ? "bg-stone-200 text-stone-900 hover:bg-stone-300" : "bg-black/40 text-white hover:bg-white/20"
							)}
						>
							← Back
						</button>
						<h1 className={cn(
							"text-lg font-serif font-bold truncate px-2 flex-1 text-center",
							isSplit ? "text-stone-900" : "text-shadow-sm"
						)}>{title}</h1>
						<Link
							to={`/pdf-stories/${storyName}/print`}
							onClick={(e) => e.stopPropagation()}
							className={cn(
								"rounded-full px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors shrink-0",
								isSplit ? "bg-stone-200 text-stone-900 hover:bg-stone-300" : "bg-black/40 text-white hover:bg-white/20"
							)}
						>
							Print
						</Link>
					</div>
				</div>

				{/* Bottom Control Bar (inside image area so caption is never covered) */}
				<div
					className={cn(
						"absolute bottom-0 left-0 right-0 p-6 pb-6 transition-opacity duration-300 z-10 print:hidden",
						isSplit
							? "bg-gradient-to-t from-amber-50 via-amber-50/90 to-transparent text-stone-900"
							: "bg-gradient-to-t from-black/90 via-black/60 to-transparent",
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
								className={cn(
									"flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50",
									isSplit ? "bg-stone-300 hover:bg-stone-400" : "bg-white/20 hover:bg-white/30"
								)}
							/>
							<span className="text-[10px] opacity-50">{totalPages}</span>
						</div>
					</div>

					{/* Controls */}
					<div className="flex items-center justify-center gap-8">
						<button
							onClick={(e) => { e.stopPropagation(); goToPage(currentPage - 1); }}
							className="p-3 rounded-full hover:bg-white/10 transition-colors"
							aria-label="Previous page"
						>
							<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>

						{hasAnyAudio ? (
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
								aria-label={isPlaying ? 'Pause' : 'Play'}
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
						) : null}

						<button
							onClick={(e) => { e.stopPropagation(); goToPage(currentPage + 1); }}
							className="p-3 rounded-full hover:bg-white/10 transition-colors"
							aria-label="Next page"
						>
							<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				</div>
				</div>
			</div>

			{/* Caption band — static, below the image area, never covered by controls */}
			{hasCaption ? (
				<div className="shrink-0 bg-white text-stone-900 px-6 py-5 text-center font-comic font-bold text-3xl sm:text-4xl md:text-5xl leading-snug shadow-[0_-4px_16px_rgba(0,0,0,0.25)]">
					{currentMarker!.text}
				</div>
			) : null}

			{hasAnyAudio ? (
				<audio
					ref={audioRef}
					src={audioSrc}
					onEnded={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
					onError={(e) => console.error("Audio Error", e)}
					playsInline
				/>
			) : null}
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
