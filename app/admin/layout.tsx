// app/(admin)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, LogOut, LayoutDashboard, Film, Upload, Globe, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true) // Mock auth

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Media', href: '/admin/media', icon: <Film className="w-4 h-4" /> },
    { label: 'Upload', href: '/admin/upload', icon: <Upload className="w-4 h-4" /> },
    { label: 'Live', href: '/admin/live', icon: <Globe className="w-4 h-4" /> },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Sidebar / Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 group">
            <span className="text-xl font-black tracking-tighter uppercase italic">
              PROYEN<span className="text-primary">MOVIES</span>
              <span className="ml-2 text-[10px] text-white/40 border-l border-white/20 pl-2">ADMIN</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 text-xs font-black uppercase tracking-widest transition ${pathname === item.href ? 'text-primary' : 'text-white/60 hover:text-white'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/" target="_blank" className="text-xs font-bold text-white/40 hover:text-white transition uppercase tracking-widest border border-white/10 px-4 py-1.5 rounded-full">
              Preview Store
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-primary transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 min-h-screen">
        <div className="container mx-auto px-6">
          {children}
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="py-12 border-t border-white/5 opacity-40">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
            ProyenMovies Admin Control Panel • Secure Session
          </p>
        </div>
      </footer>
    </div>
  )
}
