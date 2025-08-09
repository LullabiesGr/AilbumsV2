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
      .single();
    
    if (creditsError) {
      if (creditsError.code === 'PGRST116') {
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
      } else {
        console.error('❌ Failed to get user credits:', creditsError);
        throw new Error('Failed to get user credits');
      }
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