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
  user_email: string;
  credits: number; // Διαθέσιμα credits
  monthly_credits: number; // Μηνιαία βάση συνδρομής
  extra_credits: number; // Extra credits που πλήρωσε
  created_at: string;
  updated_at: string;
}

// Credits API functions
export const getUserCredits = async (userEmail: string): Promise<UserCredits | null> => {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_email', userEmail)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - create default credits
        return await createDefaultUserCredits(userEmail);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
};

export const createDefaultUserCredits = async (userEmail: string): Promise<UserCredits> => {
  try {
    const defaultCredits = {
      user_email: userEmail,
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

export const updateUserCredits = async (
  userEmail: string, 
  creditsUsed: number
): Promise<UserCredits> => {
  try {
    // First get current credits
    const currentCredits = await getUserCredits(userEmail);
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
      .eq('user_email', userEmail)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

export const addExtraCredits = async (
  userEmail: string, 
  extraCredits: number
): Promise<UserCredits> => {
  try {
    const currentCredits = await getUserCredits(userEmail);
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
      .eq('user_email', userEmail)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding extra credits:', error);
    throw error;
  }
};