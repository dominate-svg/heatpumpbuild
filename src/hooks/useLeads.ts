import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EstimateResults, Assumptions } from '@/lib/calculations';
import type { Tariff } from '@/hooks/useTariffs';

interface LeadInput {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
  address: string;
  postcode?: string;
  uprn?: string;
  epcLmkKey?: string;
}

interface EstimateInput {
  leadId: string;
  results: EstimateResults;
  assumptions: Assumptions;
  inputs: {
    scop: number;
    tariff: Tariff | null;
    currentFuel: string;
    propertyType?: string;
    region?: string;
    locationAdder: string;
    cylinderOption: string;
  };
}

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          estimates (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LeadInput) => {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone,
          consent: input.consent,
          address: input.address,
          postcode: input.postcode,
          uprn: input.uprn,
          epc_lmk_key: input.epcLmkKey,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EstimateInput) => {
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          lead_id: input.leadId,
          floor_area_m2: input.results.floorArea,
          annual_heat_kwh: input.results.annualHeatKwh,
          heat_loss_kw: input.results.heatLossKw,
          baseline_cost: input.results.baselineCost,
          hp_electric_kwh: input.results.hpElectricKwh,
          hp_cost: input.results.hpCost,
          annual_savings: input.results.annualSavings,
          scop: input.inputs.scop,
          tariff: input.inputs.tariff?.name || 'unknown',
          install_base: input.results.installBase,
          adders_json: input.results.adders,
          grant_applied: input.results.grantApplied,
          install_price_final: input.results.netInstallPrice,
          gas_rate: input.assumptions.gas_rate,
          cosy_blended_rate: input.assumptions.cosy_blended_rate,
          electricity_rate: input.assumptions.electricity_rate,
          boiler_efficiency: input.assumptions.boiler_efficiency,
          full_load_hours: input.assumptions.full_load_hours,
          current_fuel: input.inputs.currentFuel,
          property_type: input.inputs.propertyType,
          region: input.inputs.region,
          // Radiator contribution fields
          selected_radiators: input.results.radiatorsUpgraded,
          radiator_delta: input.results.radiatorAdder,
          raw_customer_contribution: input.results.rawCustomerContribution,
          customer_contribution: input.results.customerContribution,
          base_customer_contribution: input.assumptions.base_customer_contribution,
          included_radiators: input.assumptions.included_radiators,
          rad_upgrade_cost: input.assumptions.rad_upgrade_cost,
          min_customer_contribution: input.assumptions.min_customer_contribution,
          // Efficiency-driven data
          efficiency_selected: input.results.efficiencySelected,
          extra_rads: input.results.extraRads,
          radiator_adder: input.results.radiatorAdder,
          // New savings engine fields
          tariff_id: input.results.tariffId,
          tariff_peak_rate: input.results.tariffPeakRate,
          tariff_offpeak_rate: input.results.tariffOffpeakRate,
          heat_demand_kwh: input.results.annualHeatKwh,
          current_heating_cost: input.results.baselineCost,
          weighted_rate: input.results.weightedRate,
          offpeak_share_used: input.results.offpeakShareUsed,
          heat_demand_source: input.results.heatDemandSource,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
