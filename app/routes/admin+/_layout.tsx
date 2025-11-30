import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { Outlet, Link, useLocation } from '@remix-run/react'
import { Icon } from '#app/components/ui/icon.tsx'
import { requireUserWithRole } from '#app/utils/permissions.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
    await requireUserWithRole(request, 'admin')
    return json({})
}

export default function AdminLayout() {
    const location = useLocation()
    const isDashboard = location.pathname === '/admin'

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b bg-white dark:bg-stone-900 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                {!isDashboard && (
                    <Link
                        to="/admin"
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-stone-800 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Back to Dashboard"
                    >
                        <Icon name="arrow-left" className="h-6 w-6" />
                    </Link>
                )}
                <h1 className="text-xl font-bold text-foreground">
                    {isDashboard ? 'Admin Dashboard' : 'Admin Area'}
                </h1>
                <div className="ml-auto flex gap-4">
                    <Link to="/admin/settings" className="text-sm font-medium text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-2">
                        <Icon name="dots-horizontal" className="h-4 w-4" />
                        Settings
                    </Link>
                    <Link to="/stories" className="text-sm font-medium text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors flex items-center gap-2">
                        <Icon name="link-2" className="h-4 w-4" />
                        View Library
                    </Link>
                </div>
            </header>
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    )
}

