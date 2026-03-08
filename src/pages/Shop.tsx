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

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [prodResult, catResult] = await Promise.all([
        supabase.from("products").select("*, product_images(image_url, is_primary), product_categories(name, slug)").eq("status", "active").order("is_featured", { ascending: false }).order("is_popular", { ascending: false }),
        supabase.from("product_categories").select("*").order("sort_order"),
      ]);
      setProducts((prodResult.data as any) || []);
      setCategories((catResult.data as any) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "all" || (p.product_categories as any)?.slug === activeCategory;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.short_description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  return (
    <Layout>
      {/* Header */}
      <section className="relative py-10 sm:py-14" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-foreground mb-3">
            Shop All <span className="text-accent">Products</span>
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg mx-auto">
            Browse our complete catalog of solar systems, batteries, and accessories
          </p>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="py-4 sm:py-6 border-b border-border sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm">
        <div className="container">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {/* Categories */}
            <div className="flex flex-wrap gap-2 flex-1 justify-center sm:justify-start">
              <button onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}>
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-colors ${activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-12">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">{filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found</p>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No products found. Try a different search or category.</p>
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
                    <div className="p-4">
                      {(product.product_categories as any) && (
                        <span className="text-[10px] font-display font-semibold text-primary uppercase tracking-wider">
                          {(product.product_categories as any).name}
                        </span>
                      )}
                      <h3 className="font-display font-bold text-sm mt-1 mb-1 truncate">{product.name}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-2">
                        {product.short_description || ""}
                      </p>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          {product.discount_price ? (
                            <div>
                              <span className="font-display font-extrabold text-base text-primary">₦{Number(product.discount_price).toLocaleString()}</span>
                              <span className="text-muted-foreground text-[10px] line-through ml-1">₦{Number(product.price).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="font-display font-extrabold text-base text-primary">₦{Number(product.price).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/products/${product.slug}`} className="flex-1">
                          <Button variant={product.is_popular ? "amber" : "outline"} className="w-full text-xs" size="sm">View Details</Button>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => addToCart(product.id)} className="px-2.5">
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </Button>
                        <QuickBuyButton product={product} size="sm" className="px-2.5" />
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
      <section className="py-10 sm:py-14 bg-forest">
        <div className="container text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary-foreground mb-4">Need Help Choosing?</h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact"><Button variant="amber" size="lg">Book a Free Power Audit →</Button></Link>
            <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer">
              <Button variant="hero-outline" size="lg">WhatsApp Us →</Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
