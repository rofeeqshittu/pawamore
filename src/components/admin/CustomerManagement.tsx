import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, ShoppingBag, Mail } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Profile {
  user_id: string;
  display_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

interface CustomerOrder {
  user_id: string;
  order_count: number;
  total_spent: number;
}

const CustomerManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Map<string, { count: number; total: number }>>(new Map());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: profilesData }, { data: ordersData }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, phone, city, state, created_at").order("created_at", { ascending: false }),
        supabase.from("orders").select("user_id, total_amount, status").not("user_id", "is", null),
      ]);

      setProfiles(profilesData || []);

      // Aggregate orders per user
      const orderMap = new Map<string, { count: number; total: number }>();
      (ordersData || []).forEach((o: any) => {
        if (!o.user_id) return;
        const existing = orderMap.get(o.user_id) || { count: 0, total: 0 };
        existing.count++;
        if (o.status !== "cancelled") existing.total += Number(o.total_amount);
        orderMap.set(o.user_id, existing);
      });
      setOrders(orderMap);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = profiles.filter(p =>
    !search || (p.display_name?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase()) || p.phone?.includes(search))
  );

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner text="Loading customers..." /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-lg font-extrabold flex items-center gap-2">
          <Users className="w-5 h-5" /> Customers ({profiles.length})
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Spent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No customers found</td></tr>
              ) : (
                filtered.map(p => {
                  const orderData = orders.get(p.user_id);
                  return (
                    <tr key={p.user_id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {p.display_name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <span className="font-medium">{p.display_name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.phone || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                          {orderData?.count || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">₦{(orderData?.total || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
