import { useState, useEffect } from 'react'
import { useRouteLoaderData } from '@remix-run/react'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { cn } from '#app/utils/misc'
import { type loader as rootLoader } from '#app/root'

interface ParentGateProps {
    isOpen: boolean
    onClose: () => void
    onUnlock: () => void
}

export function ParentGate({ isOpen, onClose, onUnlock }: ParentGateProps) {
    const [pin, setPin] = useState('')
    const [error, setError] = useState(false)
    const data = useRouteLoaderData<typeof rootLoader>('root')
    const correctPin = data?.user?.parentSettings?.pinCode || '0000'

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === correctPin) {
                // Small delay for visual feedback
                setTimeout(() => {
                    onUnlock()
                    setPin('')
                }, 100)
            } else {
                setError(true)
                setTimeout(() => {
                    setPin('')
                    setError(false)
                }, 500)
            }
        }
    }, [pin, correctPin, onUnlock])

    // Reset pin when opened
    useEffect(() => {
        if (isOpen) {
            setPin('')
            setError(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleNum = (num: number) => {
        if (pin.length < 4) {
            setPin(prev => prev + num)
            setError(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xs p-6">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                        <Icon name="lock-closed" className="w-8 h-8 text-white/70" />
                    </div>
                    <h2 className="text-xl font-medium text-white mb-1">Parent Access</h2>
                    <p className="text-sm text-white/40">Enter 4-digit PIN</p>
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={cn(
                                "w-3 h-3 rounded-full border border-white/20 transition-all duration-300",
                                pin.length > i && "bg-white border-white scale-110",
                                error && "border-red-500 bg-red-500"
                            )}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleNum(num)}
                            className="h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-2xl font-medium text-white transition-all active:scale-95"
                        >
                            {num}
                        </button>
                    ))}
                    <div />
                    <button
                        onClick={() => handleNum(0)}
                        className="h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-2xl font-medium text-white transition-all active:scale-95"
                    >
                        0
                    </button>
                    <button
                        onClick={() => setPin(prev => prev.slice(0, -1))}
                        className="h-16 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
                    >
                        <Icon name="arrow-left" className="w-6 h-6" />
                    </button>
                </div>

                <div className="text-center">
                    <Button variant="ghost" onClick={onClose} className="text-white/40 hover:text-white hover:bg-white/10">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}





