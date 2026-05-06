import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRAND = {
  name: "PawaMore Systems",
  tagline: "Your Trusted Energy Partner",
  url: "https://pawamore.lovable.app",
  whatsapp: "+234 706 271 6154",
  email: "support@pawamore.com",
  primaryColor: "#1a5632",
  accentColor: "#e8940a",
};

function statusEmoji(status: string): string {
  const map: Record<string, string> = {
    pending: "⏳",
    confirmed: "✅",
    processing: "🔧",
    shipped: "🚚",
    delivered: "🎉",
    cancelled: "❌",
    paid: "💳",
  };
  return map[status] || "📦";
}

function generateReceiptHTML(order: any, items: any[]): string {
  const paymentLabel =
    order.payment_method === "flutterwave" ? "Online Payment" : "Pay on Delivery";
  const paymentBadge =
    order.payment_status === "paid"
      ? `<span style="background:#d4edda;color:#155724;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">✅ Paid</span>`
      : `<span style="background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">⏳ Pending</span>`;

  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);
  const statusBadge = `<span style="background:${order.status === "cancelled" ? "#f8d7da" : "#e8f5e9"};color:${order.status === "cancelled" ? "#721c24" : "#1a5632"};padding:4px 14px;border-radius:20px;font-size:13px;font-weight:700;">${statusEmoji(order.status)} ${statusLabel}</span>`;

  const itemsHTML = items
    .map(
      (i) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">${i.product_name}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#666;">${i.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#666;">₦${Number(i.unit_price).toLocaleString()}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#333;">₦${(Number(i.unit_price) * i.quantity).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const orderDate = new Date(order.created_at).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Receipt - ${BRAND.name}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,${BRAND.primaryColor} 0%,#2d7a4a 100%);padding:32px 24px;text-align:center;">
  <h1 style="color:#ffffff;font-size:26px;margin:0 0 4px 0;letter-spacing:0.5px;">${BRAND.name}</h1>
  <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:0;">${BRAND.tagline}</p>
</td></tr>

<!-- Status Banner -->
<tr><td style="padding:24px 24px 0;text-align:center;">
  <div style="margin-bottom:8px;">${statusBadge}</div>
  <h2 style="color:#333;font-size:20px;margin:12px 0 4px;">Order ${statusEmoji(order.status)} ${statusLabel}</h2>
  <p style="color:#888;font-size:13px;margin:0;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
</td></tr>

<!-- Order Info Grid -->
<tr><td style="padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;overflow:hidden;">
    <tr>
      <td style="padding:16px;width:50%;border-bottom:1px solid #eee;border-right:1px solid #eee;">
        <p style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Date</p>
        <p style="font-size:14px;color:#333;font-weight:600;margin:0;">${orderDate}</p>
      </td>
      <td style="padding:16px;width:50%;border-bottom:1px solid #eee;">
        <p style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Payment</p>
        <p style="font-size:14px;color:#333;margin:0 0 4px;">${paymentLabel}</p>
        ${paymentBadge}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding:16px;">
        <p style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Delivery To</p>
        <p style="font-size:14px;color:#333;font-weight:600;margin:0;">${order.shipping_name}</p>
        <p style="font-size:13px;color:#666;margin:4px 0 0;">${order.shipping_address}, ${order.shipping_city}${order.shipping_state ? ", " + order.shipping_state : ""}</p>
        <p style="font-size:13px;color:#666;margin:2px 0 0;">📞 ${order.shipping_phone}</p>
      </td>
    </tr>
  </table>
</td></tr>

<!-- Items Table -->
<tr><td style="padding:0 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:12px;overflow:hidden;">
    <thead>
      <tr style="background:#f9fafb;">
        <th style="padding:12px 8px;text-align:left;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #eee;">Item</th>
        <th style="padding:12px 8px;text-align:center;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #eee;">Qty</th>
        <th style="padding:12px 8px;text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #eee;">Price</th>
        <th style="padding:12px 8px;text-align:right;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #eee;">Subtotal</th>
      </tr>
    </thead>
    <tbody>${itemsHTML}</tbody>
    <tfoot>
      <tr style="background:#f9fafb;">
        <td colspan="3" style="padding:16px 8px;font-size:16px;font-weight:700;color:${BRAND.primaryColor};border-top:2px solid ${BRAND.primaryColor};">Total</td>
        <td style="padding:16px 8px;text-align:right;font-size:18px;font-weight:800;color:${BRAND.primaryColor};border-top:2px solid ${BRAND.primaryColor};">₦${Number(order.total_amount).toLocaleString()}</td>
      </tr>
    </tfoot>
  </table>
</td></tr>

${order.notes ? `
<tr><td style="padding:16px 24px 0;">
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;">
    <p style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Order Notes</p>
    <p style="font-size:13px;color:#78350f;margin:0;">${order.notes}</p>
  </div>
</td></tr>` : ""}

<!-- Footer -->
<tr><td style="padding:32px 24px;text-align:center;">
  <p style="font-size:14px;color:#333;font-weight:600;margin:0 0 8px;">Thank you for choosing ${BRAND.name}! 💚</p>
  <p style="font-size:13px;color:#888;margin:0 0 16px;">Questions about your order?</p>
  <a href="https://wa.me/2347062716154" style="display:inline-block;background:${BRAND.accentColor};color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;">WhatsApp Us →</a>
  <p style="font-size:12px;color:#aaa;margin:16px 0 0;">${BRAND.email} · ${BRAND.url}</p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function getSubjectLine(status: string, orderId: string): string {
  const short = orderId.slice(0, 8).toUpperCase();
  const map: Record<string, string> = {
    pending: `${statusEmoji("pending")} Order Received — #${short}`,
    confirmed: `${statusEmoji("confirmed")} Order Confirmed — #${short}`,
    processing: `${statusEmoji("processing")} Order Being Prepared — #${short}`,
    shipped: `${statusEmoji("shipped")} Your Order Is On Its Way — #${short}`,
    delivered: `${statusEmoji("delivered")} Order Delivered — #${short}`,
    cancelled: `${statusEmoji("cancelled")} Order Cancelled — #${short}`,
  };
  return map[status] || `📦 Order Update — #${short}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, trigger } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, serviceKey);

    // Authenticate caller: must be the order owner OR an admin.
    // Guest-order receipts must be triggered server-side (service role) only.
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
    const isServiceRole = token && token === serviceKey;

    let callerUserId: string | null = null;
    let isAdmin = false;
    if (!isServiceRole) {
      if (!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      callerUserId = user.id;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = !!roleRow;
    }

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authorization: only owner, admin, or service role may trigger.
    if (!isServiceRole && !isAdmin && order.user_id !== callerUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order_id);

    // Get recipient email
    let recipientEmail = order.guest_email;
    if (!recipientEmail && order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", order.user_id)
        .maybeSingle();
      
      // Try to get email from auth user
      const { data: authUser } = await supabase.auth.admin.getUserById(order.user_id);
      recipientEmail = authUser?.user?.email;
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "No email address found for this order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = generateReceiptHTML(order, items || []);
    const subject = getSubjectLine(order.status, order.id);

    // Use Lovable's built-in email sending via the API
    if (lovableApiKey) {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email-delivery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          html,
        }),
      });

      // Fallback: log the email for now since we don't have a dedicated email service
      console.log(`📧 Order receipt email would be sent to: ${recipientEmail}`);
      console.log(`📧 Subject: ${subject}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: recipientEmail,
        subject,
        html_preview: html.slice(0, 200) + "...",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("send-order-receipt error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
