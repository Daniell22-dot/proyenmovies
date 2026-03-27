// app/api/payment/intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getMediaItemById } from '@/lib/database'

export async function POST(request: NextRequest) {
  // @ts-ignore - Ignore exact string literal type constraint from newer Stripe SDK
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
  })

  try {
    const { mediaId } = await request.json()
    
    // Get media details from new backend
    const media = await getMediaItemById(mediaId)
    
    if (!media) throw new Error('Media not found')

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              // using artist or fallback to director if updated
              name: `${media.artist || 'Director'} - ${media.title}`,
            },
            unit_amount: Math.round(media.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/cancelled`,
      metadata: {
        media_id: mediaId,
      }
    })

    return NextResponse.json({ 
      payment_url: session.url,
      session_id: session.id 
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}