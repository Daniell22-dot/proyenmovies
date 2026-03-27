// components/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Film, Play, User, Search } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 group">
            <div className="bg-primary p-1.5 rounded-sm group-hover:bg-accent transition-colors">
              <Play className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
              PROYEN<span className="text-primary group-hover:text-accent transition-colors">MOVIES</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition">Home</Link>
            <Link href="/browse?type=movie" className="text-sm font-medium hover:text-primary transition">Movies</Link>
            <Link href="/browse?type=tv" className="text-sm font-medium hover:text-primary transition">TV Shows</Link>
            <Link href="/subscriptions" className="text-sm font-medium hover:text-primary transition">Plans</Link>

            <div className="flex items-center space-x-4 border-l border-white/20 pl-6">
              <button className="text-white hover:text-primary transition">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/login" className="text-sm font-semibold border border-white/30 px-4 py-1.5 rounded hover:bg-white hover:text-black transition">
                Sign In
              </Link>
              <Link href="/register" className="text-sm font-semibold bg-primary text-white px-4 py-1.5 rounded hover:bg-accent transition">
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-6 mt-4 border-t border-white/10 animate-fade-in bg-black">
            <div className="flex flex-col space-y-5 px-2">
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-primary">Home</Link>
              <Link href="/browse?type=movie" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-primary">Movies</Link>
              <Link href="/browse?type=tv" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-primary">TV Shows</Link>
              <Link href="/subscriptions" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium hover:text-primary">Plans</Link>
              <div className="flex flex-col space-y-3 pt-4 border-t border-white/10">
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-center py-2 border border-white/30 rounded">Sign In</Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-center py-2 bg-primary rounded">Sign Up</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
