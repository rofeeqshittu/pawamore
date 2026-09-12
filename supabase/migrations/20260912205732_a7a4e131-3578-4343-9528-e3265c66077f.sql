CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.db_keepalive (
  id integer PRIMARY KEY DEFAULT 1,
  last_ping timestamptz NOT NULL DEFAULT now(),
  ping_count bigint NOT NULL DEFAULT 0,
  CONSTRAINT db_keepalive_single_row CHECK (id = 1)
);

INSERT INTO public.db_keepalive (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.db_keepalive TO anon, authenticated;
GRANT ALL ON public.db_keepalive TO service_role;

ALTER TABLE public.db_keepalive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read keepalive" ON public.db_keepalive;
CREATE POLICY "Anyone can read keepalive"
ON public.db_keepalive
FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.db_keepalive_ping()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.db_keepalive
  SET last_ping = now(), ping_count = ping_count + 1
  WHERE id = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.db_keepalive_ping() FROM PUBLIC, anon, authenticated;