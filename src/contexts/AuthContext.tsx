import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
      // Create phone verification
      const { data, error } = await supabase.rpc('create_phone_verification', {
        p_phone_number: phone
      });

      if (error) throw error;

      // In a real app, you would send SMS here
      // For demo, we'll console log the OTP
      console.log('OTP for', phone, ':', data[0]?.otp_code);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      // Verify OTP
      const { data: isValid, error } = await supabase.rpc('verify_phone_otp', {
        p_phone_number: phone,
        p_otp_code: otp
      });

      if (error) throw error;
      if (!isValid) {
        return { success: false, error: 'Invalid or expired OTP' };
      }

      // Check if user exists with this phone number
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_no', phone)
        .eq('phone_verified', true)
        .single();

      if (existingUser) {
        // User exists, sign them in
        // In a real app, you'd create a session here
        // For now, we'll create a dummy user in auth.users
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${phone}@temp.com`,
          password: 'temppassword123',
          options: {
            data: {
              phone_number: phone,
              phone_verified: true
            }
          }
        });

        if (authError) throw authError;
        return { success: true };
      } else {
        // New user, create account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `${phone}@temp.com`,
          password: 'temppassword123',
          options: {
            data: {
              phone_number: phone,
              phone_verified: false
            }
          }
        });

        if (authError) throw authError;

        // Complete phone verification
        if (authData.user) {
          await completePhoneVerification(phone);
        }

        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
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