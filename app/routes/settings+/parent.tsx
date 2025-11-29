import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { requireUserId } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { Input } from '#app/components/ui/input.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
    const userId = await requireUserId(request)
    const settings = await prisma.parentSettings.findUnique({
        where: { userId }
    })
    return json({ settings })
}

export async function action({ request }: ActionFunctionArgs) {
    const userId = await requireUserId(request)
    const formData = await request.formData()
    const maxChaptersToPlay = Number(formData.get('maxChaptersToPlay'))

    await prisma.parentSettings.upsert({
        where: { userId },
        update: { maxChaptersToPlay },
        create: { userId, maxChaptersToPlay }
    })

    return json({ success: true })
}

export default function ParentSettings() {
    const { settings } = useLoaderData<typeof loader>()

    return (
        <div className="container mx-auto p-6 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Parent Settings</h1>
            <Form method="POST" className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="maxChaptersToPlay">Max Chapters to Play Consecutively</Label>
                    <Input
                        type="number"
                        id="maxChaptersToPlay"
                        name="maxChaptersToPlay"
                        defaultValue={settings?.maxChaptersToPlay ?? 1}
                        min={1}
                        max={100}
                    />
                    <p className="text-sm text-muted-foreground">
                        Set to 1 to pause after every chapter.
                    </p>
                </div>
                <Button type="submit">Save Settings</Button>
            </Form>
        </div>
    )
}

