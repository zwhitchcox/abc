import { Link, useLocation } from '@remix-run/react'
import { Button } from './ui/button'
import { Icon, type IconName } from './ui/icon'
import { cn } from '#app/utils/misc'

interface NavigationOverlayProps {
    isOpen: boolean
    onClose: () => void
    isLocked: boolean
    onToggleLock: () => void
}

const ACTIVITIES = [
    { name: 'Home', path: '/', icon: 'rocket' as IconName, color: 'bg-stone-500' },
    { name: 'Stories', path: '/stories', icon: 'play' as IconName, color: 'bg-orange-500' },
    { name: 'Picture Books', path: '/pdf-stories', icon: 'book-open' as IconName, color: 'bg-purple-500' },
    { name: 'Flashcards', path: '/flashcards', icon: 'camera' as IconName, color: 'bg-amber-500' },
    { name: 'ABC', path: '/abc', icon: 'pencil-1' as IconName, color: 'bg-blue-500' },
    { name: 'Words', path: '/words', icon: 'microphone' as IconName, color: 'bg-green-500' },
    { name: 'Colors', path: '/colors', icon: 'sun' as IconName, color: 'bg-pink-500' },
]

export function NavigationOverlay({ isOpen, onClose, isLocked, onToggleLock }: NavigationOverlayProps) {
    const location = useLocation()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[90] bg-stone-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200 p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Menu</h2>
                <div className="flex gap-2">
                    <Button
                        variant={isLocked ? "destructive" : "secondary"}
                        onClick={onToggleLock}
                        className="gap-2"
                    >
                        <Icon name={isLocked ? "lock-closed" : "lock-open-1"} />
                        {isLocked ? "Unlock Activity" : "Lock Activity"}
                    </Button>
                    <Button variant="ghost" onClick={onClose} size="icon" className="text-white hover:bg-white/10">
                        <Icon name="cross-1" className="w-6 h-6" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full flex-1 content-center overflow-y-auto">
                {ACTIVITIES.map(activity => (
                    <Link
                        key={activity.path}
                        to={activity.path}
                        onClick={onClose}
                        className={cn(
                            "relative overflow-hidden rounded-2xl p-6 aspect-[4/3] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-lg",
                            activity.color,
                            location.pathname === activity.path && "ring-4 ring-white ring-offset-4 ring-offset-stone-950"
                        )}
                    >
                        <Icon name={activity.icon} className="w-12 h-12 text-white drop-shadow-md" />
                        <span className="text-xl font-bold text-white drop-shadow-md">{activity.name}</span>
                    </Link>
                ))}

                <Link
                    to="/admin/parent"
                    onClick={onClose}
                    className="relative overflow-hidden rounded-2xl p-6 aspect-[4/3] flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 bg-stone-800 border-2 border-stone-700 border-dashed"
                >
                    <Icon name="avatar" className="w-12 h-12 text-white/50" />
                    <span className="text-xl font-bold text-white/50">Parent Settings</span>
                </Link>
            </div>
        </div>
    )
}





