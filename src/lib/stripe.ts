import { supabase } from './supabase';
import { STRIPE_PRODUCTS } from '../config/stripe';

export async function createCheckoutSession(priceId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');

    // Determine the mode based on the priceId
    const product = Object.values(STRIPE_PRODUCTS).find(p => p.priceId === priceId);
    if (!product) throw new Error('Invalid price ID');

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ priceId, mode: product.mode }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    return data.url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}