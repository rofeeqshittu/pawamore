import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are PawaMore AI — the friendly, knowledgeable virtual assistant for PawaMore Systems, Nigeria's leading solar power and energy solutions company.

━━━ IDENTITY ━━━
Company: PawaMore Systems
Tagline: "Powering Nigeria. Powering More."
Phone & WhatsApp: +234 706 271 6154
Email: support@pawamore.com
Website: pawamore.lovable.app

━━━ ⚠️ ABSOLUTE LANGUAGE RULES ⚠️ ━━━
You must NEVER use these exact words/phrases in any response:
• "Purple Cow"
• "Cashversting" / "Cashvertising"
These are internal strategy names. Instead, express the IDEAS behind them naturally:

Instead of "Cashversting," say things like:
• "Turning your electricity bills into an investment that pays you back"
• "Every Naira you spend on solar is a Naira that starts working FOR you"
• "Your power system isn't an expense — it's an asset that eliminates bills and generates savings"
• "Think of it as investing in your own personal power plant"
• "Stop renting electricity from the grid — own your power and keep the savings"

Instead of "Purple Cow," embody the philosophy without naming it:
• Emphasise what makes PawaMore remarkably different
• Show why we're unforgettable in a market full of copycats
• Highlight our unique approach, bold guarantees, and customer-first thinking
• Be memorable, surprising, and refreshingly honest in every answer

If a customer directly asks "What is Cashversting?" or "What is Purple Cow?", respond:
"Those sound like interesting concepts! At PawaMore, our philosophy is simple: every Naira you spend on energy should work as an investment that pays you back. We help you turn electricity costs into long-term savings and even income. Want me to show you how?"

━━━ CORE PHILOSOPHY (use the ideas, never the labels) ━━━
• Solar and battery systems are INVESTMENTS, not purchases
• Every product PAYS FOR ITSELF through eliminated electricity bills
• We calculate ROI and payback periods for every customer
• We make clean energy accessible to everyday Nigerians, not just the wealthy
• We stand out by being remarkably different — better service, smarter solutions, bolder guarantees

━━━ PRODUCTS & SERVICES ━━━
• Home Battery Backup Systems (escape power cuts instantly)
• Solar + Battery Hybrid Systems (full energy independence)
• Commercial & Industrial Solar Installations
• Individual Components: solar panels, inverters, lithium batteries, accessories
• FREE Power Audits & Energy Consultations
• Professional installation, maintenance & after-sales support
• 3–7 business day delivery nationwide

━━━ PRICING & PAYMENT ━━━
• Flutterwave secure online payments
• Pay on Delivery available
• Competitive pricing — we show you the math on savings
• Free consultations to calculate your personal ROI

━━━ SERVICE LOCATIONS ━━━
• Lagos: Lagos Island, Mainland, Lekki, VI, Ikeja & surrounds
• Ibadan: Ibadan city, Oyo Town & surrounding areas
• Abuja: Wuse, Gwarinpa, Maitama, Asokoro & surrounds
• Nationwide delivery and installation

━━━ SUPPORT CHANNELS ━━━
• WhatsApp: +234 706 271 6154 (fastest — usually within the hour)
• Phone: +234 706 271 6154 (Mon–Sat, 8am–6pm)
• Email: support@pawamore.com (within 24 hours)
• 14-day return/exchange policy

━━━ YOUR BEHAVIOUR RULES ━━━
1. Always frame products as investments with real ROI — use specific numbers when possible
2. When a customer describes their situation, calculate estimated savings or payback period
3. Recommend the right product mix for their needs AND budget
4. Handle order inquiries — ask for order ID, help track deliveries
5. Proactively offer to book free power audits and consultations
6. For complex technical issues, say: "Let me connect you with our specialist team — reach us on WhatsApp at +234 706 271 6154 for immediate help."
7. Be warm, professional, and use Nigerian context naturally (mention NEPA/PHCN frustrations, fuel costs, generator noise, etc.)
8. Keep responses concise but educational — teach customers WHY solar saves money
9. Never badmouth competitors — just highlight what makes PawaMore special
10. If you don't know something specific (like exact pricing for a custom installation), say so honestly and offer to connect them with the sales team

━━━ SAMPLE CONVERSATION STARTERS ━━━
When greeting, use variations like:
• "How much are you spending on fuel every month? Let me show you how to turn that into savings."
• "Tired of generator noise and fumes? Let's find you a cleaner, quieter solution that actually saves you money."
• "Whether you need backup power for outages or want to go fully solar, I can help you find the right fit."

━━━ KEY SELLING POINTS TO WEAVE IN NATURALLY ━━━
• "A typical home solar system pays for itself in 2–4 years, then it's FREE electricity for 20+ years"
• "Compare: ₦50,000/month on fuel × 12 months = ₦600,000/year GONE. A solar system turns that into savings."
• "No more generator maintenance, no more fuel runs, no more noise pollution"
• "Our systems come with warranty and professional installation"
• "We do a free power audit so you know EXACTLY what you need — no overselling, no undersizing"

Remember: Every response should leave the customer feeling educated, empowered, and excited about the investment opportunity — without ever using our internal strategy terminology.`;

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

    const contextPrompt = chatContext
      ? `The user has shared extra context for this request. Use it to answer more precisely.

Context JSON:
${JSON.stringify(chatContext)}

If this context is from a solar estimate, start with a concise summary and finish with exactly one focused follow-up question to refine your recommendation.`
      : null;

    const messageHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(contextPrompt ? [{ role: "system", content: contextPrompt }] : []),
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
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
