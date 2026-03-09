import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, CreditCard, Truck } from "lucide-react";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pay_on_delivery" | "flutterwave">("pay_on_delivery");
  const [flwPublicKey, setFlwPublicKey] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", state: "", notes: "" });

  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: f.email || user.email || "" }));
  }, [user]);

  useEffect(() => {
    supabase.functions.invoke("get-flutterwave-key").then(({ data }) => {
      if (data?.publicKey) setFlwPublicKey(data.publicKey);
    });
  }, []);

  if (!user) {
    sessionStorage.setItem("intendedPath", "/checkout");
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p>Please log in to continue.</p>
          <Link to="/login"><Button variant="amber">Login</Button></Link>
        </div>
      </Layout>
    );
  }
  if (items.length === 0) return <Layout><div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><ShoppingCart className="w-12 h-12 text-muted-foreground/30" /><p className="text-muted-foreground">Your cart is empty.</p><Link to="/products"><Button variant="amber">Browse Products</Button></Link></div></Layout>;

  const createOrder = async () => {
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      total_amount: total,
      shipping_name: form.name,
      shipping_phone: form.phone,
      shipping_address: form.address,
      shipping_city: form.city,
      shipping_state: form.state || null,
      notes: form.notes || null,
      payment_method: paymentMethod,
    } as any).select("id").single();
    if (error) throw error;

    const orderItems = items.map(item => {
      const p = (item as any).products;
      return {
        order_id: order.id,
        product_id: item.product_id,
        product_name: p?.name || "Product",
        quantity: item.quantity,
        unit_price: p?.discount_price || p?.price || 0,
      };
    });
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;
    return order.id;
  };

  const handleFlutterwavePayment = async (orderId: string) => {
    // Load Flutterwave inline script
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => {
      const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
      if (!FlutterwaveCheckout) {
        toast({ title: "Payment failed to load", variant: "destructive" });
        return;
      }
      FlutterwaveCheckout({
        public_key: flwPublicKey,
        tx_ref: `PAWA-${orderId}-${Date.now()}`,
        amount: total,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: {
          email: form.email || user.email,
          phone_number: form.phone,
          name: form.name,
        },
        customizations: {
          title: "PawaMore Systems",
          description: `Order #${orderId.slice(0, 8)}`,
          logo: window.location.origin + "/favicon.png",
        },
        callback: async (response: any) => {
          // Verify payment server-side
          const { data } = await supabase.functions.invoke("verify-payment", {
            body: { transaction_id: response.transaction_id, order_id: orderId },
          });
          if (data?.success) {
            await clearCart();
            toast({ title: "Payment successful! 🎉", description: "Your order has been confirmed." });
            navigate("/orders");
          } else {
            toast({ title: "Payment verification failed", description: "Please contact support.", variant: "destructive" });
          }
        },
        onclose: () => {
          toast({ title: "Payment window closed", description: "Your order is saved. You can pay later from Orders." });
          navigate("/orders");
        },
      });
    };
    document.body.appendChild(script);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (paymentMethod === "flutterwave" && !form.email) {
      toast({ title: "Email is required for online payment", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const orderId = await createOrder();

      if (paymentMethod === "flutterwave") {
        await handleFlutterwavePayment(orderId);
        setSubmitting(false);
      } else {
        await clearCart();
        toast({ title: "Order placed successfully! 🎉", description: "We'll contact you shortly to confirm." });
        navigate("/orders");
      }
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-6 sm:py-8 lg:py-12 max-w-3xl px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-4 sm:mb-6 text-center">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <h2 className="font-display font-bold text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">Delivery Details</h2>
            <div className="grid grid-cols-1 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Full Name *</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1 block">Phone Number *</label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" /></div>
                <div><label className="text-sm font-medium mb-1 block">City *</label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" /></div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Email {paymentMethod === "flutterwave" ? "*" : ""}</label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required={paymentMethod === "flutterwave"} className="min-h-[44px] text-sm sm:text-base" /></div>
              <div><label className="text-sm font-medium mb-1 block">Delivery Address *</label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" /></div>
              <div><label className="text-sm font-medium mb-1 block">State</label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="min-h-[44px] text-sm sm:text-base" /></div>
              <div><label className="text-sm font-medium mb-1 block">Notes (optional)</label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="min-h-[88px] text-sm sm:text-base resize-y" /></div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setPaymentMethod("pay_on_delivery")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "pay_on_delivery" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"}`}>
                <Truck className={`w-6 h-6 ${paymentMethod === "pay_on_delivery" ? "text-accent" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-display font-bold text-sm">Pay on Delivery</p>
                  <p className="text-xs text-muted-foreground">Cash or bank transfer</p>
                </div>
              </button>
              <button type="button" onClick={() => setPaymentMethod("flutterwave")} disabled={!flwPublicKey}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "flutterwave" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"} ${!flwPublicKey ? "opacity-50 cursor-not-allowed" : ""}`}>
                <CreditCard className={`w-6 h-6 ${paymentMethod === "flutterwave" ? "text-accent" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-display font-bold text-sm">Pay Online</p>
                  <p className="text-xs text-muted-foreground">Card, bank transfer, USSD</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
            {items.map(item => {
              const p = (item as any).products;
              const unitPrice = p?.discount_price || p?.price || 0;
              return (
                <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm">{p?.name} × {item.quantity}</span>
                  <span className="text-sm font-semibold">₦{(Number(unitPrice) * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 mt-2">
              <span className="font-display font-bold">Total</span>
              <span className="font-display font-extrabold text-primary text-lg">₦{total.toLocaleString()}</span>
            </div>
          </div>

          <Button variant="amber" size="lg" className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Processing..." : paymentMethod === "flutterwave" ? "Pay Now →" : "Place Order →"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {paymentMethod === "flutterwave" 
              ? "You'll be redirected to a secure payment page powered by Flutterwave."
              : "You'll receive a confirmation call/WhatsApp. Payment on delivery or via bank transfer."}
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Checkout;
