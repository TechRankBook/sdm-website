// supabase/functions/booking-notifications/index.ts
// This is a separate edge function to handle booking system notifications
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { WhatsAppAPI } from "../whatsapp-webhook/modules/whatsapp-api.ts"; // Ensure this path is correct
// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const WHATSAPP_CLOUD_API_TOKEN = Deno.env.get("WHATSAPP_CLOUD_API_TOKEN");
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
const BOOKING_WEBSITE_URL = Deno.env.get("BOOKING_WEBSITE_URL") || "https://sdm-emobility.com"; // Fallback URL
// Initialize Supabase client and WhatsApp API
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !WHATSAPP_CLOUD_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
  console.error("Missing environment variables. Please check your Supabase secrets.");
  Deno.exit(1); // Exit if critical environment variables are missing
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const whatsappAPI = new WhatsAppAPI(WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID);
// Helper function to get user's phone number
async function getUserPhoneNumber(userId) {
  try {
    const { data: userData, error } = await supabase.from("users").select("phone_no").eq("id", userId).single();
    if (error) throw error;
    if (!userData?.phone_no) {
      console.warn(`Phone number not found for user ID: ${userId}`);
      return null;
    }
    return userData.phone_no;
  } catch (error) {
    console.error(`Error fetching phone number for user ${userId}:`, error.message);
    // Do not re-throw here, allow the main handler to continue if phone number is not critical for other actions
    return null;
  }
}
// Main serve handler for the Edge Function
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405
    });
  }
  try {
    const { type, data } = await req.json();
    console.log(`Processing notification: ${type}`, data);
    switch(type){
      case "booking.created":
        await handleBookingCreated(data);
        break;
      case "booking.confirmed":
        await handleBookingConfirmed(data);
        break;
      case "driver.assigned":
        await handleDriverAssigned(data);
        break;
      case "trip.completed":
        await handleTripCompleted(data);
        break;
      case "send.otp":
        return await handleSendOtp(data);
        break;
      default:
        console.warn(`Unknown notification type: ${type}`);
    }
    return new Response("OK", {
      status: 200
    });
  } catch (error) {
    console.error("Error processing notification:", error.message);
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500
    });
  }
});
// Handler functions
async function handleBookingCreated(data) {
  const { booking_id, user_id } = data;
  console.log(`Booking created: ${booking_id} for user: ${user_id}`);
// No WhatsApp message here, as confirmation comes after payment
}
async function handleBookingConfirmed(data) {
  const { booking } = data;
  try {
    const phoneNumber = await getUserPhoneNumber(booking.user_id);
    if (phoneNumber) {
      console.log(`Sending booking confirmation template to user: ${phoneNumber}`);
      // Assuming you have user's name from your users table or passed in booking data
      const { data: userData } = await supabase.from("users").select("full_name").eq("id", booking.user_id).single();
      const userName = userData?.full_name || "Customer"; // Default if name not found
      await whatsappAPI.sendBookingConfirmationTemplate(phoneNumber, userName, booking.id, booking.pickup_address, booking.dropoff_address, booking.scheduled_time || booking.created_at, booking.vehicle_type || "Car", booking.fare_amount, booking.advance_amount, booking.remaining_amount);
    }
  } catch (error) {
    console.error(`Failed to handle booking confirmation for booking ${booking?.id}:`, error.message);
  }
}
async function handleDriverAssigned(data) {
  const { booking, driver } = data;
  try {
    const phoneNumber = await getUserPhoneNumber(booking.user_id);
    if (phoneNumber) {
      console.log(`Sending driver assigned template to user: ${phoneNumber}`);
      // Ensure driver and booking details have the necessary fields for the template
      await whatsappAPI.sendDriverAssignedTemplate(phoneNumber, driver.full_name, driver.phone_no, booking.vehicle_make || "Car", booking.vehicle_model || "", booking.vehicle_type, booking.license_plate || "N/A", booking.id);
    }
  } catch (error) {
    console.error(`Failed to handle driver assigned for booking ${booking?.id}:`, error.message);
  }
}
async function handleTripCompleted(data) {
  const { booking, fare_details } = data;
  try {
    const phoneNumber = await getUserPhoneNumber(booking.user_id);
    if (phoneNumber) {
      console.log(`Trip completed for booking: ${booking.id}`);
      const ratingUrl = `${BOOKING_WEBSITE_URL}/rate/${booking.id}`;
      await whatsappAPI.sendTripCompletedTemplate(phoneNumber, booking.id, booking.pickup_address, booking.dropoff_address, fare_details?.total_amount || booking.fare_amount, Date.now());
    }
  } catch (error) {
    console.error(`Failed to handle trip completed for booking ${booking?.id}:`, error.message);
  }
}
// Handler for OTP sending
async function handleSendOtp(data) {
  const { phone_no, otp } = data;
  try {
    if (!phone_no || !otp) {
      throw new Error("Phone number and OTP are required");
    }
    console.log(`Sending OTP ${otp} to phone number: ${phone_no}`);
    await whatsappAPI.sendWhatsAppOTP(phone_no, otp);
    return new Response("OTP sent successfully", {
      status: 200
    });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    return new Response(`Failed to send OTP: ${error.message}`, {
      status: 500
    });
  }
}