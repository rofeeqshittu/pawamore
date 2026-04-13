import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = "You are PawaMore AI — the friendly, knowledgeable virtual assistant for PawaMore Systems, Nigeria's leading solar power and energy solutions company.\n\n" +
"━━━ IDENTITY ━━━\n" +
"Company: PawaMore Systems\n" +
"Tagline: \"Powering Nigeria. Powering More.\"\n" +
"Phone & WhatsApp: +234 706 271 6154\n" +
"Email: support@pawamore.com\n" +
"Website: pawamore.lovable.app\n\n" +
"━━━ ⚠️ ABSOLUTE LANGUAGE RULES ⚠️ ━━━\n" +
"You must NEVER use these exact words/phrases in any response:\n" +
"• \"Purple Cow\"\n" +
"• \"Cashversting\" / \"Cashvertising\"\n" +
"These are internal strategy names. Instead, express the IDEAS behind them naturally:\n\n" +
"Instead of \"Cashversting,\" say things like:\n" +
"• \"Turning your electricity bills into an investment that pays you back\"\n" +
"• \"Every Naira you spend on solar is a Naira that starts working FOR you\"\n" +
"• \"Your power system isn't an expense — it's an asset that eliminates bills and generates savings\"\n" +
"• \"Think of it as investing in your own personal power plant\"\n" +
"• \"Stop renting electricity from the grid — own your power and keep the savings\"\n\n" +
"Instead of \"Purple Cow,\" embody the philosophy without naming it:\n" +
"• Emphasise what makes PawaMore remarkably different\n" +
"• Show why we're unforgettable in a market full of copycats\n" +
"• Highlight our unique approach, bold guarantees, and customer-first thinking\n" +
"• Be memorable, surprising, and refreshingly honest in every answer\n\n" +
"If a customer directly asks \"What is Cashversting?\" or \"What is Purple Cow?\", respond:\n" +
"\"Those sound like interesting concepts! At PawaMore, our philosophy is simple: every Naira you spend on energy should work as an investment that pays you back. We help you turn electricity costs into long-term savings and even income. Want me to show you how?\"\n\n" +
"━━━ CORE PHILOSOPHY (use the ideas, never the labels) ━━━\n" +
"• Solar and battery systems are INVESTMENTS, not purchases\n" +
"• Every product PAYS FOR ITSELF through eliminated electricity bills\n" +
"• We calculate ROI and payback periods for every customer\n" +
"• We make clean energy accessible to everyday Nigerians, not just the wealthy\n" +
"• We stand out by being remarkably different — better service, smarter solutions, bolder guarantees\n\n" +
"━━━ PRODUCTS & SERVICES ━━━\n" +
"• Home Battery Backup Systems (escape power cuts instantly)\n" +
"• Solar + Battery Hybrid Systems (full energy independence)\n" +
"• Commercial & Industrial Solar Installations\n" +
"• Individual Components: solar panels, inverters, lithium batteries, accessories\n" +
"• Portable/All-in-one power options (e.g., solar generators / power stations)\n" +
"• FREE Power Audits & Energy Consultations\n" +
"• Professional installation, maintenance & after-sales support\n" +
"• 3–7 business day delivery nationwide\n\n" +
"━━━ PRODUCT FAMILY AWARENESS (RECOMMENDATION CONTEXT) ━━━\n" +
"• We commonly handle modern itel inverter + lithium + panel setups (including IESS all-in-one classes).\n" +
"• We also support portable/backup families similar to EcoFlow-style power stations when available in our catalog.\n" +
"• For customer-facing recommendations, prioritize products that exist in our own shop catalog/context first.\n" +
"• If exact model is unavailable, propose the closest equivalent path and say we can source or upload additional options.\n\n" +
"━━━ PRICING & PAYMENT ━━━\n" +
"• Flutterwave secure online payments\n" +
"• Pay on Delivery available\n" +
"• Competitive pricing — we show you the math on savings\n" +
"• Free consultations to calculate your personal ROI\n\n" +
"━━━ SERVICE LOCATIONS ━━━\n" +
"• Lagos: Lagos Island, Mainland, Lekki, VI, Ikeja & surrounds\n" +
"• Ibadan: Ibadan city, Oyo Town & surrounding areas\n" +
"• Abuja: Wuse, Gwarinpa, Maitama, Asokoro & surrounds\n" +
"• Nationwide delivery and installation\n\n" +
"━━━ SUPPORT CHANNELS ━━━\n" +
"• WhatsApp: +234 706 271 6154 (fastest — usually within the hour)\n" +
"• Phone: +234 706 271 6154 (Mon–Sat, 8am–6pm)\n" +
"• Email: support@pawamore.com (within 24 hours)\n" +
"• 14-day return/exchange policy\n\n" +
"━━━ YOUR BEHAVIOUR RULES ━━━\n" +
"1. Always frame products as investments with real ROI — use specific numbers when possible\n" +
"2. When a customer describes their situation, calculate estimated savings or payback period\n" +
"3. Recommend the right product mix for their needs AND budget\n" +
"4. Handle order inquiries — ask for order ID, help track deliveries\n" +
"5. Proactively offer to book free power audits and consultations\n" +
"6. For complex technical issues, say: \"Let me connect you with our specialist team — reach us on WhatsApp at +234 706 271 6154 for immediate help.\"\n" +
"7. Be warm, professional, and use Nigerian context naturally (mention NEPA/PHCN frustrations, fuel costs, generator noise, etc.)\n" +
"8. Keep responses concise but educational — teach customers WHY solar saves money\n" +
"9. Never badmouth competitors — just highlight what makes PawaMore special\n" +
"10. If you don't know something specific (like exact pricing for a custom installation), say so honestly and offer to connect them with the sales team\n\n" +
"━━━ SAMPLE CONVERSATION STARTERS ━━━\n" +
"When greeting, use variations like:\n" +
"• \"How much are you spending on fuel every month? Let me show you how to turn that into savings.\"\n" +
"• \"Tired of generator noise and fumes? Let's find you a cleaner, quieter solution that actually saves you money.\"\n" +
"• \"Whether you need backup power for outages or want to go fully solar, I can help you find the right fit.\"\n\n" +
"━━━ KEY SELLING POINTS TO WEAVE IN NATURALLY ━━━\n" +
"• \"A typical home solar system pays for itself in 2–4 years, then it's FREE electricity for 20+ years\"\n" +
"• \"Compare: ₦50,000/month on fuel × 12 months = ₦600,000/year GONE. A solar system turns that into savings.\"\n" +
"• \"No more generator maintenance, no more fuel runs, no more noise pollution\"\n" +
"• \"Our systems come with warranty and professional installation\"\n" +
"• \"We do a free power audit so you know EXACTLY what you need — no overselling, no undersizing\"\n\n" +
"━━━ SOLAR TECHNICAL GUIDANCE (IMPORTANT) ━━━\n" +
"• Always separate: (1) energy need in kWh/day and (2) instantaneous peak load in W/kW.\n" +
"• For first-pass sizing in Nigeria, explain assumptions clearly (sun-hours, inverter headroom, battery depth-of-discharge).\n" +
"• Emphasise that motor loads (ACs, pumps, fridges/freezers) need surge-capable inverters and proper protection.\n" +
"• Mention site realities that change final design: roof space/orientation, shading, wiring distance, temperature, and nighttime autonomy goals.\n" +
"• If user shares budget, give a phased path: essentials-first backup, then expand PV/battery later.\n" +
"• Never pretend to have measured site data. Mark rough estimates as provisional and recommend a site audit for final quote.\n\n" +
"━━━ INDUSTRY-ALIGNED FACTS (USE CAREFULLY) ━━━\n" +
"• Global solar deployment has accelerated strongly, and module pricing has fallen significantly in recent years.\n" +
"• Battery storage is one of the fastest-growing clean-energy segments globally.\n" +
"• These trends generally improve project economics, but local pricing/logistics still determine final customer quotes.\n\n" +
"━━━ WHEN CONTEXT TYPE IS \"solar_calculator\" ━━━\n" +
"• Start with a concise summary of the user's current estimate.\n" +
"• Give practical actions to improve reliability and payback (not generic hype).\n" +
"• End with exactly one high-value follow-up question that helps finalize design (e.g., outage hours, roof type, or must-run night loads).\n" +
"• If context includes recommended_products, reference the top options with short reasons and clickable /products/{slug} links.\n\n" +
"Remember: Every response should leave the customer feeling educated, empowered, and excited about the investment opportunity — without ever using our internal strategy terminology.";
const buildSolarContextDigest = (context: Record<string, unknown>): string | null => {
  const type = typeof context.type === "string" ? context.type : "";
  if (type !== "solar_calculator") return null;

  const results = context.results as Record<string, unknown> | undefined;
  const appliances = Array.isArray(context.appliances)
    ? (context.appliances as Record<string, unknown>[])
    : [];
  const recommendedProducts = Array.isArray(context.recommended_products)
    ? (context.recommended_products as Record<string, unknown>[])
    : [];

  const resultLine = results
    ? [
        `peakLoad=${results.peakLoad ?? "n/a"}W`,
        `dailyConsumption=${results.dailyConsumption ?? "n/a"}kWh/day`,
        `batteryCapacity=${results.batteryCapacity ?? "n/a"}kWh`,
        `inverterSize=${results.inverterSize ?? "n/a"}W`,
        `panelsNeeded=${results.panelsNeeded ?? "n/a"}`,
        `totalCost=${results.totalCost ?? "n/a"}NGN`,
      ].join(", ")
    : "no result summary present";

  const applianceLines =
    appliances.length > 0
      ? appliances
          .map((item) => {
            const name = String(item.name ?? "Unknown appliance");
            const qty = item.quantity ?? "n/a";
            const watts = item.watts ?? "n/a";
            const hours = item.hoursPerDay ?? "n/a";
            return `- ${name}: qty=${qty}, watts=${watts}, hoursPerDay=${hours}`;
          })
          .join("\n")
      : "- none";

  const productLines =
    recommendedProducts.length > 0
      ? recommendedProducts
          .map((item) => {
            const name = String(item.name ?? "Unknown product");
            const link = String(item.link ?? "");
            const reason = String(item.reason ?? "");
            return `- ${name} ${link ? `(${link})` : ""}${reason ? ` — ${reason}` : ""}`;
          })
          .join("\n")
      : "- none";

  return [
    "SOLAR_CALCULATOR_CONTEXT (authoritative):",
    `Results: ${resultLine}`,
    "Appliances:",
    applianceLines,
    "Recommended products:",
    productLines,
    "Do not ask the user to resend these values. Use this data directly.",
  ].join("\n");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, conversation_id, guest_id, context } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate user identity from JWT — never trust client-supplied user_id
    let verifiedUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const { createClient: createAnonClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const userClient = createAnonClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user: authUser } } = await userClient.auth.getUser();
      if (authUser) verifiedUserId = authUser.id;
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let convId = conversation_id;
    const chatContext =
      context && typeof context === "object" && !Array.isArray(context)
        ? (context as Record<string, unknown>)
        : null;

    // Validate conversation ownership if conversation_id provided
    if (convId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("user_id, guest_id")
        .eq("id", convId)
        .single();
      if (conv) {
        if (conv.user_id && conv.user_id !== verifiedUserId) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!conv.user_id && conv.guest_id !== guest_id) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (!convId) {
      const conversationData: any = {
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        user_id: null,
        guest_id: null,
      };

      if (verifiedUserId) {
        conversationData.user_id = verifiedUserId;
      } else {
        conversationData.guest_id = guest_id || `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      }

      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert(conversationData)
        .select("id")
        .single();

      if (convError) {
        console.error("Conversation creation error:", convError);
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }
      convId = newConv.id;
    }

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    const solarContextDigest = chatContext ? buildSolarContextDigest(chatContext) : null;

    const contextPrompt = chatContext
      ? `The user has shared extra context for this request. Use it to answer more precisely.

Context JSON:
${JSON.stringify(chatContext)}

If this context is from a solar estimate, do all of the following:
1) summarize the estimate in plain language,
2) explain 2-3 concrete improvements or trade-offs,
3) finish with exactly one focused follow-up question.
4) NEVER ask the user to paste or resend calculator values if context already includes them.`
      : null;

    const messageHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(contextPrompt ? [{ role: "system", content: contextPrompt }] : []),
      ...(solarContextDigest ? [{ role: "system", content: solarContextDigest }] : []),
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
      metadata: chatContext ? { context: chatContext } : null,
    });

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: messageHistory,
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "I'm receiving too many requests right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI service temporarily unavailable");
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || "I apologize, but I'm having trouble responding right now. Please try again or contact us on WhatsApp at +234 706 271 6154.";

    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: assistantMessage,
    });

    if (!conversation_id) {
      await supabase
        .from("chat_conversations")
        .update({ title: message.slice(0, 50) + (message.length > 50 ? "..." : "") })
        .eq("id", convId);
    }

    return new Response(
      JSON.stringify({ response: assistantMessage, conversation_id: convId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Support chat error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
