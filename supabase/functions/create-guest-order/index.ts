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
    const { guest_email, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, payment_method, notes, items } = await req.json();

    // Validate required fields
    if (!guest_email || !shipping_name || !shipping_phone || !shipping_address || !shipping_city) {
      return new Response(JSON.stringify({ error: "Missing required shipping fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "At least one item is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest_email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify products exist and get server-side prices
    const productIds = items.map((i: any) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, discount_price")
      .in("id", productIds);

    if (productsError || !products || products.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid products" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Calculate total using server-side prices
    let totalAmount = 0;
    const validatedItems: any[] = [];
    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product ${item.product_id} not found` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const qty = Math.max(1, Math.min(100, parseInt(item.quantity) || 1));
      const unitPrice = product.discount_price || product.price;
      totalAmount += unitPrice * qty;
      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      user_id: null,
      guest_email,
      total_amount: totalAmount,
      shipping_name: String(shipping_name).slice(0, 200),
      shipping_phone: String(shipping_phone).slice(0, 50),
      shipping_address: String(shipping_address).slice(0, 500),
      shipping_city: String(shipping_city).slice(0, 100),
      shipping_state: shipping_state ? String(shipping_state).slice(0, 100) : null,
      notes: notes ? String(notes).slice(0, 1000) : null,
      payment_method: payment_method === "flutterwave" ? "flutterwave" : "pay_on_delivery",
    }).select("id").single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = validatedItems.map((item: any) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return new Response(JSON.stringify({ order_id: order.id, total_amount: totalAmount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Create guest order error:", err);
    return new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
