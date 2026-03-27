// components/MediaPlayer.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, DollarSign, Lock, Check, Volume2, VolumeX } from 'lucide-react'
import axios from 'axios'

interface MediaPlayerProps {
  mediaId: string
  mediaData: {
    title: string
    director: string
    price: number
    preview_url: string
    duration_seconds: number
    thumbnail_url: string
    media_type: 'movie' | 'tv'
  }
}

export default function MediaPlayer({ mediaId, mediaData }: MediaPlayerProps) {
  const [hasAccess, setHasAccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const token = localStorage.getItem(`access_token_${mediaId}`)
    if (token) {
      verifyAccess(token)
    }
  }, [mediaId])

  const verifyAccess = async (token: string) => {
    try {
      const response = await axios.post('/api/verify', {
        token,
        mediaId
      })
      if (response.data.access_granted) {
        setHasAccess(true)
      }
    } catch (error) {
      console.error('Failed to verify access')
    }
  }

  const handlePurchase = async () => {
    setIsPurchasing(true)
    try {
      const response = await axios.post('/api/payment/intent', {
        mediaId
      })
      
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      setIsPurchasing(false)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      if (!hasAccess) {
        // Play only first 30 seconds for preview
        audioRef.current.currentTime = 0
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause()
            setIsPlaying(false)
          }
        }, 30000)
      }
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <div className="w-64 h-64 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-purple-400 to-pink-400">
            {mediaData.thumbnail_url ? (
              <img 
                src={mediaData.thumbnail_url} 
                alt={mediaData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-16 h-16 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-2">{mediaData.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{mediaData.director}</p>
          
          {/* Player Controls */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                disabled={!mediaData.preview_url}
                className={`p-4 rounded-full ${
                  hasAccess ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-colors disabled:opacity-50`}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={mediaData.duration_seconds}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(mediaData.duration_seconds)}</span>
                </div>
              </div>
              
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {!hasAccess && mediaData.preview_url && (
              <div className="flex items-center gap-2 text-yellow-600 mb-4">
                <Lock className="w-4 h-4" />
                <span>Preview mode (30 seconds only)</span>
              </div>
            )}
          </div>

          {/* Purchase Section */}
          <div className="border-t border-gray-200 pt-6">
            {hasAccess ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                <span className="text-lg">You have access to this content</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-2xl font-bold flex items-center">
                      <DollarSign className="w-6 h-6 mr-1" />
                      {mediaData.price.toFixed(2)}
                    </div>
                    <p className="text-gray-500 text-sm">One-time purchase</p>
                  </div>
                  
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isPurchasing ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Full access to this track
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Play up to 10 times
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Access valid for 24 hours
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    No account required
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={mediaData.preview_url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  )
}