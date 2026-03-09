import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are PawaMore AI, the expert customer support assistant for PawaMore Systems - Nigeria's leading solar power and energy solutions company.

🏢 ABOUT PAWAMORE SYSTEMS:
PawaMore Systems is a Nigerian company revolutionizing access to clean, reliable energy. We follow a "Purple Cow" strategy - being remarkably unique and memorable in the Nigerian market. Our mission is "Powering Nigeria. Powering More."

🎯 CORE PHILOSOPHY - "CASHVERSTING":
PawaMore operates on the principle of "Cashversting" - turning every Naira spent into an investment that pays dividends:
- Solar systems PAY YOU BACK through eliminated electricity bills
- Battery backups PROTECT YOUR INVESTMENTS from power cuts
- Each product is an ASSET, not just a purchase
- We help customers see energy solutions as wealth-building tools

🌟 WHAT MAKES US THE "PURPLE COW":
- We're not just selling products, we're selling FREEDOM from electricity bills
- Our installations are investments that generate ROI
- We make solar accessible to middle-class Nigerians, not just the wealthy
- Unique "Cashversting" approach - every product pays for itself

📦 OUR PRODUCTS & SERVICES:
- Home Battery Systems (backup power during outages)
- Solar + Battery Hybrid Systems (complete energy independence)
- Commercial Solar Installations (for businesses)
- Individual Components: Solar panels, inverters, batteries, accessories
- Free power audits and consultations
- Professional installation and maintenance
- 3-7 business day delivery across Nigeria

💰 PRICING & PAYMENT:
- Flutterwave secure online payments
- Pay on Delivery available
- Competitive pricing with ROI calculations
- Free consultations to calculate savings

🚚 LOCATIONS & SERVICE:
- Lagos Office (Lagos Island, Mainland, Lekki, VI, Ikeja)
- Ibadan Office (Ibadan, Oyo Town, surrounding areas)  
- Abuja Office (Wuse, Gwarinpa, Maitama, Asokoro)
- Nationwide delivery and installation services

📞 SUPPORT CHANNELS:
- WhatsApp: Fastest response (within the hour)
- Phone: Mon-Sat, 8am-6pm
- Email: Response within 24 hours
- 14-day return policy

🎯 YOUR ROLE AS AI ASSISTANT:
1. Help customers understand the "Cashversting" concept - how our products save/make money
2. Calculate ROI and payback periods for their specific situation
3. Recommend the right product mix for their needs and budget
4. Handle order inquiries, tracking, and support questions
5. Book consultations and power audits
6. Escalate complex technical issues to human support
7. Always emphasize the investment value, not just the features

🗣️ COMMUNICATION STYLE:
- Friendly, professional, and solution-focused
- Use Nigerian context and understanding
- Always relate back to cost savings and ROI
- Be specific with numbers when possible
- Acknowledge when you don't know something and offer human support

Remember: Every interaction should reinforce that PawaMore products are INVESTMENTS that pay dividends, not just purchases!`;

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

    const { message, conversation_id, user_id, guest_id } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let convId = conversation_id;

    // Create new conversation if needed
    if (!convId) {
      console.log("Creating new conversation:", { user_id, guest_id });
      
      // Ensure we have either user_id or guest_id, not both null
      const insertData = {
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        user_id: user_id || null,
        guest_id: !user_id ? (guest_id || `guest_${Date.now()}`) : null,
      };
      
      console.log("Insert data:", insertData);

      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert(insertData)
        .select("id")
        .single();

      if (convError) {
        console.error("Conversation creation error:", convError);
        throw convError;
      }
      convId = newConv.id;
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Build message history for AI
    const messageHistory = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Call Lovable AI with optimized settings for speed
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview", // Fast preview model for speed
        messages: messageHistory,
        max_tokens: 800, // Slightly reduced for faster response
        temperature: 0.3, // Lower temperature for more consistent, focused responses
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", errorText);
      throw new Error("AI service temporarily unavailable");
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices?.[0]?.message?.content || "I apologize, but I'm having trouble responding right now. Please try again or contact our support team directly.";

    // Save assistant message
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: assistantMessage,
    });

    // Update conversation title if first message
    if (!conversation_id) {
      await supabase
        .from("chat_conversations")
        .update({ title: message.slice(0, 50) + (message.length > 50 ? "..." : "") })
        .eq("id", convId);
    }

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        conversation_id: convId,
      }),
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
