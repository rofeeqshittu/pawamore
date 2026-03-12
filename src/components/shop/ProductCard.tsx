import { Link } from "react-router-dom";
import { Image as ImageIcon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuickBuyButton from "@/components/QuickBuyButton";
import WishlistButton from "@/components/WishlistButton";
import OptimizedImage from "@/components/OptimizedImage";

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  price: number;
  discount_price: number | null;
  is_featured: boolean;
  is_popular: boolean;
  promo_label: string | null;
  stock_quantity?: number | null;
  product_images: { image_url: string; is_primary: boolean }[];
  product_categories: { name: string; slug: string } | null;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const primaryImage = product.product_images?.find((i) => i.is_primary)?.image_url || product.product_images?.[0]?.image_url;
  const outOfStock = product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity <= 0;

  return (
    <div className={`rounded-xl overflow-hidden border-2 bg-card transition-all hover:shadow-[var(--shadow-elevated)] flex flex-col ${product.is_popular ? "border-accent" : "border-border"}`}>
      {/* Promo / Popular label */}
      {(product.promo_label || product.is_popular) && (
        <div className={`text-center py-1 font-display font-bold text-[10px] uppercase tracking-wider ${product.promo_label ? "bg-destructive text-destructive-foreground" : "bg-accent text-foreground"}`}>
          {product.promo_label || "⭐ Popular"}
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
        {primaryImage ? (
          <OptimizedImage src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/20" />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-2 left-2 bg-accent text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="font-display font-bold text-sm text-destructive bg-background/80 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {(product.product_categories as any) && (
          <span className="text-[9px] sm:text-[10px] font-display font-semibold text-primary uppercase tracking-wider">
            {(product.product_categories as any).name}
          </span>
        )}
        <h3 className="font-display font-bold text-sm sm:text-base mt-1 mb-1 line-clamp-2 leading-tight">{product.name}</h3>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
          {product.short_description || ""}
        </p>

        {/* Price */}
        <div className="mb-3">
          {product.discount_price ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-base sm:text-lg text-primary">₦{Number(product.discount_price).toLocaleString()}</span>
              <span className="text-muted-foreground text-[10px] sm:text-xs line-through">₦{Number(product.price).toLocaleString()}</span>
            </div>
          ) : (
            <span className="font-display font-extrabold text-base sm:text-lg text-primary">₦{Number(product.price).toLocaleString()}</span>
          )}
        </div>

      {/* Actions — stacked on mobile, row on larger screens */}
        <div className="flex flex-col gap-2 mt-auto">
          {/* Primary action row */}
          <Link to={`/products/${product.slug}`} className="w-full">
            <Button variant={product.is_popular ? "amber" : "outline"} className="w-full text-xs min-h-[40px] sm:min-h-[44px]" size="sm">
              View Details
            </Button>
          </Link>
          {/* Secondary actions row */}
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToCart(product.id)}
              disabled={outOfStock}
              className="flex-1 min-h-[36px] sm:min-h-[40px] text-[10px] sm:text-xs gap-1"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Cart</span>
            </Button>
            <WishlistButton productId={product.id} productName={product.name} size="sm" variant="outline" className="flex-1 min-h-[36px] sm:min-h-[40px] text-[10px] sm:text-xs" />
            <QuickBuyButton product={product} size="sm" className="flex-1 min-h-[36px] sm:min-h-[40px] text-[10px] sm:text-xs" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
