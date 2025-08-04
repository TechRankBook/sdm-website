import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookingStore } from '@/stores/bookingStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isPhoneVerified } = useAuth();
  const { bookingData } = useBookingStore();

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = async () => {
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        if (isPhoneVerified) {
          // Check if user was in the middle of a booking flow
          if (bookingData.pickupLocation && bookingData.dropoffLocation) {
            navigate('/booking');
          } else {
            navigate('/');
          }
        } else {
          // User signed in with Google but needs phone verification
          navigate('/auth');
        }
      } else {
        // If no user, redirect to auth
        navigate('/auth');
      }
    };

    handleCallback();
  }, [user, isPhoneVerified, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Processing Sign In...</CardTitle>
          <CardDescription>
            Please wait while we complete your authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;