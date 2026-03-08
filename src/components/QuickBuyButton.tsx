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

  useEffect(() => {
    if (user?.email) setForm(f => ({ ...f, email: f.email || user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (open && !flwPublicKey) {
      supabase.functions.invoke("get-flutterwave-key").then(({ data }) => {
        if (data?.publicKey) setFlwPublicKey(data.publicKey);
      });
    }
  }, [open]);

  const unitPrice = product.discount_price || product.price;

  const handleQuickBuy = () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.email) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      // Create order with single item
      const { data: order, error } = await supabase.from("orders").insert({
        user_id: user!.id,
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

      // Launch Flutterwave
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.onload = () => {
        const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
        if (!FlutterwaveCheckout) {
          toast({ title: "Payment failed to load", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        setOpen(false);
        FlutterwaveCheckout({
          public_key: flwPublicKey,
          tx_ref: `PAWA-QB-${order.id}-${Date.now()}`,
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
              toast({ title: "Payment successful! 🎉" });
              navigate("/orders");
            } else {
              toast({ title: "Verification failed", variant: "destructive" });
            }
          },
          onclose: () => {
            toast({ title: "Payment window closed", description: "Order saved — pay later from Orders." });
            navigate("/orders");
          },
        });
      };
      document.body.appendChild(script);
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="forest" size={size} onClick={handleQuickBuy} className={`gap-1.5 ${className}`} disabled={!flwPublicKey && !!user}>
        <Zap className="w-3.5 h-3.5" /> Quick Buy
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Quick Buy — {product.name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">₦{Number(unitPrice).toLocaleString()} — Pay instantly with card or bank transfer</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <Input type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Delivery Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
            <Input placeholder="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
            <Button variant="amber" className="w-full" type="submit" disabled={submitting}>
              {submitting ? "Processing..." : `Pay ₦${Number(unitPrice).toLocaleString()} →`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickBuyButton;
