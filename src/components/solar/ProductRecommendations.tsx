import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import OptimizedImage from "@/components/OptimizedImage";
import { RecommendedShopProduct } from "@/lib/solar-product-recommendations";

interface ProductRecommendationsProps {
  recommendations: RecommendedShopProduct[];
}

const formatNaira = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

const ProductRecommendations = ({ recommendations }: ProductRecommendationsProps) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-base font-bold">
        <Sparkles className="h-4 w-4 text-solar-orange" />
        Top 2 Products for Your Setup
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Based on your load profile, here are strong matches from our current shop catalog.
      </p>

      <div className="space-y-3">
        {recommendations.map((product) => {
          const image =
            product.product_images?.find((item) => item.is_primary)?.image_url ??
            product.product_images?.[0]?.image_url ??
            null;
          const effectivePrice = product.discount_price ?? product.price;
          const inStock = product.stock_quantity === null || product.stock_quantity > 0;

          return (
            <div key={product.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image ? (
                    <OptimizedImage src={image} alt={product.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{product.recommendationReason}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-primary">{formatNaira(effectivePrice)}</span>
                    <span className={`text-[10px] font-semibold uppercase ${inStock ? "text-primary" : "text-destructive"}`}>
                      {inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 xs:flex-row">
                <Link to={`/products/${product.slug}`} className="flex-1">
                  <Button variant="outline" className="h-9 w-full text-xs font-semibold">
                    View Product
                  </Button>
                </Link>
                <a
                  href={`https://wa.me/2347062716154?text=${encodeURIComponent(`Hi PawaMore, I need advice on this product for my solar calculator estimate: ${product.name} - https://pawamore.lovable.app/products/${product.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="h-9 w-full bg-solar-orange text-xs font-semibold text-white hover:bg-solar-orange/90">
                    Ask on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground">
        If your exact model is not yet listed, we can source equivalent options and update your quote.
      </p>
    </div>
  );
};

export default ProductRecommendations;
