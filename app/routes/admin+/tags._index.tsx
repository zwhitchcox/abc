import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, useNavigation, Link } from '@remix-run/react'
import { prisma } from '#app/utils/db.server.ts'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { Checkbox } from '#app/components/ui/checkbox.tsx'
import { cn } from '#app/utils/misc.tsx'

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
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Manage Tags</h1>
                <p className="text-muted-foreground mt-1">Organize your content into categories and set usage limits.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm sticky top-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Icon name="plus" className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-bold">Create New Tag</h2>
                        </div>

                        <Form method="POST" className="space-y-5">
                            <input type="hidden" name="intent" value="create" />
                            <div>
                                <Label htmlFor="name">Tag Name</Label>
                                <Input id="name" name="name" required placeholder="e.g. Bedtime Stories" className="mt-1.5" />
                            </div>

                            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="limitMinutes" className="cursor-pointer">Time Limit (min)</Label>
                                    <Input id="limitMinutes" name="limitMinutes" type="number" placeholder="No Limit" min="0" className="w-24 h-8 text-right" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="intervalHours" className="cursor-pointer">Reset Every (hrs)</Label>
                                    <Input id="intervalHours" name="intervalHours" type="number" defaultValue="24" min="1" className="w-24 h-8 text-right" />
                                </div>
                            </div>

                            <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-100 dark:border-stone-800 space-y-3">
                                <Label className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Restricted Hours</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="restrictedHoursStart" className="text-xs mb-1 block">Start (0-23)</Label>
                                        <Input type="number" id="restrictedHoursStart" name="restrictedHoursStart" min="0" max="23" placeholder="21" className="h-9" />
                                    </div>
                                    <div>
                                        <Label htmlFor="restrictedHoursEnd" className="text-xs mb-1 block">End (0-23)</Label>
                                        <Input type="number" id="restrictedHoursEnd" name="restrictedHoursEnd" min="0" max="23" placeholder="7" className="h-9" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="enabled" name="enabled" defaultChecked={true} />
                                <Label htmlFor="enabled">Enabled by default</Label>
                            </div>

                            <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                                {isPending ? 'Creating...' : 'Create Tag'}
                            </Button>
                        </Form>
                    </div>
                </div>

                {/* Tags List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                        Existing Tags
                        <span className="text-sm font-normal text-muted-foreground bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">{tags.length}</span>
                    </h2>

                    {tags.length === 0 ? (
                        <div className="bg-stone-50 dark:bg-stone-900/50 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center">
                            <p className="text-muted-foreground">No tags created yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tags.map((tag) => (
                                <div
                                    key={tag.id}
                                    className={cn(
                                        "group relative p-5 rounded-xl border transition-all hover:shadow-md",
                                        tag.enabled
                                            ? "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
                                            : "bg-stone-50 dark:bg-stone-950 border-stone-200 dark:border-stone-800 opacity-75"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                {tag.name}
                                                {!tag.enabled && (
                                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Disabled</span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {tag._count.stories} stories
                                            </p>
                                        </div>

                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                                            <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                                                <Link to={tag.id}>
                                                    <Icon name="pencil-1" className="h-4 w-4 text-stone-500" />
                                                    <span className="sr-only">Edit</span>
                                                </Link>
                                            </Button>
                                            <Form method="POST">
                                                <input type="hidden" name="intent" value="delete" />
                                                <input type="hidden" name="id" value={tag.id} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    disabled={isPending}
                                                    onClick={(e) => !confirm('Delete tag? This will remove it from all stories.') && e.preventDefault()}
                                                >
                                                    <Icon name="trash" className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            </Form>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {/* Limits Badge */}
                                        {(tag.limitSeconds || (tag.restrictedHoursStart !== null)) ? (
                                            <div className="flex flex-wrap gap-2">
                                                {tag.limitSeconds && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-md font-medium">
                                                        <Icon name="clock" className="h-3 w-3" />
                                                        {Math.floor(tag.limitSeconds / 60)}m / {Math.floor(tag.intervalSeconds / 3600)}h
                                                    </span>
                                                )}
                                                {tag.restrictedHoursStart !== null && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-md font-medium">
                                                        <Icon name="moon" className="h-3 w-3" />
                                                        {tag.restrictedHoursStart}:00 - {tag.restrictedHoursEnd}:00
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-xs text-muted-foreground italic">No restrictions</div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                                        <Form method="POST">
                                            <input type="hidden" name="intent" value="toggleEnabled" />
                                            <input type="hidden" name="id" value={tag.id} />
                                            <input type="hidden" name="enabled" value={tag.enabled ? 'false' : 'true'} />
                                            <Button
                                                type="submit"
                                                variant={tag.enabled ? 'outline' : 'default'}
                                                size="sm"
                                                className={cn("h-7 text-xs", !tag.enabled && "bg-stone-800 hover:bg-stone-700")}
                                            >
                                                {tag.enabled ? 'Disable Tag' : 'Enable Tag'}
                                            </Button>
                                        </Form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
