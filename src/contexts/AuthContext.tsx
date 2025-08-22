import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { sendOTPViaWhatsapp } from '@/utils/smsService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isPhoneVerified: boolean;
  authError: string | null;
  signInWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPhoneVerification: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneForGoogleUser: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  clearAuthError: () => void;
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
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        
        // Clear any timeouts since we got an auth event
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
        
        // Clear previous errors
        setAuthError(null);
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(session);
          setUser(session?.user || null);
          setIsPhoneVerified(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Handle user session synchronously to avoid deadlocks
          setSession(session);
          setUser(session.user);
          
          // Defer database operations
          setTimeout(() => {
            if (mounted) {
              handleUserSession(session).catch((error) => {
                console.error('Error in deferred session handling:', error);
                if (mounted) {
                  setAuthError('Failed to verify user session');
                  setLoading(false);
                }
              });
            }
          }, 0);
        }
      }
    );

    // THEN initialize auth
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthError('Failed to initialize authentication');
            setLoading(false);
          }
          return;
        }

        if (currentSession?.user && mounted) {
          // Session exists, let the auth state change handler deal with it
          // Just set loading to false here since handler will be called
          setLoading(false);
        } else if (mounted) {
          // No session - user is not logged in
          setSession(null);
          setUser(null);
          setIsPhoneVerified(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setAuthError('Authentication initialization failed');
          setLoading(false);
        }
      }
    };

    // Set timeout for auth initialization
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout - no auth events received');
        setLoading(false);
      }
    }, 5000); // Reduced to 5 seconds

    initializeAuth();

    return () => {
      mounted = false;
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSession = async (session: Session) => {
    try {
      // Check if user exists in database and sync if necessary
      const userSyncResult = await ensureUserInDatabase(session.user);
      
      if (!userSyncResult.success) {
        console.error('Failed to sync user with database:', userSyncResult.error);
        await handleUserSyncFailure(userSyncResult.error);
        return;
      }

      // Check phone verification status
      await checkPhoneVerificationStatus(session.user);
      setLoading(false);
    } catch (error) {
      console.error('Error handling user session:', error);
      setAuthError('Failed to verify user session');
      setLoading(false);
    }
  };

  const ensureUserInDatabase = async (user: User): Promise<{ success: boolean; error?: string }> => {
    try {
      // First, check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, phone_verified, phone_no')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user existence:', fetchError);
        return { success: false, error: 'Database query failed' };
      }

      if (!existingUser) {
        // User doesn't exist in database, create them
        console.log('User not found in database, creating user record');
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            role: 'customer',
            email: user.email,
            phone_no: user.phone || null,
            phone_verified: user.phone_confirmed_at ? true : false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating user record:', insertError);
          return { success: false, error: 'Failed to create user record' };
        }

        console.log('User record created successfully');
      }

      return { success: true };
    } catch (error) {
      console.error('Error ensuring user in database:', error);
      return { success: false, error: 'Unexpected error during user sync' };
    }
  };

  const handleUserSyncFailure = async (error?: string) => {
    try {
      console.log('Handling user sync failure - signing out user');
      setAuthError(`Your account needs to be re-verified: ${error || 'Database sync failed'}. Please sign in again.`);
      
      // Sign out the user
      await supabase.auth.signOut();
      
      // Reset all state
      setSession(null);
      setUser(null);
      setIsPhoneVerified(false);
      setLoading(false);
    } catch (signOutError) {
      console.error('Error during user sync failure handling:', signOutError);
      // Force reset state even if signOut fails
      setSession(null);
      setUser(null);
      setIsPhoneVerified(false);
      setLoading(false);
    }
  };

  const checkPhoneVerificationStatus = async (user: User) => {
    try {
      // First, always check our custom users table for verification status
      const { data, error } = await supabase
        .from('users')
        .select('phone_verified, phone_no')
        .eq('id', user.id)
        .single();
      
      if (!error && data) {
        // If user has already verified phone in our database, use that status
        if (data.phone_verified) {
          setIsPhoneVerified(true);
          return;
        }
      }
      
      // If not verified in our database, check Supabase Auth for phone confirmation
      const hasVerifiedPhone = user.phone && user.phone_confirmed_at;
      
      if (hasVerifiedPhone) {
        setIsPhoneVerified(true);
        // Sync the verification status to our users table
        await updateUserPhoneStatus(user.id, user.phone!, true);
      } else {
        // No phone verification found anywhere
        setIsPhoneVerified(false);
      }
    } catch (error) {
      console.error('Error checking phone verification status:', error);
      setIsPhoneVerified(false);
    }
  };

  const updateUserPhoneStatus = async (userId: string, phone: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          id: userId,
          phone_no: phone,
          phone_verified: verified,
          updated_at: new Date().toISOString()
        }).eq('id', userId);
      
      if (error) {
        console.error('Error updating user phone status:', error);
      }
    } catch (error) {
      console.error('Error updating user phone status:', error);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (digits.length === 10) {
      return `91${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      return `${digits}`;
    } else if (digits.length === 13 && digits.startsWith('91')) {
      return `${digits.substring(1)}`;
    }
    
    return phone; // Return as-is if format is unclear
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setAuthError(null);
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Sending OTP to:', formattedPhone);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: true,
        }
      });

      if (error) {
        console.error('Error sending OTP:', error);
        throw new Error(error.message);
      }

      console.log('OTP sent successfully:', data);
      return { success: true };
    } catch (error: any) {
      console.error('signInWithPhone error:', error);
      setAuthError(error.message || 'Failed to send OTP');
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  };

  const verifyPhoneOTP = async (phone: string, otp: string) => {
    try {
      setAuthError(null);
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Verifying OTP for:', formattedPhone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp.trim(),
        type: 'sms'
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('OTP verified successfully, user signed in');
        // User will be synced via the auth state change listener
        return { success: true };
      }

      return { success: false, error: 'Verification failed' };
    } catch (error: any) {
      console.error('verifyPhoneOTP error:', error);
      setAuthError(error.message || 'Failed to verify OTP');
      return { success: false, error: error.message || 'Failed to verify OTP' };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
  };

  const sendPhoneVerification = async (phone: string) => {
    try {
      setAuthError(null);
      if (!user) {
        throw new Error('No user logged in');
      }

      const formattedPhone = formatPhoneNumber(phone);
      console.log('Attempting to send OTP to:', formattedPhone);
      
      // Create phone verification using your custom database function
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

      console.log('OTP generated successfully for', formattedPhone);
      
      // Send SMS with OTP (implement these helper functions)
      const smsMessage = generateOTPMessage(otpCode);
      const smsResult = await sendSMS(formattedPhone, smsMessage);
      
      if (!smsResult.success) {
        console.error('SMS sending failed:', smsResult.error);
      }
      const whatsAppResult = await sendOTPViaWhatsapp(formattedPhone, otpCode);
      if (!whatsAppResult.success) {
        console.error('WhatsApp sending failed:', whatsAppResult.error);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('sendPhoneVerification error:', error);
      setAuthError(error.message || 'Failed to send verification code');
      return { success: false, error: error.message || 'Failed to send verification code' };
    }
  };

  const verifyPhoneForGoogleUser = async (phone: string, otp: string) => {
    try {
      setAuthError(null);
      if (!user) {
        throw new Error('No user logged in');
      }

      const formattedPhone = formatPhoneNumber(phone);
      const trimmedOtp = otp.trim();
      
      console.log('Attempting to verify OTP for:', formattedPhone);
      
      // Verify OTP using your custom database function
      const { data: isValid, error } = await supabase.rpc('verify_phone_otp', {
        p_phone_number: formattedPhone,
        p_otp_code: trimmedOtp
      });

      if (error) {
        console.error('OTP verification error:', error);
        throw new Error(`Verification failed: ${error.message}`);
      }
      
      if (!isValid) {
        console.log('OTP verification failed: Invalid or expired code');
        return { 
          success: false, 
          error: 'Invalid or expired OTP. Please check the code and try again.' 
        };
      }

      console.log('OTP verified successfully for Google user');
      
      // Update the user's phone verification status
      await updateUserPhoneStatus(user.id, formattedPhone, true);
      
      // Update Supabase Auth user profile
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          phone: formattedPhone
        });

        if (updateError) {
          console.warn('Could not update user profile with phone:', updateError);
        }
      } catch (profileUpdateError) {
        console.warn('Profile update failed:', profileUpdateError);
      }

      setIsPhoneVerified(true);
      return { success: true };
    } catch (error: any) {
      console.error('verifyPhoneForGoogleUser error:', error);
      setAuthError(error.message || 'Failed to verify phone number');
      return { success: false, error: error.message || 'Failed to verify phone number' };
    }
  };

  const signOut = async () => {
    try {
      setAuthError(null);
      setLoading(true);
      
      // First update local state immediately
      setSession(null);
      setUser(null);
      setIsPhoneVerified(false);
      
      // Then call signOut (this will trigger auth state change)
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw here, just log - state is already cleared
      }
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      // State is already cleared above
    } finally {
      setLoading(false);
    }
  };

  // Helper functions (implement these based on your SMS service)
  const generateOTPMessage = (otpCode: string): string => {
    return `Your verification code is: ${otpCode}. This code will expire in 10 minutes. Do not share this code with anyone.`;
  };

  const sendSMS = async (phoneNumber: string, message: string): Promise<{ success: boolean; error?: string }> => {
    // Implement your SMS sending logic here
    // For now, return success to prevent errors
    console.log('SMS would be sent to:', phoneNumber, 'Message:', message);
    return { success: true };
  };

  const value = {
    user,
    session,
    loading,
    isPhoneVerified,
    authError,
    signInWithPhone,
    verifyPhoneOTP,
    signInWithGoogle,
    signOut,
    sendPhoneVerification,
    verifyPhoneForGoogleUser,
    clearAuthError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};