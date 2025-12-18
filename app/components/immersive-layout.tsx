import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from '@remix-run/react'
import { ParentGate } from './parent-gate'
import { NavigationOverlay } from './navigation-overlay'
import { Icon } from './ui/icon'
import { cn } from '#app/utils/misc'

export function ImmersiveLayout({ children }: { children: React.ReactNode }) {
    const [gateOpen, setGateOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const isLocked = searchParams.get('lock') === 'true'
    const navigate = useNavigate()

    const handleUnlock = () => {
        setGateOpen(false)
        setMenuOpen(true)
    }

    const toggleLock = () => {
        if (isLocked) {
            searchParams.delete('lock')
        } else {
            searchParams.set('lock', 'true')
        }
        setSearchParams(searchParams, { replace: true })
    }

    return (
        <div className="relative w-full h-full min-h-screen bg-stone-950">
            {/* Content */}
            {children}

            {/* Parent Trigger */}
            <button
                onClick={() => setGateOpen(true)}
                className={cn(
                    "fixed top-4 right-4 z-50 p-3 rounded-full text-white/20 hover:text-white/80 hover:bg-black/20 transition-all",
                    isLocked ? "opacity-0 hover:opacity-100 duration-500" : "opacity-50"
                )}
                aria-label="Parent Menu"
            >
                <Icon name="lock-closed" className="w-6 h-6" />
            </button>

            <ParentGate
                isOpen={gateOpen}
                onClose={() => setGateOpen(false)}
                onUnlock={handleUnlock}
            />

            <NavigationOverlay
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
                isLocked={isLocked}
                onToggleLock={toggleLock}
            />
        </div>
    )
}





