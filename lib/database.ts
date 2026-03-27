// lib/database.ts - NEW VERSION FOR MYSQL BACKEND
// This connects to your Express/MySQL backend instead of Supabase

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface MediaItem {
  id: string
  title: string
  description: string | null
  media_type: 'song' | 'video' | 'album' | 'image' | 'content'
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

interface MediaFilters {
  type?: string
  search?: string
  limit?: number
  offset?: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data as T;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Get all media items with optional filters
export async function getMediaItems(filters: MediaFilters = {}): Promise<MediaItem[]> {
  const params = new URLSearchParams();
  
  if (filters.type) params.append('type', filters.type);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const queryString = params.toString();
  const endpoint = `/media${queryString ? `?${queryString}` : ''}`;

  return apiCall<MediaItem[]>(endpoint);
}

// Get single media item by ID
export async function getMediaItemById(id: string): Promise<MediaItem> {
  return apiCall<MediaItem>(`/media/${id}`);
}

// Get preview URL for a media item
export async function getPreviewUrl(id: string): Promise<string> {
  const result = await apiCall<{ preview_url: string }>(`/media/preview/${id}`);
  return result.preview_url;
}

// Create a purchase
export async function createPurchase(purchaseData: {
  media_id: string
  amount_paid: number
  payment_provider: string
  payment_id: string
  customer_email?: string
  customer_phone?: string
}): Promise<Purchase> {
  return apiCall<Purchase>('/purchases/create', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  });
}

// Verify access token
export async function verifyAccessToken(
  accessToken: string,
  mediaId: string
): Promise<{
  access_granted: boolean
  reason?: string
  remaining_plays?: number
}> {
  return apiCall('/purchases/verify', {
    method: 'POST',
    body: JSON.stringify({
      access_token: accessToken,
      media_id: mediaId,
    }),
  });
}

// Get purchase by ID
export async function getPurchaseById(id: string): Promise<Purchase> {
  return apiCall<Purchase>(`/purchases/${id}`);
}

// Admin functions (add authentication headers when implementing auth)

export async function createMediaItem(mediaData: Partial<MediaItem>): Promise<MediaItem> {
  return apiCall<MediaItem>('/media', {
    method: 'POST',
    body: JSON.stringify(mediaData),
  });
}

export async function updateMediaItem(
  id: string,
  updates: Partial<MediaItem>
): Promise<{ message: string }> {
  return apiCall(`/media/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteMediaItem(id: string): Promise<{ message: string }> {
  return apiCall(`/media/${id}`, {
    method: 'DELETE',
  });
}

// Upload file
export async function uploadFile(file: File): Promise<{
  file_path: string
  file_name: string
  file_size: number
  mime_type: string
}> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header, let browser set it with boundary
  });

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed');
  }

  return result;
}