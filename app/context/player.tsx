import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useFetcher, useNavigate, useLocation } from '@remix-run/react'

type Story = {
    id: string
    title: string
    type: string
    audio?: { id: string, contentType: string }
    chapters: Array<{ id: string, title: string, startTime: number, endTime: number | null }>
    images: Array<{ id: string }>
}

type PlayerContextType = {
    currentStory: Story | null
    isPlaying: boolean
    volume: number
    maxVolume: number
    currentTime: number
    currentChapterIndex: number
    play: (story: Story, startChapter?: number, startTime?: number) => void
    pause: () => void
    resume: () => void
    setVolume: (vol: number) => void
    setMaxVolume: (vol: number) => void
    seek: (time: number) => void
    nextChapter: () => void
    prevChapter: () => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function usePlayer() {
    const context = useContext(PlayerContext)
    if (!context) throw new Error('usePlayer must be used within PlayerProvider')
    return context
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentStory, setCurrentStory] = useState<Story | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(100)
    const [maxVolume, setMaxVolume] = useState(100)
    const [currentTime, setCurrentTime] = useState(0)
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0)

    const audioRef = useRef<HTMLAudioElement | null>(null)
    const fetcher = useFetcher()
    const fetcherRef = useRef(fetcher)
    useEffect(() => { fetcherRef.current = fetcher }, [fetcher])

    const navigate = useNavigate()
    const location = useLocation()
    const lastSaveTimeRef = useRef(Date.now())
    const restoreTimeRef = useRef<number | null>(null)
    const handledDataRef = useRef<any>(null)

    const currentChapter = currentStory?.chapters[currentChapterIndex]

    const stateRef = useRef({ currentStory, currentTime, currentChapterIndex, isPlaying })
    useEffect(() => {
        stateRef.current = { currentStory, currentTime, currentChapterIndex, isPlaying }
    }, [currentStory, currentTime, currentChapterIndex, isPlaying])

    const saveProgress = useCallback((type: 'fetcher' | 'beacon' = 'fetcher', isPlayingOverride?: boolean) => {
        const { currentStory, currentTime, currentChapterIndex, isPlaying } = stateRef.current
        if (!currentStory) return

        const now = Date.now()
        const increment = Math.max(0, Math.round((now - lastSaveTimeRef.current) / 1000))
        lastSaveTimeRef.current = now
        let time = audioRef.current?.currentTime || currentTime
        if (isNaN(time)) time = 0

        const status = isPlayingOverride ?? isPlaying

        if (type === 'beacon') {
            const data = new URLSearchParams()
            data.append('intent', 'track-usage')
            data.append('storyId', currentStory.id)
            data.append('currentTime', String(time))
            data.append('currentChapterIndex', String(currentChapterIndex))
            data.append('increment', String(increment))
            data.append('isPlaying', String(status))
            navigator.sendBeacon('/resources/player', data)
        } else {
            fetcherRef.current.submit({
                intent: 'track-usage',
                storyId: currentStory.id,
                currentTime: String(time),
                currentChapterIndex: String(currentChapterIndex),
                increment: String(increment),
                isPlaying: String(status)
            }, { method: 'post', action: '/resources/player' })
        }
    }, []) // Removed fetcher dependency

    // Sync Volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, (volume / 100) * (maxVolume / 100)))
        }
    }, [volume, maxVolume])

    // Heartbeat & Limit Check
    useEffect(() => {
        if (!isPlaying || !currentStory) return

        const interval = setInterval(() => {
            saveProgress('fetcher', true)
        }, 5000)

        return () => clearInterval(interval)
    }, [isPlaying, currentStory, saveProgress])

    // Pagehide Listener
    useEffect(() => {
        const handleUnload = () => {
            if (stateRef.current.isPlaying) saveProgress('beacon', false)
        }
        window.addEventListener('pagehide', handleUnload)
        return () => window.removeEventListener('pagehide', handleUnload)
    }, [saveProgress])

    // Handle Limit Reached
    useEffect(() => {
        if (fetcher.data && fetcher.data !== handledDataRef.current) {
            handledDataRef.current = fetcher.data
            if ((fetcher.data as any).limitReached) {
                pause()
                navigate(`/timeout?reason=${(fetcher.data as any).reason}`)
            }
        }
    }, [fetcher.data, navigate, pause])

    // Playback Logic
    const play = useCallback((story: Story, startChapter = 0, startTime?: number) => {
        if (currentStory?.id !== story.id) {
            setCurrentStory(story)
            setCurrentChapterIndex(startChapter)
            const time = startTime ?? (story.chapters[startChapter]?.startTime || 0)
            setCurrentTime(time)
            restoreTimeRef.current = time
            if (audioRef.current) {
                audioRef.current.currentTime = time
            }
        }
        setIsPlaying(true)
        lastSaveTimeRef.current = Date.now()
        if (audioRef.current) {
            audioRef.current.play().catch((e) => {
                console.error("Playback failed/blocked:", e)
                setIsPlaying(false)
            })
        }
    }, [currentStory])

    const pause = useCallback(() => {
        saveProgress('fetcher', false)
        setIsPlaying(false)
        if (audioRef.current) audioRef.current.pause()
    }, [saveProgress])

    const resume = useCallback(() => {
        setIsPlaying(true)
        lastSaveTimeRef.current = Date.now()
        if (audioRef.current) audioRef.current.play().catch(console.error)
    }, [])

    const seek = useCallback((time: number) => {
        setCurrentTime(time)
        if (audioRef.current) audioRef.current.currentTime = time
    }, [])

    const nextChapter = useCallback(() => {
        if (currentStory && currentChapterIndex < currentStory.chapters.length - 1) {
            const nextIdx = currentChapterIndex + 1
            setCurrentChapterIndex(nextIdx)
            const startTime = currentStory.chapters[nextIdx]?.startTime || 0
            setCurrentTime(startTime)
            if (audioRef.current) audioRef.current.currentTime = startTime
        }
    }, [currentStory, currentChapterIndex])

    const prevChapter = useCallback(() => {
        if (currentStory && currentChapterIndex > 0) {
            const prevIdx = currentChapterIndex - 1
            setCurrentChapterIndex(prevIdx)
            const startTime = currentStory.chapters[prevIdx]?.startTime || 0
            setCurrentTime(startTime)
            if (audioRef.current) audioRef.current.currentTime = startTime
        }
    }, [currentStory, currentChapterIndex])

    const onTimeUpdate = () => {
        if (audioRef.current && currentChapter) {
            const time = audioRef.current.currentTime

            // Ignore 0 if we are attempting to restore
            if (time === 0 && restoreTimeRef.current !== null && restoreTimeRef.current > 0.5) {
                return
            }

            setCurrentTime(time)

            // Check chapter end
            if (currentChapter.endTime && time >= currentChapter.endTime) {
                // Auto advance? Or pause?
                // For now pause to match user preference of "one chapter at a time" unless configured otherwise
                // But logic for auto-advance is complex (parent settings).
                // I'll simple pause for now, or let the component handle it?
                // Global player should handle it.
                // I'll implement auto-advance logic later or assume simple next.
                // Default behavior: Pause at end of chapter
                pause()
                // If we want auto-advance, we need ParentSettings in context.
            }
        }
    }

    const value = {
        currentStory,
        isPlaying,
        volume,
        maxVolume,
        currentTime,
        currentChapterIndex,
        play,
        pause,
        resume,
        setVolume,
        setMaxVolume,
        seek,
        nextChapter,
        prevChapter
    }

    return (
        <PlayerContext.Provider value={value}>
            {children}
            {currentStory?.type === 'audiobook' && currentStory.audio?.id && (
                <audio
                    key={currentStory.id}
                    ref={audioRef}
                    src={`/resources/audio-files/${currentStory.audio.id}`}
                    onLoadedMetadata={(e) => {
                        // Restore time and play state on mount/load using Ref to avoid closure staleness
                        if (restoreTimeRef.current !== null) {
                             e.currentTarget.currentTime = restoreTimeRef.current
                        }
                        if (isPlaying) {
                            e.currentTarget.play().catch(() => {
                                setIsPlaying(false)
                            })
                        }
                    }}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={pause}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    preload="auto"
                />
            )}
        </PlayerContext.Provider>
    )
}

