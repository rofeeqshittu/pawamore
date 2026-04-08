import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChevronDown, ChevronUp, Printer, CreditCard, Truck, XCircle, Download, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  confirmed: "bg-primary/20 text-primary",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-primary/30 text-primary",
  delivered: "bg-primary/40 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

const BRAND = {
  name: "PawaMore Systems",
  tagline: "Your Trusted Energy Partner",
  url: "pawamore.lovable.app",
  whatsapp: "+234 706 271 6154",
  email: "support@pawamore.com",
  primaryColor: "#1a5632",
  accentColor: "#e8940a",
};

function buildReceiptHTML(order: any) {
  const items = order.order_items || [];
  const paymentLabel = order.payment_method === "flutterwave" ? "Online Payment" : "Pay on Delivery";
  const paymentBadge = order.payment_status === "paid"
    ? `<span style="background:#d4edda;color:#155724;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">✅ Paid</span>`
    : `<span style="background:#fff3cd;color:#856404;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">⏳ Pending</span>`;

  const statusLabel = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  const itemRows = items.map((i: any) =>
    `<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:13px;">${i.product_name}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#666;">${i.quantity}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;color:#666;">₦${Number(i.unit_price).toLocaleString()}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;font-weight:600;">₦${(Number(i.unit_price) * i.quantity).toLocaleString()}</td>
    </tr>`
  ).join("");

  const orderDate = new Date(order.created_at).toLocaleDateString("en-NG", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Receipt — Order #${order.id.slice(0, 8).toUpperCase()}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f5f5f5; color:#1a1a1a; }
  .receipt { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,${BRAND.primaryColor} 0%,#2d7a4a 100%); padding:28px 24px; text-align:center; }
  .header h1 { color:#fff; font-size:22px; letter-spacing:0.5px; }
  .header p { color:rgba(255,255,255,0.75); font-size:12px; margin-top:4px; }
  .status-banner { text-align:center; padding:20px 24px 8px; }
  .status-badge { display:inline-block; padding:5px 16px; border-radius:20px; font-size:13px; font-weight:700; }
  .info-grid { margin:0 24px; background:#f9fafb; border-radius:12px; overflow:hidden; }
  .info-cell { padding:14px 16px; }
  .info-label { font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
  .info-value { font-size:13px; font-weight:600; color:#333; }
  .info-sub { font-size:12px; color:#666; margin-top:2px; }
  table.items { width:100%; border-collapse:collapse; margin:0; }
  table.items th { padding:10px 8px; text-align:left; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:1px; border-bottom:2px solid #eee; background:#f9fafb; }
  .total-row td { padding:14px 8px; border-top:2px solid ${BRAND.primaryColor}; font-weight:700; font-size:15px; color:${BRAND.primaryColor}; }
  .footer { text-align:center; padding:28px 24px; }
  .footer p { font-size:13px; color:#888; margin-bottom:8px; }
  .cta { display:inline-block; background:${BRAND.accentColor}; color:#fff; text-decoration:none; padding:10px 24px; border-radius:8px; font-size:13px; font-weight:700; }
  .note-box { margin:12px 24px 0; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px 16px; }
  .note-label { font-size:10px; color:#92400e; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
  .note-text { font-size:12px; color:#78350f; }
  @media print {
    body { background:#fff; }
    .receipt { box-shadow:none; border-radius:0; }
    .no-print { display:none !important; }
  }
</style>
</head><body>
<div class="receipt">
  <div class="header">
    <h1>${BRAND.name}</h1>
    <p>${BRAND.tagline} — ${BRAND.url}</p>
  </div>

  <div class="status-banner">
    <span class="status-badge" style="background:${order.status === "cancelled" ? "#f8d7da" : "#e8f5e9"};color:${order.status === "cancelled" ? "#721c24" : BRAND.primaryColor};">
      ${statusLabel}
    </span>
    <h2 style="font-size:17px;margin:10px 0 2px;color:#333;">Order #${order.id.slice(0, 8).toUpperCase()}</h2>
  </div>

  <div style="padding:16px 24px;">
    <div class="info-grid">
      <div style="display:flex;flex-wrap:wrap;">
        <div class="info-cell" style="flex:1;min-width:140px;border-bottom:1px solid #eee;border-right:1px solid #eee;">
          <div class="info-label">Date</div>
          <div class="info-value">${orderDate}</div>
        </div>
        <div class="info-cell" style="flex:1;min-width:140px;border-bottom:1px solid #eee;">
          <div class="info-label">Payment</div>
          <div class="info-value">${paymentLabel}</div>
          <div style="margin-top:4px;">${paymentBadge}</div>
        </div>
      </div>
      <div class="info-cell">
        <div class="info-label">Delivery To</div>
        <div class="info-value">${order.shipping_name}</div>
        <div class="info-sub">${order.shipping_address}, ${order.shipping_city}${order.shipping_state ? ", " + order.shipping_state : ""}</div>
        <div class="info-sub">📞 ${order.shipping_phone}</div>
      </div>
    </div>
  </div>

  <div style="padding:0 24px 16px;">
    <div style="border:1px solid #eee;border-radius:12px;overflow:hidden;">
      <table class="items">
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Price</th>
            <th style="text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3">Total</td>
            <td style="text-align:right;font-size:17px;">₦${Number(order.total_amount).toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  ${order.notes ? `<div class="note-box"><div class="note-label">Order Notes</div><div class="note-text">${order.notes}</div></div>` : ""}

  <div class="footer">
    <p style="font-weight:600;color:#333;">Thank you for choosing ${BRAND.name}! 💚</p>
    <p>Questions? WhatsApp us</p>
    <a href="https://wa.me/2347062716154" class="cta no-print">WhatsApp Us →</a>
    <p style="font-size:11px;color:#bbb;margin-top:16px;">${BRAND.email} · ${BRAND.url}</p>
  </div>
</div>
<script>window.onload=function(){window.print();}</script>
</body></html>`;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sendingReceipt, setSendingReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(id, product_name, quantity, unit_price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" as any })
      .eq("id", orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
      toast({ title: "Order cancelled", description: "Your order has been cancelled." });
      // Send cancellation receipt - don't await to avoid blocking UI
      sendReceiptEmail(orderId).catch(console.error);
    } else {
      toast({ title: "Failed to cancel", description: error.message, variant: "destructive" });
    }
  };

  const handlePrint = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(buildReceiptHTML(order));
    printWindow.document.close();
  };

  const sendReceiptEmail = async (orderId: string) => {
    setSendingReceipt(orderId);
    try {
      const { data, error } = await supabase.functions.invoke("send-order-receipt", {
        body: { order_id: orderId },
      });
      if (error) throw error;
      toast({ title: "Receipt sent! 📧", description: `Sent to ${data?.email || "your email"}` });
    } catch (err: any) {
      toast({ title: "Couldn't send receipt", description: err.message, variant: "destructive" });
    } finally {
      setSendingReceipt(null);
    }
  };

  const getProgressIndex = (status: string) => statusSteps.indexOf(status);

  if (!user) return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Please log in to view your orders.</p>
        <Link to="/login"><Button variant="amber">Login</Button></Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container py-6 sm:py-8 lg:py-12 max-w-3xl px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-4 sm:mb-6">My Orders</h1>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet.</p>
            <Link to="/shop"><Button variant="amber">Start Shopping →</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isExpanded = expanded === order.id;
              const progressIdx = getProgressIndex(order.status);
              const isCancelled = order.status === "cancelled";

              return (
                <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden transition-shadow hover:shadow-sm">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="w-full p-4 flex items-center justify-between text-left min-h-[72px]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="font-display font-bold text-sm sm:text-base">₦{Number(order.total_amount).toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {order.payment_method === "flutterwave" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><CreditCard className="w-3 h-3" /> Online</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Truck className="w-3 h-3" /> COD</span>
                        )}
                        {order.payment_status === "paid" && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Paid</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                        {order.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Progress Tracker */}
                      {!isCancelled && (
                        <div className="px-4 pt-4 pb-2">
                          <div className="flex items-center justify-between mb-1">
                            {statusSteps.map((step, i) => (
                              <div key={step} className="flex flex-col items-center flex-1">
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                                  i <= progressIdx
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-muted-foreground"
                                }`}>
                                  {i <= progressIdx ? "✓" : i + 1}
                                </div>
                                <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 capitalize text-center leading-tight">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex mt-1 mx-3">
                            {statusSteps.slice(0, -1).map((_, i) => (
                              <div key={i} className={`flex-1 h-1 rounded-full mx-0.5 ${
                                i < progressIdx ? "bg-primary" : "bg-secondary"
                              }`} />
                            ))}
                          </div>
                        </div>
                      )}

                      {isCancelled && (
                        <div className="mx-4 mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-center">
                          <p className="text-sm text-destructive font-semibold">❌ This order has been cancelled</p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="p-4 space-y-2">
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Items</p>
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between py-1.5 text-xs sm:text-sm">
                            <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                            <span className="font-semibold">₦{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 mt-1 border-t border-dashed border-border">
                          <span className="font-display font-bold text-sm">Total</span>
                          <span className="font-display font-extrabold text-primary text-sm sm:text-base">₦{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="px-4 pb-3">
                        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Delivery</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {order.shipping_name} · {order.shipping_phone}<br />
                          {order.shipping_address}, {order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ""}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="p-4 pt-2 border-t border-border flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePrint(order)} className="gap-1.5 min-h-[40px] text-xs">
                          <Printer className="w-3.5 h-3.5" /> Print Receipt
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendReceiptEmail(order.id)}
                          disabled={sendingReceipt === order.id}
                          className="gap-1.5 min-h-[40px] text-xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {sendingReceipt === order.id ? "Sending..." : "Email Receipt"}
                        </Button>
                        {(order.status === "pending" || order.status === "confirmed") && (
                          <Button variant="destructive" size="sm" onClick={() => cancelOrder(order.id)} className="gap-1.5 min-h-[40px] text-xs ml-auto">
                            <XCircle className="w-3.5 h-3.5" /> Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
