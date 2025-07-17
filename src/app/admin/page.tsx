"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    const email = localStorage.getItem("adminEmail");
    
    if (adminLoggedIn === "true" && email) {
      setIsAuthenticated(true);
      setAdminEmail(email);
    } else {
      // Redirect to admin login if not authenticated
      router.push("/admin/login");
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");
      const { data, error } = await supabase
        .from("orders")
        .select("id, items, bill_amount, status, placed_at, name, email, address, payment_method")
        .order("placed_at", { ascending: false })
        .limit(5);
      if (error) {
        setOrdersError("Failed to fetch recent orders.");
        setOrdersLoading(false);
        return;
      }
      setRecentOrders(data || []);
      setOrdersLoading(false);
    };
    fetchRecentOrders();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    // Optimistically update UI
    setRecentOrders((prev) => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    if (error) {
      setOrdersError("Failed to update order status.");
      // Optionally, revert UI change
      setRecentOrders((prev) => prev.map(order => order.id === orderId ? { ...order, status: order.status } : order));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const stats = [
    { name: "Total Orders", value: "1,234", change: "+12%", changeType: "positive" },
    { name: "Revenue", value: "₹45,678", change: "+8%", changeType: "positive" },
    { name: "Active Users", value: "892", change: "+5%", changeType: "positive" },
    { name: "Pending Orders", value: "23", change: "-3%", changeType: "negative" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-extrabold text-orange-700 tracking-tight">FoodHub Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-800 font-medium">Welcome, <span className="font-semibold text-orange-600">{adminEmail}</span></span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-orange-100">
              <div className={`text-2xl font-bold mb-1 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>{stat.value}</div>
              <div className="text-gray-700 font-semibold mb-1">{stat.name}</div>
              <div className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-orange-700 mb-4">Quick Actions</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/admin/add_item"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md text-sm font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add Menu Item</span>
              </Link>
              <Link 
                href="/admin/manage_orders"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Manage Orders</span>
              </Link>
              <Link 
                href="/admin/analytics"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md text-sm font-medium flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Analytics</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Orders Table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-orange-700 mb-4">Recent Orders</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-6">
              {ordersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <span className="ml-3 text-gray-700 font-medium">Loading recent orders...</span>
                </div>
              ) : ordersError ? (
                <div className="text-center text-red-600 py-4 font-semibold">{ordersError}</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 font-medium">No recent orders found.</div>
              ) : (
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-orange-100">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Total (₹)</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Placed At</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-2 whitespace-nowrap font-bold text-orange-700">{order.id}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-800">{order.name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-800">{order.email}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                            {Array.isArray(order.items)
                              ? order.items.map((item: any, idx: number) => (
                                  <div key={idx}>{item.name} <span className="text-gray-500">x{item.quantity}</span></div>
                                ))
                              : <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap font-semibold text-green-700">₹{order.bill_amount}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-gray-600">{order.placed_at ? new Date(order.placed_at).toLocaleString() : <span className="text-gray-400">-</span>}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {order.status !== 'Cancelled' && (
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs mr-2 font-semibold shadow"
                                onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}
                              >
                                Cancel
                              </button>
                            )}
                            {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold shadow"
                                onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                              >
                                Mark as Delivered
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 border border-orange-300 shadow-sm text-sm font-semibold rounded-md text-orange-700 bg-white hover:bg-orange-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Restaurant
          </Link>
        </div>
      </div>
    </div>
  );
}
