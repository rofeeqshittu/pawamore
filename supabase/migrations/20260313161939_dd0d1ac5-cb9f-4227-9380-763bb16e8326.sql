
-- Create brands table
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Everyone can view brands
CREATE POLICY "Brands viewable by everyone" ON public.brands FOR SELECT TO public USING (true);

-- Admins can manage brands
CREATE POLICY "Admins can manage brands" ON public.brands FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Add brand_id to products
ALTER TABLE public.products ADD COLUMN brand_id UUID REFERENCES public.brands(id);

-- Seed initial brands
INSERT INTO public.brands (name, slug) VALUES
  ('EcoFlow', 'ecoflow'),
  ('Itel Energy', 'itel-energy'),
  ('Felicity Solar', 'felicity-solar'),
  ('Luminous', 'luminous'),
  ('Bluetti', 'bluetti'),
  ('Growatt', 'growatt'),
  ('Victron', 'victron'),
  ('SunKing', 'sunking'),
  ('Fibon', 'fibon'),
  ('Fidelity', 'fidelity');
