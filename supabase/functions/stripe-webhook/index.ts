import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? 'whsec_H3I7nL9WuvCViDcflG00l2vZkyLt90aX';
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (err: any) {
      console.error('Signature verification failed:', err.message);
      return new Response(`Webhook error: ${err.message}`, { status: 400 });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};
  
  if (!stripeData || !('customer' in stripeData)) {
    return;
  }

  const customerId = stripeData.customer as string;
  const { mode, payment_status } = stripeData as any;

  // Get user_id from stripe_customers table
  const { data: customerRecord, error: lookupError } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();

  if (lookupError || !customerRecord?.user_id) {
    console.warn(`No user_id found for customer: ${customerId}`);
    return;
  }

  const userId = customerRecord.user_id;

  if (event.type === 'checkout.session.completed') {
    if (mode === 'payment' && payment_status === 'paid') {
      // Handle one-time payment (extra credits)
      const {
        id: checkout_session_id,
        payment_intent,
        amount_subtotal,
        amount_total,
        currency,
      } = stripeData as Stripe.Checkout.Session;

      // Insert order record
      await supabase.from('stripe_orders').insert({
        checkout_session_id,
        payment_intent_id: payment_intent,
        customer_id: customerId,
        amount_subtotal,
        amount_total,
        currency,
        payment_status,
        status: 'completed',
      });

      // Add 50 extra credits directly to user_credits table
      await supabase
        .from('user_credits')
        .update({
          credits: supabase.raw('credits + 50'),
          extra_credits: supabase.raw('extra_credits + 50'),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      console.log(`✅ Added 50 credits to user ${userId}`);
    }

    if (mode === 'subscription') {
      await syncCustomerFromStripe(customerId);
    }
  }
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          status: 'not_started' as any,
        },
        {
          onConflict: 'customer_id',
        },
      );
      return;
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;

    // Update subscription record
    await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: priceId,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        status: subscription.status as any,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
      },
      {
        onConflict: 'customer_id',
      },
    );

    // Get user_id from stripe_customers table
    const { data: customerRecord, error: lookupError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    if (lookupError || !customerRecord?.user_id) {
      return;
    }

    const userId = customerRecord.user_id;

    // Credit mapping based on price_id
    const creditMapping: Record<string, number> = {
      'price_1RFMJNCtJc6njTYQJUh6T8bQ': 75,  // Starter
      'price_1RFMKaCtJc6njTYQvFfgEt3N': 200, // Pro
      'price_1RFMLjCtJc6njTYQdhReQy8b': 500, // Studio
    };

    const monthlyCredits = creditMapping[priceId] ?? 10;

    // Update user credits with new monthly allocation
    await supabase
      .from('user_credits')
      .update({
        monthly_credits: monthlyCredits,
        next_reset: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    console.info(`✅ Synced subscription and credits for user: ${userId}`);
  } catch (error) {
    console.error(`❌ syncCustomerFromStripe failed for ${customerId}:`, error);
  }
}