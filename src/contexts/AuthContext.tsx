import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendSMS, formatPhoneNumber, generateOTPMessage } from '@/utils/smsService'; // Ensure this is for client-side or mocked
import { useRouter } from 'next/router'; // Assuming Next.js for router

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
  const router = useRouter(); // Initialize useRouter for redirects

  // Memoize checkPhoneVerificationStatus to avoid unnecessary re-renders/re-creations
  const checkPhoneVerificationStatus = useCallback(async (userId: string) => {
    try {
      setLoading(true); // Indicate loading when checking verification status
      const { data, error } = await supabase
        .from('users')
        .select('phone_verified')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "No rows found"
        console.error('Error checking phone verification status:', error);
        setIsPhoneVerified(false);
      } else if (data) {
        setIsPhoneVerified(data.phone_verified || false);
      } else {
        // User record not found or phone_verified explicitly null
        setIsPhoneVerified(false);
      }
    } catch (error) {
      console.error('Unexpected error checking phone verification status:', error);
      setIsPhoneVerified(false);
    } finally {
      setLoading(false); // Done loading regardless of success/failure
    }
  }, []);

  useEffect(() => {
    let mounted = true; // To prevent state updates on unmounted components

    const initializeAuth = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting initial session:', sessionError);
          // Handle specific errors if needed
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await checkPhoneVerificationStatus(initialSession.user.id);
          } else {
            setIsPhoneVerified(false);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return; // Guard against unmounted component updates

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await checkPhoneVerificationStatus(currentSession.user.id);
        } else {
          setIsPhoneVerified(false);
          // Optionally, redirect to login page if user logs out
          if (event === 'SIGNED_OUT' && router.pathname !== '/login') {
            router.push('/login'); // Adjust to your login route
          }
        }
        setLoading(false); // Auth state change is complete
      }
    );

    return () => {
      mounted = false; // Cleanup flag
      subscription.unsubscribe();
    };
  }, [checkPhoneVerificationStatus, router]); // Dependency on router for push

  const signInWithPhone = async (phone: string) => {
    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to send OTP to:', formattedPhone);

      // Call Supabase RPC to create phone verification
      const { data, error: rpcError } = await supabase.rpc('create_phone_verification', {
        p_phone_number: formattedPhone
      });

      if (rpcError) {
        console.error('Error creating phone verification (RPC):', rpcError);
        // Provide a more generic message for the user, log detailed error internally
        throw new Error(`Failed to initiate phone verification. Please try again later. Code: ${rpcError.code}`);
      }

      // Supabase RPC returns an array of records
      const otpCode = data?.[0]?.otp_code;
      if (!otpCode) {
        console.error('Failed to generate OTP: OTP code not returned by RPC.');
        throw new Error('Failed to generate OTP. Please contact support if the issue persists.');
      }

      console.log('OTP generated successfully for', formattedPhone, ':', otpCode);

      // Send SMS with OTP via your external service (ideally server-side)
      const smsMessage = generateOTPMessage(otpCode);
      const smsResult = await sendSMS(formattedPhone, smsMessage); // This should ideally be a server-side call

      if (!smsResult.success) {
        console.warn('SMS sending failed (client-side):', smsResult.error);
        // Important: Even if SMS fails, if OTP is generated and stored,
        // you might still consider this 'success' to the user but log it.
        // For production, if SMS is critical, you might return an error here.
        // For now, we'll return success as the OTP is in the DB.
      }

      return { success: true };
    } catch (error: any) {
      console.error('signInWithPhone error:', error);
      return { success: false, error: error.message || 'Failed to send OTP' };
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to verify OTP for:', formattedPhone, 'with code:', otp);

      // Verify OTP via Supabase RPC
      const { data: isValid, error: otpError } = await supabase.rpc('verify_phone_otp', {
        p_phone_number: formattedPhone,
        p_otp_code: otp.trim()
      });

      if (otpError) {
        console.error('OTP verification RPC error:', otpError);
        throw new Error(`OTP verification failed: ${otpError.message}`);
      }

      if (!isValid) {
        console.log('OTP verification failed: Invalid or expired code');
        return { success: false, error: 'Invalid or expired OTP. Please check the code and try again.' };
      }

      console.log('OTP verified successfully');

      // Attempt to sign in or sign up using signInWithOtp (passwordless)
      const { data: authResponse, error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true, // Create user if not exists
          data: {
            phone_number: formattedPhone,
            phone_verified: false // Will be set to true by completePhoneVerification
          }
        }
      });

      if (authError) {
        console.error('Supabase signInWithOtp error:', authError);
        // Handle specific errors like "User already exists with different sign-in method"
        if (authError.message.includes('AuthApiError: User already registered')) {
            return { success: false, error: 'This phone number is already associated with an account. Please sign in with your usual method.' };
        }
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (authResponse.user) {
        console.log('User signed in/signed up successfully, completing phone verification...');
        const verificationResult = await completePhoneVerification(formattedPhone);
        if (!verificationResult.success) {
          throw new Error(verificationResult.error || 'Failed to complete phone verification in database.');
        }
      } else {
        // This case might occur if Supabase sends an email confirmation or if the flow
        // requires another step, but for phone OTP, a session is usually created immediately.
        // Log a warning or handle as per your Supabase auth configuration.
        console.warn('signInWithOtp completed, but no user object was immediately returned. Session might be pending.', authResponse);
        // Consider if you need to fetch the session explicitly here or if onAuthStateChange handles it.
      }

      return { success: true };
    } catch (error: any) {
      console.error('verifyOTP error:', error);
      return { success: false, error: error.message || 'Failed to verify OTP' };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // Ensure this callback URL is registered in Supabase
          queryParams: {
            access_type: 'offline', // Request refresh token for long-lived access
            prompt: 'consent' // Forces consent screen, useful for dev/testing
          }
        }
      });

      if (error) {
        console.error('Google OAuth sign-in error:', error);
        throw new Error(`Google sign-in failed: ${error.message}`);
      }

      // Supabase typically redirects, so no direct data immediately here on success
      return { success: true };
    } catch (error: any) {
      console.error('signInWithGoogle error:', error);
      return { success: false, error: error.message || 'Failed to sign in with Google' };
    } finally {
      setLoading(false);
    }
  };

  const completePhoneVerification = async (phone: string) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('No user logged in to complete phone verification.');
      }

      const { data, error } = await supabase.rpc('complete_phone_verification', {
        p_user_id: user.id,
        p_phone_number: phone
      });

      if (error) {
        console.error('Error in complete_phone_verification RPC:', error);
        throw new Error(`Failed to update phone verification status: ${error.message}`);
      }

      setIsPhoneVerified(true);
      return { success: true };
    } catch (error: any) {
      console.error('completePhoneVerification error:', error);
      return { success: false, error: error.message || 'Failed to complete phone verification.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw new Error(`Sign out failed: ${error.message}`);
      }
      setUser(null);
      setSession(null);
      setIsPhoneVerified(false);
      // Redirect to login page after successful sign out
      router.push('/login'); // Adjust to your login route
    } catch (error: any) {
      console.error('Sign out failed:', error);
      // Do not block sign out due to an error, but inform the user
      alert(`Sign out failed: ${error.message}`); // Or a more sophisticated notification
    } finally {
      setLoading(false);
    }
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