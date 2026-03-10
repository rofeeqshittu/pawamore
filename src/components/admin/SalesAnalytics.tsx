import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  payment_method: string | null;
  payment_status: string | null;
}

interface SalesAnalyticsProps {
  orders: Order[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "#3b82f6", "#8b5cf6", "#ec4899"];

const SalesAnalytics = ({ orders }: SalesAnalyticsProps) => {
  const analytics = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== "cancelled");
    const totalRevenue = validOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    const paidOrders = validOrders.filter(o => o.payment_status === "paid");
    const paidRevenue = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0);

    // Monthly revenue (last 6 months)
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyData[key] = 0;
    }
    validOrders.forEach(o => {
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += Number(o.total_amount);
      }
    });
    const revenueByMonth = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));

    // Status distribution
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Payment methods
    const paymentCounts: Record<string, number> = {};
    validOrders.forEach(o => {
      const method = o.payment_method === "flutterwave" ? "Online" : "Pay on Delivery";
      paymentCounts[method] = (paymentCounts[method] || 0) + 1;
    });
    const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

    // Average order value
    const avgOrder = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    return { totalRevenue, paidRevenue, revenueByMonth, statusData, paymentData, avgOrder, totalOrders: validOrders.length };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <DollarSign className="w-5 h-5 text-primary mb-2" />
            <p className="font-extrabold text-xl">₦{(analytics.totalRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="font-extrabold text-xl">₦{(analytics.paidRevenue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground">Paid Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <ShoppingBag className="w-5 h-5 text-primary mb-2" />
            <p className="font-extrabold text-xl">{analytics.totalOrders}</p>
            <p className="text-xs text-muted-foreground">Valid Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="font-extrabold text-xl">₦{Math.round(analytics.avgOrder).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Avg Order Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} className="text-xs" />
              <Tooltip formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status & Payment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {analytics.statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={analytics.paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {analytics.paymentData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalytics;
