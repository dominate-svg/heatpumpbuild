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
    const systemPrompt = `You are a friendly heat pump advisor for Cosy Heat. Help homeowners understand their estimate.

RESPONSE RULES:
- Keep answers SHORT (2-4 sentences max)
- Use simple everyday language, no jargon
- Use bullet points for lists
- Bold key numbers with **£X** or **X%**
- One idea per paragraph
- If technical, give a simple analogy first

CUSTOMER'S ESTIMATE:
${JSON.stringify(estimateContext, null, 2)}

TOPICS YOU CAN EXPLAIN SIMPLY:
- Heat demand: How much warmth their home needs yearly
- Current costs: What they pay now for heating
- Heat pump costs: Electricity to run it (affected by efficiency + tariff)
- Savings: Current cost minus heat pump cost
- Install price: Base cost + any extras, minus £7,500 grant
- SCOP: Efficiency rating (higher = cheaper to run)
- Cosy tariff: Cheap electricity at night when heat pumps work best

EXAMPLE GOOD RESPONSE:
"Your savings are based on comparing what you pay now vs what you'd pay with a heat pump.

**Current heating:** ~£X/year
**Heat pump:** ~£Y/year
**You'd save:** ~£Z/year

The main factor is your electricity tariff — Cosy gives you cheap rates overnight."

If unsure about something specific, suggest booking a survey. Stay friendly and helpful.`;


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
