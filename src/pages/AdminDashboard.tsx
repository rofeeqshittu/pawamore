import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Plus, Edit, Trash2, Image as ImageIcon, Package, LogOut, Eye,
  ShoppingBag, Users, DollarSign, ChevronDown, ChevronUp, Bell,
  Mail, Star, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle
} from "lucide-react";
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
  short_description: string | null;
  created_at: string;
  product_images: { image_url: string; is_primary: boolean }[];
}

interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  status: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  payment_method: string | null;
  payment_status: string | null;
  notes: string | null;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; unit_price: number }[];
}

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  rating: number;
  is_approved: boolean;
  created_at: string;
  products?: { name: string } | null;
}

interface NewsletterSub {
  id: string;
  email: string;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  confirmed: "bg-primary/20 text-primary",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-primary/30 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: TrendingUp,
  shipped: Package,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "reviews" | "newsletter">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterSub[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setLoadingData(true);
    await Promise.all([fetchProducts(), fetchOrders(), fetchReviews(), fetchNewsletters()]);
    setLoadingData(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, product_images(image_url, is_primary)")
      .order("created_at", { ascending: false });
    setProducts((data as any) || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(id, product_name, quantity, unit_price)")
      .order("created_at", { ascending: false });
    setOrders((data as any) || []);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false });
    setReviews((data as any) || []);
  };

  const fetchNewsletters = async () => {
    const { data } = await supabase
      .from("newsletter_subscriptions")
      .select("*")
      .order("subscribed_at", { ascending: false });
    setNewsletters((data as any) || []);
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
      setDeleteId(null);
      toast({ title: "Product deleted" });
    } else {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus as any }).eq("id", orderId);
    if (!error) {
      setOrders(orders.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: `Order marked as ${newStatus}` });
    }
  };

  const toggleReviewApproval = async (reviewId: string, isApproved: boolean) => {
    const { error } = await supabase.from("product_reviews").update({ is_approved: !isApproved }).eq("id", reviewId);
    if (!error) {
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_approved: !isApproved } : r));
      toast({ title: !isApproved ? "Review approved" : "Review unapproved" });
    }
  };

  const deleteReview = async (reviewId: string) => {
    const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
    if (!error) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast({ title: "Review deleted" });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner text="Loading admin panel..." size="lg" />
    </div>
  );
  if (!isAdmin) return null;

  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 5).length;
  const pendingReviews = reviews.filter(r => !r.is_approved).length;
  const activeNewsletters = newsletters.filter(n => n.is_active).length;

  const filteredOrders = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-forest border-b border-primary-foreground/10 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="PawaMore" className="h-8 w-auto rounded-lg" />
            <span className="font-display font-bold text-primary-foreground text-sm hidden sm:inline">Admin</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {(pendingOrders > 0 || pendingReviews > 0 || lowStockProducts > 0) && (
              <div className="relative">
                <Bell className="w-5 h-5 text-primary-foreground/70" />
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {pendingOrders + pendingReviews + lowStockProducts}
                </span>
              </div>
            )}
            <Link to="/"><Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground text-xs"><Eye className="w-4 h-4 mr-1" /> Site</Button></Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground text-xs"><LogOut className="w-4 h-4 mr-1" /> Logout</Button>
          </div>
        </div>
      </header>

      <div className="container py-6 sm:py-8 px-4">
        {/* Tabs */}
        <Tabs defaultValue="dashboard" onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full overflow-x-auto justify-start mb-6 sm:mb-8 flex-nowrap h-auto gap-1 flex flex-wrap bg-muted p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm whitespace-nowrap">
              <Package className="w-3.5 h-3.5 mr-1" />Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs sm:text-sm whitespace-nowrap">
              <ShoppingBag className="w-3.5 h-3.5 mr-1" />Orders
              {pendingOrders > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrders}</span>}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs sm:text-sm whitespace-nowrap">
              <Star className="w-3.5 h-3.5 mr-1" />Reviews
              {pendingReviews > 0 && <span className="ml-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingReviews}</span>}
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="text-xs sm:text-sm whitespace-nowrap">
              <Mail className="w-3.5 h-3.5 mr-1" />Newsletter
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <Package className="w-5 h-5 text-primary mb-2" />
                <p className="font-display font-extrabold text-xl sm:text-2xl">{products.length}</p>
                <p className="text-xs text-muted-foreground">Total Products</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <ShoppingBag className="w-5 h-5 text-primary mb-2" />
                <p className="font-display font-extrabold text-xl sm:text-2xl">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <DollarSign className="w-5 h-5 text-accent mb-2" />
                <p className="font-display font-extrabold text-lg sm:text-xl">₦{(totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <Users className="w-5 h-5 text-blue-500 mb-2" />
                <p className="font-display font-extrabold text-xl sm:text-2xl">{activeNewsletters}</p>
                <p className="text-xs text-muted-foreground">Subscribers</p>
              </div>
            </div>

            {/* Alerts */}
            <div className="space-y-3">
              {pendingOrders > 0 && (
                <div className="flex items-center gap-3 p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                  <p className="text-sm font-medium">{pendingOrders} order(s) awaiting confirmation</p>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("orders")}>Review</Button>
                </div>
              )}
              {lowStockProducts > 0 && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <p className="text-sm font-medium">{lowStockProducts} product(s) running low on stock</p>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("products")}>Review</Button>
                </div>
              )}
              {pendingReviews > 0 && (
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <Star className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">{pendingReviews} review(s) awaiting approval</p>
                  <Button variant="outline" size="sm" className="ml-auto" onClick={() => setActiveTab("reviews")}>Review</Button>
                </div>
              )}
              {pendingOrders === 0 && lowStockProducts === 0 && pendingReviews === 0 && (
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium">All clear! No pending actions.</p>
                </div>
              )}
            </div>

            {/* Quick order status breakdown */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h3 className="font-display font-bold mb-4">Orders by Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orderStatuses.map(status => {
                  const count = orders.filter(o => o.status === status).length;
                  const StatusIcon = statusIcons[status] || Clock;
                  return (
                    <div key={status} className="p-3 bg-secondary rounded-lg flex items-center gap-3">
                      <StatusIcon className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-bold text-sm">{count}</p>
                        <p className="text-xs text-muted-foreground capitalize">{status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent orders */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold">Recent Orders</h3>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("orders")}>View All</Button>
              </div>
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{order.shipping_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">₦{Number(order.total_amount).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || "bg-secondary"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold">All Products</h2>
              <Link to="/admin/products/new">
                <Button variant="amber" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Product</Button>
              </Link>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-16">
                <LoadingSpinner text="Loading products..." />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products yet.</p>
                <Link to="/admin/products/new"><Button variant="amber">Add First Product →</Button></Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className={`bg-card rounded-xl border overflow-hidden hover:shadow-[var(--shadow-card)] transition-shadow ${product.stock_quantity < 5 && product.stock_quantity > 0 ? "border-destructive/50" : "border-border"}`}>
                    {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                      <div className="bg-destructive/10 text-destructive text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low Stock: {product.stock_quantity} left
                      </div>
                    )}
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {primaryImage(product) ? (
                        <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground/30" /></div>
                      )}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {product.is_featured && <span className="bg-accent text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Featured</span>}
                        {product.is_popular && <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>}
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.status === "active" ? "bg-primary/20 text-primary" : product.status === "draft" ? "bg-muted text-muted-foreground" : "bg-destructive/20 text-destructive"}`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm mb-1 truncate">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display font-bold text-primary text-sm">₦{Number(product.discount_price || product.price).toLocaleString()}</span>
                        <span className={`text-xs ${product.stock_quantity < 5 && product.stock_quantity > 0 ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                          Stock: {product.stock_quantity}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/admin/products/${product.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs"><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(product.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {deleteId === product.id && (
                      <div className="border-t border-border p-3 bg-destructive/5 flex items-center justify-between">
                        <span className="text-xs text-destructive font-medium">Delete "{product.name}"?</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setDeleteId(null)}>Cancel</Button>
                          <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold">Customer Orders</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}
                >
                  All ({orders.length})
                </button>
                {orderStatuses.map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10"}`}
                  >
                    {s} ({orders.filter(o => o.status === s).length})
                  </button>
                ))}
              </div>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-muted-foreground font-mono">#{order.id.slice(0, 8)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>{order.status}</span>
                          {order.guest_email && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Guest</span>}
                        </div>
                        <p className="font-display font-bold text-sm mt-1">{order.shipping_name}</p>
                        <p className="text-xs text-muted-foreground">{order.shipping_city} • {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-display font-bold text-primary">₦{Number(order.total_amount).toLocaleString()}</p>
                        {expandedOrder === order.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {expandedOrder === order.id && (
                      <div className="border-t border-border p-4 bg-secondary/20 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Customer</p>
                            <p className="text-sm font-medium">{order.shipping_name}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                            <p className="text-sm text-muted-foreground">{order.guest_email || "Registered user"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Delivery</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                            <p className="text-sm text-muted-foreground">{order.shipping_city}</p>
                            <p className="text-sm text-muted-foreground">Payment: {order.payment_method?.replace("_", " ")}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Update Status</p>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              {orderStatuses.map((s) => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {order.notes && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Customer Notes</p>
                            <p className="text-sm text-muted-foreground">{order.notes}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">Items</p>
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between py-1.5 text-sm border-b border-border last:border-0">
                              <span>{item.product_name} × {item.quantity}</span>
                              <span className="font-semibold">₦{(Number(item.unit_price) * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="flex justify-between pt-3 font-display font-bold">
                            <span>Total</span>
                            <span className="text-primary">₦{Number(order.total_amount).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <h2 className="text-lg sm:text-xl font-extrabold mb-6">Product Reviews</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className={`bg-card border rounded-xl p-4 ${!review.is_approved ? "border-accent/50" : "border-border"}`}>
                    {!review.is_approved && (
                      <div className="text-xs font-bold text-accent mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending approval
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                        {review.content && <p className="text-sm text-muted-foreground mb-2">{review.content}</p>}
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>Product: {(review as any).products?.name || "Unknown"}</span>
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={review.is_approved ? "outline" : "default"}
                          size="sm"
                          className="text-xs"
                          onClick={() => toggleReviewApproval(review.id, review.is_approved)}
                        >
                          {review.is_approved ? "Unapprove" : "Approve"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => deleteReview(review.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold">Newsletter Subscribers</h2>
              <div className="text-sm text-muted-foreground">
                {activeNewsletters} active / {newsletters.length} total
              </div>
            </div>
            {newsletters.length === 0 ? (
              <div className="text-center py-16">
                <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No subscribers yet.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newsletters.map(sub => (
                        <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{sub.email}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize hidden sm:table-cell">{sub.source || "website"}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{new Date(sub.subscribed_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sub.is_active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {sub.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;