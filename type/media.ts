// types/media.ts
export interface Media {
  id: string;
  title: string;
  description?: string;
  media_type: 'movie' | 'tv' | 'video' | 'image' | 'content';
  price: number;
  currency?: string;
  is_free?: boolean;
  preview_url?: string;
  preview_duration?: number;
  access_type?: 'free' | 'paid' | 'subscription';
  storage_bucket?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  artist?: string;
  duration_seconds?: number;
  thumbnail_url?: string;
  tags?: any;
  play_count?: number;
  purchase_count?: number;
  revenue?: number;
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}