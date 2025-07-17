"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: number;
  items: any;
  bill_amount: number;
  status: string;
  placed_at: string;
  name: string;
  email: string;
  address: string;
  payment_method: string;
}

export default function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      // Fetch all orders (admin view)
      const { data, error } = await supabase
        .from("orders")
        .select("id, items, bill_amount, status, placed_at, name, email, address, payment_method")
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Manage Orders</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">No orders have been placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg bg-white/80 backdrop-blur-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (₹)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order.address}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(order.items)
                        ? order.items.map((item: any, idx: number) => (
                            <div key={idx}>{item.name} x{item.quantity}</div>
                          ))
                        : "-"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{order.bill_amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order.payment_method}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.placed_at ? new Date(order.placed_at).toLocaleString() : '-'}</td>
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