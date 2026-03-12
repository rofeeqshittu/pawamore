import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, X, GitCompare } from "lucide-react";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProductSkeleton from "@/components/ProductSkeleton";
import InventoryAlert from "@/components/InventoryAlert";
import ShopFilters, { ShopFiltersSidebar, type ShopFilterState } from "@/components/shop/ShopFilters";
import ProductCard from "@/components/shop/ProductCard";
import ShopPagination from "@/components/shop/ShopPagination";
import ProductComparison from "@/components/shop/ProductComparison";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";
import { useCart } from "@/contexts/CartContext";
import { useAuthReady } from "@/hooks/useAuthReady";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

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
  stock_quantity: number | null;
  specs: any;
  product_images: { image_url: string; is_primary: boolean }[];
  product_categories: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const KNOWN_BRANDS = ["EcoFlow", "Itel Energy", "Felicity Solar", "Luminous", "Bluetti", "Growatt", "Victron", "SunKing"];
const PRODUCTS_PER_PAGE = 12;
const MAX_COMPARE = 3;

const Shop = () => {
  useSEO({
    title: "Shop All Products — PawaMore Systems Nigeria",
    description: "Browse our full range of solar panels, battery systems, inverters and accessories. Genuine products with professional installation.",
  });
  const { addToCart } = useCart();
  const { isReady } = useAuthReady();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const [filters, setFilters] = useState<ShopFilterState>({
    category: "all",
    brands: [],
    minPrice: 0,
    maxPrice: 10000000,
    sortBy: "featured",
    inStock: false,
  });

  useEffect(() => {
    if (!isReady) return;
    const fetchData = async () => {
      try {
        const [prodResult, catResult] = await Promise.all([
          supabase
            .from("products")
            .select("*, product_images(image_url, is_primary), product_categories(name, slug)")
            .eq("status", "active"),
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

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const availableBrands = useMemo(() => {
    const found = new Set<string>();
    products.forEach((p) => {
      KNOWN_BRANDS.forEach((brand) => {
        if (p.name.toLowerCase().includes(brand.toLowerCase())) {
          found.add(brand);
        }
      });
    });
    return Array.from(found).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.short_description || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filters.category !== "all" && (p.product_categories as any)?.slug !== filters.category) return false;
      if (filters.brands.length > 0) {
        const matchesBrand = filters.brands.some((b) => p.name.toLowerCase().includes(b.toLowerCase()));
        if (!matchesBrand) return false;
      }
      const effectivePrice = p.discount_price ?? p.price;
      if (effectivePrice < filters.minPrice || effectivePrice > filters.maxPrice) return false;
      if (filters.inStock && p.stock_quantity !== null && p.stock_quantity <= 0) return false;
      return true;
    });

    switch (filters.sortBy) {
      case "price-low":
        result.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
        break;
      case "price-high":
        result.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
        break;
      case "newest":
        result.reverse();
        break;
      case "popular":
        result.sort((a, b) => (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0));
        break;
      case "featured":
      default:
        result.sort((a, b) => {
          if (a.is_featured !== b.is_featured) return b.is_featured ? 1 : -1;
          if (a.is_popular !== b.is_popular) return b.is_popular ? 1 : -1;
          return 0;
        });
        break;
    }
    return result;
  }, [products, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compare
  const toggleCompare = (product: Product) => {
    setCompareProducts((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) {
        toast({ title: `Compare up to ${MAX_COMPARE} products`, variant: "destructive" });
        return prev;
      }
      return [...prev, product];
    });
  };

  return (
    <ErrorBoundary>
      <Layout>
        {/* Header */}
        <section className="relative py-6 sm:py-10 lg:py-14" style={{ background: "var(--gradient-hero)" }}>
          <div className="absolute inset-0 kente-pattern opacity-20" />
          <div className="container relative z-10 text-center px-4 sm:px-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-2 sm:mb-3">
              Shop All <span className="text-accent">Products</span>
            </h1>
            <p className="text-sm sm:text-base text-primary-foreground/80 max-w-lg mx-auto">
              Browse our complete catalog of solar systems, batteries, and accessories
            </p>
          </div>
        </section>

        {/* Search Bar - Sticky */}
        <section className="py-3 sm:py-4 border-b border-border sticky top-14 xs:top-16 md:top-20 z-40 bg-background/95 backdrop-blur-sm">
          <div className="container px-4 sm:px-6">
            <div className="relative w-full max-w-xl mx-auto lg:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-4 sm:py-6 lg:py-8">
          <div className="container px-4 sm:px-6">
            <InventoryAlert />

            <div className="flex gap-6 lg:gap-8">
              {/* Desktop Sidebar Filters */}
              <aside className="hidden lg:block w-[240px] xl:w-[260px] shrink-0">
                <div className="sticky top-36 space-y-4">
                  <h2 className="font-display font-bold text-base">Filters</h2>
                  <ShopFiltersSidebar
                    filters={filters}
                    onFiltersChange={setFilters}
                    categories={categories}
                    availableBrands={availableBrands}
                  />
                </div>
              </aside>

              {/* Product Grid Area */}
              <div className="flex-1 min-w-0">
                {/* Mobile filter controls */}
                <div className="mb-4">
                  <ShopFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    categories={categories}
                    availableBrands={availableBrands}
                    resultCount={filteredProducts.length}
                  />
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 sm:py-20">
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base px-4">
                      No products found matching your filters.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilters({
                          category: "all",
                          brands: [],
                          minPrice: 0,
                          maxPrice: 10000000,
                          sortBy: "featured",
                          inStock: false,
                        });
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {paginatedProducts.map((product) => (
                        <ScrollReveal key={product.id}>
                          <ProductCard
                            product={product}
                            onAddToCart={addToCart}
                            isComparing={!!compareProducts.find((p) => p.id === product.id)}
                            onToggleCompare={toggleCompare}
                            compareDisabled={compareProducts.length >= MAX_COMPARE}
                          />
                        </ScrollReveal>
                      ))}
                    </div>
                    <ShopPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Compare Floating Bar */}
        {compareProducts.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border-2 border-primary rounded-xl shadow-xl px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 max-w-[95vw]">
            <GitCompare className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm font-display font-bold whitespace-nowrap">
              {compareProducts.length}/{MAX_COMPARE}
            </span>
            <div className="flex gap-1">
              {compareProducts.map((p) => (
                <Badge key={p.id} variant="secondary" className="text-[10px] max-w-[80px] sm:max-w-[120px] truncate gap-1">
                  {p.name.split(" ").slice(0, 2).join(" ")}
                  <X className="w-2.5 h-2.5 shrink-0 cursor-pointer" onClick={() => toggleCompare(p)} />
                </Badge>
              ))}
            </div>
            <Button
              variant="amber"
              size="sm"
              onClick={() => setCompareOpen(true)}
              disabled={compareProducts.length < 2}
              className="text-[10px] sm:text-xs min-h-[36px] px-3"
            >
              Compare
            </Button>
          </div>
        )}

        <ProductComparison
          products={compareProducts}
          onRemove={(id) => setCompareProducts((prev) => prev.filter((p) => p.id !== id))}
          onClear={() => setCompareProducts([])}
          open={compareOpen}
          onOpenChange={setCompareOpen}
        />

        {/* CTA */}
        <section className="py-8 sm:py-10 lg:py-14 bg-forest">
          <div className="container text-center px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-primary-foreground mb-3 sm:mb-4">
              Need Help Choosing?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button variant="amber" size="lg" className="min-h-[44px] sm:min-h-[48px]">
                  Book a Free Power Audit →
                </Button>
              </Link>
              <a href="https://wa.me/2347062716154" target="_blank" rel="noopener noreferrer">
                <Button variant="hero-outline" size="lg" className="min-h-[44px] sm:min-h-[48px]">
                  WhatsApp Us →
                </Button>
              </a>
            </div>
          </div>
        </section>
      </Layout>
    </ErrorBoundary>
  );
};

export default Shop;
