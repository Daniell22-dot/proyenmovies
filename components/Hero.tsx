// components/Hero.tsx
'use client'

import { Play, Info, Calendar, Clock, Star } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function Hero() {
  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image / Video */}
      <div className="absolute inset-0">
        <img
          src="/movie_banner_background.png"
          alt="Featured Movie"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 z-10 pt-20">
        <div className="max-w-2xl animate-fade-in">
          <div className="flex items-center space-x-3 text-sm font-bold text-primary uppercase tracking-widest mb-4">
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">Featured</span>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current mr-1" />
              <span>8.9 rating</span>
            </div>
            <span className="text-white/60">2h 15m</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
            GHOST IN THE <br />
            <span className="text-primary italic">MACHINE</span>
          </h1>

          <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-xl">
            In a world where consciousness can be digitized, a detective must track down a ghost that
            threatens to unzip the fabric of reality itself. Experience the future of cinema.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/watch/featured"
              className="flex items-center justify-center gap-3 bg-primary text-white px-10 py-4 rounded-md font-bold hover:bg-accent transition transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              WATCH NOW
            </Link>

            <button
              className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-md font-bold hover:bg-white/20 transition"
            >
              <Info className="w-5 h-5" />
              MORE INFO
            </button>
          </div>

          <div className="flex items-center space-x-6 mt-12 text-white/40">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">RELEASED: 2026</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">STREAMING NOW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
