// app/payment/cancelled/page.tsx
'use client'

import { XCircle, ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PaymentCancelledPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your payment was not completed. No charges have been made to your account.
          </p>

          {/* Reasons Card */}
          <div className="bg-white rounded-xl shadow p-6 mb-8 text-left">
            <h2 className="font-bold text-lg mb-4">Common reasons:</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span>You cancelled the payment process</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span>Payment authorization failed</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span>Session timed out</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <span>Technical issues with the payment processor</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Try Again
            </button>
            
            <Link
              href="/browse"
              className="w-full inline-block bg-white border border-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Browse Other Content
            </Link>
            
            <Link
              href="/"
              className="w-full inline-block bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Return Home
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Need help with your purchase?</span>
            </div>
            <p className="text-sm text-gray-500">
              Contact support at <span className="text-purple-600">support@artistmedia.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}