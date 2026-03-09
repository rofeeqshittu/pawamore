import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
}

const InventoryAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check if user is admin
    const checkAdminStatus = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      
      setIsAdmin(!!data);
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch products with low stock (less than 5 items)
    const fetchLowStockProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock_quantity")
        .lt("stock_quantity", 5)
        .gt("stock_quantity", 0)
        .eq("status", "active");

      if (!error && data) {
        setLowStockProducts(data);
      }
    };

    fetchLowStockProducts();

    // Set up real-time subscription for inventory changes
    const channel = supabase
      .channel('inventory-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchLowStockProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (!isAdmin || lowStockProducts.length === 0) return null;

  return (
    <Alert className="mb-4 border-destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Low Stock Alert:</strong> {lowStockProducts.length} product(s) running low: {" "}
        {lowStockProducts.map((product, i) => (
          <span key={product.id}>
            {product.name} ({product.stock_quantity} left)
            {i < lowStockProducts.length - 1 ? ", " : ""}
          </span>
        ))}
      </AlertDescription>
    </Alert>
  );
};

export default InventoryAlert;