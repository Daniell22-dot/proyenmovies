// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/Hero'
import MovieGrid from '@/components/MovieGrid'

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [recentAdditions, setRecentAdditions] = useState<any[]>([])
  const [recommendedMovies, setRecommendedMovies] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch public data
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const mediaRes = await fetch(`${apiUrl}/media`)
        const mediaData = await mediaRes.json()

        if (mediaData.success) {
          // Sort by rating for trending
          const sortedByRating = [...mediaData.data].sort((a, b) => (b.rating || 0) - (a.rating || 0))
          setTrendingMovies(sortedByRating.slice(0, 5))

          // Use natural order (usually latest first based on DB insertions) for recent
          setRecentAdditions(mediaData.data.slice(0, 5))
        }

        // Fetch personalized data if logged in
        const token = localStorage.getItem('token')
        if (token) {
          const headers = { 'Authorization': `Bearer ${token}` }

          const recRes = await fetch(`${apiUrl}/recommendations/personalized`, { headers })
          const recData = await recRes.json()
          if (recData.success) setRecommendedMovies(recData.data)

          const watchRes = await fetch(`${apiUrl}/recommendations/watchlist`, { headers })
          const watchData = await watchRes.json()
          if (watchData.success) setWatchlist(watchData.data)
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <Hero />

      <main className="container mx-auto px-4 pb-20">

        {/* Recommended Section (Only if logged in and has data) */}
        {recommendedMovies.length > 0 && (
          <section className="relative z-20 mt-8 mb-12">
            <MovieGrid movies={recommendedMovies} title="Recommended For You" />
          </section>
        )}

        {/* Trending Section (Shift up if no recommendations) */}
        <section className={`${recommendedMovies.length > 0 ? '' : 'relative z-20 mt-8'}`}>
          <MovieGrid movies={trendingMovies} title="Trending Now" />
        </section>

        {/* Watchlist Section */}
        {watchlist.length > 0 && (
          <section className="pt-12">
            <MovieGrid movies={watchlist} title="Your Watchlist" />
          </section>
        )}

        {/* Categories / Genres */}
        <section className="py-12">
          <div className="flex flex-wrap gap-4 mb-8">
            {['Action', 'Sci-Fi', 'Thriller', 'Drama', 'Horror', 'Documentary'].map(genre => (
              <button key={genre} className="px-6 py-2 rounded-full border border-white/10 hover:border-primary hover:bg-primary/10 transition text-sm font-bold uppercase tracking-widest italic">
                {genre}
              </button>
            ))}
          </div>
        </section>

        {/* Recently Added */}
        <section>
          <MovieGrid movies={recentAdditions} title="New Arrivals" />
        </section>

        {/* Subscription Promo */}
        <section className="py-20">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-accent p-12 text-center group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">
                UNLOCK UNLIMITED <br /> <span className="text-black">ENTERTAINMENT</span>
              </h2>
              <p className="text-lg text-white/80 mb-10 font-medium">
                Subscribe to Premium for ad-free streaming, 4K resolution, and early access to original content.
              </p>
              <a
                href="/subscriptions"
                className="inline-block bg-white text-black px-12 py-4 rounded-md font-black uppercase tracking-widest hover:bg-black hover:text-white transition transform hover:scale-105"
              >
                View Plans
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
