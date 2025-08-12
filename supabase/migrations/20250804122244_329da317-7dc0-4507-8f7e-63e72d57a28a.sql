-- Rename stripe_payment_intent_id to razorpay_payment_id for better compatibility
ALTER TABLE payments RENAME COLUMN stripe_payment_intent_id TO razorpay_payment_id;

-- Add comment for clarity
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID or legacy Stripe payment intent ID';