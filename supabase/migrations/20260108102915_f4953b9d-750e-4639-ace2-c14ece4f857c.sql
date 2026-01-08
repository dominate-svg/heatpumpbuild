-- Assumptions table for admin-configurable values
CREATE TABLE public.assumptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value NUMERIC NOT NULL,
  label TEXT NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default assumptions
INSERT INTO public.assumptions (key, value, label, unit) VALUES
  ('gas_rate', 0.07, 'Gas rate', '£/kWh'),
  ('boiler_efficiency', 0.88, 'Boiler efficiency', ''),
  ('cosy_blended_rate', 0.18, 'Cosy blended rate', '£/kWh'),
  ('electricity_rate', 0.24, 'Electricity rate', '£/kWh'),
  ('full_load_hours', 2000, 'Full load hours', 'hours'),
  ('bus_grant_value', 7500, 'BUS grant value', '£'),
  ('install_base_3_5kw', 8500, 'Install base (≤5kW)', '£'),
  ('install_base_5_8kw', 9500, 'Install base (5-8kW)', '£'),
  ('install_base_8_12kw', 11000, 'Install base (8-12kW)', '£'),
  ('install_base_12_16kw', 13000, 'Install base (12-16kW)', '£'),
  ('adder_location_6m', 250, 'Location adder (6m)', '£'),
  ('adder_location_9m', 600, 'Location adder (9m)', '£'),
  ('adder_cylinder_150l', 1150, 'New 150L cylinder', '£'),
  ('adder_cylinder_210l', 1700, 'New 210L cylinder', '£');

-- Enable RLS on assumptions (admin only)
ALTER TABLE public.assumptions ENABLE ROW LEVEL SECURITY;

-- Leads table for storing contact information
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  consent BOOLEAN NOT NULL DEFAULT false,
  address TEXT NOT NULL,
  postcode TEXT,
  uprn TEXT,
  epc_lmk_key TEXT
);

-- Enable RLS on leads (admin only)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Estimates table for storing calculation snapshots
CREATE TABLE public.estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  floor_area_m2 NUMERIC,
  annual_heat_kwh NUMERIC,
  heat_loss_kw NUMERIC,
  baseline_cost NUMERIC,
  hp_electric_kwh NUMERIC,
  hp_cost NUMERIC,
  annual_savings NUMERIC,
  scop NUMERIC,
  tariff TEXT,
  install_base NUMERIC,
  adders_json JSONB DEFAULT '{}',
  grant_applied NUMERIC,
  install_price_final NUMERIC,
  gas_rate NUMERIC,
  cosy_blended_rate NUMERIC,
  electricity_rate NUMERIC,
  boiler_efficiency NUMERIC,
  full_load_hours NUMERIC,
  current_fuel TEXT,
  property_type TEXT,
  region TEXT
);

-- Enable RLS on estimates (admin only)
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- Analytics events table (placeholder)
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'
);

-- Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Assumptions: Anyone can read, only admins can modify
CREATE POLICY "Anyone can read assumptions" ON public.assumptions FOR SELECT USING (true);
CREATE POLICY "Admins can update assumptions" ON public.assumptions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Leads: Only admins can read/write
CREATE POLICY "Admins can read leads" ON public.leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);

-- Estimates: Only admins can read, anyone can insert (linked to leads)
CREATE POLICY "Admins can read estimates" ON public.estimates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Anyone can insert estimates" ON public.estimates FOR INSERT WITH CHECK (true);

-- Analytics: Anyone can insert, admins can read
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read analytics" ON public.analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for assumptions updated_at
CREATE TRIGGER update_assumptions_updated_at
  BEFORE UPDATE ON public.assumptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();