import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  logStep('Function started');

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    logStep('Stripe key verified');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    logStep('Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');
    logStep('User authenticated', { userId: user.id, email: user.email });

    const { bookingData, bookingId } = await req.json();
    logStep('Request data received', { bookingId, serviceType: bookingData.serviceType });

    if (!bookingData.selectedFare) {
      throw new Error('No fare selected');
    }

    // Calculate advance payment (20% of total fare)
    const totalFare = bookingData.selectedFare.price;
    const advancePayment = Math.ceil(totalFare * 0.2);
    
    logStep('Fare calculation', { totalFare, advancePayment });

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        phone: user.user_metadata?.phone_number || undefined,
      });
      customerId = customer.id;
      logStep('New Stripe customer created', { customerId });
    } else {
      logStep('Existing Stripe customer found', { customerId });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${bookingData.selectedFare.type} - ${bookingData.serviceType.charAt(0).toUpperCase() + bookingData.serviceType.slice(1)} Ride`,
              description: `From: ${bookingData.pickupLocation}${bookingData.dropoffLocation ? ` To: ${bookingData.dropoffLocation}` : ''}`,
              images: [], // You can add ride service images here
            },
            unit_amount: advancePayment * 100, // Convert to paise for INR
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/booking?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/booking?canceled=true`,
      metadata: {
        booking_id: bookingId,
        user_id: user.id,
        service_type: bookingData.serviceType,
        vehicle_type: bookingData.selectedFare.type,
        total_fare: totalFare.toString(),
        advance_payment: advancePayment.toString(),
      },
      payment_intent_data: {
        metadata: {
          booking_id: bookingId,
          user_id: user.id,
        },
      },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['IN'],
      },
    });

    logStep('Checkout session created', { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      url: session.url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in create-checkout-session', { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});