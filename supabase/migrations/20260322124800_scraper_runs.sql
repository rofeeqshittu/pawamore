-- Create scraper_runs table to track AI product scraping jobs
CREATE TABLE public.scraper_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'success', 'error')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  error_message TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS — only admins can read/write scraper runs
ALTER TABLE public.scraper_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scraper runs"
  ON public.scraper_runs
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Keep updated_at current on every change
CREATE TRIGGER update_scraper_runs_updated_at
  BEFORE UPDATE ON public.scraper_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for quick queries from the admin UI (latest runs first)
CREATE INDEX idx_scraper_runs_status ON public.scraper_runs(status, created_at);
