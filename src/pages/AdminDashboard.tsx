import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Plus, Edit, Trash2, Image as ImageIcon, Package, LogOut, Eye,
  ShoppingBag, Users, DollarSign, ChevronDown, ChevronUp, Bell,
  Mail, Star, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle,
  Ticket, HelpCircle, Bot, Link2
} from "lucide-react";
import SupportTicketManagement from "@/components/admin/SupportTicketManagement";
import FAQManagement from "@/components/admin/FAQManagement";
import SalesAnalytics from "@/components/admin/SalesAnalytics";
import CustomerManagement from "@/components/admin/CustomerManagement";
import NewsletterComposer from "@/components/admin/NewsletterComposer";
import ScraperManager from "@/components/admin/ScraperManager";
import ProductImportModal from "@/components/admin/ProductImportModal";
import MoveCategoryModal from "@/components/admin/MoveCategoryModal";
import AdjustPriceModal from "@/components/admin/AdjustPriceModal";
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
  processing: "bg-primary/15 text-primary",
  shipped: "bg-primary/25 text-primary",
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
const REQUEST_TIMEOUT_MS = 12000;

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "reviews" | "newsletter" | "customers">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newsletters, setNewsletters] = useState<NewsletterSub[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serverVerifiedAdmin, setServerVerifiedAdmin] = useState<boolean | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedCount = selectedIds.length;
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deletedBuffer, setDeletedBuffer] = useState<Product[]>([]);
  const [trashProducts, setTrashProducts] = useState<Product[]>([]);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [purgeTarget, setPurgeTarget] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string | null>(null);
  const [openMoveCategoryModal, setOpenMoveCategoryModal] = useState(false);
  const [openAdjustPriceModal, setOpenAdjustPriceModal] = useState(false);
  const [openBulkActionsDialog, setOpenBulkActionsDialog] = useState(false);
  const undoTimeoutRef = useRef<number | null>(null);

  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number, label: string) =>
    Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);

  // Server-side admin verification — prevents DevTools bypass
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    const verifyAdmin = async () => {
      try {
        const { data, error } = await withTimeout(
          Promise.resolve(supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })),
          REQUEST_TIMEOUT_MS,
          "Admin permission check"
        );
        if (error || !data) {
          setServerVerifiedAdmin(false);
          navigate("/");
          return;
        }
        setServerVerifiedAdmin(true);
      } catch (error) {
        setServerVerifiedAdmin(false);
        toast({
          title: "Admin check failed",
          description: error instanceof Error ? error.message : "Could not verify admin access",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    verifyAdmin();
  }, [user, loading, navigate]);

  useEffect(() => {
    if (serverVerifiedAdmin) {
      loadAllData();
    }
  }, [serverVerifiedAdmin]);

  const loadAllData = async () => {
    setLoadingData(true);
    const tasks: Array<[string, () => Promise<void>]> = [
      ["products", fetchProducts],
      ["orders", fetchOrders],
      ["reviews", fetchReviews],
      ["newsletters", fetchNewsletters],
      ["trash", fetchTrashProducts],
      ["categories", fetchCategories],
    ];

    const results = await Promise.allSettled(tasks.map(([, run]) => run()));
    const failedLoads = results.flatMap((result, index) =>
      result.status === "rejected" ? [tasks[index][0]] : []
    );

    if (failedLoads.length > 0) {
      toast({
        title: "Partial admin data loaded",
        description: `Could not load: ${failedLoads.join(", ")}`,
        variant: "destructive",
      });
    }
    setLoadingData(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase
        .from("products")
        .select("*, product_images(image_url, is_primary)")
        .neq("status", "deleted")
        .order("created_at", { ascending: false })),
      REQUEST_TIMEOUT_MS,
      "Load products"
    );
    if (error) throw error;
    setProducts((data as any) || []);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('product_categories').select('id,name,slug').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase
        .from("orders")
        .select("*, order_items(id, product_name, quantity, unit_price)")
        .order("created_at", { ascending: false })),
      REQUEST_TIMEOUT_MS,
      "Load orders"
    );
    if (error) throw error;
    setOrders((data as any) || []);
  };

  const fetchReviews = async () => {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase
        .from("product_reviews")
        .select("*, products(name)")
        .order("created_at", { ascending: false })),
      REQUEST_TIMEOUT_MS,
      "Load reviews"
    );
    if (error) throw error;
    setReviews((data as any) || []);
  };

  const fetchNewsletters = async () => {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase
        .from("newsletter_subscriptions")
        .select("*")
        .order("subscribed_at", { ascending: false })),
      REQUEST_TIMEOUT_MS,
      "Load newsletters"
    );
    if (error) throw error;
    setNewsletters((data as any) || []);
  };

  const fetchTrashProducts = async () => {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase
        .from("products")
        .select("*, product_images(image_url, is_primary)")
        .eq("status", "deleted")
        .order("created_at", { ascending: false })),
      REQUEST_TIMEOUT_MS,
      "Load trash"
    );
    if (error) throw error;
    setTrashProducts((data as any) || []);
  };

  const handleDeleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    try {
      const { error } = await supabase.from("products").update({ status: "deleted", deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;

      // Move to deleted buffer so undo can restore status
      setDeletedBuffer(prev => [...prev, product]);
      setProducts(products.filter((p) => p.id !== id));
      setDeleteId(null);
      setSelectedIds(selectedIds.filter(sid => sid !== id));

      // start undo timer for single delete
      if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = window.setTimeout(() => setDeletedBuffer([]), 15000);

      toast({ title: "Product marked deleted (undo available)" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  // Selection helpers for bulk actions
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const ids = displayedProducts.map(p => p.id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) {
      // remove displayed ids from selection
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    // Open confirmation dialog
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const toDelete = products.filter(p => selectedIds.includes(p.id));
    try {
      const { error } = await supabase.rpc('bulk_update_products', { p_ids: selectedIds, p_new_status: 'deleted' });
      if (!error) {
        setProducts(products.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
        setDeletedBuffer(toDelete);
        setBulkDeleteOpen(false);
        // allow undo for 15s
        if (undoTimeoutRef.current) window.clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = window.setTimeout(() => setDeletedBuffer([]), 15000);
        toast({ title: `Marked ${toDelete.length} products deleted (undo available)` });
      } else {
        toast({ title: "Bulk delete failed", description: error.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Bulk delete failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  const undoBulkDelete = async () => {
    if (deletedBuffer.length === 0) return;
    try {
      // Restore status for each buffered product
      for (const p of deletedBuffer) {
        const originalStatus = p.status || "draft";
        const { error } = await supabase.from("products").update({ status: originalStatus, deleted_at: null }).eq("id", p.id);
        if (error) console.error("Failed to restore product status for", p.id, error);
      }
      // Put them back in UI list
      setProducts(prev => [...deletedBuffer, ...prev]);
      setDeletedBuffer([]);
      if (undoTimeoutRef.current) { window.clearTimeout(undoTimeoutRef.current); undoTimeoutRef.current = null; }
      toast({ title: "Restored deleted products" });
    } catch (err: any) {
      toast({ title: "Undo failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.rpc('bulk_update_products', { p_ids: selectedIds, p_new_status: newStatus });
      if (error) throw error;
      setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, status: newStatus } : p));
      setSelectedIds([]);
      toast({ title: `Updated status for ${selectedCount} products` });
    } catch (err: any) {
      toast({ title: "Bulk update failed", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleBulkSetFeatured = async (isFeatured: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.rpc('bulk_update_products', { p_ids: selectedIds, p_featured: isFeatured });
      if (error) throw error;
      setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, is_featured: isFeatured } : p));
      setSelectedIds([]);
      toast({ title: `Updated featured for ${selectedCount} products` });
    } catch (err: any) {
      toast({ title: 'Bulk featured update failed', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const handleBulkSetPopular = async (isPopular: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.rpc('bulk_update_products', { p_ids: selectedIds, p_popular: isPopular });
      if (error) throw error;
      setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, is_popular: isPopular } : p));
      setSelectedIds([]);
      toast({ title: `Updated popular for ${selectedCount} products` });
    } catch (err: any) {
      toast({ title: 'Bulk popular update failed', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const handleBulkChangeCategory = async (categoryId: string) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from('products').update({ category_id: categoryId }).in('id', selectedIds);
    if (!error) {
      setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, category_id: categoryId } : p));
      setSelectedIds([]);
      toast({ title: `Moved ${selectedCount} products to selected category` });
    } else {
      toast({ title: 'Bulk category change failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleBulkAdjustPrice = async (percent: number) => {
    if (selectedIds.length === 0) return;
    try {
      const { error } = await supabase.rpc('bulk_update_products', { p_ids: selectedIds, p_price_percent: Math.round(percent) });
      if (error) throw error;
      // Update client-side representation conservatively
      const updated = products.map(p => {
        if (!selectedIds.includes(p.id)) return p;
        const base = p.discount_price || p.price;
        const newPrice = Math.max(0, Math.round(base * (1 + percent / 100)));
        return { ...p, price: newPrice, discount_price: p.discount_price ? newPrice : null };
      });
      setProducts(updated);
      setSelectedIds([]);
      toast({ title: `Adjusted prices for ${selectedCount} products by ${percent}%` });
    } catch (err: any) {
      toast({ title: 'Bulk price adjust failed', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const exportSelectedCSV = () => {
    if (selectedIds.length === 0) return;
    const rows = products.filter(p => selectedIds.includes(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      discount_price: p.discount_price,
      status: p.status,
      category_id: p.category_id,
      stock_quantity: p.stock_quantity
    }));
    const csv = [Object.keys(rows[0]).join(',') , ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products_export.csv'; a.click();
    URL.revokeObjectURL(url);
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

  // Restore a single trashed product
  const restoreProduct = async (id: string) => {
    const p = trashProducts.find(t => t.id === id);
    if (!p) return;
    try {
      const { error } = await supabase.from("products").update({ status: p.status || 'draft', deleted_at: null }).eq("id", id);
      if (error) throw error;
      setTrashProducts(prev => prev.filter(t => t.id !== id));
      setProducts(prev => [p, ...prev]);
      toast({ title: 'Product restored' });
    } catch (err: any) {
      toast({ title: 'Restore failed', description: err.message || String(err), variant: 'destructive' });
    }
  };

  const purgeProduct = async (id: string) => {
    try {
      const { error: imgErr } = await supabase.from('product_images').delete().eq('product_id', id);
      if (imgErr) console.error('Failed deleting images', imgErr);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setTrashProducts(prev => prev.filter(p => p.id !== id));
      setPurgeDialogOpen(false);
      setPurgeTarget(null);
      toast({ title: 'Permanently deleted' });
    } catch (err: any) {
      toast({ title: 'Purge failed', description: err.message || String(err), variant: 'destructive' });
    }
  };
  if (!isAdmin) return null;

  const primaryImage = (p: Product) => p.product_images?.find((i) => i.is_primary)?.image_url || p.product_images?.[0]?.image_url;

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 5).length;
  const pendingReviews = reviews.filter(r => !r.is_approved).length;
  const activeNewsletters = newsletters.filter(n => n.is_active).length;

  const filteredOrders = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  // select-all state: true | false | "indeterminate"
  const displayedProducts = productCategoryFilter ? products.filter(p => p.category_id === productCategoryFilter) : products;
  const selectAllState: boolean | "indeterminate" = displayedProducts.length === 0 ? false : (selectedCount === 0 ? false : (selectedCount === displayedProducts.length ? true : "indeterminate"));

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
            <TabsTrigger value="customers" className="text-xs sm:text-sm whitespace-nowrap">
              <Users className="w-3.5 h-3.5 mr-1" />Customers
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs sm:text-sm whitespace-nowrap">
              <Ticket className="w-3.5 h-3.5 mr-1" />Support
            </TabsTrigger>
            <TabsTrigger value="faqs" className="text-xs sm:text-sm whitespace-nowrap">
              <HelpCircle className="w-3.5 h-3.5 mr-1" />FAQs
            </TabsTrigger>
            <TabsTrigger value="scraper" className="text-xs sm:text-sm whitespace-nowrap">
              <Bot className="w-3.5 h-3.5 mr-1" />Scraper
            </TabsTrigger>
            <TabsTrigger value="trash" className="text-xs sm:text-sm whitespace-nowrap">
              <Trash2 className="w-3.5 h-3.5 mr-1" />Trash
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <SalesAnalytics orders={orders} />

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
              <div className="flex items-center gap-4">
                <Checkbox checked={selectAllState} onCheckedChange={toggleSelectAll} aria-label={selectedCount === displayedProducts.length && displayedProducts.length > 0 ? "Deselect visible products" : "Select visible products"} />
                <h2 className="text-lg sm:text-xl font-extrabold">All Products</h2>
                <div className="sr-only" aria-live="polite">{selectedCount} products selected</div>
                <div className="flex items-center gap-2 ml-2">
                  <label className="text-sm text-muted-foreground">Category:</label>
                  <select value={productCategoryFilter || ""} onChange={(e) => setProductCategoryFilter(e.target.value || null)} className="rounded border border-input px-2 py-1 text-sm">
                    <option value="">All</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Button size="sm" onClick={() => { 
                    // select displayed products
                    const ids = displayedProducts.map(p => p.id);
                    setSelectedIds(prev => {
                      const allSelected = ids.every(id => prev.includes(id));
                      return allSelected ? prev.filter(id => !ids.includes(id)) : Array.from(new Set([...prev, ...ids]));
                    });
                  }}>Select by filter</Button>
                </div>
                {selectedCount > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>Delete ({selectedCount})</Button>
                    <Button size="sm" onClick={() => handleBulkUpdateStatus('active')}>Publish</Button>
                    <Button size="sm" onClick={() => handleBulkUpdateStatus('draft')}>Unpublish</Button>
                    <Button size="sm" onClick={() => handleBulkSetFeatured(true)}>Set Featured</Button>
                    <Button size="sm" onClick={() => handleBulkSetFeatured(false)}>Unset Featured</Button>
                    <Button size="sm" onClick={() => handleBulkSetPopular(true)}>Set Popular</Button>
                    <Button size="sm" onClick={() => handleBulkSetPopular(false)}>Unset Popular</Button>
                    <Button size="sm" onClick={() => setOpenMoveCategoryModal(true)}>Move Category</Button>
                    <Button size="sm" onClick={() => setOpenAdjustPriceModal(true)}>Adjust Price %</Button>

                    {/* Compact bulk actions for small screens */}
                    <div className="sm:hidden">
                      <Button size="sm" onClick={() => setOpenBulkActionsDialog(true)}>Bulk actions</Button>
                    </div>
                    <Button size="sm" onClick={() => exportSelectedCSV()}>Export CSV</Button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)} className="gap-1">
                  <Link2 className="w-4 h-4" /> Import from URL
                </Button>
                <Link to="/admin/products/new">
                  <Button variant="amber" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Manually</Button>
                </Link>
              </div>
            </div>

            {/* Undo banner for bulk deletes */}
            {deletedBuffer.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded flex items-center justify-between" role="status" aria-live="polite">
                <div className="text-sm">Deleted {deletedBuffer.length} product{deletedBuffer.length !== 1 ? 's' : ''}.</div>
                <div className="flex gap-2" role="group" aria-label="Undo deleted products">
                  <Button size="sm" onClick={undoBulkDelete}>Undo</Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeletedBuffer([])}>Dismiss</Button>
                </div>
              </div>
            )}

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
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No products match the selected category.</p>
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" onClick={() => setProductCategoryFilter(null)}>Show all products</Button>
                  <Link to="/admin/products/new"><Button variant="amber" size="sm">Add product</Button></Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedProducts.map((product) => (
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
                      <div className="flex items-center gap-2 mb-1">
                        <Checkbox checked={selectedIds.includes(product.id)} onCheckedChange={(val) => { if (val) setSelectedIds(prev => prev.includes(product.id) ? prev : [...prev, product.id]); else setSelectedIds(prev => prev.filter(id => id !== product.id)); }} aria-label={`Select product ${product.name}`} />
                        <h3 className="font-display font-bold text-sm truncate">{product.name}</h3>
                      </div>
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

          {/* Trash Tab */}
          <TabsContent value="trash">
            <h2 className="text-lg sm:text-xl font-extrabold mb-6">Trash (Deleted Products)</h2>
            {trashProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No deleted products.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trashProducts.map((product) => (
                  <div key={product.id} className="bg-card rounded-xl border overflow-hidden border-border">
                    <div className="aspect-video bg-secondary relative overflow-hidden">
                      {primaryImage(product) ? (
                        <img src={primaryImage(product)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-muted-foreground/30" /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm truncate mb-2">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display font-bold text-primary text-sm">₦{Number(product.discount_price || product.price).toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">Deleted</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => restoreProduct(product.id)}>Restore</Button>
                        <Button size="sm" variant="destructive" onClick={() => { setPurgeTarget(product.id); setPurgeDialogOpen(true); }}>Permanently Delete</Button>
                      </div>
                    </div>
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

          {/* Old newsletter tab removed - replaced by new one below */}

          {/* Newsletter Tab - add composer above subscriber list */}
          <TabsContent value="newsletter">
            <div className="space-y-6">
              <NewsletterComposer subscribers={newsletters} />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Subscribers</h2>
                <span className="text-sm text-muted-foreground">{activeNewsletters} active / {newsletters.length} total</span>
              </div>
              {newsletters.length > 0 && (
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
                          <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
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
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <CustomerManagement />
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support">
            <h2 className="text-lg sm:text-xl font-extrabold mb-6">Support Tickets</h2>
            <SupportTicketManagement />
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <FAQManagement />
          </TabsContent>

          {/* Scraper Tab */}
          <TabsContent value="scraper">
            <ScraperManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bulk delete confirmation dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm delete</DialogTitle>
            <DialogDescription>
              This will mark {selectedCount} product{selectedCount !== 1 ? 's' : ''} as deleted (soft-delete). They will be hidden from the catalog and you will have 15 seconds to undo this action from the banner. To permanently remove items, use the Trash tab.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purge confirmation dialog */}
      <Dialog open={purgeDialogOpen} onOpenChange={setPurgeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Permanently delete product</DialogTitle>
            <DialogDescription>
              This will permanently delete the product and its images. This action cannot be undone. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => { setPurgeDialogOpen(false); setPurgeTarget(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={() => purgeProduct(purgeTarget || '')}>Permanently Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Import Modal */}
      <ProductImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={fetchProducts}
      />

      {/* Move Category Modal */}
      <MoveCategoryModal
        open={openMoveCategoryModal}
        onOpenChange={setOpenMoveCategoryModal}
        categories={categories}
        onConfirm={(categoryId) => handleBulkChangeCategory(categoryId)}
        disabled={selectedCount === 0}
      />

      {/* Adjust Price Modal */}
      <AdjustPriceModal
        open={openAdjustPriceModal}
        onOpenChange={setOpenAdjustPriceModal}
        onConfirm={(percent) => handleBulkAdjustPrice(percent)}
        disabled={selectedCount === 0}
      />
    </div>
  );
};

export default AdminDashboard;
