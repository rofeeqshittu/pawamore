-- Ensure deleted_at is set when status becomes 'deleted' and cleared when restored

BEGIN;

-- Function to manage deleted_at
CREATE OR REPLACE FUNCTION public.set_deleted_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status = 'deleted') THEN
      NEW.deleted_at := COALESCE(NEW.deleted_at, now());
    ELSE
      NEW.deleted_at := NULL;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.status = 'deleted' AND OLD.status IS DISTINCT FROM 'deleted') THEN
      NEW.deleted_at := COALESCE(NEW.deleted_at, now());
    ELSIF (NEW.status IS DISTINCT FROM 'deleted') THEN
      NEW.deleted_at := NULL;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to products table
DROP TRIGGER IF EXISTS trigger_set_deleted_at ON public.products;
CREATE TRIGGER trigger_set_deleted_at
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at();

COMMIT;