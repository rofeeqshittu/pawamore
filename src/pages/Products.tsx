import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Battery, Sun, Zap, CheckCircle, Star, Image as ImageIcon, ShoppingCart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";
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

const staticProducts = [
  {
    icon: Battery, tag: "Entry Level", title: "Starter Battery System",
    desc: "Power your essentials — fridge, fans, TV, lights — all night. No solar needed. Plug and play.",
    features: ["Powers fridge, fans, TV & lights", "No solar panels required", "Plug-and-play — no installation", "Silent, zero-fume operation"],
    price: "From ₦380,000", ideal: "Perfect for renters & apartments",
  },
  {
    icon: Sun, tag: "Most Popular", title: "Standard Solar + Battery",
    desc: "Full day power from solar + battery backup for evening and night use.",
    features: ["Solar panels + battery storage", "Day & night coverage", "Professional rooftop installation", "Drastically cuts electricity bills"],
    price: "From ₦780,000", ideal: "Best for 2–3 bedroom homes",
  },
  {
    icon: Zap, tag: "Premium", title: "Premium Hybrid System",
    desc: "Total energy independence. Powers AC, washing machine, full home load.",
    features: ["Powers AC, washing machine & more", "Grid + solar + battery hybrid", "Scales for large loads", "Smart monitoring included"],
    price: "From ₦2,200,000", ideal: "Best for large homes & SMEs",
  },
];

const brands = ["EcoFlow", "Itel Energy", "Felicity Solar", "Luminous", "Bluetti"];
const PRODUCTS_PREVIEW_LIMIT = 6;

const Products = () => {
  useSEO({ title: "Solar Systems & Battery Products — PawaMore Systems Nigeria", description: "Home battery systems from ₦380,000. Solar + battery combos from ₦780,000. EcoFlow, Itel Energy, Felicity Solar. Genuine products, professionally installed." });
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(image_url, is_primary), product_categories(name, slug)")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("is_popular", { ascending: false })
        .limit(PRODUCTS_PREVIEW_LIMIT);
      setProducts((data as any) || []);
      setLoading(false);
    };
    fetchData();
  }, []);

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

      {/* Category 1: Power Tanks, Batteries & Inverters */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <ScrollReveal>
              <div>
                <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 mb-4">
                  <Battery className="w-4 h-4 text-primary" />
                  <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">Power Solutions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
                  Power Tanks, Batteries <span className="text-accent">& Inverters</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  From portable power stations to whole-home inverter setups — we carry a full range of power tanks, lithium batteries, and hybrid inverters from trusted brands. Whether you need a compact backup unit or a heavy-duty system, we've got you covered.
                </p>
                <ul className="space-y-3 mb-6">
                  {["Portable power tanks — charge from wall or solar, use anywhere", "Lithium battery banks — longer life, faster charging, zero maintenance", "Hybrid inverters — seamlessly switch between grid, solar & battery", "Scalable setups — start small, expand as your needs grow"].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact">
                  <Button variant="amber">Get a Quote →</Button>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-elevated)]">
                <img src={batteryImg} alt="Power tanks, batteries and inverters by PawaMore" className="w-full h-full object-cover aspect-[4/3]" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Category 2: Solar + Battery Systems with Tiers */}
      <section className="py-10 sm:py-16 md:py-20 bg-secondary">
        <div className="container">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 bg-background rounded-full px-4 py-1.5 mb-4">
                <Sun className="w-4 h-4 text-primary" />
                <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">Solar + Battery Systems</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
                Complete Solar <span className="text-accent">Energy Systems</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Combine solar panels with battery storage for true energy independence. Generate your own electricity during the day and store it for evening and night use. Choose the tier that fits your power needs and budget.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {staticProducts.map((product, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:shadow-[var(--shadow-elevated)] h-full flex flex-col ${i === 1 ? "border-accent bg-card scale-[1.02]" : "border-border bg-card"}`}>
                  {i === 1 && (
                    <div className="bg-accent text-foreground text-center py-1.5 font-display font-bold text-xs uppercase tracking-wider">⭐ Most Popular</div>
                  )}
                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-3 py-1 mb-4 w-fit">
                      <product.icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-display font-semibold text-primary">{product.tag}</span>
                    </div>
                    <h3 className="font-display font-bold text-xl mb-3">{product.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{product.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {product.features.map((feat, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      <div className="font-display font-extrabold text-2xl text-primary mb-1">{product.price}</div>
                      <div className="text-sm text-muted-foreground mb-6">{product.ideal}</div>
                      <Link to="/contact">
                        <Button variant={i === 1 ? "amber" : "outline"} className="w-full">Get a Quote →</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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

      {/* DB Products - Shop Section */}
      <section className="py-10 sm:py-16 md:py-20 bg-secondary">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-3">
              Shop Our <span className="text-accent">Products</span>
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8 sm:mb-10">
              Browse our latest products available for purchase with delivery across Nigeria
            </p>
          </ScrollReveal>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Products coming soon! Contact us for a custom quote.</p>
              <Link to="/contact"><Button variant="amber">Contact Us →</Button></Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ScrollReveal key={product.id}>
                    <div className={`rounded-xl sm:rounded-2xl overflow-hidden border-2 bg-card transition-all hover:shadow-[var(--shadow-elevated)] ${product.is_popular ? "border-accent" : "border-border"}`}>
                      {(product.promo_label || product.is_popular) && (
                        <div className={`text-center py-1.5 font-display font-bold text-xs uppercase tracking-wider ${product.promo_label ? "bg-destructive text-destructive-foreground" : "bg-accent text-foreground"}`}>
                          {product.promo_label || "⭐ Most Popular"}
                        </div>
                      )}
                      <div className="aspect-video bg-secondary relative overflow-hidden">
                        {primaryImage(product) ? (
                          <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground/20" /></div>
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
                          {product.ideal_for && <span className="text-[10px] sm:text-xs text-accent font-semibold">{product.ideal_for}</span>}
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/products/${product.slug}`} className="flex-1">
                            <Button variant={product.is_popular ? "amber" : "outline"} className="w-full" size="default">View Details →</Button>
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

              <div className="text-center mt-8 sm:mt-10">
                <Link to="/shop">
                  <Button variant="default" size="lg" className="gap-2">
                    Browse All Products <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
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
