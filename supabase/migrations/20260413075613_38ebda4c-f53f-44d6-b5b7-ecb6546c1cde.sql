
-- 1. Add deleted_at column to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- 2. Create trigger function for deleted_at management
CREATE OR REPLACE FUNCTION public.set_deleted_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 3. Attach trigger
DROP TRIGGER IF EXISTS trigger_set_deleted_at ON public.products;
CREATE TRIGGER trigger_set_deleted_at
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_deleted_at();

-- 4. Security: Fix contact_submissions admin policy - change from public to authenticated
DROP POLICY IF EXISTS "Admins can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can manage contact submissions"
ON public.contact_submissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Security: Fix newsletter_subscriptions SELECT policy - change from public to authenticated
DROP POLICY IF EXISTS "Admins can view newsletter subscriptions" ON public.newsletter_subscriptions;
CREATE POLICY "Admins can view newsletter subscriptions"
ON public.newsletter_subscriptions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
