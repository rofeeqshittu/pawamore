-- Allow users to update their own orders (for cancellation)
CREATE POLICY "Users can cancel own pending orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');