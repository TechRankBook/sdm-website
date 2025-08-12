import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-RAZORPAY-PAYMENT] ${step}${detailsStr}`);
};

// Function to create HMAC SHA256 signature
async function createSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  logStep('Function started');

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      throw new Error('Razorpay key secret not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    logStep('Authorization header found');

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error('User not authenticated');
    logStep('User authenticated', { userId: user.id });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json();
    logStep('Request data received', { razorpay_order_id, razorpay_payment_id, booking_id });

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await createSignature(body, razorpayKeySecret);
    
    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }
    logStep('Payment signature verified');

    // Use service role to update database
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Update payment record
    const { error: paymentError } = await supabaseServiceRole
      .from('payments')
      .update({
        status: 'paid',
        razorpay_payment_id: razorpay_payment_id,
        transaction_id: razorpay_payment_id,
        gateway_response: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          verified_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', booking_id)
      .eq('transaction_id', razorpay_order_id);

    if (paymentError) throw paymentError;
    logStep('Payment record updated');

    // Update booking status
    const { error: bookingError } = await supabaseServiceRole
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id);

    if (bookingError) throw bookingError;
    logStep('Booking status updated');

    // Send booking confirmation notification
    await supabaseServiceRole
      .from('notifications')
      .insert({
        user_id: user.id,
        channel: 'whatsapp',
        title: 'Booking Confirmed',
        message: `🎉 Your booking has been confirmed! Booking ID: ${booking_id.slice(0, 8)}. You'll receive driver details soon.`,
        metadata: {
          booking_id: booking_id,
          type: 'booking_confirmation',
          razorpay_payment_id: razorpay_payment_id,
        },
      });

    logStep('Booking confirmation notification sent');

    return new Response(JSON.stringify({ 
      success: true,
      booking_id: booking_id,
      payment_id: razorpay_payment_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in verify-razorpay-payment', { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});