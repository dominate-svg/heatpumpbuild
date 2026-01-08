-- Update assumptions for new radiator pricing logic
UPDATE public.assumptions SET value = 3000 WHERE key = 'base_customer_contribution';
UPDATE public.assumptions SET value = 2 WHERE key = 'included_radiators';
UPDATE public.assumptions SET value = 200 WHERE key = 'rad_upgrade_cost';

-- Insert if they don't exist
INSERT INTO public.assumptions (key, label, value, unit)
VALUES 
  ('base_customer_contribution', 'Base Customer Contribution', 3000, '£')
ON CONFLICT (key) DO UPDATE SET value = 3000;

INSERT INTO public.assumptions (key, label, value, unit)
VALUES 
  ('included_radiators', 'Base Radiators (at 340%)', 2, 'radiators')
ON CONFLICT (key) DO UPDATE SET value = 2, label = 'Base Radiators (at 340%)';

INSERT INTO public.assumptions (key, label, value, unit)
VALUES 
  ('rad_upgrade_cost', 'Cost Per Extra Radiator', 200, '£')
ON CONFLICT (key) DO UPDATE SET value = 200, label = 'Cost Per Extra Radiator';

-- Add columns to estimates table for storing efficiency-driven data
ALTER TABLE public.estimates 
ADD COLUMN IF NOT EXISTS efficiency_selected numeric,
ADD COLUMN IF NOT EXISTS extra_rads integer,
ADD COLUMN IF NOT EXISTS radiator_adder numeric;