Recommended RLS and policy snippets for products (apply carefully)

-- Enable RLS on products (run as admin):
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow admins full access (assumes "app_role" claim in JWT)
-- CREATE POLICY "admins_full_access" ON public.products
-- FOR ALL
-- TO authenticated
-- USING (auth.role() = 'admin')
-- WITH CHECK (auth.role() = 'admin');

-- Prevent direct DELETEs by non-admins (only allow soft-delete via update to status)
-- CREATE POLICY "no_hard_delete" ON public.products
-- FOR DELETE
-- TO authenticated
-- USING (false);

-- Allow updates if user is admin (or via a service role) -- adjust condition to your auth claims
-- CREATE POLICY "admins_update" ON public.products
-- FOR UPDATE
-- TO authenticated
-- USING (auth.role() = 'admin')
-- WITH CHECK (auth.role() = 'admin');

-- Alternatively, put more granular checks for service role used by server/edge functions.

Notes:
- RLS requires Supabase/Postgres auth functions to check roles; adapt auth.role() checks to your environment.
- Test policies in a staging environment before applying to production.
