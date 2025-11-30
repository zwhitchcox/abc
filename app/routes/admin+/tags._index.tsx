import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, useNavigation, Link } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { stories: true } } }
    })
	return json({ tags })
}

export async function action({ request }: ActionFunctionArgs) {
	await requireUserWithRole(request, 'admin')
	const formData = await request.formData()
	const intent = formData.get('intent')

	if (intent === 'create') {
		const name = String(formData.get('name'))
        const limitMinutes = Number(formData.get('limitMinutes'))
        const intervalHours = Number(formData.get('intervalHours'))
        const enabled = formData.get('enabled') === 'on'

        const restrictedHoursStart = formData.get('restrictedHoursStart') ? Number(formData.get('restrictedHoursStart')) : null
        const restrictedHoursEnd = formData.get('restrictedHoursEnd') ? Number(formData.get('restrictedHoursEnd')) : null

		const limitSeconds = limitMinutes > 0 ? limitMinutes * 60 : null
        const intervalSeconds = intervalHours > 0 ? intervalHours * 3600 : 86400

		await prisma.tag.create({
			data: {
                name,
                limitSeconds,
                intervalSeconds,
                enabled,
                restrictedHoursStart,
                restrictedHoursEnd
            },
		})
	} else if (intent === 'delete') {
		const id = String(formData.get('id'))
		await prisma.tag.delete({ where: { id } })
    } else if (intent === 'toggleEnabled') {
        const id = String(formData.get('id'))
        const enabled = formData.get('enabled') === 'true'
        await prisma.tag.update({ where: { id }, data: { enabled } })
    }

	return json({ success: true })
}

export default function TagsAdmin() {
	const { tags } = useLoaderData<typeof loader>()
    const navigation = useNavigation()
    const isPending = navigation.state === 'submitting'

	return (
		<div className="container mx-auto p-6 max-w-2xl">
			<h1 className="text-3xl font-bold mb-8">Manage Tags</h1>

			<div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 mb-8">
				<h2 className="text-xl font-semibold mb-4">Create New Tag</h2>
				<Form method="POST" className="space-y-4">
					<input type="hidden" name="intent" value="create" />
					<div>
						<Label htmlFor="name">Tag Name</Label>
						<Input id="name" name="name" required placeholder="e.g. Favorites, Bedtime" />
					</div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="enabled" name="enabled" defaultChecked={true} />
                        <Label htmlFor="enabled">Enabled</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="limitMinutes">Time Limit (Minutes)</Label>
                            <Input id="limitMinutes" name="limitMinutes" type="number" placeholder="No Limit" min="0" />
                            <p className="text-xs text-muted-foreground mt-1">How much time allowed</p>
                        </div>
                        <div>
                            <Label htmlFor="intervalHours">Interval (Hours)</Label>
                            <Input id="intervalHours" name="intervalHours" type="number" defaultValue="24" min="1" />
                            <p className="text-xs text-muted-foreground mt-1">Reset frequency (default 24h)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                         <div>
                             <Label htmlFor="restrictedHoursStart">Disable Start (Hour 0-23)</Label>
                             <Input id="restrictedHoursStart" type="number" name="restrictedHoursStart" min="0" max="23" placeholder="e.g. 21 (9 PM)" />
                         </div>
                         <div>
                             <Label htmlFor="restrictedHoursEnd">Disable End (Hour 0-23)</Label>
                             <Input id="restrictedHoursEnd" type="number" name="restrictedHoursEnd" min="0" max="23" placeholder="e.g. 7 (7 AM)" />
                         </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Set start and end hours to disable access during that time period (based on configured Time Zone).</p>

					<Button type="submit" disabled={isPending} className="w-full">
                        {isPending ? 'Creating...' : 'Create Tag'}
                    </Button>
				</Form>
			</div>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold">Existing Tags</h2>
				{tags.length === 0 ? (
					<p className="text-muted-foreground">No tags yet.</p>
				) : (
					tags.map((tag) => (
						<div
							key={tag.id}
							className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 gap-4"
						>
							<div>
								<h3 className="font-bold text-lg flex items-center gap-2">
                                    {tag.name}
                                    {!tag.enabled && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Disabled</span>}
                                </h3>
								<p className="text-sm text-muted-foreground">
                                    Limit: {tag.limitSeconds ? `${Math.floor(tag.limitSeconds / 60)}m` : 'None'} / {Math.floor(tag.intervalSeconds / 3600)}h
                                    • {tag._count.stories} stories
                                </p>
                                {tag.restrictedHoursStart !== null && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        Restricted: {tag.restrictedHoursStart}:00 - {tag.restrictedHoursEnd}:00
                                    </p>
                                )}
							</div>
                            <div className="flex items-center gap-2">
                                <Button asChild size="sm" variant="secondary">
                                    <Link to={tag.id}>
                                        <Icon name="pencil-1" className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Form method="POST">
                                    <input type="hidden" name="intent" value="toggleEnabled" />
                                    <input type="hidden" name="id" value={tag.id} />
                                    <input type="hidden" name="enabled" value={tag.enabled ? 'false' : 'true'} />
                                    <Button
                                        type="submit"
                                        variant={tag.enabled ? 'outline' : 'secondary'}
                                        size="sm"
                                        disabled={isPending}
                                    >
                                        {tag.enabled ? 'Disable' : 'Enable'}
                                    </Button>
                                </Form>
                                <Form method="POST">
                                    <input type="hidden" name="intent" value="delete" />
                                    <input type="hidden" name="id" value={tag.id} />
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        size="sm"
                                        disabled={isPending}
                                        onClick={(e) => !confirm('Delete tag?') && e.preventDefault()}
                                    >
                                        <Icon name="trash" className="h-4 w-4" />
                                    </Button>
                                </Form>
                            </div>
						</div>
					))
				)}
			</div>
		</div>
	)
}

