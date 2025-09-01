import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Phone, Shield, Chrome, Zap, ArrowLeft } from 'lucide-react';
import evAbstractBg from '@/assets/ev-abstract-bg.jpg';

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

    const registerPhoneNumber = async (phoneNumberId, accessToken, pin) => {
  const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/register`;

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  const payload = {
    messaging_product: 'whatsapp',
    pin: pin
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Request was successful!');
    console.log('Response JSON:', data);
    return data;
  } catch (error) {
    console.error('An error occurred:', error);
    return null;
  }
};

// --- Example of how to call the function ---
const myPhoneNumberId = "740329502490134"; // Replace with your actual Phone Number ID
const myAccessToken = "EAAeZCgWUm52MBPILW4FRZBqYOha7IsbTYwUhjsQk1z9rMCDVR9qWVvk87mLLxyUcxOHLVZBBCg1zdSNvTkUUnJYjF0WLyiNvc1ai3SPvSBle3p677z6zXPBxFzkJKEsYX3BzWUsoLgy8COnzMJpBNql2SQ1XfQNXPOWocZCKJXxZBA1et2ntGxBRCIIIVLEPZCSabZBYfR5crnRx8B4pZCZCvhSeaa6DwcheSoSfFEiGNSGZAsaf3UAhD4JzaRma4xxwZDZD"; // Replace with your actual Access Token
const myPin = "123456"; // Replace with your desired 6-digit PIN

const data = await registerPhoneNumber(myPhoneNumberId, myAccessToken, myPin);
console.log('what is this?', data);
    
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
      <div className="min-h-screen flex items-center justify-center morphing-bg ev-particles p-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${evAbstractBg})` }}
        />
        
        <Card className="w-full max-w-md glass charging-animation card-hover-lift relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 electric-glow">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Welcome to SDM E-Mobility
            </CardTitle>
            <CardDescription className="text-base">
              Enter your phone number to get started. We'll send you a verification code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted/50 pl-3 pr-2 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-l-none text-lg input-focus-glow bg-background/50"
                  maxLength={10}
                />
              </div>
              <Button type="submit" className="w-full btn-electric energy-flow" disabled={loading}>
                <Phone className="w-4 h-4 mr-2" />
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background/80 px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full btn-electric hover:bg-primary/5"
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
      <div className="min-h-screen flex items-center justify-center morphing-bg ev-particles p-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${evAbstractBg})` }}
        />
        
        <Card className="w-full max-w-md glass charging-animation card-hover-lift relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 electric-glow">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Verify Your Phone
            </CardTitle>
            <CardDescription className="text-base">
              Enter the 6-digit code sent to <span className="font-semibold text-primary">{phoneNumber}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleOTPVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6} className="gap-2">
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full btn-electric energy-flow" disabled={loading}>
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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
      <div className="min-h-screen flex items-center justify-center morphing-bg ev-particles p-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${evAbstractBg})` }}
        />
        
        <Card className="w-full max-w-md glass charging-animation card-hover-lift relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 electric-glow">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Verify Phone Number
            </CardTitle>
            <CardDescription className="text-base">
              To complete your account setup, please verify your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleGooglePhoneVerification} className="space-y-6">
              <div className="flex">
                <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted/50 pl-3 pr-2 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 rounded-l-none text-lg input-focus-glow bg-background/50"
                  maxLength={10}
                />
              </div>
              <Button type="submit" className="w-full btn-electric energy-flow" disabled={loading}>
                <Phone className="w-4 h-4 mr-2" />
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
      <div className="min-h-screen flex items-center justify-center morphing-bg ev-particles p-4 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${evAbstractBg})` }}
        />
        
        <Card className="w-full max-w-md glass charging-animation card-hover-lift relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 electric-glow">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Verify Your Phone
            </CardTitle>
            <CardDescription className="text-base">
              Enter the 6-digit code sent to <span className="font-semibold text-primary">{phoneNumber}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleGooglePhoneOTPVerify} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6} className="gap-2">
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={1} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={2} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={3} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={4} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                    <InputOTPSlot index={5} className="w-12 h-12 text-lg border-primary/30 focus:border-primary input-focus-glow" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" className="w-full btn-electric energy-flow" disabled={loading}>
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "Verifying..." : "Verify Phone Number"}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setStep('google-phone-verify')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
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