// app/(admin)/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [demoPassword, setDemoPassword] = useState('admin123') // Default demo password

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const authenticated = localStorage.getItem('admin_authenticated')
    
    if (token && authenticated === 'true') {
      // Check if token is still valid (less than 24 hours old)
      const tokenTime = parseInt(token)
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (Date.now() - tokenTime < twentyFourHours) {
        router.push('/admin/dashboard')
      } else {
        // Token expired, clear it
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_authenticated')
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Get admin password from environment or use default
      const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'
      
      // Validate password
      if (!password.trim()) {
        throw new Error('Please enter a password')
      }

      if (password === adminPassword) {
        // Set authentication tokens
        localStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_token', Date.now().toString())
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect to dashboard
        router.push('/admin/dashboard')
      } else {
        throw new Error('Invalid admin password')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Artist Admin Panel</h1>
          <p className="text-gray-400 mt-2">Secure Content Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Admin Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 text-red-200">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Login to Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              This panel is for authorized personnel only. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Demo Note */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">For testing purposes:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-gray-900 px-3 py-1 rounded text-gray-300 font-mono text-sm">
                {demoPassword}
              </code>
              <button
                onClick={() => {
                  setPassword(demoPassword)
                  setError('')
                }}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Use this password
              </button>
            </div>
          </div>
          
          <p className="text-xs text-gray-600 mt-4">
            Set your own password in <code className="bg-gray-900 px-1 py-0.5 rounded">.env.local</code> as <code className="bg-gray-900 px-1 py-0.5 rounded">NEXT_PUBLIC_ADMIN_PASSWORD</code>
          </p>
        </div>
      </div>
    </div>
  )
}