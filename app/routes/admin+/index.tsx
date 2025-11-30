import { Link } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'
import { type LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    return null
}

export default function AdminDashboard() {
    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stories Card */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400">
                            <Icon name="file-text" className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold">Stories & Videos</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Manage audiobooks and read-aloud videos. Upload new content and organize items.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/admin/stories/new"
                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg text-center font-semibold hover:bg-orange-700 transition-colors"
                        >
                            Add New Story
                        </Link>
                        <Link
                            to="/admin/stories"
                            className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 py-2 px-4 rounded-lg text-center hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                        >
                            Manage All Stories
                        </Link>
                    </div>
                </div>

                {/* Tags Card */}
                <div className="bg-white dark:bg-stone-900 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                            <Icon name="list" className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold">Tags</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                        Organize content into tags (collections), set time limits, and manage availability schedules.
                    </p>
                    <div className="flex flex-col gap-3">
                         <Link
                            to="/admin/tags"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Manage Tags
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

