import fs from 'node:fs'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Link, useLoaderData, useFetcher } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const stories = await prisma.story.findMany({
		select: {
			id: true,
			title: true,
			_count: {
				select: {
					chapters: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})
	return json({ stories })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const formData = await request.formData()
	const intent = formData.get('intent')
	const storyId = formData.get('storyId')

	if (typeof storyId !== 'string') {
		return json({ error: 'Invalid story ID' }, { status: 400 })
	}

	if (intent === 'delete') {
		const story = await prisma.story.findUnique({
			where: { id: storyId },
			include: { audio: true },
		})

		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 })
		}

		// Delete audio file from disk if it exists
		if (story.audio?.filepath) {
			try {
				await fs.promises.unlink(story.audio.filepath)
			} catch (e) {
				console.error('Error deleting audio file:', e)
				// Continue deleting the record even if file delete fails (maybe file already gone)
			}
		}

		await prisma.story.delete({ where: { id: storyId } })
		return json({ success: true })
	}

	return json({ error: 'Invalid intent' }, { status: 400 })
}

export default function StoriesAdminRoute() {
	const { stories } = useLoaderData<typeof loader>()

	return (
		<div className="container mx-auto p-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Manage Stories</h1>
				<Button asChild>
					<Link to="new">
						<Icon name="plus" className="mr-2" />
						Upload New Story
					</Link>
				</Button>
			</div>

			<div className="rounded-md border">
				<div className="grid grid-cols-3 gap-4 border-b bg-muted/50 p-4 font-medium">
					<div>Title</div>
					<div>Chapters</div>
					<div className="text-right">Actions</div>
				</div>
				{stories.length === 0 ? (
					<div className="p-4 text-center text-muted-foreground">
						No stories found. Upload one to get started.
					</div>
				) : (
					<div className="divide-y">
						{stories.map((story) => (
							<div key={story.id} className="grid grid-cols-3 gap-4 p-4 items-center">
								<div>{story.title}</div>
								<div>{story._count.chapters}</div>
								<div className="text-right">
									<DeleteStoryButton storyId={story.id} />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

function DeleteStoryButton({ storyId }: { storyId: string }) {
	const fetcher = useFetcher()
	const isDeleting = fetcher.state !== 'idle'

	return (
		<fetcher.Form method="POST">
			<input type="hidden" name="storyId" value={storyId} />
			<input type="hidden" name="intent" value="delete" />
			<Button
				variant="destructive"
				size="sm"
				type="submit"
				disabled={isDeleting}
				onClick={(e) => {
					if (!confirm('Are you sure you want to delete this story?')) {
						e.preventDefault()
					}
				}}
			>
				<Icon name="trash" className="mr-2" />
				{isDeleting ? 'Deleting...' : 'Delete'}
			</Button>
		</fetcher.Form>
	)
}
