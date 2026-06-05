import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

function normalizeWords(input: string) {
	return Array.from(
		new Set(
			input
				.split(/[\n,]+/)
				.map((word) => word.trim().toLowerCase())
				.filter(Boolean),
		),
	)
}

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const children = await prisma.childProfile.findMany({
		where: { ownerId: userId },
		include: { words: { orderBy: [{ category: 'asc' }, { word: 'asc' }] } },
		orderBy: { createdAt: 'desc' },
	})
	return json({ children })
}

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()
	const intent = String(formData.get('intent') ?? '')
	if (intent === 'create-child') {
		const name = String(formData.get('name') ?? '').trim()
		if (name) {
			await prisma.childProfile.create({ data: { ownerId: userId, name } })
		}
		return redirect('/story-app/words')
	}
	if (intent === 'add-words') {
		const childId = String(formData.get('childId') ?? '')
		const category = String(formData.get('category') ?? 'general').trim() || 'general'
		const child = await prisma.childProfile.findFirst({
			where: { id: childId, ownerId: userId },
			select: { id: true },
		})
		if (!child) return redirect('/story-app/words')
		const words = normalizeWords(String(formData.get('words') ?? ''))
		await prisma.$transaction(
			words.map((word) =>
				prisma.childWord.upsert({
					where: { childId_word: { childId: child.id, word } },
					update: { category },
					create: { childId: child.id, word, category },
				}),
			),
		)
		return redirect('/story-app/words')
	}
	return redirect('/story-app/words')
}

export default function StoryWordsRoute() {
	const { children } = useLoaderData<typeof loader>()
	return (
		<div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
			<section className="rounded-lg border bg-white p-6 shadow-sm">
				<h1 className="mb-4 text-xl font-bold">Child profiles</h1>
				<Form method="post" className="mb-6 space-y-3">
					<input type="hidden" name="intent" value="create-child" />
					<label className="grid gap-1 text-sm font-semibold">
						Child name
						<input
							name="name"
							className="rounded-md border px-3 py-2 font-normal"
							placeholder="Zephyr"
						/>
					</label>
					<button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
						Add child
					</button>
				</Form>
				<div className="space-y-3">
					{children.map((child) => (
						<div key={child.id} className="rounded-md bg-slate-50 p-3">
							<p className="font-semibold">{child.name}</p>
							<p className="text-sm text-slate-600">{child.words.length} words</p>
						</div>
					))}
				</div>
			</section>
			<section className="rounded-lg border bg-white p-6 shadow-sm">
				<h2 className="mb-4 text-xl font-bold">Known words</h2>
				<Form method="post" className="mb-6 grid gap-3">
					<input type="hidden" name="intent" value="add-words" />
					<label className="grid gap-1 text-sm font-semibold">
						Child
						<select name="childId" className="rounded-md border px-3 py-2 font-normal">
							{children.map((child) => (
								<option key={child.id} value={child.id}>
									{child.name}
								</option>
							))}
						</select>
					</label>
					<label className="grid gap-1 text-sm font-semibold">
						Category
						<input
							name="category"
							defaultValue="general"
							className="rounded-md border px-3 py-2 font-normal"
						/>
					</label>
					<label className="grid gap-1 text-sm font-semibold">
						Words
						<textarea
							name="words"
							rows={6}
							className="rounded-md border px-3 py-2 font-normal"
							placeholder="saw, cut, log, tree"
						/>
					</label>
					<button className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
						Add words
					</button>
				</Form>
				<div className="grid gap-4 md:grid-cols-2">
					{children.map((child) => (
						<div key={child.id} className="rounded-md bg-slate-50 p-4">
							<h3 className="font-bold">{child.name}</h3>
							<p className="mt-2 text-sm leading-6 text-slate-700">
								{child.words.map((word) => word.word).join(', ') || 'No words yet.'}
							</p>
						</div>
					))}
				</div>
			</section>
		</div>
	)
}
