import { prisma } from './db.server.ts'

export async function createJob(type: string, userId: string | null, details: any) {
    return prisma.job.create({
        data: {
            type,
            status: 'pending',
            progress: '0%',
            userId,
            details: JSON.stringify(details),
        },
    })
}

export async function updateJobProgress(jobId: string, progress: string, result?: any) {
    // We use updateMany to avoid errors if the job was deleted in the meantime
    // or if we want to be safe. But update is fine here.
    try {
        return await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'processing',
                progress,
                result: result ? JSON.stringify(result) : undefined,
            },
        })
    } catch (e) {
        console.error(`Failed to update job ${jobId}:`, e)
        return null
    }
}

export async function completeJob(jobId: string, result: any) {
    try {
        return await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'completed',
                progress: '100%',
                result: JSON.stringify(result),
            },
        })
    } catch (e) {
        console.error(`Failed to complete job ${jobId}:`, e)
        return null
    }
}

export async function failJob(jobId: string, error: any) {
    try {
        return await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'failed',
                result: JSON.stringify({ error: error.message || String(error) }),
            },
        })
    } catch (e) {
        console.error(`Failed to fail job ${jobId}:`, e)
        return null
    }
}
