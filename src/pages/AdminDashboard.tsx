import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Image, Package, LogOut, LayoutDashboard, Star, Eye } from "lucide-react";
import logo from "@/assets/logo.png";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  status: string;
  is_featured: boolean;
  is_popular: boolean;
  promo_label: string | null;
  stock_quantity: number;
  category_id: string | null;
  short_description: string | null;
  created_at: string;
  product_images: { image_url: string; is_primary: boolean }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, product_images(image_url, is_primary)")
      .order("created_at", { ascending: false });
    setProducts((data as any) || []);
    setLoadingProducts(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("product_categories").select("*").order("sort_order");
    setCategories((data as any) || []);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter((p) => p.id !== id));
    setDeleteId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

  const primaryImage = (p: Product) => {
    const primary = p.product_images?.find((i) => i.is_primary);
    return primary?.image_url || p.product_images?.[0]?.image_url;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-forest border-b border-primary-foreground/10 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="PawaMore" className="h-8 w-auto rounded-lg" />
            <span className="font-display font-bold text-primary-foreground text-sm hidden sm:inline">Admin</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground text-xs">
                <Eye className="w-4 h-4 mr-1" /> View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground text-xs">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-primary" /> Product Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
          </div>
          <Link to="/admin/products/new">
            <Button variant="amber" size="default" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="text-center py-20 text-muted-foreground">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No products yet. Add your first product!</p>
            <Link to="/admin/products/new">
              <Button variant="amber">Add First Product →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow">
                {/* Image */}
                <div className="aspect-video bg-secondary relative overflow-hidden">
                  {primaryImage(product) ? (
                    <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {product.is_featured && <span className="bg-accent text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>}
                    {product.is_popular && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
                    {product.promo_label && <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{product.promo_label}</span>}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      product.status === 'active' ? 'bg-primary/20 text-primary' :
                      product.status === 'draft' ? 'bg-muted text-muted-foreground' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-bold text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-muted-foreground text-xs truncate mb-2">{product.short_description || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      {product.discount_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-primary text-sm">₦{Number(product.discount_price).toLocaleString()}</span>
                          <span className="text-muted-foreground text-xs line-through">₦{Number(product.price).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="font-display font-bold text-primary text-sm">₦{Number(product.price).toLocaleString()}</span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">Stock: {product.stock_quantity}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/admin/products/${product.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(product.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Delete confirmation */}
                {deleteId === product.id && (
                  <div className="border-t border-border p-3 bg-destructive/5 flex items-center justify-between">
                    <span className="text-xs text-destructive font-medium">Delete this product?</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setDeleteId(null)}>Cancel</Button>
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDelete(product.id)}>Delete</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
