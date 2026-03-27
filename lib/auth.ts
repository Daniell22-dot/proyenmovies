// lib/auth.ts
export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('admin_token')
  const authenticated = localStorage.getItem('admin_authenticated')
  
  if (!token || authenticated !== 'true') return false
  
  // Check if token is less than 24 hours old
  const tokenTime = parseInt(token)
  const twentyFourHours = 24 * 60 * 60 * 1000
  
  return Date.now() - tokenTime < twentyFourHours
}

export const loginAdmin = (password: string): boolean => {
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
  
  if (password === adminPassword) {
    localStorage.setItem('admin_authenticated', 'true')
    localStorage.setItem('admin_token', Date.now().toString())
    return true
  }
  
  return false
}

export const logoutAdmin = (): void => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_authenticated')
}