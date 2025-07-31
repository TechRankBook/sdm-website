import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendSMS, formatPhoneNumber, generateOTPMessage } from '@/utils/smsService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPhoneVerified: boolean;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  completePhoneVerification: (phone: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check phone verification status
          setTimeout(async () => {
            await checkPhoneVerificationStatus(session.user.id);
          }, 0);
        } else {
          setIsPhoneVerified(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkPhoneVerificationStatus(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkPhoneVerificationStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone_verified')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setIsPhoneVerified(data.phone_verified || false);
      }
    } catch (error) {
      console.error('Error checking phone verification status:', error);
      setIsPhoneVerified(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to send OTP to:', formattedPhone);
      
      // Create phone verification
      const { data, error } = await supabase.rpc('create_phone_verification', {
        p_phone_number: formattedPhone
      });

      if (error) {
        console.error('Error creating phone verification:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to generate OTP - no data returned');
      }

      const otpCode = data[0]?.otp_code;
      if (!otpCode) {
        throw new Error('Failed to generate OTP - missing OTP code');
      }

      console.log('OTP generated successfully for', formattedPhone, ':', otpCode);
      
      // Send SMS with OTP
      const smsMessage = generateOTPMessage(otpCode);
      const smsResult = await sendSMS(formattedPhone, smsMessage);
      
      if (!smsResult.success) {
        console.error('SMS sending failed:', smsResult.error);
        // In production, you might want to still return success since OTP is generated
        // but log the SMS failure for monitoring
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('signInWithPhone error:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to verify OTP for:', formattedPhone, 'with code:', otp);
      
      // Verify OTP
      const { data: isValid, error } = await supabase.rpc('verify_phone_otp', {
        p_phone_number: formattedPhone,
        p_otp_code: otp.trim()
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw new Error(`Verification failed: ${error.message}`);
      }
      
      if (!isValid) {
        console.log('OTP verification failed: Invalid or expired code');
        return { success: false, error: 'Invalid or expired OTP. Please check the code and try again.' };
      }

      console.log('OTP verified successfully');

      // Check if user exists with this phone number
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('phone_no', formattedPhone)
        .eq('phone_verified', true)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking existing user:', userError);
        throw new Error(`User lookup failed: ${userError.message}`);
      }

      if (existingUser) {
        console.log('Existing user found, signing in...');
        // User exists, sign them in using their existing email
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: existingUser.email,
          password: '#@sdm2025' // In production, use proper session management
        });

        if (authError) {
          console.error('Sign in error:', authError);
          throw new Error(`Sign in failed: ${authError.message}`);
        }
        
        return { success: true };
      } else {
        console.log('New user, creating account...');
        // New user, create account
        const tempEmail = `${formattedPhone.replace(/\D/g, '')}@temp.sdmmobility.com`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: tempEmail,
          password: 'temppassword123',
          options: {
            data: {
              phone_number: formattedPhone,
              phone_verified: false
            }
          }
        });

        if (authError) {
          console.error('Sign up error:', authError);
          throw new Error(`Account creation failed: ${authError.message}`);
        }

        // Complete phone verification
        if (authData.user) {
          console.log('Completing phone verification...');
          const verificationResult = await completePhoneVerification(formattedPhone);
          if (!verificationResult.success) {
            throw new Error(verificationResult.error || 'Failed to complete verification');
          }
        }

        return { success: true };
      }
    } catch (error: any) {
      console.error('verifyOTP error:', error);
      return { success: false, error: error.message || 'Failed to verify OTP' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const completePhoneVerification = async (phone: string) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase.rpc('complete_phone_verification', {
        p_user_id: user.id,
        p_phone_number: phone
      });

      if (error) throw error;

      setIsPhoneVerified(true);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsPhoneVerified(false);
  };

  const value = {
    user,
    session,
    loading,
    isPhoneVerified,
    signInWithPhone,
    verifyOTP,
    signInWithGoogle,
    signOut,
    completePhoneVerification
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};