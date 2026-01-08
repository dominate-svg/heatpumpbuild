-- Add new radiator-related assumptions
INSERT INTO public.assumptions (key, label, value, unit) VALUES
  ('base_customer_contribution', 'Base customer contribution', 3000, '£'),
  ('included_radiators', 'Included radiators', 2, 'units'),
  ('rad_upgrade_cost', 'Radiator upgrade cost', 350, '£'),
  ('min_customer_contribution', 'Minimum customer contribution', 2000, '£')
ON CONFLICT (key) DO NOTHING;

-- Add new columns to estimates table for radiator data
ALTER TABLE public.estimates 
  ADD COLUMN IF NOT EXISTS selected_radiators integer,
  ADD COLUMN IF NOT EXISTS radiator_delta numeric,
  ADD COLUMN IF NOT EXISTS raw_customer_contribution numeric,
  ADD COLUMN IF NOT EXISTS customer_contribution numeric,
  ADD COLUMN IF NOT EXISTS base_customer_contribution numeric,
  ADD COLUMN IF NOT EXISTS included_radiators integer,
  ADD COLUMN IF NOT EXISTS rad_upgrade_cost numeric,
  ADD COLUMN IF NOT EXISTS min_customer_contribution numeric;