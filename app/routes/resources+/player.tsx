import { json, type ActionFunctionArgs } from '@remix-run/node'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export async function action({ request }: ActionFunctionArgs) {
    const userId = await requireUserId(request)
    const formData = await request.formData()

    const intent = formData.get('intent')

    if (intent === 'track-usage') {
        const storyId = String(formData.get('storyId'))
        const currentTime = Number(formData.get('currentTime'))
        const increment = Number(formData.get('increment'))
        const currentChapterIndex = Number(formData.get('currentChapterIndex'))
        const isPlaying = formData.get('isPlaying') === 'true'

        if (!storyId) return json({ error: 'Missing storyId' }, { status: 400 })

        // 1. Save Progress
        await prisma.storyProgress.upsert({
            where: { userId_storyId: { userId, storyId } },
            update: { currentTime, currentChapterIndex, isPlaying },
            create: { userId, storyId, currentTime, currentChapterIndex, isPlaying }
        })

        // 2. Log Usage
        if (increment > 0) {
            await prisma.usageLog.create({
                data: {
                    userId,
                    storyId,
                    secondsPlayed: increment
                }
            })

            // 3. Check Limits (Hybrid Logic)
            const story = await prisma.story.findUnique({
                where: { id: storyId },
                include: { tags: true }
            })

            const parentSettings = await prisma.parentSettings.findUnique({ where: { userId } })
            const timeZone = parentSettings?.timeZone || 'UTC'
            const now = new Date()

            // Check Global Limit
            if (parentSettings?.globalLimitSeconds) {
                 const windowStart = new Date(now.getTime() - parentSettings.globalIntervalSeconds * 1000)
                 const globalLogs = await prisma.usageLog.findMany({
                     where: {
                         userId,
                         createdAt: { gt: windowStart }
                     }
                 })
                 const globalTotal = globalLogs.reduce((acc, log) => acc + log.secondsPlayed, 0)

                 if (globalTotal >= parentSettings.globalLimitSeconds) {
                      return json({ success: true, limitReached: true, reason: 'Global Time Limit Reached' })
                 }
            }

            // Check Type Limits
            if (parentSettings && story) {
                const isAudiobook = story.type === 'audiobook'
                const isReadaloud = story.type === 'readaloud'

                let limitSeconds: number | null = null
                let intervalSeconds = 86400
                let restrictedStart: number | null = null
                let restrictedEnd: number | null = null
                let typeName = ''

                if (isAudiobook) {
                    limitSeconds = parentSettings.audiobookLimitSeconds
                    intervalSeconds = parentSettings.audiobookIntervalSeconds
                    restrictedStart = parentSettings.audiobookRestrictedStart
                    restrictedEnd = parentSettings.audiobookRestrictedEnd
                    typeName = 'Audiobook'
                } else if (isReadaloud) {
                    limitSeconds = parentSettings.readaloudLimitSeconds
                    intervalSeconds = parentSettings.readaloudIntervalSeconds
                    restrictedStart = parentSettings.readaloudRestrictedStart
                    restrictedEnd = parentSettings.readaloudRestrictedEnd
                    typeName = 'Read Aloud'
                }

                if (typeName) {
                    // Type Hours Check
                    if (restrictedStart !== null && restrictedEnd !== null) {
                         try {
                            const formatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false })
                            const hour = parseInt(formatter.format(now)) % 24
                            let inRange = false
                            if (restrictedStart < restrictedEnd) {
                                inRange = hour >= restrictedStart && hour < restrictedEnd
                            } else if (restrictedStart > restrictedEnd) {
                                 inRange = hour >= restrictedStart || hour < restrictedEnd
                            }
                            if (inRange) return json({ success: true, limitReached: true, reason: `${typeName} Restricted Hours` })
                        } catch {}
                    }

                    // Type Usage Check
                    if (limitSeconds) {
                         const windowStart = new Date(now.getTime() - intervalSeconds * 1000)
                         const typeLogs = await prisma.usageLog.findMany({
                             where: {
                                 userId,
                                 story: { type: story.type },
                                 createdAt: { gt: windowStart }
                             }
                         })
                         const typeTotal = typeLogs.reduce((acc, log) => acc + log.secondsPlayed, 0)
                         if (typeTotal >= limitSeconds) return json({ success: true, limitReached: true, reason: `${typeName} Time Limit Reached` })
                    }
                }
            }

            if (!story?.tags || story.tags.length === 0) {
                 return json({ success: true, limitReached: true, reason: 'No Tags' })
            }

            let hasEnabledTag = false
            let blockingReason: string | null = null

            for (const tag of story.tags) {
                // Enable Check (Permissive)
                if (tag.enabled) hasEnabledTag = true

                // Hours Check (Restrictive)
                if (tag.restrictedHoursStart !== null && tag.restrictedHoursEnd !== null) {
                     try {
                        const formatter = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false })
                        const hour = parseInt(formatter.format(now)) % 24
                        let inRange = false
                        if (tag.restrictedHoursStart < tag.restrictedHoursEnd) {
                            inRange = hour >= tag.restrictedHoursStart && hour < tag.restrictedHoursEnd
                        } else if (tag.restrictedHoursStart > tag.restrictedHoursEnd) {
                             inRange = hour >= tag.restrictedHoursStart || hour < tag.restrictedHoursEnd
                        }
                        if (inRange) {
                            blockingReason = `Restricted Hours`
                        }
                    } catch {
                        // ignore
                    }
                }

                // Usage Limit Check (Restrictive)
                if (!blockingReason && tag.limitSeconds) {
                    const windowStart = new Date(now.getTime() - tag.intervalSeconds * 1000)
                    const logs = await prisma.usageLog.findMany({
                        where: {
                            userId,
                            story: { tags: { some: { id: tag.id } } },
                            createdAt: { gt: windowStart }
                        }
                    })
                    const total = logs.reduce((acc, log) => acc + log.secondsPlayed, 0)
                    if (total >= tag.limitSeconds) {
                        blockingReason = `Time Limit (${tag.name})`
                    }
                }

                if (blockingReason) break
            }

            if (blockingReason) {
                return json({ success: true, limitReached: true, reason: blockingReason })
            }

            if (!hasEnabledTag) {
                return json({ success: true, limitReached: true, reason: 'Restricted' })
            }
        }

        return json({ success: true })
    }

    return json({ error: 'Invalid intent' }, { status: 400 })
}
