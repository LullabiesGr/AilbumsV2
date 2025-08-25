import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserCredits {
  id: string;
  user_id: string; // UID from authentication
  credits: number; // Διαθέσιμα credits
  monthly_credits: number; // Μηνιαία credits βάση συνδρομής
  extra_credits: number; // Extra credits που πλήρωσε
  next_reset: string; // Timestamp για επόμενο reset
  created_at: string;
  updated_at: string;
}

// Stripe Customer interface
export interface StripeCustomer {
  id: string;
  user_id: string;
  customer_id: string; // Stripe customer ID (cus_...)
  created_at: string;
  updated_at: string;
}

// Stripe Subscription interface
export interface StripeSubscription {
  id: string;
  customer_id: string; // Links to stripe_customers.customer_id
  subscription_id: string; // Stripe subscription ID
  price_id: string; // Stripe price ID
  status: string; // active, canceled, past_due, etc.
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

// User Plan interface
export interface UserPlan {
  plan_name: string;
  price_id: string;
  status: string;
  monthly_credits: number;
  current_period_end: string;
  is_active: boolean;
}

// Plan configurations
const PLAN_CONFIGS = {
  'price_1RzFPGCtJc6njTYQg5yLagWT': {
    name: 'Starter',
    monthly_credits: 100,
    features: ['Basic AI Analysis', 'Face Detection', 'Quality Scoring', 'Standard Support']
  },
  'price_1RzFTkCtJc6njTYQ4RuFQ7xz': {
    name: 'Pro', 
    monthly_credits: 200,
    features: ['Deep AI Analysis', 'Event-Specific Prompts', 'Advanced Features', 'Priority Support']
  },
  'price_1RzFV8CtJc6njTYQjpSGsjex': {
    name: 'Studio',
    monthly_credits: 500,
    features: ['Unlimited Analysis', 'All Pro Features', 'API Access', 'White-label Options']
  },
  'price_1REGOlCtJc6njTYQF3WdxPX6': {
    name: 'Extra Credits',
    monthly_credits: 50, // One-time purchase
    features: ['Additional Credits', 'No Expiration', 'Add to existing plan']
  }
};

// Get user subscription plan
export const getUserPlan = async (userEmail: string): Promise<UserPlan | null> => {
  try {
    console.log('🔍 Getting subscription plan for user:', userEmail);
    
    // First, get the user's ID from user_profiles table using email
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.warn('⚠️ User profile not found for email:', userEmail);
        return null;
      }
      console.error('❌ Failed to get user profile:', profileError);
      throw new Error('Failed to find user profile');
    }
    
    if (!userProfile) {
      console.warn('⚠️ User profile not found for email:', userEmail);
      return null;
    }
    
    console.log('✅ Found user_id:', userProfile.user_id, 'for email:', userEmail);
    
    // Get Stripe customer ID
    const { data: stripeCustomer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userProfile.user_id)
      .single();
    
    if (customerError) {
      if (customerError.code === 'PGRST116') {
        console.warn('⚠️ No Stripe customer found for user_id:', userProfile.user_id);
        return {
          plan_name: 'Free',
          price_id: '',
          status: 'inactive',
          monthly_credits: 50, // Default free credits
          current_period_end: '',
          is_active: false
        };
      }
      console.error('❌ Failed to get stripe customer:', customerError);
      throw new Error('Failed to get Stripe customer');
    }
    
    if (!stripeCustomer) {
      console.warn('⚠️ No Stripe customer found for user_id:', userProfile.user_id);
      return {
        plan_name: 'Free',
        price_id: '',
        status: 'inactive',
        monthly_credits: 50,
        current_period_end: '',
        is_active: false
      };
    }
    
    console.log('✅ Found Stripe customer_id:', stripeCustomer.customer_id);
    
    // Get active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('customer_id', stripeCustomer.customer_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (subscriptionError) {
      console.error('❌ Failed to get subscription:', subscriptionError);
      throw new Error('Failed to get subscription');
    }
    
    if (!subscription) {
      console.warn('⚠️ No active subscription found for customer:', stripeCustomer.customer_id);
      return {
        plan_name: 'Free',
        price_id: '',
        status: 'inactive',
        monthly_credits: 50,
        current_period_end: '',
        is_active: false
      };
    }
    
    console.log('✅ Found active subscription:', subscription);
    
    // Get plan configuration
    const planConfig = PLAN_CONFIGS[subscription.price_id as keyof typeof PLAN_CONFIGS];
    
    if (!planConfig) {
      console.warn('⚠️ Unknown price_id:', subscription.price_id);
      return {
        plan_name: 'Unknown Plan',
        price_id: subscription.price_id,
        status: subscription.status,
        monthly_credits: 100,
        current_period_end: subscription.current_period_end,
        is_active: subscription.status === 'active'
      };
    }
    
    const userPlan: UserPlan = {
      plan_name: planConfig.name,
      price_id: subscription.price_id,
      status: subscription.status,
      monthly_credits: planConfig.monthly_credits,
      current_period_end: subscription.current_period_end,
      is_active: subscription.status === 'active'
    };
    
    console.log('✅ User plan loaded:', userPlan);
    return userPlan;
    
  } catch (error: any) {
    console.error('❌ getUserPlan error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Get plan features by price_id
export const getPlanFeatures = (priceId: string): string[] => {
  const planConfig = PLAN_CONFIGS[priceId as keyof typeof PLAN_CONFIGS];
  return planConfig?.features || [];
};

// Get plan name by price_id
export const getPlanName = (priceId: string): string => {
  const planConfig = PLAN_CONFIGS[priceId as keyof typeof PLAN_CONFIGS];
  return planConfig?.name || 'Unknown Plan';
};

// Get user credits by email (find UID first, then get credits)
export const getUserCredits = async (userEmail: string): Promise<UserCredits | null> => {
  try {
    console.log('🔍 Getting credits for user email:', userEmail);
    
    // First, get the user's ID from user_profiles table using email
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (profileError) {
      console.error('❌ Failed to get user profile:', profileError);
      if (profileError.code === 'PGRST116') {
        console.warn('⚠️ User profile not found for email:', userEmail);
        return null;
      }
      throw new Error('Failed to find user profile');
    }
    
    if (!userProfile) {
      console.warn('⚠️ User profile not found for email:', userEmail);
      return null;
    }
    
    console.log('✅ Found user_id:', userProfile.user_id, 'for email:', userEmail);
    
    // Now get credits using the user_id from user_profiles
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userProfile.user_id)
      .maybeSingle();
    
    if (creditsError) {
      console.error('❌ Failed to get user credits:', creditsError);
      throw new Error('Failed to get user credits');
    }
    
    if (!credits) {
      // No credits record found - create default one  
      console.log('📝 Creating default credits record for user_id:', userProfile.user_id);
      
      const defaultCredits: Partial<UserCredits> = {
        user_id: userProfile.user_id,
        credits: 100, // Default starting credits
        monthly_credits: 100,
        extra_credits: 0,
        next_reset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };
      
      const { data: newCredits, error: createError } = await supabase
        .from('user_credits')
        .insert(defaultCredits)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create default credits:', createError);
        throw new Error('Failed to create user credits');
      }
      
      console.log('✅ Created default credits:', newCredits);
      return newCredits;
    }
    
    console.log('✅ User credits loaded:', credits);
    return credits;
    
  } catch (error: any) {
    console.error('❌ getUserCredits error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Update user credits (deduct credits for operations)
export const updateUserCredits = async (userEmail: string, creditsToDeduct: number): Promise<UserCredits> => {
  try {
    console.log('💳 Updating credits for user:', userEmail, 'deducting:', creditsToDeduct);
    
    // Get current credits first
    const currentCredits = await getUserCredits(userEmail);
    if (!currentCredits) {
      throw new Error('User credits not found');
    }
    
    // Calculate new credits
    const newCreditsAmount = Math.max(0, currentCredits.credits - creditsToDeduct);
    
    console.log('💰 Credits calculation:', {
      current: currentCredits.credits,
      deducting: creditsToDeduct,
      newAmount: newCreditsAmount
    });
    
    // Update credits in database
    const { data: updatedCredits, error } = await supabase
      .from('user_credits')
      .update({ 
        credits: newCreditsAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', currentCredits.user_id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to update credits:', error);
      throw new Error('Failed to update credits');
    }
    
    console.log('✅ Credits updated successfully:', updatedCredits);
    return updatedCredits;
    
  } catch (error: any) {
    console.error('❌ updateUserCredits error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Add extra credits (for purchases)
export const addExtraCredits = async (userEmail: string, extraCredits: number): Promise<UserCredits> => {
  try {
    console.log('💎 Adding extra credits for user:', userEmail, 'amount:', extraCredits);
    
    // Get current credits first
    const currentCredits = await getUserCredits(userEmail);
    if (!currentCredits) {
      throw new Error('User credits not found');
    }
    
    // Add to both total credits and extra_credits tracking
    const newCreditsAmount = currentCredits.credits + extraCredits;
    const newExtraCredits = currentCredits.extra_credits + extraCredits;
    
    // Update credits in database
    const { data: updatedCredits, error } = await supabase
      .from('user_credits')
      .update({ 
        credits: newCreditsAmount,
        extra_credits: newExtraCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', currentCredits.user_id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Failed to add extra credits:', error);
      throw new Error('Failed to add extra credits');
    }
    
    console.log('✅ Extra credits added successfully:', updatedCredits);
    return updatedCredits;
    
  } catch (error: any) {
    console.error('❌ addExtraCredits error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};

// Get user's current subscription
export const getUserSubscription = async (userEmail: string) => {
  try {
    console.log('🔍 Getting subscription for user:', userEmail);
    
    // First, get the user's ID from user_profiles table using email
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', userEmail)
      .single();
    
    if (profileError) {
      console.error('❌ Failed to get user profile:', profileError);
      throw new Error('Failed to find user profile');
    }
    
    if (!userProfile) {
      console.warn('⚠️ User profile not found for email:', userEmail);
      return null;
    }
    
    // Get Stripe customer ID
    const { data: stripeCustomer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userProfile.user_id)
      .maybeSingle();
    
    if (customerError) {
      console.error('❌ Failed to get stripe customer:', customerError);
      throw new Error('Failed to get Stripe customer');
    }
    
    if (!stripeCustomer) {
      console.warn('⚠️ No Stripe customer found for user_id:', userProfile.user_id);
      return null;
    }
    
    // Get subscription data
    const { data: subscription, error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('*')
      .eq('customer_id', stripeCustomer.customer_id)
      .order('created_at', { ascending: false })
      .maybeSingle();
    
    if (subscriptionError) {
      console.error('❌ Failed to get subscription:', subscriptionError);
      throw new Error('Failed to get subscription');
    }
    
    return subscription;
  } catch (error: any) {
    console.error('❌ getUserSubscription error:', error);
    throw error instanceof Error ? error : new Error(error.toString());
  }
};