-- Create phone verification table
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create policy for phone verifications
CREATE POLICY "Users can create phone verifications" 
ON public.phone_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their phone verifications" 
ON public.phone_verifications 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can read their phone verifications" 
ON public.phone_verifications 
FOR SELECT 
USING (true);

-- Add phone verification status to users table
ALTER TABLE public.users 
ADD COLUMN phone_verified BOOLEAN DEFAULT false,
ADD COLUMN phone_verification_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster phone number lookups
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone_number);
CREATE INDEX idx_users_phone_verified ON public.users(phone_no, phone_verified);

-- Function to generate OTP
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Function to create phone verification
CREATE OR REPLACE FUNCTION public.create_phone_verification(p_phone_number TEXT)
RETURNS TABLE(verification_id UUID, otp_code TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_otp TEXT;
BEGIN
  -- Generate OTP
  v_otp := public.generate_otp();
  
  -- Insert verification record
  INSERT INTO public.phone_verifications (
    phone_number,
    otp_code,
    expires_at
  ) VALUES (
    p_phone_number,
    v_otp,
    now() + INTERVAL '10 minutes'
  ) RETURNING id INTO v_id;
  
  RETURN QUERY SELECT v_id, v_otp;
END;
$$;

-- Function to verify OTP
CREATE OR REPLACE FUNCTION public.verify_phone_otp(p_phone_number TEXT, p_otp_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_verification_record RECORD;
BEGIN
  -- Get the latest verification record for this phone
  SELECT * INTO v_verification_record
  FROM public.phone_verifications
  WHERE phone_number = p_phone_number
    AND otp_code = p_otp_code
    AND expires_at > now()
    AND NOT verified
    AND attempts < 3
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_verification_record IS NULL THEN
    -- Update attempts if record exists
    UPDATE public.phone_verifications
    SET attempts = attempts + 1
    WHERE phone_number = p_phone_number
      AND otp_code = p_otp_code;
    
    RETURN false;
  END IF;
  
  -- Mark as verified
  UPDATE public.phone_verifications
  SET verified = true, updated_at = now()
  WHERE id = v_verification_record.id;
  
  RETURN true;
END;
$$;

-- Function to mark user phone as verified
CREATE OR REPLACE FUNCTION public.complete_phone_verification(p_user_id UUID, p_phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if phone is already used by another user
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE phone_no = p_phone_number 
      AND phone_verified = true 
      AND id != p_user_id
  ) THEN
    RAISE EXCEPTION 'Phone number already registered with another account';
  END IF;
  
  -- Update user record
  UPDATE public.users
  SET 
    phone_no = p_phone_number,
    phone_verified = true,
    phone_verification_completed_at = now(),
    updated_at = now()
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$;