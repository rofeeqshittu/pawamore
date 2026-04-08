import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";

const Cart = () => {
  const { items, loading, authLoading, total, updateQuantity, removeFromCart } = useCart();

  // Show loading spinner while auth is initializing
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </Layout>
    );
  }

  // After auth is ready, if cart is empty and not loading, show empty or login prompt
  if (!loading && items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/products"><Button variant="amber">Browse Products →</Button></Link>
        </div>
      </Layout>
    );
  }

  if (loading) return <Layout><div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading cart...</div></Layout>;

  return (
    <Layout>
      <div className="container py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link to="/products"><Button variant="amber">Browse Products →</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const p = item.products;
                const img = p?.product_images?.find((i) => i.is_primary)?.image_url || p?.product_images?.[0]?.image_url;
                const unitPrice = p?.discount_price ?? p?.price ?? 0;
                return (
                  <div key={item.id} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                    <div className="w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                      {img ? <img src={img} alt={p?.name} className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${p?.slug}`} className="font-display font-bold text-sm hover:text-primary truncate block">{p?.name}</Link>
                      <p className="text-primary font-bold text-sm mt-1">₦{Number(unitPrice).toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-secondary">
                          <Plus className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeFromCart(item.product_id)} className="ml-auto text-destructive hover:bg-destructive/10 p-1.5 rounded-md">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-sm">₦{(Number(unitPrice) * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
              <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-primary font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between mb-6">
                <span className="font-display font-bold">Total</span>
                <span className="font-display font-extrabold text-lg text-primary">₦{total.toLocaleString()}</span>
              </div>
              <Link to="/checkout">
                <Button variant="amber" className="w-full" size="lg">Proceed to Checkout →</Button>
              </Link>
              <Link to="/products" className="block text-center text-sm text-muted-foreground hover:text-primary mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
