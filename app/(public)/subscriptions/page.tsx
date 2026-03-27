// app/(public)/subscriptions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Check, Zap, Crown, Play } from 'lucide-react'

// UI config mapping based on plan name
const planUIConfig: Record<string, any> = {
    'Free': {
        icon: <Play className="w-6 h-6" />,
        color: 'bg-white/5',
        buttonText: 'Get Started',
        featured: false,
        durationText: 'Forever'
    },
    'Premium': {
        icon: <Zap className="w-6 h-6 text-primary" />,
        color: 'bg-primary/10 border-primary/50',
        buttonText: 'Subscribe Now',
        featured: true,
        durationText: 'Monthly'
    },
    'VIP': {
        icon: <Crown className="w-6 h-6 text-yellow-500" />,
        color: 'bg-yellow-500/10 border-yellow-500/50',
        buttonText: 'Go VIP',
        featured: false,
        durationText: 'Monthly'
    }
}

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
                const res = await fetch(`${apiUrl}/subscriptions/plans`)
                const data = await res.json()
                if (data.success && data.data) {
                    const mappedPlans = data.data.map((p: any) => {
                        const uiConfig = planUIConfig[p.name] || {
                            icon: <Play className="w-6 h-6" />,
                            color: 'bg-white/5',
                            buttonText: 'Subscribe',
                            featured: false,
                            durationText: p.duration_days > 30 ? 'Yearly' : 'Monthly'
                        }

                        let parsedFeatures = p.features
                        if (typeof p.features === 'string') {
                            try { parsedFeatures = JSON.parse(p.features) } catch (e) { }
                        }

                        return {
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            duration: uiConfig.durationText,
                            icon: uiConfig.icon,
                            features: Array.isArray(parsedFeatures) ? parsedFeatures : [],
                            color: uiConfig.color,
                            featured: uiConfig.featured,
                            buttonText: uiConfig.buttonText
                        }
                    })
                    setPlans(mappedPlans)
                }
            } catch (error) {
                console.error("Failed to fetch plans", error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-white/60 font-bold uppercase tracking-widest">Loading Plans...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter italic">
                        CHOOSE YOUR <span className="text-primary">PLAN</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        Experience unlimited entertainment at your fingertips. Switch or cancel anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${plan.color} ${plan.featured ? 'border-primary ring-1 ring-primary/20' : 'border-white/10'}`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-black/40 rounded-xl">
                                    {plan.icon}
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">${Number(plan.price).toFixed(2)}</div>
                                    <div className="text-xs text-white/40 font-bold uppercase tracking-widest">{plan.duration}</div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8">
                                {plan.name}
                            </h3>

                            <div className="flex-grow space-y-4 mb-10">
                                {plan.features.map((feature: string) => (
                                    <div key={feature} className="flex items-start space-x-3 text-sm text-white/70">
                                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-4 rounded-md font-black uppercase tracking-widest transition ${plan.featured ? 'bg-primary text-white hover:bg-accent' : 'bg-white text-black hover:bg-white/90'}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Preview */}
                <div className="mt-32 text-center text-white/40">
                    <p className="text-sm font-bold uppercase tracking-[0.2em]">Secure Checkout • Instant Setup • Cancel Anytime</p>
                </div>
            </div>
        </div>
    )
}
