"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  statusCounts: Record<string, number>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchAnalytics() {
    setLoading(true);
    setError("");
    try {
      // Fetch total orders and revenue
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("bill_amount, status")
        .order("placed_at", { ascending: false });
      if (ordersError) throw ordersError;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.bill_amount || 0), 0);
      const statusCounts: Record<string, number> = {};
      orders.forEach((o: any) => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      // Fetch total customers
      const { count: totalCustomers, error: usersError } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("user_type", "customer");
      if (usersError) throw usersError;

      setData({ totalOrders, totalRevenue, totalCustomers: totalCustomers || 0, statusCounts });
    } catch (err: any) {
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-orange-700 mb-10 text-center tracking-tight">Business Analytics</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-700 font-medium">Loading analytics...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8 font-semibold">{error}</div>
        ) : data ? (
          <>
            <section className="mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border border-orange-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-2">📦</div>
                  <div className="text-3xl font-extrabold text-orange-700 mb-1">{data.totalOrders}</div>
                  <div className="text-gray-700 font-semibold">Total Orders</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border border-orange-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-3xl font-extrabold text-green-700 mb-1">₹{data.totalRevenue}</div>
                  <div className="text-gray-700 font-semibold">Total Revenue</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center border border-orange-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-2">👥</div>
                  <div className="text-3xl font-extrabold text-blue-700 mb-1">{data.totalCustomers}</div>
                  <div className="text-gray-700 font-semibold">Total Customers</div>
                </div>
              </div>
            </section>
            <section className="mb-10">
              <h2 className="text-xl font-bold text-orange-700 mb-4">Orders by Status</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col gap-4">
                  {Object.entries(data.statusCounts).length === 0 ? (
                    <div className="text-gray-500 font-medium">No orders yet.</div>
                  ) : (
                    Object.entries(data.statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center gap-4 group">
                        <span className="w-32 capitalize font-semibold text-gray-700">{status}</span>
                        <div className="flex-1 bg-gray-200 rounded h-5 relative overflow-hidden">
                          <div
                            className={`h-5 rounded-l transition-all duration-300 ${status === 'Delivered' ? 'bg-green-400 group-hover:bg-green-500' : status === 'Cancelled' ? 'bg-red-400 group-hover:bg-red-500' : 'bg-yellow-400 group-hover:bg-yellow-500'}`}
                            style={{ width: `${(count / data.totalOrders) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 font-bold text-gray-800">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
