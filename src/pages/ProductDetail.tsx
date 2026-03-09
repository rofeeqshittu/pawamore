import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Share2, Copy, CheckCircle, ChevronLeft, Image as ImageIcon, Zap, Star } from "lucide-react";
import QuickBuyButton from "@/components/QuickBuyButton";
import ProductReviews from "@/components/ProductReviews";
import { toast } from "@/hooks/use-toast";
import useSEO from "@/hooks/useSEO";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useCart();

  useSEO({
    title: product ? `${product.name} — PawaMore Systems` : "Product — PawaMore Systems",
    description: product?.short_description || "View product details at PawaMore Systems Nigeria",
  });

  const fetchProduct = async () => {
    if (!slug) return;
    
    try {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(id, image_url, is_primary, sort_order), product_categories(name, slug)")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      
      setProduct(data);
      
      if (data) {
        await fetchReviews(data.id);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const { data: reviewsData } = await supabase
        .from("product_reviews")
        .select(`
          id, user_id, rating, title, content, is_approved, created_at,
          profiles(display_name)
        `)
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);

      // Calculate average rating
      if (reviewsData && reviewsData.length > 0) {
        const average = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        setReviewStats({ average, total: reviewsData.length });
      } else {
        setReviewStats({ average: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProduct();
    }
  }, [slug, authLoading]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product?.name, text: product?.short_description || "", url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Layout><div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div></Layout>;
  if (!product) return <Layout><div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Product not found.</p><Link to="/products"><Button variant="amber">← Back to Products</Button></Link></div></Layout>;

  const images = product.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  const price = product.discount_price || product.price;

  return (
    <Layout>
      <div className="container py-8 sm:py-12 md:py-16">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-secondary rounded-2xl overflow-hidden mb-3">
              {images.length > 0 ? (
                <img src={images[selectedImage]?.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-16 h-16 text-muted-foreground/20" /></div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: any, i: number) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? "border-primary" : "border-border"}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.product_categories && (
              <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">{(product.product_categories as any).name}</span>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-1 mb-3">{product.name}</h1>

            {product.promo_label && (
              <span className="inline-block bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">{product.promo_label}</span>
            )}

            <div className="flex items-end gap-3 mb-4">
              <span className="font-display font-extrabold text-2xl sm:text-3xl text-primary">₦{Number(price).toLocaleString()}</span>
              {product.discount_price && (
                <span className="text-muted-foreground text-lg line-through">₦{Number(product.price).toLocaleString()}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">{product.short_description || product.description}</p>

            {product.powers && (
              <div className="bg-secondary rounded-lg p-3 mb-4">
                <strong className="text-sm">Powers:</strong>
                <p className="text-sm text-muted-foreground">{product.powers}</p>
              </div>
            )}

            {product.ideal_for && (
              <p className="text-sm text-accent font-semibold mb-4">Ideal for: {product.ideal_for}</p>
            )}

            <p className="text-sm text-muted-foreground mb-6">
              {product.stock_quantity > 0 ? <span className="text-primary font-semibold">✓ In Stock ({product.stock_quantity} available)</span> : <span className="text-destructive font-semibold">Out of Stock</span>}
            </p>

            {/* Primary Actions - Mobile First */}
            <div className="flex flex-col gap-3 mb-4">
              <Button variant="amber" size="lg" className="w-full" onClick={() => addToCart(product.id)} disabled={product.stock_quantity <= 0}>
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
              <QuickBuyButton product={product} size="lg" className="w-full" />
            </div>

            {/* Secondary Actions - Compact on Mobile */}
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 min-h-[44px]">
                <Share2 className="w-4 h-4 mr-1.5 sm:mr-2" /> 
                <span>Share</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyLink} className="flex-1 min-h-[44px]">
                {copied ? <CheckCircle className="w-4 h-4 mr-1.5 sm:mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-1.5 sm:mr-2" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </Button>
            </div>

            {product.description && product.description !== product.short_description && (
              <div className="border-t border-border pt-6">
                <h3 className="font-display font-bold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="font-display font-bold text-lg mb-3">Specifications</h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="bg-secondary rounded-lg p-3">
                      <span className="text-xs text-muted-foreground capitalize block mb-1">{key.replace(/_/g, " ")}</span>
                      <p className="text-sm font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 lg:mt-16">
            <ProductReviews
              productId={product.id}
              productName={product.name}
              reviews={reviews}
              averageRating={reviewStats.average}
              totalReviews={reviewStats.total}
              onReviewAdded={() => fetchReviews(product.id)}
            />
          </div>
        </div>
      </Layout>
    );
  };

export default ProductDetail;
