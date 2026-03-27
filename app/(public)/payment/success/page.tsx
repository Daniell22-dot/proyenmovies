// app/payment/success/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { CheckCircle, Download, Play, Share2 } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [accessToken, setAccessToken] = useState('')
  const [mediaTitle, setMediaTitle] = useState('')

  useEffect(() => {
    if (sessionId) {
      // In a real app, you would fetch the purchase details from your API
      const token = `acc_${Math.random().toString(36).substring(2, 15)}`
      setAccessToken(token)
      localStorage.setItem(`access_token_${sessionId}`, token)
      
      // Set a demo media title
      setMediaTitle('Summer Vibes - Your Purchase')
    }
  }, [sessionId])

  const copyAccessToken = () => {
    navigator.clipboard.writeText(accessToken)
    alert('Access token copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600">
              Thank you for your purchase. Your content is now ready to access.
            </p>
          </div>

          {/* Purchase Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Your Purchase Details</h2>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Item</p>
                  <p className="text-gray-600">{mediaTitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Amount Paid</p>
                  <p className="text-green-600 font-bold">$1.99</p>
                </div>
              </div>

              {/* Access Token */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Access Token (Save this)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm break-all">
                    {accessToken || 'Loading...'}
                  </div>
                  <button
                    onClick={copyAccessToken}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This token gives you 24-hour access. Keep it safe!
                </p>
              </div>

              {/* Access Instructions */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">How to access your content:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>Return to the media page</li>
                  <li>The player will automatically detect your access</li>
                  <li>Enjoy your content for the next 24 hours</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Link
              href="/browse"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-md transition-shadow"
            >
              <Play className="w-8 h-8 text-purple-600 mb-3" />
              <span className="font-medium">Browse More</span>
            </Link>
            
            <button
              onClick={() => router.push('/')}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-md transition-shadow"
            >
              <Download className="w-8 h-8 text-blue-600 mb-3" />
              <span className="font-medium">Go Home</span>
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied! Share with friends.')
              }}
              className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow hover:shadow-md transition-shadow"
            >
              <Share2 className="w-8 h-8 text-green-600 mb-3" />
              <span className="font-medium">Share</span>
            </button>
          </div>

          {/* Support Info */}
          <div className="text-center text-gray-500 text-sm">
            <p>Need help? Contact support at support@artistmedia.com</p>
            <p className="mt-2">Your receipt has been sent to your email.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}