import { redirect } from '@remix-run/node'
import { prisma } from './db.server.ts'

export async function checkStoryAccess(userId: string, story: any, parentSettings: any) {
    if (!parentSettings) return

    // Check Global Limit
    if (parentSettings.globalLimitSeconds) {
        const now = new Date()
        const windowStart = new Date(now.getTime() - parentSettings.globalIntervalSeconds * 1000)
        const globalLogs = await prisma.usageLog.findMany({
            where: {
                userId,
                createdAt: { gt: windowStart }
            }
        })
        const globalTotal = globalLogs.reduce((acc, log) => acc + log.secondsPlayed, 0)

        if (globalTotal >= parentSettings.globalLimitSeconds) {
            throw redirect(`/timeout?reason=Global Time Limit Reached`)
        }
    }

    // Check Type Limits
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
                const formatter = new Intl.DateTimeFormat('en-US', { timeZone: parentSettings.timeZone || 'UTC', hour: 'numeric', hour12: false })
                const hour = parseInt(formatter.format(new Date())) % 24
                let inRange = false
                if (restrictedStart < restrictedEnd) {
                    inRange = hour >= restrictedStart && hour < restrictedEnd
                } else if (restrictedStart > restrictedEnd) {
                    inRange = hour >= restrictedStart || hour < restrictedEnd
                }
                if (inRange) throw redirect(`/timeout?reason=${encodeURIComponent(typeName + ' Restricted Hours')}`)
            } catch { }
        }

        // Type Usage Check
        if (limitSeconds) {
            const now = new Date()
            const windowStart = new Date(now.getTime() - intervalSeconds * 1000)
            const typeLogs = await prisma.usageLog.findMany({
                where: {
                    userId,
                    story: { type: story.type },
                    createdAt: { gt: windowStart }
                }
            })
            const typeTotal = typeLogs.reduce((acc, log) => acc + log.secondsPlayed, 0)
            if (typeTotal >= limitSeconds) throw redirect(`/timeout?reason=${encodeURIComponent(typeName + ' Time Limit Reached')}`)
        }
    }

    // Hybrid Restriction Check
    if (!story.tags || story.tags.length === 0) {
        throw redirect(`/timeout?reason=No Tags Assigned`)
    }

    const timeZone = parentSettings?.timeZone || 'UTC'
    const now = new Date()

    let hasEnabledTag = false
    let blockingReason: string | null = null

    for (const tag of story.tags) {
        if (tag.enabled) hasEnabledTag = true

        // Check Hours (Restrictive)
        if (tag.restrictedHoursStart !== null && tag.restrictedHoursEnd !== null) {
            try {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone,
                    hour: 'numeric',
                    hour12: false
                })
                const hour = parseInt(formatter.format(now)) % 24

                let inRange = false
                if (tag.restrictedHoursStart < tag.restrictedHoursEnd) {
                    inRange = hour >= tag.restrictedHoursStart && hour < tag.restrictedHoursEnd
                } else if (tag.restrictedHoursStart > tag.restrictedHoursEnd) {
                    inRange = hour >= tag.restrictedHoursStart || hour < tag.restrictedHoursEnd
                }

                if (inRange) blockingReason = `Restricted Hours`
            } catch (e) {
                console.error('Timezone check failed:', e)
            }
        }

        // Check Limits (Restrictive)
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
            if (total >= tag.limitSeconds) blockingReason = `Time Limit (${tag.name})`
        }

        if (blockingReason) break
    }

    if (blockingReason) {
        throw redirect(`/timeout?reason=${encodeURIComponent(blockingReason)}`)
    }

    if (!hasEnabledTag) {
        throw redirect(`/timeout?reason=Restricted`)
    }
}

