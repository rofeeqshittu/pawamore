import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Image as ImageIcon, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import QuickBuyButton from "@/components/QuickBuyButton";
import { toast } from "@/hooks/use-toast";
import useSEO from "@/hooks/useSEO";

interface WishlistItem {
  id: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    discount_price: number | null;
    short_description: string | null;
    is_popular: boolean;
    is_featured: boolean;
    promo_label: string | null;
    stock_quantity: number;
    product_images: { image_url: string; is_primary: boolean }[];
  };
}

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({ 
    title: "My Wishlist — PawaMore Systems", 
    description: "Your saved favorite products from PawaMore Systems" 
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const { data, error } = await supabase
          .from("wishlist")
          .select(`
            id,
            created_at,
            products (
              id,
              name,
              slug,
              price,
              discount_price,
              short_description,
              is_popular,
              is_featured,
              promo_label,
              stock_quantity,
              product_images (image_url, is_primary)
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setWishlistItems((data as any) || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({ 
          title: "Failed to load wishlist", 
          description: "Please try refreshing the page",
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (wishlistId: string, productName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", wishlistId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      toast({ 
        title: "Removed from wishlist", 
        description: `${productName} removed from your favorites` 
      });
    } catch (error: any) {
      console.error("Remove from wishlist error:", error);
      toast({ 
        title: "Failed to remove", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const getPrimaryImage = (item: WishlistItem) => {
    const images = item.products.product_images;
    return images?.find(img => img.is_primary)?.image_url || images?.[0]?.image_url;
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 max-w-md mx-auto text-center">
          <Heart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>
          <p className="text-muted-foreground mb-6">Please log in to view your saved products.</p>
          <Link to="/login">
            <Button variant="amber">Log In</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {wishlistItems.length > 0 
              ? `${wishlistItems.length} saved product${wishlistItems.length !== 1 ? 's' : ''}`
              : "No saved products yet"
            }
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-20 h-20 text-muted-foreground/10 mx-auto mb-6" />
            <h2 className="text-xl font-bold mb-4">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start browsing products and click the heart icon to save your favorites here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button variant="amber">Browse Products</Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline">Visit Shop</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wishlistItems.map((item) => {
              const product = item.products;
              const primaryImage = getPrimaryImage(item);
              const effectivePrice = product.discount_price || product.price;

              return (
                <Card key={item.id} className="group hover:shadow-lg transition-all">
                  {(product.promo_label || product.is_popular) && (
                    <div className={`text-center py-1.5 font-bold text-xs uppercase tracking-wider ${
                      product.promo_label 
                        ? "bg-destructive text-destructive-foreground" 
                        : "bg-accent text-foreground"
                    }`}>
                      {product.promo_label || "⭐ Popular"}
                    </div>
                  )}
                  
                  <div className="aspect-video bg-secondary relative overflow-hidden">
                    {primaryImage ? (
                      <img 
                        src={primaryImage} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                      </div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 text-xs">Featured</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromWishlist(item.id, product.name)}
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background text-destructive hover:text-destructive"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.short_description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.short_description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xl text-primary">
                          ₦{Number(effectivePrice).toLocaleString()}
                        </span>
                        {product.discount_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₦{Number(product.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Badge variant={product.stock_quantity > 0 ? "default" : "secondary"}>
                        {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/products/${product.slug}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addToCart(product.id)}
                        disabled={product.stock_quantity <= 0}
                        className="px-3"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <QuickBuyButton 
                        product={product} 
                        size="sm" 
                        className="px-3" 
                      />
                    </div>

                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Saved {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;