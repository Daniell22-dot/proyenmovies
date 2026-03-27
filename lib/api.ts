import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// Generic API call function with axios
export async function fetchFromAPI(endpoint: string, options = {}) {
  try {
    const response = await api.get(endpoint, options)
    return response.data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Post request helper
export async function postToAPI(endpoint: string, data: any) {
  try {
    const response = await api.post(endpoint, data)
    return response.data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Dashboard specific calls
export async function getDashboardStats() {
  return fetchFromAPI('/dashboard/stats')
}

// Media calls
export async function getPublishedMedia(limit: number | null = null) {
  let url = '/media'
  if (limit) {
    url += `?limit=${limit}`
  }
  return fetchFromAPI(url)
}

export async function getMediaById(id: string) {
  return fetchFromAPI(`/media/${id}`)
}

export async function getAllPublishedMedia() {
  return fetchFromAPI('/media')
}