import fs from 'node:fs'
import path from 'node:path'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderFunctionArgs) {
	const pdfDir = path.join(process.cwd(), 'data', 'processed-pdfs')

	if (!fs.existsSync(pdfDir)) {
		return json({ stories: [] })
	}

	const dirs = await fs.promises.readdir(pdfDir, { withFileTypes: true })
	const stories = dirs
		.filter(d => d.isDirectory())
		.map(d => ({
			name: d.name,
			title: d.name.replace(/-/g, ' '),
		}))

	return json({ stories })
}

export default function PdfStoriesIndex() {
	const { stories } = useLoaderData<typeof loader>()

	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
			<h1 className="mb-8 text-center font-serif text-4xl font-bold text-amber-900">
				Picture Books
			</h1>

			{stories.length === 0 ? (
				<p className="text-center text-amber-700">No stories yet. Process a PDF to get started!</p>
			) : (
				<div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{stories.map(story => (
						<Link
							key={story.name}
							to={`/pdf-stories/${story.name}`}
							className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
						>
							<div className="aspect-[3/4] overflow-hidden rounded-lg bg-amber-100">
								<img
									src={`/resources/pdf-images/${story.name}/01`}
									alt={story.title}
									className="h-full w-full object-cover"
								/>
							</div>
							<h2 className="mt-4 text-center font-serif text-lg font-semibold text-amber-900 group-hover:text-amber-700">
								{story.title}
							</h2>
						</Link>
					))}
				</div>
			)}
		</div>
	)
}

