import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Plan configurations mapping Stripe price IDs to plan details
export const PLAN_CONFIGS = {
  'price_starter': {
    name: 'Starter',
    monthlyCredits: 75,
    features: ['Basic AI Analysis', 'Face Detection', 'Standard Support']
  },
  'price_pro': {
    name: 'Pro',
    monthlyCredits: 200,
    features: ['Advanced AI Features', 'Deep Analysis', 'Priority Support']
  },
  'price_studio': {
    name: 'Studio',
    monthlyCredits: 500,
    features: ['All Premium Features', 'Unlimited AI Analysis', 'Priority Support']
  }
}

// Get user's current subscription
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}

// Get user's plan details
export async function getUserPlan(userId: string) {
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return {
      name: 'Beta Free',
      monthlyCredits: 50,
      features: ['Basic Features', 'Limited AI Analysis']
    }
  }

  return PLAN_CONFIGS[subscription.price_id] || {
    name: 'Unknown',
    monthlyCredits: 0,
    features: []
  }
}

// Get plan features by price ID
export function getPlanFeatures(priceId: string) {
  return PLAN_CONFIGS[priceId]?.features || []
}

// Get plan name by price ID
export function getPlanName(priceId: string) {
  return PLAN_CONFIGS[priceId]?.name || 'Unknown Plan'
}

// Get user's current credits
export async function getUserCredits(userId: string) {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching credits:', error)
    return { monthly_credits: 0, extra_credits: 0 }
  }

  return data
}