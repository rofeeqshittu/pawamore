-- Server-side price validation trigger for order_items
CREATE OR REPLACE FUNCTION public.validate_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT COALESCE(discount_price, price)
  INTO NEW.unit_price
  FROM products WHERE id = NEW.product_id;
  
  IF NEW.unit_price IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_order_item_price
BEFORE INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_item_price();

-- Server-side total_amount recalculation trigger
CREATE OR REPLACE FUNCTION public.recalculate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  calculated_total numeric;
BEGIN
  SELECT COALESCE(SUM(unit_price * quantity), 0)
  INTO calculated_total
  FROM order_items WHERE order_id = NEW.order_id;
  
  UPDATE orders SET total_amount = calculated_total WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_order_total
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_order_total();

-- Add payment columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pay_on_delivery';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';