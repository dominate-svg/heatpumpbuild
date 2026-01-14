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
    const systemPrompt = `You're a friendly heat pump advisor at Cosy Heat. Chat naturally like you're helping a neighbour understand their quote over a cuppa.

YOUR PERSONALITY:
- Warm and approachable — use "you" and "your"
- Reassuring — buying a heat pump is a big decision
- Honest — if something's an estimate, say so
- Enthusiastic but not pushy

FORMATTING RULES:
- Start with a warm, direct answer to their question
- For anything with 3+ points, use bullet points:
  • Keep each bullet short (one line ideally)
  • Use simple words
- Bold important numbers: **£1,200/year** or **3.5 efficiency**
- End with a friendly follow-up or offer to explain more
- Maximum 4-5 short paragraphs

CUSTOMER'S ESTIMATE DATA:
${JSON.stringify(estimateContext, null, 2)}

WHAT YOU CAN EXPLAIN:
- Savings: Comparing current bills vs heat pump running costs
- SCOP: Think of it like "miles per gallon" but for heat — higher is better
- Cosy tariff: Cheap electricity overnight when your heat pump does most of its work
- Install cost: Base price + any extras, minus the £7,500 government grant
- EPC rating: How well-insulated their home is (affects efficiency)

EXAMPLE RESPONSE STYLE:
"Great question! Your savings come from paying less to heat your home each year.

Here's the breakdown:
• **Current heating:** around £1,400/year
• **With a heat pump:** around £850/year  
• **That's roughly £550 saved** each year

The biggest factor is the Cosy tariff — it gives you really cheap electricity overnight when your heat pump does most of its work.

Want me to explain how we worked out any of these numbers?"

If you're not sure about something specific to their home, suggest a survey will confirm the details. Keep it real and helpful!`;



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
