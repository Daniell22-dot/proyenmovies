// components/MovieCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Calendar, Clock, Info } from 'lucide-react'
import { useState } from 'react'

interface MovieCardProps {
    movie: {
        id: string
        title: string
        thumbnail_url: string | null
        media_type: 'movie' | 'tv'
        rating: number | string
        release_date: string | null
        genres?: string[]
        duration?: string
    }
}

export default function MovieCard({ movie }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    const formatRating = (rating: number | string) => {
        const num = typeof rating === 'string' ? parseFloat(rating) : rating
        return isNaN(num) ? '0.0' : num.toFixed(1)
    }

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '2024'

    return (
        <Link
            href={`/movie/${movie.id}`}
            className="group relative block aspect-[2/3] movie-card rounded-xl bg-card overflow-hidden shadow-lg border border-white/5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Poster Image */}
            {movie.thumbnail_url ? (
                <Image
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20">
                    <Play className="w-12 h-12 text-white/20 mb-2" />
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">No Poster</span>
                </div>
            )}

            {/* Overlay Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-90' : 'opacity-60'}`} />

            {/* Hover Status / Play Button */}
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50">
                    <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                </div>
            </div>

            {/* Movie Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-white/60 mb-1">
                    <span>{movie.media_type?.toUpperCase() || 'MOVIE'}</span>
                    <span>•</span>
                    <div className="flex items-center text-yellow-500">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        <span>{formatRating(movie.rating || 0)}</span>
                    </div>
                </div>

                <h3 className="font-bold text-white text-sm md:text-base leading-tight truncate mb-1">
                    {movie.title}
                </h3>

                <div className="flex items-center justify-between text-[10px] text-white/50">
                    <div className="flex items-center space-x-2">
                        <span>{releaseYear}</span>
                        <span>•</span>
                        <span>{movie.duration || '2h 10m'}</span>
                    </div>
                </div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-1">
                {movie.media_type === 'tv' && (
                    <span className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border border-white/20">
                        Series
                    </span>
                )}
            </div>
        </Link>
    )
}
