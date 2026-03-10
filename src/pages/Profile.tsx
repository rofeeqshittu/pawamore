import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Save, MapPin, ShoppingBag, Eye, Upload, Lock, Mail, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_name: string;
  shipping_city: string;
  order_items: { product_name: string; quantity: number }[];
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchOrders();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, phone, address, city, state, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setForm({
          display_name: data.display_name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast({
        title: "Failed to load profile",
        description: "Please refresh and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id, status, total_amount, created_at, shipping_name, shipping_city,
          order_items(product_name, quantity)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setOrders(data as any);
      }
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          display_name: form.display_name || null,
          phone: form.phone || null,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          avatar_url: form.avatar_url || null,
        });

      if (error) throw error;

      toast({ 
        title: "Profile updated! ✨", 
        description: "Your information has been saved successfully." 
      });
    } catch (error: any) {
      toast({ 
        title: "Failed to update profile", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 2MB",
        variant: "destructive"
      });
      return;
    }

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, create it first
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: "Avatar upload unavailable",
            description: "Please contact support to enable avatar uploads",
            variant: "destructive"
          });
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setForm({ ...form, avatar_url: publicUrl });
      
      toast({
        title: "Avatar uploaded! 📸",
        description: "Don't forget to save your profile to update your avatar."
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset sent! 📧",
        description: "Check your email for password reset instructions."
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 max-w-md mx-auto text-center">
          <p className="text-muted-foreground mb-4">Please log in to view your profile.</p>
          <Link to="/login">
            <Button variant="amber">Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <LoadingSpinner text="Loading profile..." />
          </div>
        </div>
      </Layout>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-accent/20 text-accent",
    confirmed: "bg-primary/20 text-primary", 
    processing: "bg-primary/20 text-primary",
    shipped: "bg-primary/30 text-primary",
    delivered: "bg-primary/40 text-primary",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <ErrorBoundary>
      <Layout>
        <div className="container py-6 sm:py-8 lg:py-12 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
              Profile Settings
            </h1>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your details to speed up checkout
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={form.avatar_url} alt={form.display_name} />
                        <AvatarFallback className="text-xl">
                          {form.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{form.display_name || user.email}</p>
                        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                        <label className="relative cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={avatarUploading}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            disabled={avatarUploading}
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {avatarUploading ? "Uploading..." : "Change Avatar"}
                          </Button>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Display Name</label>
                        <Input
                          value={form.display_name}
                          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                          placeholder="Your display name"
                          className="min-h-[44px]"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Phone Number</label>
                        <Input
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="Your phone number"
                          className="min-h-[44px]"
                        />
                      </div>
                    </div>

                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Delivery Address
                        </CardTitle>
                        <CardDescription className="text-xs">
                          This will auto-fill at checkout
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Address</label>
                          <Textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Street address"
                            className="min-h-[60px]"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">City</label>
                            <Input
                              value={form.city}
                              onChange={(e) => setForm({ ...form, city: e.target.value })}
                              placeholder="City"
                              className="min-h-[44px]"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">State</label>
                            <Input
                              value={form.state}
                              onChange={(e) => setForm({ ...form, state: e.target.value })}
                              placeholder="State (optional)"
                              className="min-h-[44px]"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button 
                      type="submit" 
                      disabled={saving || avatarUploading} 
                      size="lg" 
                      className="w-full min-h-[48px] gap-2"
                      variant="amber"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Order History
                  </CardTitle>
                  <CardDescription>
                    View your recent orders and track their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner text="Loading orders..." />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Link to="/products">
                        <Button variant="amber">Start Shopping</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">#{order.id.slice(0, 8)}</span>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-secondary text-muted-foreground"}`}>
                                {order.status}
                              </span>
                            </div>
                            <span className="font-bold text-primary">₦{Number(order.total_amount).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(order.created_at).toLocaleDateString()} • {order.shipping_city}
                          </p>
                          <div className="text-sm mb-3">
                            <span className="text-muted-foreground">Items: </span>
                            {order.order_items?.map(item => `${item.product_name} (${item.quantity})`).join(', ') || 'No items'}
                          </div>
                          {(order.status === "pending" || order.status === "confirmed") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1.5"
                              onClick={async () => {
                                const { error } = await supabase
                                  .from("orders")
                                  .update({ status: "cancelled" as any })
                                  .eq("id", order.id);
                                if (!error) {
                                  setOrders(orders.map(o => o.id === order.id ? { ...o, status: "cancelled" } : o));
                                  toast({ title: "Order cancelled" });
                                } else {
                                  toast({ title: "Failed to cancel", description: error.message, variant: "destructive" });
                                }
                              }}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel Order
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="text-center pt-4">
                        <Link to="/orders">
                          <Button variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View All Orders
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    My Wishlist
                  </CardTitle>
                  <CardDescription>
                    Your saved favorite products
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <Link to="/wishlist">
                    <Button variant="amber" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View Full Wishlist
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Manage your account security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Address</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Last updated: Unknown</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePasswordReset}>
                      Reset Password
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <h4 className="font-medium mb-2">Account Data</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Your account was created on {new Date(user.created_at || '').toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default Profile;