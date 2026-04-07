import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link2, Loader2, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProductImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ScrapedProduct {
  source_url: string;
  name: string;
  short_description: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  key_features: string[];
  benefits: string[];
  meta_description: string;
  seo_keywords: string;
  images: string[];
  nigerian_context: string;
  scraped_at: string;
}

const ProductImportModal = ({ open, onOpenChange, onSuccess }: ProductImportModalProps) => {
  const [step, setStep] = useState<'input' | 'loading' | 'preview'>('input');
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedProduct | null>(null);
  const [editedData, setEditedData] = useState<Partial<ScrapedProduct>>({});
  const [saving, setSaving] = useState(false);

  const handleImport = async () => {
    // Validate URL format
    if (!url || !url.startsWith('http')) {
      toast({ title: "Invalid URL", description: "Please enter a valid product URL starting with http:// or https://", variant: "destructive" });
      return;
    }

    // Validate URL is not too long
    if (url.length > 2000) {
      toast({ title: "URL too long", description: "Please enter a shorter URL", variant: "destructive" });
      return;
    }

    // Try to parse URL
    try {
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "The URL format is invalid", variant: "destructive" });
      return;
    }

    setStep('loading');
    setProgress(10);
    setProgressMessage('Fetching product page...');

    try {
      // Call Edge Function
      setTimeout(() => {
        setProgress(30);
        setProgressMessage('Extracting product data...');
      }, 1000);

      const { data, error } = await supabase.functions.invoke('scrape-product-from-url', {
        body: { url },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape product');
      }

      setProgress(70);
      setProgressMessage('AI rewriting content...');

      // Simulate AI processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress(90);
      setProgressMessage('Processing images...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setProgressMessage('Complete!');

      // Validate scraped data
      if (!data.data.name || !data.data.description) {
        throw new Error('Incomplete product data. Please try a different URL or add manually.');
      }

      // Store scraped data with log_id
      const scrapedDataWithLog = { ...data.data, log_id: data.log_id };
      setScrapedData(scrapedDataWithLog);
      setEditedData(scrapedDataWithLog);
      
      setTimeout(() => {
        setStep('preview');
      }, 500);

      toast({ 
        title: "Product scraped successfully! ✨", 
        description: "Review the data and make any edits before saving.",
      });

    } catch (error: unknown) {
      console.error('Import error:', error);
      let errorMessage = 'Failed to import product';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }

      toast({
        title: "Import failed",
        description: errorMessage,
        variant: "destructive",
      });
      setStep('input');
      setProgress(0);
    }
  };

  const handleSave = async (status: 'active' | 'draft' = 'active') => {
    if (!editedData || !scrapedData) return;

    setSaving(true);
    try {
      // Create product slug
      const slug = editedData.name?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || '';

      // Insert product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: editedData.name || scrapedData.name,
          slug,
          description: editedData.description || scrapedData.description,
          short_description: editedData.short_description || scrapedData.short_description,
          price: editedData.price || scrapedData.price,
          brand: editedData.brand || scrapedData.brand,
          category: editedData.category || scrapedData.category,
          stock_quantity: 10, // Default stock
          status,
          is_featured: false,
          meta_description: scrapedData.meta_description,
          meta_keywords: scrapedData.seo_keywords,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert product images
      if (scrapedData.images && scrapedData.images.length > 0) {
        const imageInserts = scrapedData.images.map((imageUrl, index) => ({
          product_id: product.id,
          image_url: imageUrl,
          is_primary: index === 0,
          sort_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts);

        if (imagesError) console.error('Failed to insert images:', imagesError);
      }

      // Log import completion
      console.log('Product imported successfully:', product.id);

      toast({
        title: status === 'active' ? "Product published! 🎉" : "Product saved as draft",
        description: `${editedData.name} has been added to your catalog.`,
      });

      // Reset and close
      setStep('input');
      setUrl('');
      setScrapedData(null);
      setEditedData({});
      setProgress(0);
      onOpenChange(false);
      
      if (onSuccess) onSuccess();

    } catch (error: unknown) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save product';
      toast({
        title: "Failed to save product",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setStep('input');
    setUrl('');
    setScrapedData(null);
    setEditedData({});
    setProgress(0);
    setProgressMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetModal();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-amber" />
            Import Product from URL
          </DialogTitle>
          <DialogDescription>
            Paste a product URL from manufacturer or partner websites. AI will automatically extract and optimize the content.
            <div className="mt-3 p-3 bg-muted rounded-md text-xs space-y-1">
              <p className="font-medium">✅ Best supported sites:</p>
              <p className="text-muted-foreground">EcoFlow, iTel Energy, Felicity Solar, Jackery, Bluetti</p>
              <p className="font-medium mt-2">⚠️ Also works with:</p>
              <p className="text-muted-foreground">Most e-commerce sites (Amazon, AliExpress, Jumia)</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: URL Input */}
        {step === 'input' && (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="product-url">Product URL</Label>
              <Input
                id="product-url"
                placeholder="https://example.com/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supported: EcoFlow, iTel Energy, Felicity Solar, Jackery, Bluetti, and more
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Example: https://us.ecoflow.com/products/delta-pro
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} className="gap-2">
                <Link2 className="w-4 h-4" />
                Import Product
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="space-y-4 py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-amber" />
              <div className="text-center">
                <p className="font-medium">{progressMessage}</p>
                <p className="text-sm text-muted-foreground mt-1">This may take 15-30 seconds...</p>
              </div>
              <Progress value={progress} className="w-full max-w-md" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Edit */}
        {step === 'preview' && scrapedData && (
          <div className="space-y-6 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Product imported successfully!</p>
                <p className="text-sm text-green-700 mt-1">
                  AI has rewritten the content for Nigerian market. Review and edit as needed.
                </p>
              </div>
            </div>

            {/* Product Images */}
            {scrapedData.images && scrapedData.images.length > 0 && (
              <div>
                <Label>Product Images ({scrapedData.images.length})</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {scrapedData.images.slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Product ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Product Name */}
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={editedData.name || scrapedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Price, Brand & Category */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price (NGN)</Label>
                <Input
                  id="price"
                  type="number"
                  value={editedData.price || scrapedData.price}
                  onChange={(e) => setEditedData({ ...editedData, price: parseFloat(e.target.value) })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={editedData.brand || scrapedData.brand}
                  onChange={(e) => setEditedData({ ...editedData, brand: e.target.value })}
                  className="mt-2"
                  placeholder="e.g., EcoFlow"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editedData.category || scrapedData.category}
                  onValueChange={(value) => setEditedData({ ...editedData, category: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Battery Systems">Battery Systems</SelectItem>
                    <SelectItem value="Solar Panels">Solar Panels</SelectItem>
                    <SelectItem value="Inverters">Inverters</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <Label htmlFor="short_description">Short Description</Label>
              <Textarea
                id="short_description"
                value={editedData.short_description || scrapedData.short_description}
                onChange={(e) => setEditedData({ ...editedData, short_description: e.target.value })}
                rows={2}
                maxLength={160}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(editedData.short_description || scrapedData.short_description)?.length || 0}/160 characters
              </p>
            </div>

            {/* Full Description */}
            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={editedData.description || scrapedData.description}
                onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                rows={6}
                className="mt-2"
              />
            </div>

            {/* Nigerian Context Badge */}
            {scrapedData.nigerian_context && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Nigerian Context</p>
                  <p className="text-sm text-amber-700">{scrapedData.nigerian_context}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={resetModal} disabled={saving}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave('active')} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Publish Product
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductImportModal;
