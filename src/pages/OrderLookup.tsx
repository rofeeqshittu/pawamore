import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const OrderLookup = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", orderId: "" });
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  // Pre-fill from URL params if available
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");
    const orderId = urlParams.get("order");
    if (email && orderId) {
      setForm({ email: decodeURIComponent(email), orderId });
    }
  });

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.orderId) {
      toast({ title: "Please fill in both fields", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      // Use the secure lookup function
      const { data: orderData, error: orderError } = await supabase
        .rpc("get_guest_order", {
          p_guest_email: form.email,
          p_order_id: form.orderId
        });

      if (orderError) throw orderError;
      if (!orderData || orderData.length === 0) {
        toast({ title: "Order not found", description: "Please check your email and order ID.", variant: "destructive" });
        return;
      }

      setOrder(orderData[0]);

      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", form.orderId);

      if (itemsError) throw itemsError;
      setOrderItems(itemsData || []);

      toast({ title: "Order found! ✨" });
    } catch (error: any) {
      console.error("Order lookup error:", error);
      toast({ title: "Lookup failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-green-100 text-green-800",
      delivered: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800"
    } as const;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6">
          Order Lookup
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Enter your email and order ID to track your order status
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Your Order
            </CardTitle>
            <CardDescription>
              Check your email for the order confirmation with your Order ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter the email used for your order"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order ID</label>
                <Input
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  placeholder="Order ID from your confirmation email"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full" variant="amber">
                {loading ? "Looking up..." : "Find My Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </span>
                {getStatusBadge(order.status)}
              </CardTitle>
              <CardDescription>
                Order placed on {new Date(order.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order ID:</span>
                  <p className="text-muted-foreground font-mono">{order.id}</p>
                </div>
                <div>
                  <span className="font-medium">Total Amount:</span>
                  <p className="text-muted-foreground">₦{Number(order.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-medium">Payment Method:</span>
                  <p className="text-muted-foreground">{order.payment_method}</p>
                </div>
                <div>
                  <span className="font-medium">Payment Status:</span>
                  <p className="text-muted-foreground">{order.payment_status || "Pending"}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Shipping Address:</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{order.shipping_name}</p>
                  <p>{order.shipping_phone}</p>
                  <p>{order.shipping_address}</p>
                  <p>{order.shipping_city}</p>
                </div>
              </div>

              {orderItems.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Items Ordered:</h4>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>₦{Number(item.unit_price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-muted p-3 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Questions about your order? Contact us at{" "}
                  <a href="mailto:support@pawamore.com" className="text-primary hover:underline">
                    support@pawamore.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default OrderLookup;