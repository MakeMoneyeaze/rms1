"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: number;
  items: any;
  bill_amount: number;
  status: string;
  placed_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("You must be logged in to view your orders.");
        setLoading(false);
        return;
      }
      // Fetch orders for this user
      const { data, error } = await supabase
        .from("orders")
        .select("id, items, bill_amount, status, placed_at")
        .eq("user_id", user.id)
        .order("placed_at", { ascending: false });
      if (error) {
        setError("Failed to fetch orders.");
        setLoading(false);
        return;
      }
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 text-[var(--foreground)]">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[var(--primary)] mb-8 text-center">Your Orders</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            <span className="ml-3 text-[var(--foreground)]">Loading your orders...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">No orders found</h3>
            <p className="text-[var(--foreground)]">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg bg-[var(--background)]/80 backdrop-blur-md">
            <table className="min-w-full divide-y divide-[var(--muted)]">
              <thead className="bg-[var(--secondary)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">Total (₹)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)] uppercase tracking-wider">Placed At</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--background)] divide-y divide-[var(--muted)]">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                      {Array.isArray(order.items)
                        ? order.items.map((item: any, idx: number) => (
                            <div key={idx}>{item.name} x{item.quantity}</div>
                          ))
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--primary)] font-medium">₹{order.bill_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">{order.placed_at ? new Date(order.placed_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
