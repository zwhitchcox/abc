import fs from 'node:fs'
import path from 'node:path'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData, useSearchParams, isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { cn } from '#app/utils/misc.tsx'

interface Marker {
	page: number
	startTime: number
	duration: number
	text: string
}

interface PageData {
	page: number
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

	const metadataPath = path.join(storyDir, 'metadata.json')
	let title = storyName.replace(/-/g, ' ')
	let showText = false
	let layout: 'caption' | 'split' = 'caption'
	try {
		if (fs.existsSync(metadataPath)) {
			const metadata = JSON.parse(await fs.promises.readFile(metadataPath, 'utf-8')) as {
				title?: string
				showText?: boolean
				layout?: 'caption' | 'split'
			}
			if (metadata.title) title = metadata.title
			if (metadata.showText) showText = true
			if (metadata.layout === 'split') layout = 'split'
		}
	} catch {}

	const pages: PageData[] = imageFiles.map((_, i) => {
		const pageNum = i + 1
		const marker = markers.find(m => m.page === pageNum)
		return { page: pageNum, text: marker?.text ?? '' }
	})

	return json({ storyName, title, pages, showText, layout })
}

interface Face {
	kind: 'cover' | 'title' | 'content' | 'text-only' | 'image-only' | 'blank' | 'back'
	page?: PageData
	title?: string
}

interface Sheet {
	sheetIndex: number
	front: [Face, Face]
	back: [Face, Face]
}

function buildImposition(faces: Face[]): Sheet[] {
	const n = faces.length
	const sheets: Sheet[] = []
	const numSheets = n / 4
	for (let k = 0; k < numSheets; k++) {
		sheets.push({
			sheetIndex: k,
			front: [faces[n - 1 - 2 * k]!, faces[2 * k]!],
			back: [faces[2 * k + 1]!, faces[n - 2 - 2 * k]!],
		})
	}
	return sheets
}

function FaceContent({
	face,
	storyName,
	showText,
	layout,
	small,
	pageNumber,
	numberSide,
}: {
	face: Face
	storyName: string
	showText: boolean
	layout: 'caption' | 'split'
	small: boolean
	pageNumber?: number | null
	numberSide?: 'left' | 'right'
}) {
	const numberEl =
		pageNumber != null ? (
			<div
				className={cn(
					'face-page-number',
					numberSide === 'left' ? 'face-page-number-left' : 'face-page-number-right',
					small && 'face-page-number-small',
				)}
			>
				{pageNumber}
			</div>
		) : null

	if (face.kind === 'blank' || face.kind === 'back') {
		return <div className="face-blank">{numberEl}</div>
	}
	if (face.kind === 'title') {
		return (
			<div className="face face-title">
				<img
					src={`/resources/pdf-images/${storyName}/01`}
					alt={face.title ?? ''}
					className="face-title-image"
				/>
				<div className={cn('face-title-text', small && 'face-title-text-small')}>
					{face.title}
				</div>
			</div>
		)
	}
	if (face.kind === 'cover') {
		return (
			<div className="face face-cover">
				<div className="face-cover-image-wrap">
					<img
						src={`/resources/pdf-images/${storyName}/01`}
						alt={face.title ?? ''}
						className="face-cover-image"
					/>
					<div className={cn('face-cover-title', small && 'face-cover-title-small')}>
						{face.title}
					</div>
				</div>
			</div>
		)
	}
	if (face.kind === 'text-only') {
		const p = face.page!
		const paragraphs = p.text.split(/\n\n+/)
		return (
			<div className="face face-text-only">
				<div className={cn('face-text-only-body', small && 'face-text-only-body-small')}>
					{paragraphs.map((para, i) => (
						<p key={i}>{para}</p>
					))}
				</div>
				{numberEl}
			</div>
		)
	}
	if (face.kind === 'image-only') {
		const p = face.page!
		return (
			<div className="face face-image-only">
				<img
					src={`/resources/pdf-images/${storyName}/${String(p.page).padStart(2, '0')}`}
					alt={`Page ${p.page}`}
					className="face-image-only-img"
				/>
				{numberEl}
			</div>
		)
	}
	// content
	const p = face.page!
	const isSplit = layout === 'split'
	const hasText = showText && Boolean(p.text)
	const paragraphs = hasText ? p.text.split(/\n\n+/) : []
	return (
		<div className="face face-content">
			{isSplit && hasText ? (
				<div className="face-split">
					<div className={cn('face-split-text', small && 'face-split-text-small')}>
						{paragraphs.map((para, i) => (
							<p key={i}>{para}</p>
						))}
					</div>
					<div className="face-split-image">
						<img
							src={`/resources/pdf-images/${storyName}/${String(p.page).padStart(2, '0')}`}
							alt={`Page ${p.page}`}
						/>
					</div>
				</div>
			) : (
				<>
					<div className="face-image-wrap">
						<img
							src={`/resources/pdf-images/${storyName}/${String(p.page).padStart(2, '0')}`}
							alt={`Page ${p.page}`}
							className="face-image"
						/>
					</div>
					{hasText ? (
						<div className={cn('face-caption', small && 'face-caption-small')}>
							{paragraphs.map((para, i) => (
								<p key={i}>{para}</p>
							))}
						</div>
					) : null}
				</>
			)}
			{numberEl}
		</div>
	)
}

export default function PdfStoryPrint() {
	const { storyName, title, pages, showText, layout } = useLoaderData<typeof loader>()
	const [searchParams, setSearchParams] = useSearchParams()
	const format = searchParams.get('format') === 'booklet' ? 'booklet' : 'flat'
	const isBooklet = format === 'booklet'
	const isSplit = layout === 'split'

	const duplexFlip: 'short' | 'long' =
		searchParams.get('flip') === 'long' ? 'long' : 'short'
	const rotateBacks = duplexFlip === 'long'

	const contentPages = pages.slice(1)

	let readingOrder: Face[] = []
	if (isBooklet) {
		readingOrder.push({ kind: 'cover', title })
		for (const p of contentPages) {
			readingOrder.push({ kind: 'text-only', page: p })
			readingOrder.push({ kind: 'image-only', page: p })
		}
		while ((readingOrder.length + 1) % 4 !== 0) {
			readingOrder.push({ kind: 'blank' })
		}
		readingOrder.push({ kind: 'back' })
		while (readingOrder.length % 4 !== 0) {
			readingOrder.push({ kind: 'blank' })
		}
	} else {
		readingOrder.push({ kind: 'title', title })
		for (const p of contentPages) {
			readingOrder.push({ kind: 'content', page: p })
		}
	}

	const sheets = isBooklet ? buildImposition(readingOrder) : []

	const pageSize = isBooklet
		? 'letter landscape'
		: isSplit
			? 'letter landscape'
			: 'letter portrait'

	const flatPageWidth = isSplit ? '10in' : '7.5in'
	const flatPageHeight = isSplit ? '7.5in' : '10in'

	return (
		<>
			<style>{`
				@page {
					size: ${pageSize};
					margin: ${isBooklet ? '0.35in' : '0.5in'};
				}
				@media print {
					.no-print { display: none !important; }
					body { background: white !important; }
					.print-sheet {
						page-break-after: always;
						break-after: page;
						box-shadow: none !important;
						margin: 0 auto !important;
					}
					.print-sheet:last-child {
						page-break-after: auto;
						break-after: auto;
					}
				}

				.face {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					box-sizing: border-box;
					overflow: hidden;
					padding: 0.2in;
					position: relative;
				}
				.face-blank { width: 100%; height: 100%; position: relative; }

				.face-page-number {
					position: absolute;
					bottom: 0.2in;
					font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', system-ui, sans-serif;
					font-weight: 700;
					color: #57534e;
					font-size: 16pt;
					line-height: 1;
					pointer-events: none;
				}
				.face-page-number-left { left: 0.3in; }
				.face-page-number-right { right: 0.3in; }
				.face-page-number-small { font-size: 10pt; bottom: 0.12in; }
				.face-page-number-small.face-page-number-left { left: 0.18in; }
				.face-page-number-small.face-page-number-right { right: 0.18in; }

				.face-cover, .face-title { gap: 0.25in; }
				.face-title-image {
					max-width: 100%;
					max-height: 75%;
					object-fit: contain;
					border-radius: 0.2in;
				}
				.face-cover-image-wrap {
					position: relative;
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.face-cover-image {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 0.2in;
				}
				.face-cover-title {
					position: absolute;
					left: 5%;
					right: 5%;
					bottom: 5%;
					text-align: center;
					font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', system-ui, sans-serif;
					font-weight: 800;
					font-size: 36pt;
					line-height: 1.1;
					color: #1c1917;
					background: rgba(255, 255, 255, 0.92);
					padding: 0.18in 0.25in;
					border-radius: 0.18in;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
				}
				.face-cover-title-small {
					font-size: 18pt;
					padding: 0.1in 0.15in;
					border-radius: 0.1in;
				}
				.face-title-text {
					font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', system-ui, sans-serif;
					font-weight: 800;
					font-size: 42pt;
					text-align: center;
					color: #1c1917;
					line-height: 1.1;
				}
				.face-title-text-small { font-size: 22pt; }

				.face-text-only {
					padding: 0.3in;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.face-text-only-body {
					font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', system-ui, sans-serif;
					font-weight: 600;
					color: #1c1917;
					font-size: 28pt;
					line-height: 1.35;
					max-width: 100%;
				}
				.face-text-only-body p { margin: 0 0 0.2in 0; }
				.face-text-only-body p:last-child { margin-bottom: 0; }
				.face-text-only-body-small { font-size: 16pt; line-height: 1.35; }
				.face-text-only-body-small p { margin: 0 0 0.12in 0; }

				.face-image-only {
					padding: 0.2in;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				.face-image-only-img {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 0.2in;
				}

				.face-image-wrap {
					flex: 1 1 auto;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 100%;
					min-height: 0;
				}
				.face-image {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
				}
				.face-caption {
					flex: 0 0 auto;
					width: 100%;
					text-align: center;
					font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', system-ui, sans-serif;
					font-weight: 700;
					color: #1c1917;
					font-size: 26pt;
					line-height: 1.2;
					padding: 0.15in 0.15in 0.05in 0.15in;
				}
				.face-caption p { margin: 0 0 0.08in 0; }
				.face-caption p:last-child { margin-bottom: 0; }
				.face-caption-small { font-size: 13pt; padding: 0.1in; }

				.face-split {
					display: flex;
					flex-direction: row;
					align-items: stretch;
					gap: 0.2in;
					width: 100%;
					height: 100%;
				}
				.face-split-text {
					flex: 1 1 50%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					gap: 0.15in;
					font-family: 'Comic Sans MS', 'Comic Sans', 'Chalkboard SE', system-ui, sans-serif;
					font-weight: 600;
					color: #1c1917;
					font-size: 20pt;
					line-height: 1.35;
					padding: 0.1in;
				}
				.face-split-text p { margin: 0; }
				.face-split-text-small { font-size: 12pt; gap: 0.08in; }
				.face-split-image {
					flex: 1 1 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					min-width: 0;
				}
				.face-split-image img {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 0.15in;
				}

				.flat-page {
					width: ${flatPageWidth};
					height: ${flatPageHeight};
					margin: 0 auto 0.4in auto;
					background: white;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
					box-sizing: border-box;
				}

				.booklet-sheet {
					width: 10in;
					height: 7.5in;
					margin: 0 auto 0.4in auto;
					background: white;
					box-shadow: 0 2px 8px rgba(0,0,0,0.15);
					box-sizing: border-box;
					position: relative;
					overflow: hidden;
				}
				.booklet-sheet-inner {
					width: 100%;
					height: 100%;
					display: grid;
					grid-template-columns: 1fr 1fr;
					transform-origin: center center;
				}
				.booklet-sheet-rotated .booklet-sheet-inner {
					transform: rotate(180deg);
				}
				.booklet-face {
					width: 100%;
					height: 100%;
					border-left: 1px dashed rgba(0,0,0,0.25);
					position: relative;
					overflow: hidden;
				}
				.booklet-face:first-child { border-left: none; }
				@media print {
					.booklet-face { border-left: none; }
				}
				.booklet-sheet-label {
					position: absolute;
					top: -1.4em;
					left: 0;
					right: 0;
					text-align: center;
					font-family: system-ui, sans-serif;
					font-size: 11pt;
					color: #57534e;
					font-weight: 600;
				}
				@media print {
					.booklet-sheet-label { display: none !important; }
				}

				.booklet-instructions {
					max-width: 7in;
					margin: 0 auto 1in auto;
					padding: 0.4in;
					background: #fffbeb;
					border: 2px solid #fbbf24;
					border-radius: 0.25in;
					font-family: system-ui, sans-serif;
					color: #1c1917;
					line-height: 1.5;
					font-size: 11pt;
				}
				.booklet-instructions h2 {
					margin-top: 0;
					font-size: 14pt;
					font-weight: 700;
				}
				.booklet-instructions ol { padding-left: 1.3em; }
				.booklet-instructions li { margin-bottom: 0.3em; }
				@media print {
					.booklet-instructions { display: none !important; }
				}
			`}</style>

			<div className="no-print sticky top-0 z-50 flex items-center justify-between gap-3 bg-white px-4 py-3 shadow-md flex-wrap">
				<Link
					to={`/pdf-stories/${storyName}`}
					className="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium hover:bg-stone-300 transition-colors shrink-0"
				>
					← Back to Book
				</Link>
				<h1 className="text-base sm:text-lg font-bold text-stone-800 truncate flex-1 min-w-0 text-center">
					{title} — {isBooklet ? 'Booklet Preview' : 'Print Preview'}
				</h1>
				<div className="flex items-center gap-2 shrink-0 flex-wrap">
					<div className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold">
						<button
							type="button"
							onClick={() => {
								const sp = new URLSearchParams(searchParams)
								sp.delete('format')
								setSearchParams(sp, { replace: true })
							}}
							className={cn(
								'px-3 py-1.5 rounded-full transition-colors',
								!isBooklet ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900',
							)}
						>
							One page per sheet
						</button>
						<button
							type="button"
							onClick={() => {
								const sp = new URLSearchParams(searchParams)
								sp.set('format', 'booklet')
								setSearchParams(sp, { replace: true })
							}}
							className={cn(
								'px-3 py-1.5 rounded-full transition-colors',
								isBooklet ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900',
							)}
						>
							Fold &amp; staple booklet
						</button>
					</div>
					{isBooklet ? (
						<div
							className="inline-flex rounded-full bg-stone-100 p-1 text-xs font-semibold"
							title="Match to your printer's duplex flip direction"
						>
							<button
								type="button"
								onClick={() => {
									const sp = new URLSearchParams(searchParams)
									sp.delete('flip')
									setSearchParams(sp, { replace: true })
								}}
								className={cn(
									'px-3 py-1.5 rounded-full transition-colors',
									!rotateBacks
										? 'bg-white text-stone-900 shadow-sm'
										: 'text-stone-600 hover:text-stone-900',
								)}
							>
								Short-edge flip
							</button>
							<button
								type="button"
								onClick={() => {
									const sp = new URLSearchParams(searchParams)
									sp.set('flip', 'long')
									setSearchParams(sp, { replace: true })
								}}
								className={cn(
									'px-3 py-1.5 rounded-full transition-colors',
									rotateBacks
										? 'bg-white text-stone-900 shadow-sm'
										: 'text-stone-600 hover:text-stone-900',
								)}
							>
								Long-edge flip
							</button>
						</div>
					) : null}
					<button
						type="button"
						onClick={() => window.print()}
						className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
					>
						Print / Save PDF
					</button>
				</div>
			</div>

			{isBooklet ? (
				<div className="min-h-screen bg-stone-200 py-6 print:bg-white print:py-0">
					<div className="booklet-instructions">
						<h2>How to print &amp; make the booklet</h2>
						<p style={{ marginTop: 0 }}>
							This produces {sheets.length * 2}{' '}
							{sheets.length * 2 === 1 ? 'page' : 'pages'} of output (front + back
							of {sheets.length}{' '}
							{sheets.length === 1 ? 'sheet' : 'sheets'} of letter paper,
							landscape).
						</p>
						<p style={{ marginTop: 0, padding: '0.1in 0.15in', background: '#fef3c7', borderRadius: '0.1in' }}>
							<strong>Currently set for:</strong>{' '}
							{rotateBacks
								? '“Flip on long edge” (back pages are pre-rotated 180°).'
								: '“Flip on short edge” (back pages print in normal orientation).'}{' '}
							If your first test print comes out upside-down on alternating pages, switch the toggle above.
						</p>
						<ol>
							<li>
								Print <strong>double-sided</strong> (duplex) on letter paper in{' '}
								<strong>landscape</strong> orientation. In your printer's duplex
								settings, pick{' '}
								<strong>
									{rotateBacks
										? '“Flip on long edge” / “Long-Edge binding”'
										: '“Flip on short edge” / “Short-Edge binding”'}
								</strong>{' '}
								to match this preview.
							</li>
							<li>
								<strong>Important:</strong> Make sure “Scale to fit” /
								“Shrink to fit” is OFF — pick “Actual size” or “100%”.
							</li>
							<li>
								No duplex printer? Print all odd-numbered output pages first
								(“Front” sheets below), then flip the stack and feed it back in
								to print the even-numbered pages (“Back” sheets). Keep sheets in
								order.
							</li>
							<li>
								Stack the printed sheets with Sheet 1 on top, Sheet{' '}
								{sheets.length} at the bottom.
							</li>
							<li>
								Fold the whole stack in half along the vertical center line (the
								dashed line in the preview).
							</li>
							<li>
								Staple twice along the fold (saddle-stitch), or sew it with
								needle and thread for a fancier bind. Trim the fore-edge if you
								want it flush.
							</li>
						</ol>
						<p style={{ marginBottom: 0, fontSize: '10pt', color: '#78716c' }}>
							Not sure which flip your printer uses? Print one test sheet both
							ways — whichever gives you right-side-up back pages is correct.
						</p>
					</div>

					{sheets.map((sheet, idx) => {
						const renderFace = (face: Face) => {
							const bookIndex = readingOrder.indexOf(face)
							const bookPage = bookIndex >= 0 ? bookIndex + 1 : null
							const showNumber =
								face.kind === 'text-only' ||
								face.kind === 'image-only' ||
								face.kind === 'content'
							const numberSide: 'left' | 'right' | undefined =
								bookPage != null ? (bookPage % 2 === 0 ? 'left' : 'right') : undefined
							return (
								<FaceContent
									face={face}
									storyName={storyName}
									showText={showText}
									layout={layout}
									small={true}
									pageNumber={showNumber ? bookPage : null}
									numberSide={numberSide}
								/>
							)
						}
						return (
							<div key={`sheet-${idx}`} className="relative mb-8">
								<div className="booklet-sheet-label print:hidden">
									Sheet {sheet.sheetIndex + 1} — FRONT (outside)
								</div>
								<div className="booklet-sheet print-sheet">
									<div className="booklet-sheet-inner">
										<div className="booklet-face">{renderFace(sheet.front[0])}</div>
										<div className="booklet-face">{renderFace(sheet.front[1])}</div>
									</div>
								</div>

								<div className="booklet-sheet-label print:hidden" style={{ marginTop: '0.4in' }}>
									Sheet {sheet.sheetIndex + 1} — BACK (inside)
									{rotateBacks ? ' — rotated 180° for long-edge flip' : ''}
								</div>
								<div
									className={cn(
										'booklet-sheet print-sheet mt-8',
										rotateBacks && 'booklet-sheet-rotated',
									)}
								>
									<div className="booklet-sheet-inner">
										<div className="booklet-face">{renderFace(sheet.back[0])}</div>
										<div className="booklet-face">{renderFace(sheet.back[1])}</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			) : (
				<div className="min-h-screen bg-stone-200 py-6 print:bg-white print:py-0">
					{readingOrder.map((face, i) => {
						const showNumber = face.kind === 'content'
						let bookPage: number | null = null
						if (showNumber) {
							let n = 0
							for (let k = 0; k <= i; k++) {
								if (readingOrder[k]?.kind === 'content') n++
							}
							bookPage = n
						}
						return (
							<div key={i} className="flat-page print-sheet">
								<FaceContent
									face={face}
									storyName={storyName}
									showText={showText}
									layout={layout}
									small={false}
									pageNumber={bookPage}
									numberSide="right"
								/>
							</div>
						)
					})}
				</div>
			)}
		</>
	)
}

export function ErrorBoundary() {
	const error = useRouteError()
	return (
		<div className="flex min-h-screen items-center justify-center bg-white text-stone-900 p-4 text-center">
			<div>
				<h1 className="text-2xl font-bold text-red-600 mb-4">Story Error</h1>
				<p className="mb-4 text-stone-600">
					{isRouteErrorResponse(error)
						? `${error.status}: ${error.data}`
						: 'An unexpected error occurred.'}
				</p>
				<a href="/pdf-stories" className="text-blue-600 hover:underline">Back to Stories</a>
			</div>
		</div>
	)
}
