import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

interface Category { id: string; name: string; slug: string; }
interface Brand { id: string; name: string; slug: string; }

const AdminProductForm = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [images, setImages] = useState<{ id?: string; url: string; is_primary: boolean }[]>([]);
  const [videos, setVideos] = useState<{ id?: string; video_url: string; thumbnail_url?: string; sort_order: number }[]>([]);

  const [form, setForm] = useState({
    name: "", slug: "", category_id: "", brand_id: "", description: "", short_description: "",
    price: "", discount_price: "", powers: "", ideal_for: "", promo_label: "",
    stock_quantity: "0", status: "active", is_featured: false, is_popular: false,
    specs: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (isEditing) fetchProduct();
  }, [isEditing]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("product_categories").select("id, name, slug").order("sort_order");
    setCategories((data as any) || []);
  };

  const fetchBrands = async () => {
    const { data } = await supabase.from("brands").select("id, name, slug").order("name");
    setBrands((data as any) || []);
  };

  const fetchProduct = async () => {
    const { data } = await supabase.from("products").select("*, product_images(id, image_url, is_primary, sort_order), product_videos(id, video_url, thumbnail_url, sort_order)").eq("id", id!).single();
    if (data) {
      setForm({
        name: data.name, slug: data.slug, category_id: data.category_id || "",
        brand_id: (data as any).brand_id || "",
        description: data.description || "", short_description: data.short_description || "",
        price: String(data.price), discount_price: data.discount_price ? String(data.discount_price) : "",
        powers: data.powers || "", ideal_for: data.ideal_for || "", promo_label: data.promo_label || "",
        stock_quantity: String(data.stock_quantity), status: data.status || "active",
        is_featured: data.is_featured || false, is_popular: data.is_popular || false,
        specs: data.specs ? JSON.stringify(data.specs, null, 2) : "",
      });
      setImages(((data as any).product_images || []).map((img: any) => ({ id: img.id, url: img.image_url, is_primary: img.is_primary })));
      setVideos(((data as any).product_videos || []).map((vid: any) => ({ id: vid.id, video_url: vid.video_url, thumbnail_url: vid.thumbnail_url, sort_order: vid.sort_order })));
    }
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleChange = (field: string, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !isEditing) updated.slug = generateSlug(value);
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        setImages((prev) => [...prev, { url: urlData.publicUrl, is_primary: prev.length === 0 }]);
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setVideoUploading(true);

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        setVideos((prev) => [...prev, { video_url: urlData.publicUrl, sort_order: prev.length }]);
      }
    }
    setVideoUploading(false);
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index).map((vid, i) => ({ ...vid, sort_order: i })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let specs = {};
    if (form.specs.trim()) {
      try { specs = JSON.parse(form.specs); } catch { /* ignore */ }
    }

    const productData = {
      name: form.name, slug: form.slug, category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      description: form.description, short_description: form.short_description,
      price: parseFloat(form.price), discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      powers: form.powers || null, ideal_for: form.ideal_for || null, promo_label: form.promo_label || null,
      stock_quantity: parseInt(form.stock_quantity), status: form.status,
      is_featured: form.is_featured, is_popular: form.is_popular, specs,
    };

    let productId = id;

    if (isEditing) {
      await supabase.from("products").update(productData).eq("id", id!);
      // Delete old images and videos, then re-insert
      await supabase.from("product_images").delete().eq("product_id", id!);
      await supabase.from("product_videos").delete().eq("product_id", id!);
    } else {
      const { data } = await supabase.from("products").insert(productData).select("id").single();
      productId = data?.id;
    }

    if (productId) {
      // Insert images
      if (images.length > 0) {
        const imageRows = images.map((img, i) => ({
          product_id: productId!,
          image_url: img.url,
          is_primary: img.is_primary,
          sort_order: i,
        }));
        await supabase.from("product_images").insert(imageRows);
      }

      // Insert videos
      if (videos.length > 0) {
        const videoRows = videos.map((vid, i) => ({
          product_id: productId!,
          video_url: vid.video_url,
          thumbnail_url: vid.thumbnail_url || null,
          sort_order: i,
        }));
        await supabase.from("product_videos").insert(videoRows);
      }
    }

    setSaving(false);
    navigate("/admin");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const inputClass = "w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-forest border-b border-primary-foreground/10 sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="PawaMore" className="h-8 w-auto rounded-lg" />
            <span className="font-display font-bold text-primary-foreground text-sm">Admin</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-3xl py-6 sm:py-10 px-4">
        <Link to="/admin" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-extrabold mb-6">{isEditing ? "Edit Product" : "Add New Product"}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Basic Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name *</label>
                <input className={inputClass} required value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. EcoFlow Delta 2 Max" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">URL Slug</label>
                <input className={inputClass} value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} placeholder="auto-generated" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Short Description</label>
              <input className={inputClass} value={form.short_description} onChange={(e) => handleChange("short_description", e.target.value)} placeholder="Brief one-liner" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Description</label>
              <textarea className={`${inputClass} resize-none`} rows={4} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Detailed product description..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Powers (what it runs)</label>
                <input className={inputClass} value={form.powers} onChange={(e) => handleChange("powers", e.target.value)} placeholder="e.g. Fridge, fans, TV, lights" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Ideal For</label>
                <input className={inputClass} value={form.ideal_for} onChange={(e) => handleChange("ideal_for", e.target.value)} placeholder="e.g. 2-3 bedroom homes" />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Pricing & Stock</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₦) *</label>
                <input className={inputClass} type="number" required min="0" step="0.01" value={form.price} onChange={(e) => handleChange("price", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Discount Price (₦)</label>
                <input className={inputClass} type="number" min="0" step="0.01" value={form.discount_price} onChange={(e) => handleChange("discount_price", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Stock Qty</label>
                <input className={inputClass} type="number" min="0" value={form.stock_quantity} onChange={(e) => handleChange("stock_quantity", e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Promo Label</label>
                <input className={inputClass} value={form.promo_label} onChange={(e) => handleChange("promo_label", e.target.value)} placeholder="e.g. 15% OFF" />
              </div>
            </div>
          </div>

          {/* Category & Status */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Category & Status</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <select className={inputClass} value={form.category_id} onChange={(e) => handleChange("category_id", e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <select className={inputClass} value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => handleChange("is_featured", e.target.checked)} className="rounded" />
                ⭐ Featured
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_popular} onChange={(e) => handleChange("is_popular", e.target.checked)} className="rounded" />
                🔥 Popular
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Product Images</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className={`relative rounded-lg overflow-hidden border-2 aspect-square ${img.is_primary ? "border-accent" : "border-border"}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => setPrimaryImage(i)}
                    className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${img.is_primary ? "bg-accent text-foreground" : "bg-background/80 text-foreground"}`}>
                    {img.is_primary ? "Primary" : "Set Primary"}
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload</span>
                  </>
                )}
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Videos */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Product Videos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {videos.map((vid, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-video bg-secondary">
                  <video src={vid.video_url} className="w-full h-full object-cover" muted />
                  <button type="button" onClick={() => removeVideo(i)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-background/80 text-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Video {i + 1}
                  </div>
                </div>
              ))}
              <label className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                {videoUploading ? <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /> : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload Video</span>
                  </>
                )}
                <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" disabled={videoUploading} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Upload short videos (MP4, WebM). Keep file sizes under 50MB for best performance.</p>
          </div>

          {/* Specs */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4">
            <h2 className="font-display font-bold text-lg">Technical Specs (JSON)</h2>
            <textarea className={`${inputClass} resize-none font-mono text-xs`} rows={5} value={form.specs} onChange={(e) => handleChange("specs", e.target.value)}
              placeholder='{"battery": "3.5kWh LiFePO4", "inverter": "3.5kVA Hybrid"}' />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button type="submit" variant="amber" size="lg" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : isEditing ? "Update Product →" : "Create Product →"}
            </Button>
            <Link to="/admin"><Button type="button" variant="outline" size="lg">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
