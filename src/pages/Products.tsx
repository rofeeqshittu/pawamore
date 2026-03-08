import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Battery, Sun, Zap, CheckCircle, Star, Image as ImageIcon, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import batteryImg from "@/assets/battery-system.jpg";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  powers: string | null;
  ideal_for: string | null;
  is_featured: boolean;
  is_popular: boolean;
  promo_label: string | null;
  status: string;
  stock_quantity: number;
  specs: any;
  product_images: { image_url: string; is_primary: boolean }[];
  product_categories: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const brands = ["EcoFlow", "Itel Energy", "Felicity Solar", "Luminous", "Bluetti"];

const Products = () => {
  useSEO({ title: "Solar Systems & Battery Products — PawaMore Systems Nigeria", description: "Home battery systems from ₦380,000. Solar + battery combos from ₦780,000. EcoFlow, Itel Energy, Felicity Solar. Genuine products, professionally installed." });
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [prodResult, catResult] = await Promise.all([
      supabase.from("products").select("*, product_images(image_url, is_primary), product_categories(name, slug)").eq("status", "active").order("is_featured", { ascending: false }).order("is_popular", { ascending: false }),
      supabase.from("product_categories").select("*").order("sort_order"),
    ]);
    setProducts((prodResult.data as any) || []);
    setCategories((catResult.data as any) || []);
    setLoading(false);
  };

  const filteredProducts = activeCategory === "all" ? products : products.filter((p) => (p.product_categories as any)?.slug === activeCategory);
  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-12 sm:py-16 md:py-28" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 kente-pattern opacity-20" />
        <div className="container relative z-10 text-center">
          <ScrollReveal>
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 sm:mb-6 leading-tight">
              World-Class Energy Products.
              <br className="hidden sm:block" />
              <span className="text-accent"> Expertly Installed.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              We source only from authorised distributors and verified manufacturers. Every product is genuine, warranted, and installed by our certified team.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      {categories.length > 0 && (
        <section className="py-6 sm:py-8 border-b border-border">
          <div className="container">
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={() => setActiveCategory("all")}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-display font-semibold transition-colors ${
                  activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"
                }`}>
                All Products
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-display font-semibold transition-colors ${
                    activeCategory === cat.slug ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="container">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">No products available yet. Check back soon!</p>
              <Link to="/contact"><Button variant="amber">Contact Us for a Quote →</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ScrollReveal key={product.id}>
                  <div className={`rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-card transition-all hover:shadow-[var(--shadow-elevated)] ${
                    product.is_popular ? "border-accent" : "border-border"
                  }`}>
                    {/* Promo / Popular Banner */}
                    {(product.promo_label || product.is_popular) && (
                      <div className={`text-center py-1.5 font-display font-bold text-xs uppercase tracking-wider ${
                        product.promo_label ? "bg-destructive text-destructive-foreground" : "bg-accent text-foreground"
                      }`}>
                        {product.promo_label || "⭐ Most Popular"}
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {primaryImage(product) ? (
                        <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}
                      {product.is_featured && (
                        <span className="absolute top-2 left-2 bg-accent text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>

                    <div className="p-4 sm:p-6">
                      {(product.product_categories as any) && (
                        <span className="text-[10px] sm:text-xs font-display font-semibold text-primary uppercase tracking-wider">
                          {(product.product_categories as any).name}
                        </span>
                      )}
                      <h3 className="font-display font-bold text-base sm:text-lg mt-1 mb-1 sm:mb-2">{product.name}</h3>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2">
                        {product.short_description || product.description || ""}
                      </p>

                      {product.powers && (
                        <p className="text-xs text-muted-foreground bg-secondary rounded-lg p-2 mb-3">
                          <strong>Powers:</strong> {product.powers}
                        </p>
                      )}

                      <div className="flex items-end justify-between mb-3 sm:mb-4">
                        <div>
                          {product.discount_price ? (
                            <div>
                              <span className="font-display font-extrabold text-lg sm:text-xl text-primary">₦{Number(product.discount_price).toLocaleString()}</span>
                              <span className="text-muted-foreground text-xs line-through ml-2">₦{Number(product.price).toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="font-display font-extrabold text-lg sm:text-xl text-primary">₦{Number(product.price).toLocaleString()}</span>
                          )}
                        </div>
                        {product.ideal_for && (
                          <span className="text-[10px] sm:text-xs text-accent font-semibold">{product.ideal_for}</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/products/${product.slug}`} className="flex-1">
                          <Button variant={product.is_popular ? "amber" : "outline"} className="w-full" size="default">
                            View Details →
                          </Button>
                        </Link>
                        <Button variant="outline" size="default" onClick={() => addToCart(product.id)} className="px-3">
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brands */}
      <section className="py-10 sm:py-16">
        <div className="container text-center">
          <ScrollReveal>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-6 sm:mb-8">Brands We <span className="text-accent">Carry</span></h2>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              {brands.map((brand) => (
                <div key={brand} className="bg-secondary rounded-lg sm:rounded-xl px-4 sm:px-8 py-2.5 sm:py-4 font-display font-bold text-primary text-sm sm:text-lg">
                  {brand}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm mt-4 sm:mt-6 max-w-xl mx-auto">
              All products are sourced from authorised Nigerian distributors with manufacturer warranty plus PawaMore's 90-day installation guarantee.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-16 bg-forest">
        <div className="container text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-foreground mb-4 sm:mb-6">Not Sure Which System?</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/contact" className="w-full sm:w-auto"><Button variant="amber" size="lg" className="w-full sm:w-auto">Book a Free Audit →</Button></Link>
            <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto">WhatsApp Us to Order →</Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
