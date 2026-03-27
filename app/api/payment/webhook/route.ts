// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createPurchase } from '@/lib/database'

export async function POST(request: NextRequest) {
  // @ts-ignore - Ignore exact string literal type constraint from newer Stripe SDK
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
  })

  const sig = request.headers.get('stripe-signature')!
  const body = await request.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    try {
      // Create purchase record in database using new MySQL backend
      await createPurchase({
        media_id: session.metadata!.media_id,
        amount_paid: session.amount_total! / 100,
        payment_provider: 'stripe',
        payment_id: session.id,
        customer_email: session.customer_email || undefined
      })

      console.log(`Purchase recorded for session: ${session.id}`)
      
    } catch (error) {
      console.error('Webhook processing error:', error)
      return NextResponse.json(
        { error: 'Failed to record purchase' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}