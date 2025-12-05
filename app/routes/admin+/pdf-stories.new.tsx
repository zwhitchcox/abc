import path from 'path'
import {
	json,
	unstable_createMemoryUploadHandler,
	unstable_parseMultipartFormData,
	redirect,
	type ActionFunctionArgs,
    type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useNavigation } from '@remix-run/react'
import { execa } from 'execa'
import fs from 'fs-extra'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    return json({})
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')

	const uploadHandler = unstable_createMemoryUploadHandler({
		maxPartSize: 500_000_000, // 500MB
	})

	const formData = await unstable_parseMultipartFormData(request, uploadHandler)
	const file = formData.get('file') as File

	if (!file || !file.name) {
		return json({ error: 'File is required' }, { status: 400 })
	}

    // Save file to temp location
    const uploadsDir = path.join(process.cwd(), 'data', 'raw-pdfs')
    await fs.ensureDir(uploadsDir)
    const filePath = path.join(uploadsDir, file.name)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // Spawn process-pdf script in background
    execa('npm', ['run', 'process-pdf', filePath], {
        detached: true,
        stdio: 'inherit',
        cwd: process.cwd()
    }).unref()

	return redirect('/pdf-stories')
}

export default function NewPdfStory() {
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'

	return (
		<div className="container mx-auto p-8 max-w-md">
			<h1 className="text-2xl font-bold mb-6">Upload PDF Story</h1>
			<Form method="post" encType="multipart/form-data" className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-2">PDF File</label>
					<input
						type="file"
						name="file"
						accept=".pdf"
						required
						className="block w-full text-sm border rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-2"
					/>
				</div>
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
				>
					{isSubmitting ? 'Uploading & Starting...' : 'Upload & Process'}
				</button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Processing happens in the background and may take several minutes.
                    The story will appear in the library automatically as pages are processed.
                </p>
			</Form>
		</div>
	)
}

