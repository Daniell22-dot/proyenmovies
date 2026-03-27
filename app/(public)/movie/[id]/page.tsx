// app/(public)/movie/[id]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Play, Pause, Volume2, VolumeX, Clock, Star, Calendar, ArrowLeft, Info, Share2, Plus, Check } from 'lucide-react'
import Link from 'next/link'
import Hls from 'hls.js'

// Interface for movie data
interface Movie {
    id: string
    title: string
    description: string
    rating: number
    release_date: string
    duration: string
    genres: string[]
    thumbnail_url: string
    trailer_url: string
    is_live: boolean
    hls_manifest_url?: string
}

// Mock data removed in favor of API calls

export default function MovieDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const movieId = params.id as string

    const [movie, setMovie] = useState<Movie | null>(null)
    const [loading, setLoading] = useState(true)

    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [inWatchlist, setInWatchlist] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<Hls | null>(null)

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
                const res = await fetch(`${apiUrl}/media/${movieId}`)
                const data = await res.json()
                if (data.success && data.data) {
                    const dbMovie = data.data

                    // safely parse tags/genres
                    let genres = ['Action', 'Drama']
                    if (dbMovie.tags) {
                        try {
                            if (typeof dbMovie.tags === 'string') {
                                if (dbMovie.tags.startsWith('[')) {
                                    genres = JSON.parse(dbMovie.tags)
                                } else {
                                    genres = dbMovie.tags.split(',').map((t: string) => t.trim())
                                }
                            }
                        } catch (e) { }
                    }

                    setMovie({
                        id: dbMovie.id,
                        title: dbMovie.title || 'Unknown Title',
                        description: dbMovie.description || 'No description available.',
                        rating: dbMovie.rating || 0,
                        release_date: dbMovie.release_date || new Date().toISOString(),
                        duration: dbMovie.duration || '2h 00m',
                        genres: genres,
                        thumbnail_url: dbMovie.preview_url || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1200&auto=format&fit=crop',
                        trailer_url: dbMovie.trailer_url || dbMovie.file_url || 'https://www.w3schools.com/html/mov_bbb.mp4',
                        is_live: !!dbMovie.is_live,
                        hls_manifest_url: dbMovie.hls_manifest_url
                    })
                }
            } catch (error) {
                console.error("Failed to fetch movie", error)
            } finally {
                setLoading(false)
            }
        }
        if (movieId) {
            fetchMovie()
        }
    }, [movieId])

    // Check watchlist status on load
    useEffect(() => {
        const checkWatchlist = async () => {
            if (!movie) return // Ensure movie data is loaded
            const token = localStorage.getItem('token')
            if (!token) return

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
                const res = await fetch(`${apiUrl}/recommendations/watchlist`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const data = await res.json()
                if (data.success && data.data.some((m: any) => m.id === movie.id)) {
                    setInWatchlist(true)
                }
            } catch (error) {
                console.error('Failed to check watchlist', error)
            }
        }
        checkWatchlist()
    }, [movie]) // Depend on movie to ensure it's loaded

    useEffect(() => {
        const video = videoRef.current
        if (!video || !movie) return

        const videoUrl = movie.hls_manifest_url || movie.trailer_url

        if (!videoUrl) return

        if (Hls.isSupported() && videoUrl.endsWith('.m3u8')) {
            const hls = new Hls()
            hls.loadSource(videoUrl)
            hls.attachMedia(video)
            hlsRef.current = hls

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest parsed')
            })

            return () => {
                hls.destroy()
            }
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native support for HLS (Safari)
            video.src = videoUrl
        } else {
            // Standard MP4
            video.src = videoUrl
        }
    }, [movie])

    const togglePlay = async () => {
        if (!videoRef.current) return
        if (isPlaying) {
            videoRef.current.pause()
        } else {
            videoRef.current.play()

            // Track history when play starts
            const token = localStorage.getItem('token')
            if (token && movie) {
                try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
                    await fetch(`${apiUrl}/recommendations/history`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            mediaId: movie.id,
                            position: Math.floor(videoRef.current.currentTime)
                        })
                    })
                } catch (e) {
                    console.error('Failed to track history', e)
                }
            }
        }
        setIsPlaying(!isPlaying)
    }

    const toggleWatchlist = async () => {
        if (!movie) return;
        const token = localStorage.getItem('token')
        if (!token) {
            alert('Please login to use watchlists')
            return
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
            const method = inWatchlist ? 'DELETE' : 'POST'
            const url = inWatchlist
                ? `${apiUrl}/recommendations/watchlist/${movie.id}`
                : `${apiUrl}/recommendations/watchlist`

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: !inWatchlist ? JSON.stringify({ mediaId: movie.id }) : undefined
            })

            if (res.ok) {
                setInWatchlist(!inWatchlist)
            }
        } catch (error) {
            console.error('Watchlist toggle failed', error)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    if (loading || !movie) {
        return (
            <div className="min-h-screen bg-black pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-white/60 font-bold uppercase tracking-widest">Loading Movie...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero / Player Section */}
            <div className="relative h-[70vh] w-full overflow-hidden bg-zinc-900">
                <video
                    ref={videoRef}
                    poster={movie?.thumbnail_url}
                    className="w-full h-full object-cover opacity-60"
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                />

                {/* Play Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    {!isPlaying && (
                        <button
                            onClick={togglePlay}
                            className="w-24 h-24 bg-primary rounded-full flex items-center justify-center hover:scale-110 transition shadow-2xl shadow-primary/40"
                        >
                            <Play className="w-10 h-10 fill-current ml-1" />
                        </button>
                    )}
                </div>

                {/* Video Controls (Simple) */}
                <div className="absolute bottom-6 right-6 flex items-center space-x-4">
                    <button onClick={toggleMute} className="p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/80 transition">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>

                <button
                    onClick={() => router.back()}
                    className="absolute top-28 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/80 transition"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Content Section */}
            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Info */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center space-x-4 mb-6 text-sm font-bold text-primary italic uppercase tracking-widest">
                            <span>{movie.genres.join(' / ')}</span>
                            <span>•</span>
                            <div className="flex items-center text-yellow-500">
                                <Star className="w-4 h-4 fill-current mr-1" />
                                <span>{movie.rating}</span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter italic">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-12 text-white/60 font-medium">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5" />
                                <span>{movie.duration}</span>
                            </div>
                            <span className="px-2 py-0.5 border border-white/20 rounded text-xs">4K</span>
                            <span className="px-2 py-0.5 border border-white/20 rounded text-xs">HDR</span>
                            <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded text-xs font-bold">HLS ADAPTIVE</span>
                        </div>

                        <p className="text-xl text-white/70 leading-relaxed mb-12 max-w-3xl">
                            {movie.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={togglePlay}
                                className="flex items-center space-x-3 bg-primary text-white px-10 py-4 rounded-md font-black uppercase tracking-widest hover:bg-accent transition transform hover:scale-105"
                            >
                                <Play className="w-6 h-6 fill-current" />
                                <span>{isPlaying ? 'Pause' : 'Watch Full Movie'}</span>
                            </button>
                            <button
                                onClick={toggleWatchlist}
                                className={`flex items-center space-x-3 px-8 py-4 rounded-md font-black uppercase tracking-widest transition border ${inWatchlist
                                    ? 'bg-transparent border-white/20 text-white hover:bg-white/5'
                                    : 'bg-white/10 border-transparent hover:bg-white/20 text-white'
                                    }`}
                            >
                                {inWatchlist ? (
                                    <>
                                        <Check className="w-6 h-6 text-green-400" />
                                        <span>In Watchlist</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-6 h-6" />
                                        <span>Add to Watchlist</span>
                                    </>
                                )}
                            </button>
                            <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-md transition">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Sidebar / Meta */}
                    <div className="space-y-8">
                        <div className="p-8 rounded-2xl bg-zinc-900 border border-white/5">
                            <h3 className="text-lg font-black uppercase italic tracking-tighter mb-6">Cast & Crew</h3>
                            <div className="space-y-4">
                                {[
                                    { role: 'Director', name: 'James Cameron' },
                                    { role: 'Lead Actor', name: 'Scarlett Johansson' },
                                    { role: 'Lead Actress', name: 'Ana de Armas' }
                                ].map(item => (
                                    <div key={item.role}>
                                        <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">{item.role}</div>
                                        <div className="text-sm font-bold">{item.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 rounded-2xl bg-primary/10 border border-primary/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <Info className="w-5 h-5 text-primary" />
                                <h3 className="font-black uppercase italic tracking-tighter">Subscription Required</h3>
                            </div>
                            <p className="text-sm text-white/60 mb-6">
                                This movie is available for Premium and VIP subscribers. Join now to unlock full access.
                            </p>
                            <Link
                                href="/subscriptions"
                                className="block w-full text-center py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded transition hover:bg-accent"
                            >
                                Upgrade Plan
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
