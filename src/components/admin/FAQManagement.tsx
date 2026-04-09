import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
}

const categories = [
  { value: "getting_started", label: "Getting Started" },
  { value: "system_sizing_reliability", label: "System Sizing & Reliability" },
  { value: "delivery_support_trust", label: "Delivery, Support & Trust" },
  { value: "general", label: "General (Legacy)" },
  { value: "orders", label: "Orders (Legacy)" },
  { value: "payments", label: "Payments (Legacy)" },
  { value: "shipping", label: "Shipping (Legacy)" },
  { value: "returns", label: "Returns (Legacy)" },
  { value: "services", label: "Services (Legacy)" },
  { value: "products", label: "Products (Legacy)" },
];

const FAQManagement = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "getting_started",
    is_published: true,
  });

  const fetchFaqs = async () => {
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) {
      setFaqs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateDialog = () => {
    setEditingFaq(null);
    setFormData({
      question: "",
      answer: "",
      category: "getting_started",
      is_published: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    setSaving(true);
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from("faq_items")
          .update({
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            is_published: formData.is_published,
          })
          .eq("id", editingFaq.id);

        if (error) throw error;
        toast.success("FAQ updated successfully");
      } else {
        const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.sort_order)) : 0;
        const { error } = await supabase
          .from("faq_items")
          .insert({
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            is_published: formData.is_published,
            sort_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success("FAQ created successfully");
      }

      setDialogOpen(false);
      fetchFaqs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("Failed to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
      toast.success("FAQ deleted successfully");
      fetchFaqs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("Failed to delete FAQ");
    }
  };

  const togglePublished = async (faq: FAQItem) => {
    try {
      const { error } = await supabase
        .from("faq_items")
        .update({ is_published: !faq.is_published })
        .eq("id", faq.id);

      if (error) throw error;
      toast.success(`FAQ ${!faq.is_published ? "published" : "unpublished"}`);
      fetchFaqs();
    } catch (error) {
      console.error("Error toggling FAQ:", error);
      toast.error("Failed to update FAQ");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">FAQ Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage frequently asked questions shown on the help center
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground">No FAQs yet. Create your first one!</p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id}
              className={`border border-border rounded-lg p-4 ${!faq.is_published ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1 cursor-move" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium">{faq.question}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{faq.answer}</p>
                      <span className="inline-block mt-2 text-xs bg-muted px-2 py-1 rounded">
                        {faq.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={faq.is_published}
                        onCheckedChange={() => togglePublished(faq)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(faq)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
            <DialogDescription>
              {editingFaq ? "Update the FAQ details below" : "Add a new frequently asked question"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="e.g., How do I track my order?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Provide a detailed answer..."
                className="min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Published</Label>
                <div className="flex items-center h-10">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formData.is_published ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {editingFaq ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQManagement;
