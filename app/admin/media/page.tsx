// app/(admin)/media/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Music, Video, Image, Edit, Trash2, Eye, Play, DollarSign } from 'lucide-react'

interface MediaItem {
  id: string
  title: string
  artist: string
  price: number
  media_type: 'song' | 'video' | 'album' | 'image' | 'content'
  is_published: boolean
  purchase_count: number
  play_count: number
  created_at: string
}

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const fetchMedia = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/media`)

      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }

      const data = await response.json()
      if (data.success) {
        setMediaItems(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.artist.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && item.is_published) ||
      (filter === 'draft' && !item.is_published)
    return matchesSearch && matchesFilter
  })

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_published: !currentStatus })
      })

      if (response.ok) {
        fetchMedia() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating media:', error)
    }
  }

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/media/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchMedia() // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'song': return <Music className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      default: return <Music className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading media...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Media Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your {mediaItems.length} media items
          </p>
        </div>

        <a
          href="/admin/upload"
          className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          + Upload New Media
        </a>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search media by title or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'published', 'draft'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-3 rounded-lg font-medium ${filter === option
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No media found</h3>
          <p className="text-gray-600 mb-6">
            {search ? 'Try a different search term' : 'Start by uploading your first media item'}
          </p>
          <a
            href="/admin/upload"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700"
          >
            Upload Your First Media
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow border overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getMediaIcon(item.media_type)}
                    <span className="font-medium">{item.media_type}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 truncate">{item.title}</h3>
                <p className="text-gray-600">by {item.artist}</p>
              </div>

              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">${item.price.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{item.purchase_count}</div>
                    <div className="text-sm text-gray-500">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{item.play_count}</div>
                    <div className="text-sm text-gray-500">Plays</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePublishStatus(item.id, item.is_published)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  >
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => deleteMedia(item.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}