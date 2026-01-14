import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Tariff {
  id: string;
  name: string;
  supplier: string;
  peak_rate_p_per_kwh: number;
  offpeak_rate_p_per_kwh: number | null;
  offpeak_hours_per_day: number;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
}

export function useTariffs() {
  return useQuery({
    queryKey: ['tariffs'],
    queryFn: async (): Promise<Tariff[]> => {
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as Tariff[];
    },
  });
}

export function useAllTariffs() {
  return useQuery({
    queryKey: ['tariffs-all'],
    queryFn: async (): Promise<Tariff[]> => {
      const { data, error } = await supabase
        .from('tariffs')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as Tariff[];
    },
  });
}

export function useUpdateTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tariff: Partial<Tariff> & { id: string }) => {
      const { error } = await supabase
        .from('tariffs')
        .update(tariff)
        .eq('id', tariff.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      queryClient.invalidateQueries({ queryKey: ['tariffs-all'] });
    },
  });
}

export function useCreateTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tariff: Omit<Tariff, 'id'>) => {
      const { data, error } = await supabase
        .from('tariffs')
        .insert(tariff)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      queryClient.invalidateQueries({ queryKey: ['tariffs-all'] });
    },
  });
}

export function useDeleteTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tariffs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      queryClient.invalidateQueries({ queryKey: ['tariffs-all'] });
    },
  });
}

// Helper to format tariff display name
export function formatTariffLabel(tariff: Tariff): string {
  const hasOffpeak = tariff.offpeak_hours_per_day > 0 && tariff.offpeak_rate_p_per_kwh !== null;
  
  // Special cases for specific tariff types
  const lowerName = tariff.name.toLowerCase();
  
  // Cosy: 3-rate tariff
  if (lowerName.includes('cosy')) {
    return `${tariff.supplier} — Cosy (3-rate tariff)`;
  }
  
  // Agile: variable/dynamic
  if (lowerName.includes('agile')) {
    return `${tariff.supplier} — Agile (variable)`;
  }
  
  // Price cap: flat rate
  if (lowerName.includes('cap') || lowerName.includes('ofgem')) {
    return `${tariff.supplier} — Price Cap (${tariff.peak_rate_p_per_kwh}p/kWh)`;
  }
  
  // TOU tariffs: show off-peak / peak format
  if (hasOffpeak) {
    return `${tariff.supplier} — ${tariff.name} (${tariff.offpeak_rate_p_per_kwh}p / ${tariff.peak_rate_p_per_kwh}p)`;
  }
  
  // Flat tariffs
  return `${tariff.supplier} — ${tariff.name} (${tariff.peak_rate_p_per_kwh}p/kWh)`;
}
