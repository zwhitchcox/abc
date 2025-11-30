import fs from 'node:fs'
import path from 'node:path'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { Button } from '#app/components/ui/button.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')

    const uploadHandler = async (file: FileUpload) => {
        if (file.fieldName !== 'cookiesFile') return

        const dataDir = path.join(process.cwd(), 'data')
        await fs.promises.mkdir(dataDir, { recursive: true })
        const filepath = path.join(dataDir, 'cookies.txt')

        const writeStream = fs.createWriteStream(filepath)
        for await (const chunk of file.stream()) {
            writeStream.write(chunk)
        }
        writeStream.end()

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })

        return filepath
    }

    try {
        await parseFormData(request, { maxFileSize: 1024 * 1024 * 5 }, uploadHandler)
        return json({ success: true, error: null })
    } catch (e) {
        return json({ success: false, error: 'Upload failed' }, { status: 400 })
    }
}

export default function Settings() {
    const actionData = useActionData<typeof action>()
    const navigation = useNavigation()
    const isSubmitting = navigation.state === 'submitting'

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="max-w-md p-6 border rounded-lg bg-card">
                <h2 className="text-lg font-semibold mb-4">YouTube Cookies</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Upload a cookies.txt file to bypass YouTube bot detection.
                    Use an extension like "Get cookies.txt LOCALLY" to export them.
                </p>

                <Form method="post" encType="multipart/form-data" className="space-y-4">
                    <div>
                        <Label htmlFor="cookiesFile">cookies.txt</Label>
                        <input
                            id="cookiesFile"
                            name="cookiesFile"
                            type="file"
                            accept=".txt"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    {actionData?.error && (
                        <p className="text-sm text-red-500">{actionData.error}</p>
                    )}
                    {actionData?.success && (
                        <p className="text-sm text-green-600">Cookies updated successfully!</p>
                    )}

                    <StatusButton type="submit" status={isSubmitting ? 'pending' : 'idle'}>Upload Cookies</StatusButton>
                </Form>
            </div>
        </div>
    )
}

