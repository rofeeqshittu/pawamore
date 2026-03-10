import { useState, useCallback } from "react";
import { Star, ThumbsUp, Camera, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface ReviewImage {
  id: string;
  image_url: string;
}

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  review_images?: ReviewImage[];
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewAdded: () => void;
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().trim().max(100, "Title must be less than 100 characters").optional(),
  content: z.string().trim().min(10, "Review must be at least 10 characters").max(1000, "Review must be less than 1000 characters")
});

const StarRating = ({ rating, onRatingChange, readonly = false, size = "w-5 h-5" }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: string;
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={readonly ? undefined : () => onRatingChange?.(star)}
        disabled={readonly}
        className={`${size} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-all`}
      >
        <Star className={`w-full h-full ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
      </button>
    ))}
  </div>
);

const ProductReviews = ({ productId, productName, reviews, averageRating, totalReviews, onReviewAdded }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [form, setForm] = useState({ rating: 0, title: "", content: "" });

  const userReview = user ? reviews.find(r => r.user_id === user.id) : null;

  const resetForm = () => {
    setForm({ rating: 0, title: "", content: "" });
    setSelectedImages([]);
    setEditingReview(null);
  };

  const openEditDialog = (review: Review) => {
    setEditingReview(review);
    setForm({
      rating: review.rating,
      title: review.title || "",
      content: review.content || "",
    });
    setSelectedImages([]);
    setIsDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        toast({ title: "Image too large", description: `${f.name} exceeds 5MB limit`, variant: "destructive" });
        return false;
      }
      return true;
    });
    setSelectedImages(prev => [...prev, ...validFiles].slice(0, 4)); // max 4 images
  };

  const uploadImages = async (reviewId: string): Promise<string[]> => {
    if (!user) return [];
    const urls: string[] = [];
    for (const file of selectedImages) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${reviewId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('review-images').upload(path, file);
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('review-images').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in to write a review", variant: "destructive" });
      return;
    }

    try {
      const validatedData = reviewSchema.parse(form);
      setSubmitting(true);

      if (editingReview) {
        // Update existing review
        const { error } = await supabase.from("product_reviews").update({
          rating: validatedData.rating,
          title: validatedData.title || null,
          content: validatedData.content,
          is_approved: false, // Re-submit for approval after edit
        }).eq("id", editingReview.id);
        if (error) throw error;

        // Upload new images if any
        if (selectedImages.length > 0) {
          const imageUrls = await uploadImages(editingReview.id);
          for (const url of imageUrls) {
            await supabase.from("review_images" as any).insert({ review_id: editingReview.id, image_url: url });
          }
        }

        toast({ title: "Review updated! ✨", description: "Your review will be re-published after approval." });
      } else {
        // Create new review
        const { data: newReview, error } = await supabase.from("product_reviews").insert({
          product_id: productId,
          user_id: user.id,
          rating: validatedData.rating,
          title: validatedData.title || null,
          content: validatedData.content,
          is_approved: false,
        }).select("id").single();
        if (error) throw error;

        // Upload images
        if (selectedImages.length > 0 && newReview) {
          const imageUrls = await uploadImages(newReview.id);
          for (const url of imageUrls) {
            await supabase.from("review_images" as any).insert({ review_id: newReview.id, image_url: url });
          }
        }

        toast({ title: "Review submitted! ✨", description: "Your review will be published after admin approval." });
      }

      resetForm();
      setIsDialogOpen(false);
      onReviewAdded();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
      } else {
        toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
    if (!error) {
      toast({ title: "Review deleted" });
      onReviewAdded();
    } else {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    const { error } = await supabase.from("review_images" as any).delete().eq("id", imageId);
    if (!error) {
      onReviewAdded();
      toast({ title: "Image removed" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: totalReviews > 0 ? (reviews.filter(rev => rev.rating === r).length / totalReviews) * 100 : 0
  }));

  return (
    <div className="space-y-6">
      {/* Reviews Header with Rating Distribution */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">Customer Reviews</h3>
          {totalReviews > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-extrabold">{averageRating.toFixed(1)}</span>
                <div>
                  <StarRating rating={Math.round(averageRating)} readonly size="w-5 h-5" />
                  <span className="text-sm text-muted-foreground">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
                </div>
              </div>
              {/* Rating bars */}
              <div className="space-y-1.5">
                {ratingCounts.map(({ stars, count, pct }) => (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-8 text-right text-muted-foreground">{stars}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-muted-foreground text-xs">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No reviews yet</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {user && !userReview && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Star className="w-4 h-4" /> Write Review
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingReview ? "Edit Review" : `Review ${productName}`}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating *</label>
                    <StarRating rating={form.rating} onRatingChange={(rating) => setForm({ ...form, rating })} size="w-8 h-8" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (Optional)</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sum up your experience..." maxLength={100} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Review *</label>
                    <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Share your experience..." rows={4} maxLength={1000} required />
                    <p className="text-xs text-muted-foreground mt-1">{form.content.length}/1000</p>
                  </div>
                  {/* Image upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Photos (Optional, max 4)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedImages.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {selectedImages.length < 4 && (
                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                          <Camera className="w-5 h-5 text-muted-foreground" />
                          <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={submitting || form.rating === 0} className="flex-1">
                      {submitting ? "Submitting..." : editingReview ? "Update Review" : "Submit Review"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {user && userReview && (
            <>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => openEditDialog(userReview)}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Review</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating *</label>
                      <StarRating rating={form.rating} onRatingChange={(rating) => setForm({ ...form, rating })} size="w-8 h-8" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sum up your experience..." maxLength={100} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Review *</label>
                      <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Share your experience..." rows={4} maxLength={1000} required />
                    </div>
                    {/* Existing images */}
                    {editingReview?.review_images && editingReview.review_images.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Photos</label>
                        <div className="flex flex-wrap gap-2">
                          {editingReview.review_images.map(img => (
                            <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                              <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute top-0.5 right-0.5 bg-destructive/80 rounded-full p-0.5">
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* New images */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Add Photos</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedImages.map((file, i) => (
                          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {selectedImages.length < 4 && (
                          <label className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50">
                            <Camera className="w-5 h-5 text-muted-foreground" />
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={submitting || form.rating === 0} className="flex-1">
                        {submitting ? "Updating..." : "Update Review"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>Cancel</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" className="text-destructive gap-2" onClick={() => handleDeleteReview(userReview.id)}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Review
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className={review.user_id === user?.id ? "border-primary/30" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {review.profiles?.display_name?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.profiles?.display_name || "Anonymous"}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} readonly size="w-3.5 h-3.5" />
                        <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  {review.user_id === user?.id && (
                    <Badge variant="outline" className="text-xs">Your Review</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {review.title && <p className="font-semibold text-sm mb-1">{review.title}</p>}
                {review.content && <p className="text-sm leading-relaxed text-muted-foreground">{review.content}</p>}
                {/* Review images */}
                {review.review_images && review.review_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.review_images.map(img => (
                      <img key={img.id} src={img.image_url} alt="Review photo" className="w-20 h-20 object-cover rounded-lg border border-border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(img.image_url, '_blank')} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductReviews;
