import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, estimateContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a detailed system prompt with the estimate context
    const systemPrompt = `You are a helpful heat pump advisor for Cosy Heat. You help homeowners understand their heat pump estimate and answer questions about the calculations.

Here is the customer's estimate context:
${JSON.stringify(estimateContext, null, 2)}

Key things you can explain:
1. **Heat demand**: How we estimate the annual heat needed based on EPC band and floor area
2. **Current heating costs**: How we calculate their existing fuel costs (gas, oil, LPG)
3. **Heat pump running costs**: How SCOP (efficiency) and electricity tariffs affect costs
4. **Savings calculation**: Current cost minus heat pump cost = annual savings
5. **Install costs**: Base installation plus any add-ons (cylinder, pipework location)
6. **BUS grant**: The £7,500 government grant that reduces upfront cost
7. **Tariffs**: Explain Cosy 3-rate tariff and how off-peak electricity helps savings
8. **EPC adjustments**: How poor insulation (EPC E/F/G) reduces heat pump efficiency

Be friendly, concise, and helpful. If you don't know something specific to their property, suggest they book a survey for accurate figures.

Important notes:
- Standing charges are excluded from savings comparisons (they pay them either way)
- For oil homes, we use conservative assumptions as oil prices vary
- SCOP is adjusted down for poorer EPC ratings due to higher flow temperatures needed
- DHW (hot water) runs at lower efficiency than space heating

Keep answers clear and jargon-free. Use £ for money. If asked about something outside heat pumps/estimates, politely redirect to heat pump topics.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("estimate-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
