import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Assumptions } from '@/lib/calculations';

interface AssumptionRow {
  id: string;
  key: string;
  value: number;
  label: string;
  unit: string | null;
}

export function useAssumptions() {
  return useQuery({
    queryKey: ['assumptions'],
    queryFn: async (): Promise<Assumptions> => {
      const { data, error } = await supabase
        .from('assumptions')
        .select('*');

      if (error) throw error;

      const assumptions: Record<string, number> = {};
      (data as AssumptionRow[]).forEach((row) => {
        assumptions[row.key] = Number(row.value);
      });

      return {
        gas_rate: assumptions.gas_rate ?? 0.07,
        boiler_efficiency: assumptions.boiler_efficiency ?? 0.88,
        cosy_blended_rate: assumptions.cosy_blended_rate ?? 0.18,
        electricity_rate: assumptions.electricity_rate ?? 0.24,
        full_load_hours: assumptions.full_load_hours ?? 2000,
        bus_grant_value: assumptions.bus_grant_value ?? 7500,
        install_base_3_5kw: assumptions.install_base_3_5kw ?? 8500,
        install_base_5_8kw: assumptions.install_base_5_8kw ?? 9500,
        install_base_8_12kw: assumptions.install_base_8_12kw ?? 11000,
        install_base_12_16kw: assumptions.install_base_12_16kw ?? 13000,
        adder_location_6m: assumptions.adder_location_6m ?? 250,
        adder_location_9m: assumptions.adder_location_9m ?? 600,
        adder_cylinder_150l: assumptions.adder_cylinder_150l ?? 1150,
        adder_cylinder_210l: assumptions.adder_cylinder_210l ?? 1700,
      };
    },
  });
}

export function useAssumptionsList() {
  return useQuery({
    queryKey: ['assumptions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assumptions')
        .select('*')
        .order('key');

      if (error) throw error;
      return data as AssumptionRow[];
    },
  });
}

export function useUpdateAssumption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: number }) => {
      const { error } = await supabase
        .from('assumptions')
        .update({ value })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assumptions'] });
      queryClient.invalidateQueries({ queryKey: ['assumptions-list'] });
    },
  });
}
