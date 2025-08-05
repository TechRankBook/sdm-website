import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Phone, Shield, Chrome } from 'lucide-react';

const Auth = () => {
  const [step, setStep] = useState<'phone' | 'otp' | 'google-phone-verify' | 'google-phone-otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { 
    signInWithPhone, 
    verifyPhoneOTP, 
    signInWithGoogle, 
    user, 
    isPhoneVerified,
    sendPhoneVerification,
    verifyPhoneForGoogleUser
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and phone is verified, redirect to home
    if (user && isPhoneVerified) {
      navigate('/booking');
    }
    // If user is authenticated but phone not verified, show phone verification step
    else if (user && !isPhoneVerified) {
      setStep('google-phone-verify');
    }
  }, [user, isPhoneVerified, navigate]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await signInWithPhone(phoneNumber);
    
    if (result.success) {
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    } else {
      console.error('Failed to send OTP:', result.error);
      toast({
        title: "Failed to Send OTP",
        description: result.error || "Unable to send verification code. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await verifyPhoneOTP(phoneNumber, otp);
    
    if (result.success) {
      toast({
        title: "Verification Successful",
        description: "Welcome to SDM E-Mobility! You're now signed in.",
      });
      navigate('/booking');
    } else {
      console.error('OTP verification failed:', result.error);
      toast({
        title: "Verification Failed",
        description: result.error || "Invalid OTP code. Please check and try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to sign in with Google",
        variant: "destructive"
      });
      setLoading(false);
    }
    // Loading will be handled by auth state change
  };

  // For Google users to send phone verification
  const handleGooglePhoneVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await sendPhoneVerification(phoneNumber);
    
    if (result.success) {
      setStep('google-phone-otp');
      toast({
        title: "Verification Code Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
    } else {
      console.error('Failed to send verification code:', result.error);
      toast({
        title: "Failed to Send Code",
        description: result.error || "Unable to send verification code. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // For Google users to verify phone OTP
  const handleGooglePhoneOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await verifyPhoneForGoogleUser(phoneNumber, otp);
    
    if (result.success) {
      toast({
        title: "Phone Verified Successfully",
        description: "Your phone number has been verified. Welcome to SDM E-Mobility!",
      });
      navigate('/booking');
    } else {
      console.error('Phone verification failed:', result.error);
      toast({
        title: "Verification Failed",
        description: result.error || "Invalid OTP code. Please check and try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  // Phone number entry step
  if (step === 'phone') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <img 
                src="/logo1.png" 
                alt="SDM E-Mobility" 
                className="h-10 w-auto cursor-pointer"
              />
            </div>
            <CardTitle>Welcome to SDM E-Mobility</CardTitle>
            <CardDescription>
              Enter your phone number to get started. We'll send you a verification code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted pl-3 pr-2 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-l-none text-lg"
                  maxLength={10}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phone OTP verification step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Verify Your Phone</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleOTPVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="text-sm text-muted-foreground"
              >
                Change phone number
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Google user phone verification step
  if (step === 'google-phone-verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Verify Phone Number</CardTitle>
            <CardDescription>
              To complete your account setup, please verify your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleGooglePhoneVerification} className="space-y-4">
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted pl-3 pr-2 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-l-none text-lg"
                  maxLength={10}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending Code..." : "Send Verification Code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Google user phone OTP verification step
  if (step === 'google-phone-otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Verify Your Phone</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleGooglePhoneOTPVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Phone Number"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep('google-phone-verify')}
                className="text-sm text-muted-foreground"
              >
                Change phone number
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default Auth;