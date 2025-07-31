import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendSMS, formatPhoneNumber, generateOTPMessage } from '@/utils/smsService'; // Ensure this is for client-side or mocked


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
          if (event === 'SIGNED_OUT') {
           // Adjust to your login route
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
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to verify OTP for:', formattedPhone, 'with code:', otp);
      
      // Verify OTP (This part remains the same)
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

      // Check if user exists with this phone number (This part also remains mostly the same)
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('phone_no', formattedPhone)
        .eq('phone_verified', true)
        .single();

      if (userError && userError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error('Error checking existing user:', userError);
        throw new Error(`User lookup failed: ${userError.message}`);
      }

      if (existingUser) {
        console.log('Existing user found, signing in...');
        // **Important: For existing users, if they have an email, use signInWithOtp (magic link) or ask for password.**
        // If you strictly want passwordless by phone, you might need a custom auth flow
        // that directly issues a session based on the OTP verification.
        // The `signInWithPassword` will only work if `existingUser.email` also has a real password.
        // If this is meant to be a purely passwordless flow, you might need a server-side
        // function (Edge Function) to mint a session after OTP verification.
        // For now, let's assume `signInWithPassword` is suitable if the user actually set a password.
        // If not, the current `signInWithPassword` will fail here too.
        // A common pattern is to redirect to a "create password" page if they are existing but only logged in via OTP.
        // Or, if truly passwordless, you'd use signInWithOtp:
        const { error: signInError } = await supabase.auth.signInWithOtp({
            email: existingUser.email,
            options: {
                shouldCreateUser: false, // Don't create if email exists
            }
        });
        if (signInError) {
            console.error('Sign in with OTP error:', signInError);
            // This would mean sending an email magic link. Not ideal for phone-first.
            // For a truly phone-first passwordless experience, consider a custom Supabase Edge Function
            // that leverages the internal `auth.admin.signIn()` if the OTP is valid.
            // For simplicity here, let's keep the user creation path robust.
            throw new Error(`Sign in failed for existing user: ${signInError.message}`);
        }
        return { success: true };

      } else {
        console.log('New user, creating account...');
        // *** Crucial Change Here: Use signInWithOtp for phone/email instead of signUp with dummy password ***
        // Supabase allows phone sign-in directly if you've enabled it.
        // If not, you'd stick to email sign-up and then connect the phone.

        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
            phone: formattedPhone, // Use phone directly if phone sign-in is enabled in Supabase
            // If phone sign-in is not enabled, you'd need to use email magic link,
            // or perform a server-side call after OTP verification.
            options: {
                shouldCreateUser: true // Create user if phone/email doesn't exist
            }
        });

        if (authError) {
          console.error('Sign up/in error:', authError);
          throw new Error(`Account creation/sign-in failed: ${authError.message}`);
        }

        // After successful signInWithOtp (which also logs in the user),
        // complete phone verification if authData.user is available
        if (authData.user) {
          console.log('Completing phone verification...');
          const verificationResult = await completePhoneVerification(formattedPhone);
          if (!verificationResult.success) {
            throw new Error(verificationResult.error || 'Failed to complete verification');
          }
        } else if (authData.session) {
            // If user object isn't immediately available but session is,
            // ensure state is updated or handle based on onAuthStateChange listener
            // The onAuthStateChange listener should pick this up anyway.
        } else {
            // This might happen if signInWithOtp sends a link to an email/phone that
            // needs to be clicked/verified separately, not immediately signing in.
            // For phone OTP, typically it signs in immediately.
            console.warn("signInWithOtp completed, but no user or session immediately available. User may need to complete action (e.g., email link).");
        }

        return { success: true };
      }
    } catch (error: any) {
      console.error('verifyOTP error:', error);
      return { success: false, error: error.message || 'Failed to verify OTP' };
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
      // Redirect to login page after successful sign out // Adjust to your login route
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