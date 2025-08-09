import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for user_credits table
export interface UserCredits {
  id: string;
  user_id: string;
  email: string;
  credits: number;
  monthly_credits: number;
  extra_credits: number;
  created_at: string;
  updated_at: string;
}

// Get user credits by email
export const getUserCredits = async (email: string): Promise<UserCredits | null> => {
  try {
    console.log('🔍 Fetching user credits for:', email);
    
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - user doesn't exist in credits table yet
        console.log('ℹ️ User not found in credits table:', email);
        return null;
      }
      console.error('❌ Error fetching user credits:', error);
      throw new Error(`Failed to fetch user credits: ${error.message}`);
    }

    console.log('✅ User credits fetched successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ getUserCredits error:', error);
    throw error;
  }
};

// Create initial user credits record
export const createUserCredits = async (email: string, userId: string): Promise<UserCredits> => {
  try {
    console.log('🆕 Creating user credits record for:', { email, userId });
    
    const newUserCredits = {
      user_id: userId,
      email: email,
      credits: 100, // Default starting credits
      monthly_credits: 0,
      extra_credits: 0
    };

    const { data, error } = await supabase
      .from('user_credits')
      .insert(newUserCredits)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user credits:', error);
      throw new Error(`Failed to create user credits: ${error.message}`);
    }

    console.log('✅ User credits created successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ createUserCredits error:', error);
    throw error;
  }
};

// Update user credits
export const updateUserCredits = async (
  email: string, 
  updates: Partial<Pick<UserCredits, 'credits' | 'monthly_credits' | 'extra_credits'>>
): Promise<UserCredits> => {
  try {
    console.log('🔄 Updating user credits for:', email, 'with:', updates);
    
    const { data, error } = await supabase
      .from('user_credits')
      .update(updates)
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating user credits:', error);
      throw new Error(`Failed to update user credits: ${error.message}`);
    }

    console.log('✅ User credits updated successfully:', data);
    return data;
  } catch (error: any) {
    console.error('❌ updateUserCredits error:', error);
    throw error;
  }
};

// Get or create user credits (helper function)
export const getOrCreateUserCredits = async (email: string, userId: string): Promise<UserCredits> => {
  try {
    // Try to get existing credits
    let userCredits = await getUserCredits(email);
    
    // If not found, create new record
    if (!userCredits) {
      userCredits = await createUserCredits(email, userId);
    }
    
    return userCredits;
  } catch (error: any) {
    console.error('❌ getOrCreateUserCredits error:', error);
    throw error;
  }
};