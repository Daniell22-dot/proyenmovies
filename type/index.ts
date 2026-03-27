// types/index.ts - CORRECT VERSION
export interface MediaItem {
  id: string
  title: string
  description: string | null
  media_type: 'movie' | 'video' | 'tv' | 'image' | 'content'
  price: number
  currency: string
  is_free: boolean
  preview_url: string | null
  preview_duration: number | null
  access_type: 'free' | 'paid' | 'subscription'
  storage_bucket: string
  file_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  artist: string | null
  duration_seconds: number | null
  thumbnail_url: string | null
  tags: string[]
  play_count: number
  purchase_count: number
  revenue: number
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Purchase {
  id: string
  session_id: string | null
  device_fingerprint: string | null
  ip_address: string | null
  user_agent: string | null
  media_id: string
  amount_paid: number
  currency: string
  payment_provider: string
  payment_id: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  access_token: string
  access_token_expires_at: string
  max_plays: number
  customer_email: string | null
  customer_phone: string | null
  created_at: string
  updated_at: string
}

export interface AccessLog {
  id: string
  purchase_id: string
  media_id: string
  access_token: string
  action: 'play' | 'download' | 'preview'
  ip_address: string | null
  user_agent: string | null
  accessed_at: string
}

export interface DailySale {
  date: string
  revenue: number
}

export interface TopMediaItem {
  title: string
  purchase_count: number
  revenue: number
}