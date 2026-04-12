import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShoppingCart,
  Share2,
  Copy,
  CheckCircle,
  ChevronLeft,
  Image as ImageIcon,
  Play,
  ShieldCheck,
  Truck,
  Wrench,
  ArrowRight,
} from "lucide-react";
import QuickBuyButton from "@/components/QuickBuyButton";
import ProductReviews from "@/components/ProductReviews";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "@/hooks/use-toast";
import useSEO from "@/hooks/useSEO";
import { getRelatedProducts, type RelatedProduct } from "@/lib/related-products";
import { buildOgProductUrl } from "@/lib/ogProxy";
import { stripHtml } from "@/lib/htmlUtils";

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
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const { addToCart } = useCart();

  const images = product?.product_images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  const primaryImage = images.find((i: any) => i.is_primary)?.image_url || images[0]?.image_url;
  const productUrl = typeof window !== "undefined" ? window.location.href : "";
  
  // Cloudflare Worker for rich social previews (crawlers get OG tags, humans get 302 redirect)
  const shareUrl = product?.slug
    ? buildOgProductUrl(product.slug)
    : productUrl;
  
  // Format price for display
  const displayPrice = product?.discount_price || product?.price;
  const formattedPrice = displayPrice ? `₦${Number(displayPrice).toLocaleString('en-NG')}` : '';
  
  // Create rich description for social sharing
  const socialDescription = product
    ? `${stripHtml(product.short_description || product.name || '')} | ${formattedPrice} | Available at PawaMore Systems. ${product.stock_quantity > 0 ? "✅ In Stock" : "⏳ Pre-order"}. Delivery options available nationwide.`
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
      "description": stripHtml(product.short_description || product.description || ""),
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

  const fetchRelated = async (currentProduct: any) => {
    const { data, error } = await supabase
      .from("products")
      .select("id,name,slug,short_description,price,discount_price,ideal_for,powers,specs,stock_quantity,is_featured,is_popular,product_images(image_url,is_primary),product_categories(name,slug),brands(name,slug)")
      .eq("status", "active")
      .neq("id", currentProduct.id)
      .limit(60);

    if (error || !data) {
      setRelatedProducts([]);
      return;
    }

    const suggestions = getRelatedProducts(currentProduct, data as any[], 2);
    setRelatedProducts(suggestions);
  };

  const fetchProduct = async (retries = 2) => {
    if (!slug) return;
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(id, image_url, is_primary, sort_order), product_videos(id, video_url, thumbnail_url, sort_order), product_categories(name, slug), brands(name, slug)")
        .eq("slug", slug)
        .eq("status", "active")
        .maybeSingle();
      
      if (error) throw error;
      setProduct(data);
      setVideos(data?.product_videos?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) || []);
      if (data) {
        await Promise.all([fetchReviews(data.id), fetchRelated(data)]);
      }
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
      // Fetch approved reviews, and also include the current user's review (even if not approved)
      let query = supabase
        .from("product_reviews")
        .select(`id, user_id, rating, title, content, is_approved, created_at`)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (user?.id) {
        // include approved reviews or the logged-in user's review
        query = query.or(`is_approved.eq.true,user_id.eq.${user.id}`);
      } else {
        query = query.eq("is_approved", true);
      }

      const { data: reviewsData, error } = await query;
      if (error) throw error;

      const deduped = (reviewsData || []).reduce((acc: any[], r: any) => {
        if (!acc.some(x => x.id === r.id)) acc.push(r);
        return acc;
      }, []);

      setReviews(deduped);

      // Compute stats only from approved reviews
      const approved = deduped.filter(r => r.is_approved);
      if (approved.length > 0) {
        const average = approved.reduce((sum: number, r: any) => sum + r.rating, 0) / approved.length;
        setReviewStats({ average, total: approved.length });
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
      await navigator.share({ title: product?.name, text: stripHtml(product?.short_description || ""), url: shareUrl });
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
  const categoryName = ((product.product_categories as any)?.name || "").toLowerCase();
  const valueHooks = [
    product.ideal_for
      ? `Best for: ${product.ideal_for}`
      : categoryName.includes("inverter")
        ? "Best for: homes and small businesses needing dependable backup and expansion flexibility."
        : categoryName.includes("battery")
          ? "Best for: users prioritizing longer runtime and cleaner backup than generator-only setups."
          : categoryName.includes("panel")
            ? "Best for: rooftop energy generation and lower daytime electricity cost."
            : "Best for: practical everyday power backup and outage resilience.",
    product.powers
      ? `What it can power: ${product.powers}`
      : "What it can power: depends on your final load profile — use our calculator for a first estimate.",
    "Before you buy: confirm your must-run appliances, outage duration, and future expansion plan.",
  ];

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

            <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">{stripHtml(product.short_description || product.description || "")}</p>

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

            <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {valueHooks.map((line) => (
                <div key={line} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-xs leading-relaxed text-foreground">{line}</p>
                </div>
              ))}
            </div>

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

            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-bold">Why buy this from PawaMore?</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Product-fit advisory before purchase so you avoid overspending or undersizing.
                </p>
                <p className="flex items-start gap-2">
                  <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Delivery and setup guidance available across Nigeria.
                </p>
                <p className="flex items-start gap-2">
                  <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  After-sales support for troubleshooting, optimization, and upgrades.
                </p>
              </div>
            </div>

            {product.description && product.description !== product.short_description && (
              <div className="border-t border-border pt-6">
                <h3 className="font-display font-bold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{stripHtml(product.description || "")}</p>
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

        {relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-14">
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-extrabold sm:text-xl">You may also like</h2>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Two smart matches picked from live shop inventory.
                </p>
              </div>
              <Link to="/shop" className="text-xs font-semibold text-primary hover:underline sm:text-sm">
                Browse more
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {relatedProducts.map((item) => {
                const image =
                  item.product_images?.find((img) => img.is_primary)?.image_url ||
                  item.product_images?.[0]?.image_url;
                const amount = item.discount_price ?? item.price;

                return (
                  <article key={item.id} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                    <div className="flex gap-3">
                      <Link to={`/products/${item.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary sm:h-24 sm:w-24">
                        {image ? (
                          <img src={image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-secondary" />
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link to={`/products/${item.slug}`} className="line-clamp-2 text-sm font-bold hover:text-primary sm:text-base">
                          {item.name}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                          {item.suggestionReason}
                        </p>
                        <p className="mt-2 text-sm font-extrabold text-primary sm:text-base">
                          ₦{Number(amount).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px]"
                        onClick={() => addToCart(item.id)}
                        disabled={item.stock_quantity !== null && item.stock_quantity <= 0}
                      >
                        <ShoppingCart className="mr-1.5 h-4 w-4" />
                        Add
                      </Button>
                      <Link to={`/products/${item.slug}`}>
                        <Button size="sm" className="min-h-[40px] w-full">
                          View
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

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
