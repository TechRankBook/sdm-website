import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOOKING-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  logStep('Function started');

  try {
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

    const { type, data } = await req.json();
    logStep('Request data received', { type, bookingId: data?.booking?.id });

    if (type === 'booking.confirmed' && data?.booking) {
      const booking = data.booking;
      
      // Use service role to insert notification
      const supabaseServiceRole = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      // Send booking confirmation notification
      await supabaseServiceRole
        .from('notifications')
        .insert({
          user_id: booking.user_id,
          channel: 'whatsapp',
          title: 'Booking Confirmed',
          message: `🎉 Your booking has been confirmed! Booking ID: ${booking.id.slice(0, 8)}. You'll receive driver details soon.`,
          metadata: {
            booking_id: booking.id,
            type: 'booking_confirmation',
            pickup_address: booking.pickup_address,
            dropoff_address: booking.dropoff_address,
            fare_amount: booking.fare_amount,
            scheduled_time: booking.scheduled_time,
          },
        });

      logStep('Booking confirmation notification sent');

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Notification sent successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error('Invalid notification type or missing booking data');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep('ERROR in booking-notifications', { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});