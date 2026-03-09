import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Image as ImageIcon, ShoppingCart, Search } from "lucide-react";
import QuickBuyButton from "@/components/QuickBuyButton";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";
import { useCart } from "@/contexts/CartContext";
import { useAuthReady } from "@/hooks/useAuthReady";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  ideal_for: string | null;
  is_featured: boolean;
  is_popular: boolean;
  promo_label: string | null;
  status: string;
  product_images: { image_url: string; is_primary: boolean }[];
  product_categories: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Shop = () => {
  useSEO({ title: "Shop All Products — PawaMore Systems Nigeria", description: "Browse our full range of solar panels, battery systems, inverters and accessories. Genuine products with professional installation." });
  const { addToCart } = useCart();
  const { isReady } = useAuthReady();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return; // Wait for auth to be ready
    
    const fetchData = async () => {
      try {
        const [prodResult, catResult] = await Promise.all([
          supabase.from("products").select("*, product_images(image_url, is_primary), product_categories(name, slug)").eq("status", "active").order("is_featured", { ascending: false }).order("is_popular", { ascending: false }),
          supabase.from("product_categories").select("*").order("sort_order"),
        ]);
        setProducts((prodResult.data as any) || []);
        setCategories((catResult.data as any) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isReady]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || (p.product_categories as any)?.slug === activeCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.short_description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-6 sm:py-10 lg:py-14" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center px-4 sm:px-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-2 sm:mb-3">
            Shop All <span className="text-accent">Products</span>
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg mx-auto px-2">
            Browse our complete catalog of solar systems, batteries, and accessories
          </p>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="py-3 sm:py-4 lg:py-6 border-b border-border sticky top-14 xs:top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col gap-3 items-stretch">
            {/* Search */}
            <div className="relative w-full max-w-md mx-auto sm:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-lg border border-input bg-background text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
              />
            </div>
            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button onClick={() => setActiveCategory("all")}
                className={`px-3 py-2 rounded-full text-xs sm:text-sm font-display font-semibold transition-colors min-h-[36px] ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}>
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 py-2 rounded-full text-xs sm:text-sm font-display font-semibold transition-colors min-h-[36px] ${activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-6 sm:py-8 lg:py-12">
        <div className="container px-4 sm:px-6">
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found</p>

          {loading ? (
            <div className="text-center py-12 sm:py-20 text-muted-foreground text-sm sm:text-base">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">No products found. Try a different search or category.</p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ScrollReveal key={product.id}>
                  <div className={`rounded-xl overflow-hidden border-2 bg-card transition-all hover:shadow-[var(--shadow-elevated)] ${product.is_popular ? "border-accent" : "border-border"}`}>
                    {(product.promo_label || product.is_popular) && (
                      <div className={`text-center py-1 font-display font-bold text-[10px] uppercase tracking-wider ${product.promo_label ? "bg-destructive text-destructive-foreground" : "bg-accent text-foreground"}`}>
                        {product.promo_label || "⭐ Popular"}
                      </div>
                    )}
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {primaryImage(product) ? (
                        <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/20" /></div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      {(product.product_categories as any) && (
                        <span className="text-[9px] sm:text-[10px] font-display font-semibold text-primary uppercase tracking-wider">
                          {(product.product_categories as any).name}
                        </span>
                      )}
                      <h3 className="font-display font-bold text-sm sm:text-base mt-1 mb-1 truncate">{product.name}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
                        {product.short_description || ""}
                      </p>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          {product.discount_price ? (
                            <div>
                              <span className="font-display font-extrabold text-sm sm:text-base text-primary">₦{Number(product.discount_price).toLocaleString()}</span>
                              <span className="text-muted-foreground text-[9px] sm:text-[10px] line-through ml-1">₦{Number(product.price).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="font-display font-extrabold text-sm sm:text-base text-primary">₦{Number(product.price).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 sm:gap-2">
                        <Link to={`/products/${product.slug}`} className="flex-1">
                          <Button variant={product.is_popular ? "amber" : "outline"} className="w-full text-xs min-h-[36px]" size="sm">View Details</Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => addToCart(product.id)} className="px-2 sm:px-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center">
                          <ShoppingCart className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                        </Button>
                        <QuickBuyButton product={product} size="sm" className="px-2 sm:px-2.5 min-h-[36px] min-w-[36px]" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-10 lg:py-14 bg-forest">
        <div className="container text-center px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-primary-foreground mb-3 sm:mb-4">Need Help Choosing?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact"><Button variant="amber" size="lg" className="min-h-[44px] sm:min-h-[48px]">Book a Free Power Audit →</Button></Link>
            <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg" className="min-h-[44px] sm:min-h-[48px]">WhatsApp Us →</Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
