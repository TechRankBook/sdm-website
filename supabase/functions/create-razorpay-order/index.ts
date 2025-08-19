import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-RAZORPAY-ORDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  logStep('Function started');

  try {
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }
    logStep('Razorpay credentials verified');

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
    const  userInfo  = await supabase
      .from('users')
      .select('id, email, phone_no')
      .eq('id', user.id)
      .single();
    logStep('User authenticated', { userId: user.id, email: user.email });

    const { bookingData, bookingId, paymentMethod = 'razorpay', paymentAmount } = await req.json();
    logStep('Request data received', { bookingId, serviceType: bookingData.serviceType, paymentMethod });

    if (!bookingData.selectedFare) {
      throw new Error('No fare selected');
    }

    // Use the payment amount from frontend (either partial 25% or full)
    const totalFare = bookingData.selectedFare.price;
    const actualPaymentAmount = paymentAmount || Math.ceil(totalFare * 0.25);
    
    logStep('Fare calculation', { totalFare, actualPaymentAmount });

    // Create Razorpay order
    const orderData = {
      amount: 1* 100, // Amount in paise
      // amount: actualPaymentAmount * 100,
      currency: 'INR',
      receipt: `rcpt_${bookingId.slice(-32)}`, // Truncate to fit 40 char limit
      payment_capture: 1,
      notes: {
        booking_id: bookingId,
        user_id: user.id,
        service_type: bookingData.serviceType,
        vehicle_type: bookingData.selectedFare.type,
        total_fare: totalFare.toString(),
        payment_amount: actualPaymentAmount.toString(),
      }
    };

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text();
      throw new Error(`Razorpay API error: ${errorData}`);
    }

    const order = await razorpayResponse.json();
    logStep('Razorpay order created', { orderId: order.id, amount: order.amount });

    // Update booking with payment method and order ID
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    await supabaseServiceRole
      .from('bookings')
      .update({ 
        payment_method: paymentMethod,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    // Create payment record
    await supabaseServiceRole
      .from('payments')
      .insert({
        booking_id: bookingId,
        user_id: user.id,
        amount: actualPaymentAmount,
        currency: 'INR',
        status: 'pending',
        transaction_id: order.id,
        gateway_response: order,
      });

    logStep('Payment record created');

    return new Response(JSON.stringify({ 
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
      booking_id: bookingId,
      user_email: user.email,
      user_name: userInfo.data?.full_name || userInfo.data?.email.split('@')[0] || 'Guest',
      user_phone: userInfo.data?.phone_number || user.user_metadata?.phone_no || 'Not provided',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in create-razorpay-order', { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});