-- Fix: Allow guest orders (where user_id IS NULL and guest_email IS NOT NULL)
-- The current policy checks auth.uid() IS NULL which doesn't work with anon key
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  -- Logged-in users: user_id must match their auth id
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Guest users: user_id must be null and guest_email must be provided
  (user_id IS NULL AND guest_email IS NOT NULL)
);