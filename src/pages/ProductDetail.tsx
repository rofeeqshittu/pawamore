import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, Share2, Copy, CheckCircle, ChevronLeft, Image as ImageIcon, Play } from "lucide-react";
import QuickBuyButton from "@/components/QuickBuyButton";
import ProductReviews from "@/components/ProductReviews";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "@/hooks/use-toast";
import useSEO from "@/hooks/useSEO";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState({ average: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useCart();

  const images = product?.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  const primaryImage = images.find((i: any) => i.is_primary)?.image_url || images[0]?.image_url;
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  
  // OG proxy URL for social sharing - uses Cloudflare Worker
  // Set VITE_OG_PROXY_URL in env after deploying the worker (e.g., https://pawamore-og.workers.dev)
  const ogProxyUrl = import.meta.env.VITE_OG_PROXY_URL;
  const shareUrl = product?.slug && ogProxyUrl
    ? `${ogProxyUrl}/products/${encodeURIComponent(product.slug)}`
    : productUrl;
  
  // Format price for display
  const displayPrice = product?.discount_price || product?.price;
  const formattedPrice = displayPrice ? `₦${Number(displayPrice).toLocaleString('en-NG')}` : '';
  
  // Create rich description for social sharing
  const socialDescription = product 
    ? `${product.short_description || product.name} | ${formattedPrice} | Available at PawaMore Systems. ${product.stock_quantity > 0 ? '✅ In Stock' : '⏳ Pre-order'}. Free delivery in Lagos.`
    : "Quality solar and battery solutions at PawaMore Systems Nigeria";
  
  // Product availability for schema
  const availability = product?.stock_quantity > 0 ? "in stock" : "out of stock";

  useSEO({
    title: product ? `${product.name} - ${formattedPrice} | PawaMore` : "Product | PawaMore Systems",
    description: socialDescription,
    image: primaryImage || undefined,
    url: productUrl,
    type: "product",
    price: displayPrice,
    availability: availability,
  });

  // Add Product Schema JSON-LD for rich snippets
  useEffect(() => {
    if (!product) return;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": primaryImage || "",
      "description": product.short_description || product.description || "",
      "brand": {
        "@type": "Brand",
        "name": product.brand || "PawaMore"
      },
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "NGN",
        "price": displayPrice,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "availability": product.stock_quantity > 0 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "PawaMore Systems"
        }
      },
      ...(reviewStats.total > 0 && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": reviewStats.average.toFixed(1),
          "reviewCount": reviewStats.total,
          "bestRating": "5",
          "worstRating": "1"
        }
      })
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"][data-product-schema]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-product-schema', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

    return () => {
      const tag = document.querySelector('script[type="application/ld+json"][data-product-schema]');
      if (tag) tag.remove();
    };
  }, [product, primaryImage, displayPrice, formattedPrice, productUrl, reviewStats]);

  const fetchProduct = async (retries = 2) => {
    if (!slug) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(id, image_url, is_primary, sort_order), product_videos(id, video_url, thumbnail_url, sort_order), product_categories(name, slug)")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      
      if (error) throw error;
      setProduct(data);
      setVideos(data?.product_videos?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || []);
      if (data) await fetchReviews(data.id);
    } catch (error: any) {
      console.error("Error fetching product:", error);
      // Retry on auth lock errors
      if (retries > 0 && error?.message?.includes("Lock")) {
        await new Promise(r => setTimeout(r, 500));
        return fetchProduct(retries - 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const { data: reviewsData } = await supabase
        .from("product_reviews")
        .select(`id, user_id, rating, title, content, is_approved, created_at`)
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      setReviews(reviewsData || []);
      if (reviewsData && reviewsData.length > 0) {
        const average = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setReviewStats({ average, total: reviewsData.length });
      } else {
        setReviewStats({ average: 0, total: 0 });
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchProduct();
  }, [slug, authLoading]);

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

  if (loading) return <ErrorBoundary><Layout><div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div></Layout></ErrorBoundary>;
  if (!product) return <ErrorBoundary><Layout><div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Product not found.</p><Link to="/products"><Button variant="amber">&larr; Back to Products</Button></Link></div></Layout></ErrorBoundary>;

  const price = product.discount_price || product.price;

  return (
    <ErrorBoundary>
      <Layout>
      <div className="container py-6 sm:py-10 md:py-16 px-4 sm:px-6">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 sm:mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Images & Videos */}
          <div className="min-w-0">
            {videos.length > 0 && (
              <div className="flex gap-2 mb-3">
                <button onClick={() => setActiveTab('images')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'images' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                  <ImageIcon className="w-4 h-4" /> Photos ({images.length})
                </button>
                <button onClick={() => setActiveTab('videos')}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${activeTab === 'videos' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                  <Play className="w-4 h-4" /> Videos ({videos.length})
                </button>
              </div>
            )}

            {activeTab === 'images' ? (
              <>
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
                        aria-label={`View image ${i + 1} of ${images.length}`}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === selectedImage ? "border-primary" : "border-border"}`}>
                        <img src={img.image_url} alt={`${product.name} - image ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                {videos.map((video: any, i: number) => (
                  <div key={video.id} className="rounded-2xl overflow-hidden bg-secondary">
                    <video src={video.video_url} controls className="w-full aspect-video" poster={video.thumbnail_url || undefined} preload="metadata" />
                    {videos.length > 1 && (
                      <div className="p-2 text-center text-xs text-muted-foreground">Video {i + 1} of {videos.length}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            {product.product_categories && (
              <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">{(product.product_categories as any).name}</span>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold mt-1 mb-3">{product.name}</h1>

            {product.promo_label && (
              <span className="inline-block bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">{product.promo_label}</span>
            )}

            <div className="flex items-end gap-3 mb-4">
              <span className="font-display font-extrabold text-xl sm:text-2xl lg:text-3xl text-primary">₦{Number(price).toLocaleString()}</span>
              {product.discount_price && (
                <span className="text-muted-foreground text-base sm:text-lg line-through">₦{Number(product.price).toLocaleString()}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">{product.short_description || product.description}</p>

            {product.powers && (
              <div className="bg-secondary rounded-lg p-3 mb-4">
                <strong className="text-sm">Powers:</strong>
                <p className="text-sm text-muted-foreground">{product.powers}</p>
              </div>
            )}

            {product.ideal_for && (
              <p className="text-sm text-accent font-semibold mb-4">Ideal for: {product.ideal_for}</p>
            )}

            <p className="text-sm text-muted-foreground mb-4">
              {product.stock_quantity > 0 ? <span className="text-primary font-semibold">✓ In Stock ({product.stock_quantity} available)</span> : <span className="text-destructive font-semibold">Out of Stock</span>}
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col gap-2 sm:gap-3 mb-4">
              <Button variant="amber" size="lg" className="w-full min-h-[44px] sm:min-h-[48px]" onClick={() => addToCart(product.id)} disabled={product.stock_quantity <= 0}>
                <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <QuickBuyButton product={product} size="default" className="w-full min-h-[40px] sm:min-h-[44px]" />
                <WhatsAppButton
                  productName={product.name}
                  productPrice={price}
                  productUrl={shareUrl}
                  size="default"
                  className="min-h-[40px] sm:min-h-[44px]"
                />
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 min-h-[40px]">
                <Share2 className="w-4 h-4 mr-1.5" /> Share
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyLink} className="flex-1 min-h-[40px]">
                {copied ? <CheckCircle className="w-4 h-4 mr-1.5 text-primary" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? "Copied!" : "Copy Link"}
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

        {/* Reviews */}
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
    </ErrorBoundary>
  );
};

export default ProductDetail;
