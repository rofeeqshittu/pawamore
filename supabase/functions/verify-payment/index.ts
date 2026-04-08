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
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: authUser } } = await userClient.auth.getUser();

    // Allow authenticated users or guest orders verified by ownership below
    const { transaction_id, order_id } = await req.json();

    if (!transaction_id || !order_id) {
      return new Response(JSON.stringify({ error: "Missing transaction_id or order_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify order ownership: authenticated user must own the order, or it's a guest order
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: order } = await adminClient.from("orders").select("user_id, guest_email").eq("id", order_id).single();
    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // If order has a user_id, the caller must be that user
    if (order.user_id && (!authUser || authUser.id !== order.user_id)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secretKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
    if (!secretKey) {
      return new Response(JSON.stringify({ error: "Payment not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify with Flutterwave
    const verifyRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const verifyData = await verifyRes.json();

    const supabase = adminClient;

    if (verifyData.status === "success" && verifyData.data?.status === "successful") {
      // Validate that the transaction reference matches the order to prevent fraud
      const txRef = verifyData.data?.tx_ref || "";
      if (!txRef.startsWith(`PAWA-${order_id}-`)) {
        return new Response(JSON.stringify({ error: "Transaction does not match order" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("orders").update({
        payment_status: "paid",
        payment_reference: String(transaction_id),
        payment_method: "flutterwave",
        status: "confirmed",
      }).eq("id", order_id);

      return new Response(JSON.stringify({ success: true, message: "Payment verified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      await supabase.from("orders").update({
        payment_status: "failed",
        payment_reference: String(transaction_id),
      }).eq("id", order_id);

      return new Response(JSON.stringify({ success: false, message: "Payment verification failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
