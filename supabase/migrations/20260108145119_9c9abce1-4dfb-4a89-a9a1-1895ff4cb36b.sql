-- Add new assumptions for the upgraded savings engine
INSERT INTO public.assumptions (key, value, label, unit) VALUES
  ('heat_intensity_kwh_per_m2', 110, 'Heat intensity per m²', 'kWh/m²'),
  ('boiler_efficiency_oil', 0.85, 'Boiler efficiency (oil)', '%'),
  ('hp_scop_default', 3.2, 'Default heat pump SCOP', ''),
  ('hp_scop_min', 2.8, 'Minimum heat pump SCOP', ''),
  ('hp_scop_max', 3.6, 'Maximum heat pump SCOP', ''),
  ('hp_aux_factor', 1.05, 'Heat pump auxiliary factor', ''),
  ('offpeak_share_default', 0.55, 'Default off-peak usage share', '%'),
  ('offpeak_share_min', 0.30, 'Minimum off-peak share', '%'),
  ('offpeak_share_max', 0.70, 'Maximum off-peak share', '%'),
  ('oil_rate_p_per_kwh', 10, 'Oil rate (fallback)', 'p/kWh')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, label = EXCLUDED.label, unit = EXCLUDED.unit;

-- Create tariffs table
CREATE TABLE public.tariffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  supplier TEXT NOT NULL,
  peak_rate_p_per_kwh NUMERIC NOT NULL,
  offpeak_rate_p_per_kwh NUMERIC,
  offpeak_hours_per_day NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;

-- Anyone can read active tariffs
CREATE POLICY "Anyone can read tariffs"
ON public.tariffs
FOR SELECT
USING (true);

-- Only admins can modify tariffs
CREATE POLICY "Admins can insert tariffs"
ON public.tariffs
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Admins can update tariffs"
ON public.tariffs
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

CREATE POLICY "Admins can delete tariffs"
ON public.tariffs
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
));

-- Add trigger for updated_at
CREATE TRIGGER update_tariffs_updated_at
BEFORE UPDATE ON public.tariffs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with example tariffs
INSERT INTO public.tariffs (name, supplier, peak_rate_p_per_kwh, offpeak_rate_p_per_kwh, offpeak_hours_per_day, notes, sort_order) VALUES
  ('Heat Pump', 'British Gas', 24, 12, 7, '7 hours off-peak', 1),
  ('Cosy', 'Octopus Energy', 24, 12, 8, '8 hours half price', 2),
  ('Go', 'Octopus Energy', 25, 9, 4, '4 hours super cheap', 3),
  ('Agile', 'Octopus Energy', 28, 28, 0, 'Variable rates', 4),
  ('Heat Pump', 'EDF', 25, 13, 7, '7 hours off-peak', 5),
  ('Next Heat Pump', 'E.ON', 24, 12, 7, '7 hours off-peak', 6),
  ('Heat Pump', 'Scottish Power', 25, 13, 7, '7 hours off-peak', 7),
  ('Price Cap Rate', 'Ofgem', 28, 28, 0, 'Single rate cap', 8);

-- Add new columns to estimates table for storing calculation details
ALTER TABLE public.estimates
ADD COLUMN IF NOT EXISTS tariff_id UUID REFERENCES public.tariffs(id),
ADD COLUMN IF NOT EXISTS tariff_peak_rate NUMERIC,
ADD COLUMN IF NOT EXISTS tariff_offpeak_rate NUMERIC,
ADD COLUMN IF NOT EXISTS heat_demand_kwh NUMERIC,
ADD COLUMN IF NOT EXISTS current_heating_cost NUMERIC,
ADD COLUMN IF NOT EXISTS weighted_rate NUMERIC,
ADD COLUMN IF NOT EXISTS offpeak_share_used NUMERIC,
ADD COLUMN IF NOT EXISTS heat_demand_source TEXT;