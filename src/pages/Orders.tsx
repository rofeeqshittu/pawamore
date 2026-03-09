import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChevronDown, ChevronUp, Printer, CreditCard, Truck, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  confirmed: "bg-primary/20 text-primary",
  processing: "bg-primary/20 text-primary",
  shipped: "bg-primary/30 text-primary",
  delivered: "bg-primary/40 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handlePrint = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const items = order.order_items || [];
    const paymentLabel = order.payment_method === "flutterwave" ? "Online Payment" : "Pay on Delivery";
    const paymentStatus = order.payment_status === "paid" ? "✅ Paid" : "⏳ Pending";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Receipt - Order #${order.id.slice(0, 8)}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #1a5632; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #1a5632; font-size: 24px; }
        .header p { color: #666; font-size: 12px; margin-top: 4px; }
        .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
        .meta div { }
        .meta strong { display: block; font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; padding: 8px; border-bottom: 2px solid #ddd; font-size: 12px; color: #888; text-transform: uppercase; }
        td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        .total-row td { border-top: 2px solid #1a5632; font-weight: bold; font-size: 15px; }
        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .paid { background: #d4edda; color: #155724; }
        .pending { background: #fff3cd; color: #856404; }
        @media print { body { padding: 20px; } }
      </style>
      </head><body>
      <div class="header">
        <h1>PawaMore Systems</h1>
        <p>Your Energy Partner — pawamore.lovable.app</p>
      </div>
      <div class="meta">
        <div><strong>Order ID</strong>#${order.id.slice(0, 8)}</div>
        <div><strong>Date</strong>${new Date(order.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</div>
        <div><strong>Payment</strong>${paymentLabel}<br/><span class="badge ${order.payment_status === "paid" ? "paid" : "pending"}">${paymentStatus}</span></div>
      </div>
      <div style="margin-bottom:16px;font-size:13px;">
        <strong style="font-size:11px;color:#888;text-transform:uppercase;display:block;margin-bottom:4px;">Delivery To</strong>
        ${order.shipping_name}<br/>${order.shipping_address}, ${order.shipping_city}${order.shipping_state ? ", " + order.shipping_state : ""}<br/>${order.shipping_phone}
      </div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>
          ${items.map((i: any) => `<tr><td>${i.product_name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">₦${Number(i.unit_price).toLocaleString()}</td><td style="text-align:right">₦${(Number(i.unit_price) * i.quantity).toLocaleString()}</td></tr>`).join("")}
          <tr class="total-row"><td colspan="3">Total</td><td style="text-align:right">₦${Number(order.total_amount).toLocaleString()}</td></tr>
        </tbody>
      </table>
      <div class="footer">
        <p>Thank you for choosing PawaMore Systems!</p>
        <p>For support: WhatsApp +234 706 271 6154</p>
      </div>
      <script>window.print();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (!user) return <Layout><div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><p>Please log in.</p><Link to="/login"><Button variant="amber">Login</Button></Link></div></Layout>;

  return (
    <Layout>
      <div className="container py-8 sm:py-12 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6">My Orders</h1>
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet.</p>
            <Link to="/products"><Button variant="amber">Start Shopping →</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="w-full p-4 flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="font-display font-bold">₦{Number(order.total_amount).toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
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
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                      {order.status}
                    </span>
                    {expanded === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expanded === order.id && (
                  <div className="border-t border-border p-4 bg-secondary/30">
                    <p className="text-xs text-muted-foreground mb-2">Delivery: {order.shipping_name}, {order.shipping_address}, {order.shipping_city}</p>
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between py-1.5 text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="font-semibold">₦{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-border flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handlePrint(order)} className="gap-2">
                        <Printer className="w-3.5 h-3.5" /> Print Receipt
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
