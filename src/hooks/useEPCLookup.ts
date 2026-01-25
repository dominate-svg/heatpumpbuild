import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EPCData } from '@/lib/calculations';

interface EPCResponse {
  rows?: Array<{
    address: string;
    postcode: string;
    uprn?: string;
    'lmk-key'?: string;
    'heating-cost-current'?: string;
    'total-floor-area'?: string;
    'main-fuel'?: string;
    'property-type'?: string;
    'built-form'?: string;
    'construction-age-band'?: string;
    'hotwater-description'?: string;
    'local-authority'?: string;
    'current-energy-rating'?: string;
    'space-heating-demand'?: string;
  }>;
}

export function useEPCLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupAddress = async (postcode: string, address?: string): Promise<EPCData[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('epc-lookup', {
        body: { postcode, address },
      });

      if (fnError) throw fnError;

      const response = data as EPCResponse;
      
      if (!response.rows || response.rows.length === 0) {
        return null;
      }

      return response.rows.map((row) => ({
        address: row.address || '',
        postcode: row.postcode || postcode,
        uprn: row.uprn,
        lmkKey: row['lmk-key'],
        heatingCostCurrent: row['heating-cost-current'] ? parseFloat(row['heating-cost-current']) : undefined,
        totalFloorArea: row['total-floor-area'] ? parseFloat(row['total-floor-area']) : undefined,
        mainFuel: row['main-fuel'],
        propertyType: row['property-type'] || row['built-form'],
        builtForm: row['built-form'],
        constructionAgeBand: row['construction-age-band'],
        hotWaterDescription: row['hotwater-description'],
        region: determineRegion(row['local-authority'] || row.postcode),
        epcBand: row['current-energy-rating'],
        spaceHeatingDemand: row['space-heating-demand'] ? parseFloat(row['space-heating-demand']) : undefined,
      }));
    } catch (err) {
      console.error('EPC lookup error:', err);
      setError('Unable to lookup EPC data. Please enter details manually.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { lookupAddress, loading, error };
}

function determineRegion(localAuthority: string): string {
  // Simplified region detection - in production would use a proper lookup
  const scotlandPrefixes = ['S', 'AB', 'DD', 'DG', 'EH', 'FK', 'G', 'HS', 'IV', 'KA', 'KW', 'KY', 'ML', 'PA', 'PH', 'TD', 'ZE'];
  const niPrefixes = ['BT'];
  
  const prefix = localAuthority?.split(' ')[0]?.toUpperCase() || '';
  
  if (scotlandPrefixes.some(p => prefix.startsWith(p))) return 'Scotland';
  if (niPrefixes.some(p => prefix.startsWith(p))) return 'Northern Ireland';
  if (prefix.startsWith('CF') || prefix.startsWith('LL') || prefix.startsWith('SA') || prefix.startsWith('SY') || prefix.startsWith('NP') || prefix.startsWith('LD')) {
    return 'Wales';
  }
  
  return 'England';
}
