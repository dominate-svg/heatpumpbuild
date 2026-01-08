import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postcode, address } = await req.json();
    const apiKey = Deno.env.get('EPC_API_KEY');

    if (!apiKey) {
      throw new Error('EPC_API_KEY not configured');
    }

    if (!postcode) {
      throw new Error('Postcode is required');
    }

    // Clean postcode
    const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();

    // Build the EPC API URL
    const baseUrl = 'https://epc.opendatacommunities.org/api/v1/domestic/search';
    const params = new URLSearchParams({
      postcode: cleanPostcode,
      size: '50',
    });

    if (address) {
      params.append('address', address);
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ rows: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`EPC API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('EPC lookup error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
