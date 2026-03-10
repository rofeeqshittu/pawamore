
-- Tighten order_items INSERT: only authenticated users can insert directly
-- Guest order items are created server-side via create-guest-order edge function
DROP POLICY IF EXISTS "Users and guests create order items" ON public.order_items;
CREATE POLICY "Users create own order items"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);
