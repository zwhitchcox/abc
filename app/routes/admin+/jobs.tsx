import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useRevalidator } from '@remix-run/react'
import { useEffect } from 'react'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { Icon } from '#app/components/ui/icon.tsx'
import { cn } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const jobs = await prisma.job.findMany({
		orderBy: { createdAt: 'desc' },
		take: 50,
	})
	return json({ jobs })
}

export default function JobsPage() {
	const { jobs } = useLoaderData<typeof loader>()
	const revalidator = useRevalidator()

	// Auto-refresh if there are active jobs
	useEffect(() => {
		const hasActiveJobs = jobs.some(j => ['pending', 'processing'].includes(j.status))
		if (hasActiveJobs) {
			const interval = setInterval(() => {
				revalidator.revalidate()
			}, 2000)
			return () => clearInterval(interval)
		}
	}, [jobs, revalidator])

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">Background Jobs</h1>

			<div className="rounded-md border bg-card text-card-foreground shadow-sm">
				<div className="overflow-x-auto w-full">
					<table className="w-full text-sm text-left">
						<thead className="bg-muted/50 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Type</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium">Progress</th>
								<th className="px-4 py-3 font-medium">Created</th>
								<th className="px-4 py-3 font-medium">Details</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{jobs.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
										No jobs found
									</td>
								</tr>
							) : (
								jobs.map(job => (
									<tr key={job.id} className="hover:bg-muted/50 transition-colors">
										<td className="px-4 py-3 font-medium">{job.type}</td>
										<td className="px-4 py-3">
											<StatusBadge status={job.status} />
										</td>
										<td className="px-4 py-3">
											<div className="flex flex-col gap-1">
												<span className="font-medium">{job.progress}</span>
												{job.result && job.status === 'processing' && (
													<span className="text-xs text-muted-foreground">
														{safeParse(job.result)?.message}
													</span>
												)}
											</div>
										</td>
										<td className="px-4 py-3 text-muted-foreground">
											{new Date(job.createdAt).toLocaleString()}
										</td>
										<td className="px-4 py-3 max-w-xs">
                                            <JobDetails job={job} />
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

function StatusBadge({ status }: { status: string }) {
	const colors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
	}
	const color = colors[status] || 'bg-gray-100 text-gray-800'

	return (
		<span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', color)}>
			{status}
		</span>
	)
}

function safeParse(jsonString: string | null): Record<string, any> | null {
	if (!jsonString) return null
	try {
		return JSON.parse(jsonString)
	} catch {
		return null
	}
}

function JobDetails({ job }: { job: any }) {
    const result = safeParse(job.result) as Record<string, any> | null

    if (job.status === 'failed') {
        return <span className="text-red-500 text-xs break-words">{result?.error || 'Unknown error'}</span>
    }
    
    if (job.status === 'completed') {
        return (
            <div className="text-xs space-y-1">
                <div className="flex gap-2">
                    <span className="text-green-600">✓ {result?.succeeded ?? 0}</span>
                    <span className="text-red-600">✗ {result?.failed ?? 0}</span>
                    <span className="text-gray-500">- {result?.skipped ?? 0}</span>
                </div>
            </div>
        )
    }

    return null
}

