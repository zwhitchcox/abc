import { Link, useSearchParams } from '@remix-run/react'
import { useState, useEffect } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

export default function TimeoutPage() {
    const [searchParams] = useSearchParams()
    const reason = searchParams.get('reason') || 'Time Limit Reached'
    const availableAtParam = searchParams.get('availableAt')

    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        if (!availableAtParam) return

        const target = new Date(availableAtParam).getTime()

        const update = () => {
            const now = Date.now()
            const diff = target - now
            if (diff <= 0) {
                setTimeLeft('Ready!')
                return
            }

            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)

            setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`)
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [availableAtParam])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-950 text-white p-8 text-center transition-colors">
            <div className="mb-8 p-6 bg-stone-900 rounded-full shadow-2xl border border-stone-800">
                <Icon name="clock" className="h-24 w-24 text-orange-600 animate-pulse" />
            </div>

            <h1 className="text-5xl font-bold mb-6 font-comic text-orange-500 drop-shadow-sm">
                {reason === 'Restricted Hours' ? 'Sleep Time!' : "Time's Up!"}
            </h1>

            <div className="text-xl text-stone-400 mb-12 max-w-md mx-auto leading-relaxed">
                {reason === 'No Tags Assigned' ? (
                    <p>This story hasn't been unlocked yet.<br/>Ask your parent to add a tag.</p>
                ) : reason === 'Restricted Hours' ? (
                    <p>It's not time for stories right now.<br/>Try again later!</p>
                ) : (
                    <p>You've used up your time for now.<br/>Why not play outside or draw a picture?</p>
                )}
                 {reason !== 'No Tags Assigned' && reason !== 'Restricted Hours' && reason !== 'Time Limit Reached' && (
                    <p className="mt-2 text-sm opacity-70">({reason})</p>
                )}
            </div>

            {availableAtParam && timeLeft && (
                <div className="mb-12 p-8 bg-stone-900/80 rounded-3xl border border-stone-800 shadow-inner min-w-[280px]">
                    <p className="text-xs text-stone-500 uppercase tracking-[0.2em] mb-3 font-bold">Available In</p>
                    <p className="text-5xl font-mono font-bold text-orange-400 tabular-nums tracking-tight">{timeLeft}</p>
                </div>
            )}

            <Button asChild size="lg" className="text-xl px-10 py-8 rounded-2xl bg-orange-600 hover:bg-orange-700 hover:scale-105 transition-all shadow-lg shadow-orange-900/20">
                <Link to="/stories">
                    <Icon name="arrow-left" className="mr-3 h-6 w-6" />
                    Back to Library
                </Link>
            </Button>
        </div>
    )
}

