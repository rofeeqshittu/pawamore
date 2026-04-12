-- Migration: add bulk_update_products RPC
-- Adds a server-side function to perform efficient bulk updates on products

BEGIN;

CREATE OR REPLACE FUNCTION public.bulk_update_products(
  p_ids uuid[],
  p_new_status text DEFAULT NULL,
  p_featured boolean DEFAULT NULL,
  p_popular boolean DEFAULT NULL,
  p_category uuid DEFAULT NULL,
  p_price_percent integer DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE products
  SET
    status = COALESCE(p_new_status, status),
    is_featured = COALESCE(p_featured, is_featured),
    is_popular = COALESCE(p_popular, is_popular),
    category_id = COALESCE(p_category, category_id),
    price = CASE
      WHEN p_price_percent IS NOT NULL THEN GREATEST(0, ROUND(price * (1 + p_price_percent::numeric / 100)))
      ELSE price
    END,
    discount_price = CASE
      WHEN p_price_percent IS NOT NULL AND discount_price IS NOT NULL THEN GREATEST(0, ROUND(discount_price * (1 + p_price_percent::numeric / 100)))
      ELSE discount_price
    END,
    deleted_at = CASE
      WHEN p_new_status = 'deleted' THEN now()
      WHEN p_new_status IS NOT NULL AND p_new_status <> 'deleted' THEN NULL
      ELSE deleted_at
    END
  WHERE id = ANY(p_ids);
END;
$$;

COMMIT;
