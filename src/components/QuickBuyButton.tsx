import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface QuickBuyButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    discount_price?: number | null;
    slug?: string;
  };
  size?: "sm" | "default" | "lg";
  className?: string;
}

const QuickBuyButton = ({ product, size = "default", className = "" }: QuickBuyButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [flwPublicKey, setFlwPublicKey] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "" });

  // Pre-fill email from user profile
  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: f.email || user.email || "" }));
  }, [user]);

  // Eagerly fetch FLW key (works for both guests and logged-in users)
  useEffect(() => {
    if (!flwPublicKey) {
      supabase.functions.invoke("get-flutterwave-key").then(({ data }) => {
        if (data?.publicKey) setFlwPublicKey(data.publicKey);
      });
    }
  }, [flwPublicKey]);

  const unitPrice = product.discount_price || product.price;

  const handleQuickBuy = () => {
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.email) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!flwPublicKey) {
      toast({ title: "Payment not configured", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      let orderId: string;

      if (user) {
        // Authenticated user: direct insert
        const { data: order, error } = await supabase.from("orders").insert({
          user_id: user.id,
          total_amount: unitPrice,
          shipping_name: form.name,
          shipping_phone: form.phone,
          shipping_address: form.address,
          shipping_city: form.city,
          payment_method: "flutterwave",
        } as any).select("id").single();
        if (error) throw error;

        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: unitPrice,
        });
        orderId = order.id;
      } else {
        // Guest user: use server-side edge function
        const { data, error } = await supabase.functions.invoke("create-guest-order", {
          body: {
            guest_email: form.email,
            shipping_name: form.name,
            shipping_phone: form.phone,
            shipping_address: form.address,
            shipping_city: form.city,
            payment_method: "flutterwave",
            items: [{ product_id: product.id, quantity: 1 }],
          },
        });
        if (error) throw error;
        orderId = data.order_id;
      }

      // Launch Flutterwave (script might already be loaded)
      const launchFlutterwave = () => {
        const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
        if (!FlutterwaveCheckout) {
          toast({ title: "Payment failed to load", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        setOpen(false);
        FlutterwaveCheckout({
          public_key: flwPublicKey,
          tx_ref: `PAWA-${orderId}-${Date.now()}`,
          amount: unitPrice,
          currency: "NGN",
          payment_options: "card,banktransfer,ussd",
          customer: { email: form.email, phone_number: form.phone, name: form.name },
          customizations: {
            title: "PawaMore Systems",
            description: `Quick Buy: ${product.name}`,
            logo: window.location.origin + "/favicon.png",
          },
          callback: async (response: any) => {
            const { data } = await supabase.functions.invoke("verify-payment", {
              body: { transaction_id: response.transaction_id, order_id: order.id },
            });
            if (data?.success) {
              toast({ title: "Payment successful! 🎉", description: user ? "Check your orders page for details." : "Check your email for order confirmation." });
              if (user) {
                navigate("/orders");
              } else {
                // For guests, show order confirmation or redirect to order lookup
                navigate(`/order-lookup?email=${encodeURIComponent(form.email)}&order=${order.id}`);
              }
            } else {
              toast({ title: "Verification failed", variant: "destructive" });
            }
          },
          onclose: () => {
            toast({ title: "Payment window closed", description: user ? "Order saved — pay later from Orders." : "Order saved — check your email." });
            if (user) {
              navigate("/orders");
            } else {
              navigate(`/order-lookup?email=${encodeURIComponent(form.email)}&order=${order.id}`);
            }
          },
        });
      };

      if ((window as any).FlutterwaveCheckout) {
        launchFlutterwave();
      } else {
        const script = document.createElement("script");
        script.src = "https://checkout.flutterwave.com/v3.js";
        script.onload = launchFlutterwave;
        document.body.appendChild(script);
      }
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="forest"
        size={size}
        onClick={handleQuickBuy}
        className={`gap-1.5 ${className}`}
        disabled={submitting}
      >
        <Zap className="w-3.5 h-3.5" /> Quick Buy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-32px)] mx-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="font-display text-lg sm:text-xl">Quick Buy — {product.name}</DialogTitle>
          </DialogHeader>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
            ₦{Number(unitPrice).toLocaleString()} — Pay instantly with card or bank transfer
            {!user && <span className="block mt-1 text-amber-600">✨ No account needed - checkout as guest!</span>}
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" />
            <Input placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" />
            <Input type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" />
            <Input placeholder="Delivery Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" />
            <Input placeholder="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required className="min-h-[44px] text-sm sm:text-base" />
            <Button variant="amber" className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-base" type="submit" disabled={submitting || !flwPublicKey}>
              {submitting ? "Processing..." : !flwPublicKey ? "Loading payment..." : `Pay ₦${Number(unitPrice).toLocaleString()} →`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickBuyButton;
