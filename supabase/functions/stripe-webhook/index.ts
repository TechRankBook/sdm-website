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
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } }
);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  logStep('Webhook received');

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep('Webhook signature verified', { type: event.type, id: event.id });
    } catch (err) {
      logStep('Webhook signature verification failed', { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        logStep('Unhandled event type', { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in stripe-webhook', { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  logStep('Processing checkout.session.completed', { sessionId: session.id });
  
  try {
    // Extract booking ID from metadata
    const bookingId = session.metadata?.booking_id;
    if (!bookingId) {
      logStep('No booking_id found in session metadata');
      return;
    }

    // Get the payment method from metadata or determine from payment intent
    const paymentMethodType = session.metadata?.payment_method || 'card';
    
    // Update booking status to confirmed and payment status to paid
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'accepted',
        payment_status: 'paid',
        payment_method: paymentMethodType,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (bookingError) {
      throw new Error(`Failed to update booking: ${bookingError.message}`);
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: session.metadata?.user_id,
        amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        currency: session.currency || 'usd',
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
        transaction_id: session.id,
        gateway_response: session,
      });

    if (paymentError) {
      logStep('Failed to create payment record', { error: paymentError.message });
    }

    // Send confirmation notification
    await sendBookingConfirmationNotification(bookingId, session.metadata?.user_id);
    
    logStep('Checkout session completed successfully', { bookingId });
  } catch (error) {
    logStep('Error processing checkout session', { error: error.message });
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  logStep('Processing payment_intent.succeeded', { paymentIntentId: paymentIntent.id });
  
  try {
    // Update payment record
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        gateway_response: paymentIntent,
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (error) {
      logStep('Failed to update payment record', { error: error.message });
    } else {
      logStep('Payment intent succeeded processing completed');
    }
  } catch (error) {
    logStep('Error processing payment intent succeeded', { error: error.message });
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  logStep('Processing payment_intent.payment_failed', { paymentIntentId: paymentIntent.id });
  
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        gateway_response: paymentIntent,
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (paymentError) {
      logStep('Failed to update payment record', { error: paymentError.message });
    }

    // Update booking status
    const { data: payment } = await supabase
      .from('payments')
      .select('booking_id, user_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (payment) {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.booking_id);

      if (bookingError) {
        logStep('Failed to update booking status', { error: bookingError.message });
      }

      // Send failure notification
      await sendPaymentFailedNotification(payment.booking_id, payment.user_id);
    }
    
    logStep('Payment intent failed processing completed');
  } catch (error) {
    logStep('Error processing payment intent failed', { error: error.message });
    throw error;
  }
}

async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  logStep('Processing payment_intent.canceled', { paymentIntentId: paymentIntent.id });
  
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        gateway_response: paymentIntent,
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (paymentError) {
      logStep('Failed to update payment record', { error: paymentError.message });
    }

    // Update booking status
    const { data: payment } = await supabase
      .from('payments')
      .select('booking_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (payment) {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          payment_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.booking_id);

      if (bookingError) {
        logStep('Failed to update booking status', { error: bookingError.message });
      }
    }
    
    logStep('Payment intent canceled processing completed');
  } catch (error) {
    logStep('Error processing payment intent canceled', { error: error.message });
    throw error;
  }
}

async function sendBookingConfirmationNotification(bookingId: string, userId?: string) {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        channel: 'whatsapp',
        title: 'Booking Confirmed! 🚗',
        message: 'Your ride has been booked successfully. Payment confirmed. You will receive driver details shortly.',
        metadata: {
          booking_id: bookingId,
          type: 'booking_confirmation'
        }
      });

    if (error) {
      logStep('Failed to send confirmation notification', { error: error.message });
    } else {
      logStep('Confirmation notification sent successfully');
    }
  } catch (error) {
    logStep('Error sending confirmation notification', { error: error.message });
  }
}

async function sendPaymentFailedNotification(bookingId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        channel: 'whatsapp',
        title: 'Payment Failed ❌',
        message: 'Your payment could not be processed. Please try again or contact support.',
        metadata: {
          booking_id: bookingId,
          type: 'payment_failed'
        }
      });

    if (error) {
      logStep('Failed to send payment failed notification', { error: error.message });
    } else {
      logStep('Payment failed notification sent successfully');
    }
  } catch (error) {
    logStep('Error sending payment failed notification', { error: error.message });
  }
}