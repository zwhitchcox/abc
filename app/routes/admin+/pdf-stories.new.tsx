import path from 'path'
import { type FileUpload, parseFormData } from '@mjackson/form-data-parser'
import {
	json,
	redirect,
	type ActionFunctionArgs,
    type LoaderFunctionArgs,
} from '@remix-run/node'
import { Form, useNavigation } from '@remix-run/react'
import { execa } from 'execa'
import fs from 'fs-extra'
import { useState } from 'react'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    return json({})
}

export async function action({ request }: ActionFunctionArgs) {
    await requireUserWithRole(request, 'admin')

    const uploadsDir = path.join(process.cwd(), 'data', 'raw-pdfs')
    await fs.ensureDir(uploadsDir)

    const uploadHandler = async (file: FileUpload) => {
        if (file.fieldName !== 'file') return

        const filePath = path.join(uploadsDir, file.name)
        const writeStream = fs.createWriteStream(filePath)

        for await (const chunk of file.stream()) {
            writeStream.write(chunk)
        }
        writeStream.end()

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve)
            writeStream.on('error', reject)
        })

        return filePath
    }

    const formData = await parseFormData(
        request,
        { maxFileSize: 1024 * 1024 * 500, maxFiles: 100 }, // 500MB max per file, 100 files max
        uploadHandler
    )

    const files = formData.getAll('file') as string[]
    const validFiles = files.filter(f => typeof f === 'string' && f.length > 0)

	if (validFiles.length === 0) {
		return json({ error: 'No files uploaded' }, { status: 400 })
	}

    // Spawn process-pdf script in background for each file
    for (const filePath of validFiles) {
        execa('npm', ['run', 'process-pdf', filePath], {
            detached: true,
            stdio: 'inherit',
            cwd: process.cwd()
        }).unref()
    }

	return redirect('/pdf-stories')
}

export default function NewPdfStory() {
	const navigation = useNavigation()
    const [uploadProgress, setUploadProgress] = useState<number>(0)
    const [isUploading, setIsUploading] = useState(false)

    const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const fileInput = document.getElementById('file') as HTMLInputElement

        if (!fileInput?.files?.length) {
            alert('Please select at least one file')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', window.location.href, true)

        // Track upload progress
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100
                setUploadProgress(Math.round(percentComplete))
            }
        }

        xhr.onload = () => {
            setIsUploading(false)
            if (xhr.status >= 200 && xhr.status < 300) {
               if (xhr.responseURL && !xhr.responseURL.includes('pdf-stories/new')) {
                   window.location.href = xhr.responseURL
               } else {
                   window.location.href = '/admin/pdf-stories'
               }
            } else {
                console.error('Upload failed:', xhr.statusText)
                alert('Upload failed. Check console for details.')
            }
        }

        xhr.onerror = () => {
            setIsUploading(false)
            console.error('XHR Error')
            alert('Network error during upload.')
        }

        xhr.send(formData)
    }

	return (
		<div className="container mx-auto p-8 max-w-md">
			<h1 className="text-2xl font-bold mb-6">Upload PDF Story</h1>

            {isUploading && (
                <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow border">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium">Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Please wait while files are being uploaded.</p>
                </div>
            )}

			<Form
                method="post"
                encType="multipart/form-data"
                className="space-y-4"
                onSubmit={handleUpload}
            >
				<div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-900"
                    onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.classList.add('border-blue-500')
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.classList.remove('border-blue-500')
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        e.currentTarget.classList.remove('border-blue-500')
                        const files = e.dataTransfer.files
                        if (files && files.length > 0) {
                            const input = document.getElementById('file') as HTMLInputElement
                            if (input) {
                                input.files = files
                                const count = files.length
                                const label = document.getElementById('file-count-label')
                                if (label) label.innerText = count > 0 ? `${count} files selected` : ''
                            }
                        }
                    }}
                >
					<label htmlFor="file" className="cursor-pointer block w-full h-full">
                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                            <span className="text-4xl">📄</span>
                            <span className="font-medium text-lg">Click to Upload or Drag & Drop</span>
                            <span className="text-sm text-muted-foreground">Support for PDF files</span>
                        </div>
                    </label>
					<input
						id="file"
						type="file"
						name="file"
						accept=".pdf"
						required
                        multiple
						className="hidden"
                        onChange={(e) => {
                            const count = e.target.files?.length || 0
                            const label = document.getElementById('file-count-label')
                            if (label) label.innerText = count > 0 ? `${count} files selected` : ''
                        }}
					/>
                    <p id="file-count-label" className="mt-4 text-sm font-medium text-blue-600 h-5"></p>
				</div>
				<button
					type="submit"
					disabled={isUploading || navigation.state === 'submitting'}
					className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
				>
					{isUploading ? 'Uploading...' : 'Upload & Process'}
				</button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Processing happens in the background and may take several minutes per file.
                    Stories will appear in the library automatically as pages are processed.
                </p>
			</Form>
		</div>
	)
}

