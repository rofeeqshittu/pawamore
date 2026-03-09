import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  productId: string;
  productName?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
  className?: string;
  showText?: boolean;
}

const WishlistButton = ({ 
  productId, 
  productName = "product",
  size = "default", 
  variant = "ghost",
  className = "",
  showText = false
}: WishlistButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !productId) return;

    const checkWishlistStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error("Wishlist check error:", error);
          return;
        }

        setIsInWishlist(!!data);
      } catch (error) {
        console.error("Wishlist status check failed:", error);
      }
    };

    checkWishlistStatus();
  }, [user, productId]);

  const handleWishlistToggle = async () => {
    if (!user) {
      // Save current page and show login prompt
      sessionStorage.setItem("intendedPath", window.location.pathname + window.location.search);
      toast({ 
        title: "Please log in", 
        description: "Create an account to save your favorite products",
        variant: "destructive" 
      });
      navigate("/login");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);

        if (error) throw error;

        setIsInWishlist(false);
        toast({ 
          title: "Removed from wishlist", 
          description: `${productName} removed from your favorites` 
        });
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;

        setIsInWishlist(true);
        toast({ 
          title: "Added to wishlist! ❤️", 
          description: `${productName} saved to your favorites` 
        });
      }
    } catch (error: any) {
      console.error("Wishlist toggle error:", error);
      toast({ 
        title: "Failed to update wishlist", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`gap-2 ${className}`}
      title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} transition-all ${
          isInWishlist ? 'fill-red-500 text-red-500 scale-110' : 'text-muted-foreground hover:text-red-500'
        }`} 
      />
      {showText && (
        <span className="hidden sm:inline">
          {loading ? "..." : isInWishlist ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;