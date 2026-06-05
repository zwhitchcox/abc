import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { createCommercialStoryDraft } from '#app/utils/commercial-story-generator.server.ts'
import {
	estimateStoryGenerationCost,
	getStoryAppUsageSummary,
} from '#app/utils/commercial-story-limits.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const [children, usage] = await Promise.all([
		prisma.childProfile.findMany({
			where: { ownerId: userId },
			include: { words: { orderBy: { word: 'asc' } } },
			orderBy: { createdAt: 'desc' },
		}),
		getStoryAppUsageSummary(userId),
	])
	const tenPageEstimate = estimateStoryGenerationCost({
		pageCount: 10,
		textGeneration: true,
	})
	return json({
		children,
		availableCostCents: usage.availableCostCents,
		tenPageEstimate,
	})
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const childId = String(formData.get('childId') ?? '') || null
	const child = childId
		? await prisma.childProfile.findFirst({
				where: { id: childId, ownerId: userId },
				include: { words: true },
			})
		: null
	const explicitWords = String(formData.get('words') ?? '')
		.split(/[\n,]+/)
		.map((word) => word.trim().toLowerCase())
		.filter(Boolean)
	const childWords = child?.words.map((word) => word.word) ?? []
	const story = await createCommercialStoryDraft({
		userId,
		childId,
		title: String(formData.get('title') ?? ''),
		prompt: String(formData.get('prompt') ?? ''),
		sourceText: String(formData.get('sourceText') ?? '').trim() || null,
		pageCount: Number(formData.get('pageCount') ?? 10),
		words: Array.from(new Set([...childWords, ...explicitWords])),
	})
	return redirect(`/story-app/stories/${story.id}`)
}

export default function NewStoryRoute() {
	const { children, availableCostCents, tenPageEstimate } =
		useLoaderData<typeof loader>()
	return (
		<div className="mx-auto max-w-3xl rounded-lg border bg-white p-6 shadow-sm">
			<h1 className="text-2xl font-bold">Create a story</h1>
			<p className="mt-2 text-sm text-slate-600">
				The first pass creates a draft plan and reserves estimated generation cost.
				Image generation will run from the server-side generation seam.
			</p>
			<div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
				Available generation budget: ${(availableCostCents / 100).toFixed(2)} ·
				Typical 10-page estimate: $
				{(tenPageEstimate.estimatedCostCents / 100).toFixed(2)}
			</div>
			<Form method="post" className="mt-6 grid gap-4">
				<label className="grid gap-1 text-sm font-semibold">
					Title
					<input
						name="title"
						required
						className="rounded-md border px-3 py-2 font-normal"
						placeholder="Zephyr Tiger Goes to the Library"
					/>
				</label>
				<label className="grid gap-1 text-sm font-semibold">
					Child word list
					<select name="childId" className="rounded-md border px-3 py-2 font-normal">
						<option value="">No child profile</option>
						{children.map((child) => (
							<option key={child.id} value={child.id}>
								{child.name} ({child.words.length} words)
							</option>
						))}
					</select>
				</label>
				<label className="grid gap-1 text-sm font-semibold">
					Story description
					<textarea
						name="prompt"
						required
						rows={4}
						className="rounded-md border px-3 py-2 font-normal"
						placeholder="A gentle story about a tiger family visiting the library and picking books."
					/>
				</label>
				<label className="grid gap-1 text-sm font-semibold">
					Optional exact story text
					<textarea
						name="sourceText"
						rows={6}
						className="rounded-md border px-3 py-2 font-normal"
						placeholder="Paste parent-written page text here to generate images only."
					/>
				</label>
				<div className="grid gap-4 md:grid-cols-2">
					<label className="grid gap-1 text-sm font-semibold">
						Pages
						<input
							name="pageCount"
							type="number"
							min={1}
							max={40}
							defaultValue={10}
							className="rounded-md border px-3 py-2 font-normal"
						/>
					</label>
					<label className="grid gap-1 text-sm font-semibold">
						Extra words for this story
						<input
							name="words"
							className="rounded-md border px-3 py-2 font-normal"
							placeholder="rain, boot, puddle"
						/>
					</label>
				</div>
				<button className="w-fit rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
					Create draft
				</button>
			</Form>
		</div>
	)
}
