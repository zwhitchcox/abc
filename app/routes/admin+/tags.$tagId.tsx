import { invariantResponse } from '@epic-web/invariant'
import { json, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, Link } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    invariantResponse(params.tagId, 'Tag ID is required')

    const tag = await prisma.tag.findUnique({
        where: { id: params.tagId }
    })
    invariantResponse(tag, 'Tag not found', { status: 404 })

    return json({ tag })
}

export async function action({ request, params }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    invariantResponse(params.tagId, 'Tag ID is required')

    const formData = await request.formData()
    const name = String(formData.get('name'))
    const limitMinutes = formData.get('limitMinutes') ? Number(formData.get('limitMinutes')) : 0
    const intervalHours = formData.get('intervalHours') ? Number(formData.get('intervalHours')) : 24
    const enabled = formData.get('enabled') === 'on'

    const rStart = formData.get('restrictedHoursStart')
    const rEnd = formData.get('restrictedHoursEnd')

    const restrictedHoursStart = rStart && rStart !== '' ? Number(rStart) : null
    const restrictedHoursEnd = rEnd && rEnd !== '' ? Number(rEnd) : null

    const limitSeconds = limitMinutes > 0 ? limitMinutes * 60 : null
    const intervalSeconds = intervalHours > 0 ? intervalHours * 3600 : 86400

    await prisma.tag.update({
        where: { id: params.tagId },
        data: {
            name,
            limitSeconds,
            intervalSeconds,
            enabled,
            restrictedHoursStart,
            restrictedHoursEnd
        }
    })

    return redirect('/admin/tags')
}

export default function EditTag() {
    const { tag } = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto p-6 max-w-2xl">
             <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/tags" className="text-muted-foreground hover:text-foreground">
                    <Icon name="arrow-left" className="h-6 w-6" />
                </Link>
                <h1 className="text-3xl font-bold">Edit Tag</h1>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800">
                <Form method="POST" className="space-y-6" key={tag.id}>
                    <div>
                        <Label htmlFor="name">Tag Name</Label>
                        <Input id="name" name="name" defaultValue={tag.name} required />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="enabled" name="enabled" defaultChecked={tag.enabled} />
                        <Label htmlFor="enabled">Enabled</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="limitMinutes">Time Limit (Minutes)</Label>
                            <Input
                                id="limitMinutes"
                                name="limitMinutes"
                                type="number"
                                defaultValue={tag.limitSeconds ? Math.floor(tag.limitSeconds / 60) : ''}
                                placeholder="No Limit"
                                min="0"
                            />
                             <p className="text-xs text-muted-foreground mt-1">Leave empty for no limit</p>
                        </div>
                        <div>
                            <Label htmlFor="intervalHours">Interval (Hours)</Label>
                            <Input
                                id="intervalHours"
                                name="intervalHours"
                                type="number"
                                defaultValue={Math.floor(tag.intervalSeconds / 3600)}
                                min="1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Reset frequency (default 24h)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                         <div>
                             <Label htmlFor="restrictedHoursStart">Disable Start (Hour 0-23)</Label>
                             <Input
                                id="restrictedHoursStart"
                                type="number"
                                name="restrictedHoursStart"
                                min="0"
                                max="23"
                                defaultValue={tag.restrictedHoursStart ?? ''}
                                placeholder="e.g. 21 (9 PM)"
                            />
                         </div>
                         <div>
                             <Label htmlFor="restrictedHoursEnd">Disable End (Hour 0-23)</Label>
                             <Input
                                id="restrictedHoursEnd"
                                type="number"
                                name="restrictedHoursEnd"
                                min="0"
                                max="23"
                                defaultValue={tag.restrictedHoursEnd ?? ''}
                                placeholder="e.g. 7 (7 AM)"
                            />
                         </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Set start and end hours to disable access during that time period (based on configured Time Zone).</p>

                    <div className="flex gap-4 pt-4">
                        <Button type="submit">Save Changes</Button>
                        <Button variant="secondary" asChild>
                            <Link to="/admin/tags">Cancel</Link>
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

