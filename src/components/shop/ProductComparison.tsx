import { X, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import OptimizedImage from "@/components/OptimizedImage";
import { stripHtml } from "@/lib/htmlUtils";
import { Link } from "react-router-dom";

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
  specs: any;
  product_images: { image_url: string; is_primary: boolean }[];
  product_categories: { name: string; slug: string } | null;
}

interface ProductComparisonProps {
  products: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductComparison = ({ products, onRemove, onClear, open, onOpenChange }: ProductComparisonProps) => {
  // Collect all spec keys
  const allSpecKeys = new Set<string>();
  products.forEach((p) => {
    if (p.specs && typeof p.specs === "object") {
      Object.keys(p.specs).forEach((k) => allSpecKeys.add(k));
    }
  });
  const specKeys = Array.from(allSpecKeys);

  const getImage = (p: Product) =>
    p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-display text-base sm:text-xl flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Compare Products ({products.length})
          </DialogTitle>
        </DialogHeader>

        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No products selected for comparison.</p>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr>
                  <th className="text-left p-2 font-display text-xs text-muted-foreground w-24 sm:w-32 sticky left-0 bg-background">Feature</th>
                  {products.map((p) => (
                    <th key={p.id} className="p-2 text-center min-w-[120px] sm:min-w-[160px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          onClick={() => onRemove(p.id)}
                          className="self-end text-muted-foreground hover:text-destructive"
                          title="Remove"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        {getImage(p) && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-secondary">
                            <OptimizedImage src={getImage(p)!} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Link to={`/products/${p.slug}`} className="font-display font-bold text-xs sm:text-sm text-center hover:text-primary line-clamp-2">
                          {p.name}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Price */}
                <tr className="bg-secondary/30">
                  <td className="p-2 font-display font-semibold text-xs sticky left-0 bg-secondary/30">Price</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-2 text-center">
                      <span className="font-display font-extrabold text-sm sm:text-base text-primary">
                        ₦{Number(p.discount_price ?? p.price).toLocaleString()}
                      </span>
                      {p.discount_price && (
                        <span className="block text-[10px] text-muted-foreground line-through">
                          ₦{Number(p.price).toLocaleString()}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr>
                  <td className="p-2 font-display font-semibold text-xs sticky left-0 bg-background">Category</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-2 text-center text-xs">
                      {(p.product_categories as any)?.name || "—"}
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr className="bg-secondary/30">
                  <td className="p-2 font-display font-semibold text-xs sticky left-0 bg-secondary/30">Stock</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-2 text-center">
                      {p.stock_quantity === null || p.stock_quantity === undefined ? (
                        <Badge variant="secondary" className="text-[10px]">Available</Badge>
                      ) : p.stock_quantity > 0 ? (
                        <Badge className="text-[10px] bg-green-600">{p.stock_quantity} left</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">Out of Stock</Badge>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr>
                  <td className="p-2 font-display font-semibold text-xs sticky left-0 bg-background">Description</td>
                  {products.map((p) => (
                    <td key={p.id} className="p-2 text-center text-[11px] text-muted-foreground line-clamp-3">
                      {stripHtml(p.short_description || "—")}
                    </td>
                  ))}
                </tr>

                {/* Dynamic Specs */}
                {specKeys.map((key, idx) => (
                  <tr key={key} className={idx % 2 === 0 ? "bg-secondary/30" : ""}>
                    <td className={`p-2 font-display font-semibold text-xs capitalize sticky left-0 ${idx % 2 === 0 ? "bg-secondary/30" : "bg-background"}`}>
                      {key.replace(/_/g, " ")}
                    </td>
                    {products.map((p) => (
                      <td key={p.id} className="p-2 text-center text-xs">
                        {p.specs && typeof p.specs === "object" ? String((p.specs as any)[key] ?? "—") : "—"}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Action */}
                <tr>
                  <td className="p-2 sticky left-0 bg-background"></td>
                  {products.map((p) => (
                    <td key={p.id} className="p-2 text-center">
                      <Link to={`/products/${p.slug}`}>
                        <Button variant="amber" size="sm" className="text-[10px] sm:text-xs min-h-[36px]">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {products.length > 0 && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClear} className="text-xs gap-1">
              <X className="w-3.5 h-3.5" /> Clear All
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductComparison;
