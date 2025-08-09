import { supabase } from './supabase';

// Database types
export interface UserCredits {
  id: string;
  user_id: string; // UUID from auth.users
  credits: number; // Διαθέσιμα credits
  monthly_credits: number; // Μηνιαία βάση συνδρομής
  extra_credits: number; // Extra credits που πλήρωσε
  created_at: string;
  updated_at: string;
}

// Get current authenticated user
const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('User not authenticated');
  return user;
};

// Credits API functions
export const getUserCredits = async (): Promise<UserCredits | null> => {
  try {
    const user = await getCurrentUser();
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - create default credits
        return await createDefaultUserCredits();
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

export const createDefaultUserCredits = async (): Promise<UserCredits> => {
  try {
    const user = await getCurrentUser();
    
    const defaultCredits = {
      user_id: user.id,
      credits: 100, // Default free credits
      monthly_credits: 0,
      extra_credits: 0
    };

    const { data, error } = await supabase
      .from('user_credits')
      .insert(defaultCredits)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating default user credits:', error);
    throw error;
  }
};

export const updateUserCredits = async (creditsUsed: number): Promise<UserCredits> => {
  try {
    const user = await getCurrentUser();
    
    // First get current credits
    const currentCredits = await getUserCredits();
    if (!currentCredits) {
      throw new Error('User credits not found');
    }

    // Calculate new credits (subtract used credits)
    const newCredits = Math.max(0, currentCredits.credits - creditsUsed);

    const { data, error } = await supabase
      .from('user_credits')
      .update({ 
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

export const addExtraCredits = async (extraCredits: number): Promise<UserCredits> => {
  try {
    const user = await getCurrentUser();
    
    const currentCredits = await getUserCredits();
    if (!currentCredits) {
      throw new Error('User credits not found');
    }

    const { data, error } = await supabase
      .from('user_credits')
      .update({ 
        credits: currentCredits.credits + extraCredits,
        extra_credits: currentCredits.extra_credits + extraCredits,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding extra credits:', error);
    throw error;
  }
};

// Check if user has enough credits for an operation
export const checkCreditsAvailable = async (requiredCredits: number): Promise<boolean> => {
  try {
    const userCredits = await getUserCredits();
    return userCredits ? userCredits.credits >= requiredCredits : false;
  } catch (error) {
    console.error('Error checking credits availability:', error);
    return false;
  }
};

// Deduct credits for an operation
export const deductCredits = async (
  operation: string, 
  creditsUsed: number
): Promise<UserCredits> => {
  try {
    const hasEnoughCredits = await checkCreditsAvailable(creditsUsed);
    if (!hasEnoughCredits) {
      throw new Error(`Insufficient credits. Required: ${creditsUsed}`);
    }

    console.log(`Deducting ${creditsUsed} credits for operation: ${operation}`);
    return await updateUserCredits(creditsUsed);
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
};