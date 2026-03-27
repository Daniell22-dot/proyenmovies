// app/(admin)/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  PlayCircle,
  Video,
  Users,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  Zap,
  Activity
} from 'lucide-react'

interface DashboardStats {
  totalRevenue: number
  activeSubscriptions: number
  liveViewers: number
  totalMedia: number
  topMovies: Array<{ title: string; views: number; rating: number }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 24500.80,
    activeSubscriptions: 1240,
    liveViewers: 85,
    totalMedia: 42,
    topMovies: [
      { title: 'The Cyber Recon', views: 12500, rating: 8.4 },
      { title: 'Neon Nights', views: 9800, rating: 7.9 },
      { title: 'Void Runner', views: 8200, rating: 9.1 }
    ]
  })

  const [users, setUsers] = useState([
    { id: '1', username: 'alex_cyber', email: 'alex@example.com', status: 'active', sub: 'Premium' },
    { id: '2', username: 'neon_rider', email: 'rider@example.com', status: 'banned', sub: 'None' },
    { id: '3', username: 'void_walker', email: 'void@example.com', status: 'active', sub: 'VIP' }
  ])

  const [loading, setLoading] = useState(false)

  const toggleBan = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'banned' : 'active' } : u))
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic border-l-4 border-primary pl-4">
            COMMAND <span className="text-primary">CENTER</span>
          </h1>
          <p className="text-white/40 mt-2 font-medium">Platform overview and viewer regulation</p>
        </div>

        <div className="flex items-center gap-4 mt-6 md:mt-0">
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded hover:bg-accent transition transform hover:scale-105">
            <Video className="w-4 h-4" />
            Go Live
          </button>
          <button className="p-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition">
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Revenue</p>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-black italic tracking-tighter">${stats.totalRevenue.toLocaleString()}</p>
          <div className="flex items-center mt-4 text-[10px] font-bold text-green-500 uppercase">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>+12.5% this month</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Subscriptions</p>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-black italic tracking-tighter">{stats.activeSubscriptions.toLocaleString()}</p>
          <div className="flex items-center mt-4 text-[10px] font-bold text-blue-500 uppercase">
            <Activity className="w-3 h-3 mr-1" />
            <span>850 Premium • 390 VIP</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Live Viewers</p>
            <div className="p-2 bg-red-500/10 rounded-lg animate-pulse">
              <Activity className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-black italic tracking-tighter">{stats.liveViewers}</p>
          <div className="flex items-center mt-4 text-[10px] font-bold text-red-500 uppercase">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2" />
            <span>Live Now</span>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Content Items</p>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <PlayCircle className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-3xl font-black italic tracking-tighter">{stats.totalMedia}</p>
          <div className="flex items-center mt-4 text-[10px] font-bold text-yellow-500 uppercase">
            <BarChart3 className="w-3 h-3 mr-1" />
            <span>32 Movies • 10 Series</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Viewer Regulation Section */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Viewer Regulation</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search viewers..."
                className="bg-white/5 border border-white/10 rounded px-3 py-1 text-xs focus:border-primary outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/5">
                  <th className="p-6">User</th>
                  <th className="p-6">Subscription</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{user.username}</p>
                          <p className="text-[10px] text-white/40">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${user.sub === 'VIP' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          user.sub === 'Premium' ? 'bg-primary/10 text-primary border border-primary/20' :
                            'bg-white/10 text-white/40'
                        }`}>
                        {user.sub}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-2">
                        {user.status === 'active' ? (
                          <div className="flex items-center text-green-500 text-[10px] font-black uppercase">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Active
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500 text-[10px] font-black uppercase">
                            <ShieldAlert className="w-3 h-3 mr-1" />
                            Banned
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => toggleBan(user.id)}
                        className={`p-2 rounded hover:bg-white/10 transition ${user.status === 'active' ? 'text-red-500' : 'text-green-500'}`}
                        title={user.status === 'active' ? 'Ban User' : 'Unban User'}
                      >
                        {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Movies Sidebar */}
        <div className="glass rounded-2xl border border-white/5 p-6">
          <h2 className="text-xl font-black uppercase italic tracking-tighter mb-8">Top Performing</h2>
          <div className="space-y-6">
            {stats.topMovies.map((movie, idx) => (
              <div key={idx} className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-black italic text-primary group-hover:scale-110 transition">{idx + 1}</div>
                  <div>
                    <h4 className="text-sm font-bold uppercase truncate max-w-[120px]">{movie.title}</h4>
                    <p className="text-[10px] text-white/40 font-bold tracking-widest">{movie.views.toLocaleString()} VIEWS</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-yellow-500 italic">{movie.rating}</div>
                  <TrendingUp className="w-3 h-3 text-green-500 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 border border-white/10 rounded-md text-xs font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
