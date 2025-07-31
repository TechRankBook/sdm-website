// SMS Service utilities for OTP delivery
// This file contains the SMS integration logic

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends SMS using configured SMS provider
 * In production, this should be implemented with actual SMS services like:
 * - Twilio
 * - AWS SNS
 * - Firebase Cloud Messaging
 * - India-specific providers like TextLocal, MSG91, etc.
 */
export const sendSMS = async (phoneNumber: string, message: string): Promise<SMSResponse> => {
  try {
    // For demo purposes, we'll just log the message
    console.log(`📱 SMS would be sent to ${phoneNumber}: ${message}`);
    
    // TODO: Implement actual SMS service integration
    // Example with Twilio:
    // const client = twilio(accountSid, authToken);
    // const result = await client.messages.create({
    //   body: message,
    //   from: '+1234567890', // Your Twilio phone number
    //   to: phoneNumber
    // });
    // return { success: true, messageId: result.sid };
    
    // For now, simulate successful SMS delivery
    return { 
      success: true, 
      messageId: `demo_${Date.now()}` 
    };
  } catch (error: any) {
    console.error('SMS sending failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send SMS' 
    };
  }
};

/**
 * Formats phone number for SMS delivery
 * Ensures proper international format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  } else if (digits.length === 13 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  // Return as-is if already properly formatted
  return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`;
};

/**
 * Generates SMS message for OTP
 */
export const generateOTPMessage = (otp: string, companyName: string = 'SDM E-Mobility'): string => {
  return `Your ${companyName} verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
};