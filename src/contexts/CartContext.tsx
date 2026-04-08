import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products?: {
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    stock_quantity: number;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  authLoading: boolean;
  itemCount: number;
  total: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  items: [], loading: false, authLoading: true, itemCount: 0, total: 0,
  addToCart: async () => {}, removeFromCart: async () => {},
  updateQuantity: async () => {}, clearCart: async () => {}, refreshCart: async () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, products(name, slug, price, discount_price, stock_quantity, product_images(image_url, is_primary))")
      .eq("user_id", user.id);
    setItems((data as any) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId: string) => {
    if (!user) { toast({ title: "Please log in", description: "You need to log in to add items to cart.", variant: "destructive" }); return; }
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: 1 });
    }
    await fetchCart();
    toast({ title: "Added to cart ✓" });
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
    await fetchCart();
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;
    await supabase.from("cart_items").update({ quantity }).eq("user_id", user.id).eq("product_id", productId);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => {
    const product = i.products;
    const price = product?.discount_price ?? product?.price ?? 0;
    return sum + Number(price) * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, authLoading, itemCount, total, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
