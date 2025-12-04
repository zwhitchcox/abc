import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { getUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userId = await getUserId(request)
	const storyId = params.storyId

	if (userId && storyId) {
		await prisma.storyProgress.upsert({
			where: { userId_storyId: { userId, storyId } },
			update: { currentTime: 0, currentChapterIndex: 0, isPlaying: false, playCount: { increment: 1 } },
			create: { userId, storyId, currentTime: 0, currentChapterIndex: 0, isPlaying: false, playCount: 1 },
		})
	}

	return redirect('/stories')
}

