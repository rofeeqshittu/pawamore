import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a helpful customer support assistant for PawaMore Systems, a Nigerian solar power and battery backup company. 

Your role is to:
1. Answer questions about products (solar panels, inverters, batteries, power solutions)
2. Help with order inquiries and tracking
3. Provide information about services (installation, maintenance, consultation)
4. Guide users to appropriate resources
5. Escalate complex issues to human support when needed

Be friendly, professional, and concise. If you don't know something, acknowledge it and offer to connect the user with human support.

Key information:
- Delivery typically takes 3-7 business days within Nigeria
- We accept Flutterwave payments and Pay on Delivery
- Free power audits and consultations available
- Returns accepted within 14 days
- Installation services available for all products`;

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
      const { data: newConv, error: convError } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: user_id || null,
          guest_id: guest_id || null,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        })
        .select("id")
        .single();

      if (convError) throw convError;
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

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: messageHistory,
        max_tokens: 1024,
        temperature: 0.7,
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
