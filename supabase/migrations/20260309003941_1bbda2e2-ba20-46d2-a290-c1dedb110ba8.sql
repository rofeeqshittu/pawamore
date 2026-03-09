-- Make user_id nullable for guest orders
ALTER TABLE public.orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Add guest email field for order lookup
ALTER TABLE public.orders 
ADD COLUMN guest_email TEXT;

-- Add order lookup index for guests
CREATE INDEX idx_orders_guest_lookup ON public.orders(guest_email, created_at DESC) 
WHERE user_id IS NULL;

-- Create order lookup function for guests
CREATE OR REPLACE FUNCTION public.get_guest_order(
  p_guest_email TEXT,
  p_order_id UUID
)
RETURNS TABLE(
  id UUID,
  created_at TIMESTAMPTZ,
  total_amount NUMERIC,
  status TEXT,
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  payment_method TEXT,
  payment_status TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.created_at,
    o.total_amount,
    o.status,
    o.shipping_name,
    o.shipping_phone,
    o.shipping_address,
    o.shipping_city,
    o.payment_method,
    o.payment_status
  FROM orders o
  WHERE o.guest_email = p_guest_email 
    AND o.id = p_order_id
    AND o.user_id IS NULL;
$$;

-- Update RLS policies to allow guest orders
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;

CREATE POLICY "Users and guests can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR  -- Authenticated user
  (auth.uid() IS NULL AND user_id IS NULL AND guest_email IS NOT NULL)  -- Guest with email
);

-- Allow guests to view their orders via the function (already secured)
CREATE POLICY "Guests can view own orders via function"
ON public.orders
FOR SELECT
USING (
  auth.uid() = user_id OR  -- Authenticated user
  user_id IS NULL  -- Guest orders (access controlled by function)
);