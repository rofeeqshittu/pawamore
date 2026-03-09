import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, CreditCard, Truck, AlertTriangle } from "lucide-react";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [flwLoading, setFlwLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pay_on_delivery" | "flutterwave">("pay_on_delivery");
  const [flwPublicKey, setFlwPublicKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    address: "", 
    city: "", 
    state: "", 
    notes: "" 
  });

  // Pre-fill form from user profile
  useEffect(() => {
    if (!user) return;
    
    setProfileLoading(true);
    setForm(f => ({ ...f, email: f.email || user.email || "" }));
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name, phone, address, city, state")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (error) {
          console.warn("Profile fetch warning:", error.message);
          return;
        }
        
        if (data) {
          setForm(f => ({
            ...f,
            name: f.name || data.display_name || "",
            phone: f.phone || data.phone || "",
            address: f.address || data.address || "",
            city: f.city || data.city || "",
            state: f.state || data.state || "",
          }));
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to load profile data");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchFlwKey = async () => {
      setFlwLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("get-flutterwave-key");
        if (error) {
          console.warn("Flutterwave key fetch error:", error);
        } else if (data?.publicKey) {
          setFlwPublicKey(data.publicKey);
        }
      } catch (err) {
        console.error("Flutterwave fetch error:", err);
      } finally {
        setFlwLoading(false);
      }
    };

    fetchFlwKey();
  }, []);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner text="Loading checkout..." />
        </div>
      </Layout>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    sessionStorage.setItem("intendedPath", "/checkout");
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="text-xl font-bold">Login Required</h2>
          <p className="text-muted-foreground max-w-sm">
            Please log in to continue with your checkout. Your cart will be preserved.
          </p>
          <Link to="/login">
            <Button variant="amber" size="lg">Login to Continue</Button>
          </Link>
        </div>
      </Layout>
    );
  }
  
  // Show empty cart state
  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground max-w-sm">
            Add some products to your cart before proceeding to checkout.
          </p>
          <Link to="/products">
            <Button variant="amber" size="lg">Browse Products</Button>
          </Link>
        </div>
      </Layout>
    );
  }

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

  const loadFlutterwaveScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).FlutterwaveCheckout) {
        resolve();
        return;
      }
      const existing = document.querySelector('script[src*="flutterwave"]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load payment script"));
      document.head.appendChild(script);
    });
  };

  const handleFlutterwavePayment = async (orderId: string) => {
    try {
      await loadFlutterwaveScript();
    } catch {
      toast({ title: "Payment script failed to load", description: "Please try again or choose Pay on Delivery.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
    if (!FlutterwaveCheckout) {
      toast({ title: "Payment failed to initialize", variant: "destructive" });
      setSubmitting(false);
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
        try {
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
        } catch (err) {
          toast({ title: "Verification error", description: "Your payment may have succeeded. Please check your orders.", variant: "destructive" });
          navigate("/orders");
        }
      },
      onclose: () => {
        toast({ title: "Payment window closed", description: "Your order is saved. You can pay later from Orders." });
        navigate("/orders");
      },
    });
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
    <ErrorBoundary>
      <Layout>
        <div className="container py-6 sm:py-8 lg:py-12 max-w-3xl px-4 sm:px-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-4 sm:mb-6 text-center">Checkout</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}

          {profileLoading && (
            <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg flex items-center gap-3">
              <LoadingSpinner size="sm" />
              <p className="text-muted-foreground text-sm">Loading your profile...</p>
            </div>
          )}

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
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="font-display font-bold text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">Payment Method</h2>
              
              {flwLoading && (
                <div className="mb-4 p-3 bg-muted/30 border border-border rounded-lg flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-muted-foreground">Loading payment options...</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <button type="button" onClick={() => setPaymentMethod("pay_on_delivery")}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left min-h-[60px] ${paymentMethod === "pay_on_delivery" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"}`}>
                  <Truck className={`w-5 sm:w-6 h-5 sm:h-6 flex-shrink-0 ${paymentMethod === "pay_on_delivery" ? "text-accent" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-display font-bold text-sm sm:text-base">Pay on Delivery</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Cash or bank transfer</p>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod("flutterwave")} disabled={!flwPublicKey || flwLoading}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all text-left min-h-[60px] ${paymentMethod === "flutterwave" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground/30"} ${(!flwPublicKey || flwLoading) ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <CreditCard className={`w-5 sm:w-6 h-5 sm:h-6 flex-shrink-0 ${paymentMethod === "flutterwave" ? "text-accent" : "text-muted-foreground"}`} />
                  <div>
                    <p className="font-display font-bold text-sm sm:text-base">Pay Online</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {flwLoading ? "Loading..." : !flwPublicKey ? "Temporarily unavailable" : "Card, bank transfer, USSD"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="font-display font-bold text-base sm:text-lg lg:text-xl mb-3 sm:mb-4">Order Summary</h2>
              <div className="space-y-3 sm:space-y-4">
                {items.map(item => {
                  const p = (item as any).products;
                  const unitPrice = p?.discount_price || p?.price || 0;
                  return (
                    <div key={item.id} className="flex justify-between py-2 border-b border-border last:border-0 min-h-[44px] items-center">
                      <span className="text-xs sm:text-sm pr-2 flex-1 min-w-0 truncate">{p?.name} × {item.quantity}</span>
                      <span className="text-xs sm:text-sm font-semibold flex-shrink-0">₦{(Number(unitPrice) * item.quantity).toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between pt-3 mt-2 border-t min-h-[48px] items-center">
                  <span className="font-display font-bold text-sm sm:text-base">Total</span>
                  <span className="font-display font-extrabold text-primary text-base sm:text-lg">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="amber" 
              size="lg" 
              className="w-full min-h-[48px] sm:min-h-[56px] text-sm sm:text-base" 
              type="submit" 
              disabled={submitting || profileLoading || (paymentMethod === "flutterwave" && !flwPublicKey)}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Processing...
                </span>
              ) : paymentMethod === "flutterwave" ? "Pay Now →" : "Place Order →"}
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
              {paymentMethod === "flutterwave" 
                ? "You'll be redirected to a secure payment page powered by Flutterwave."
                : "You'll receive a confirmation call/WhatsApp. Payment on delivery or via bank transfer."}
            </p>
          </form>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Checkout;
