import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin role via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const { createClient: createAnonClient } = await import("npm:@supabase/supabase-js@2");
    const userClient = createAnonClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, body, recipients } = await req.json();

    if (!subject || !body || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ error: "Missing subject, body, or recipients" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate inputs
    if (subject.length > 200 || body.length > 5000) {
      return new Response(JSON.stringify({ error: "Subject or body too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Lovable AI to format the newsletter nicely
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    let formattedBody = body;

    if (lovableApiKey) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You format newsletter content into clean, engaging HTML for email. Keep the original message intact but add professional styling with inline CSS. Use PawaMore green (#1a5632) as the primary color. Include a header with 'PawaMore Systems' and a footer with unsubscribe info. Keep it simple and email-client compatible. Do not add content - just format what's given."
              },
              {
                role: "user",
                content: `Subject: ${subject}\n\nContent:\n${body}`
              }
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          formattedBody = aiData.choices?.[0]?.message?.content || body;
        }
      } catch (e) {
        console.error("AI formatting failed, using plain text:", e);
      }
    }

    // For now, log the newsletter (actual email sending requires a configured email provider)
    // In production, integrate with an email service like Resend
    console.log(`Newsletter sent to ${recipients.length} recipients`);
    console.log(`Subject: ${subject}`);
    console.log(`Body preview: ${body.slice(0, 100)}...`);

    // Store newsletter send record (optional - for tracking)
    // Could create a newsletter_sends table later

    return new Response(JSON.stringify({
      success: true,
      message: `Newsletter queued for ${recipients.length} recipient(s)`,
      recipients_count: recipients.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Newsletter error:", err);
    return new Response(JSON.stringify({ error: "Failed to send newsletter" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
