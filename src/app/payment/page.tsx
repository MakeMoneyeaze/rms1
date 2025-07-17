"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCartItems, getCartTotalPrice, clearCart } from "@/lib/cart";

export default function Payment() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    zipcode: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "" });
  const [upi, setUpi] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch from users table
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, email, address, postal_code')
          .eq('id', user.id)
          .single();
        if (data) {
          setForm(f => ({
            ...f,
            name: `${data.first_name} ${data.last_name}`.trim(),
            email: data.email || "",
            address: data.address || "",
            zipcode: data.postal_code || "",
          }));
        }
      }
    };
    fetchUserDetails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");
      // Get cart
      const cartItems = getCartItems();
      const billAmount = getCartTotalPrice();
      // Prepare order data
      const orderData = {
        user_id: user.id,
        items: cartItems,
        bill_amount: billAmount,
        address: form.address,
        zipcode: form.zipcode,
        name: form.name,
        email: form.email,
        payment_method: paymentMethod,
        status: "placed",
        placed_at: new Date().toISOString(),
      };
      console.log('ORDER DATA:', orderData);
      // Insert order
      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) {
        console.error('ORDER INSERT ERROR:', error);
        throw error;
      }
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      let msg = "Failed to place order. Please try again.";
      if (err && err.message) {
        msg += `\nError: ${err.message}`;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <div className="bg-white/90 rounded-2xl shadow-xl p-10 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2 text-green-700">Payment Successful!</h2>
          <p className="text-gray-700 mb-6">Thank you for your order. Your payment has been processed.</p>
          <button className="button bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md px-6 py-3 mt-4 transition-colors duration-200" onClick={() => router.push("/dashboard")}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black px-2 py-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-orange-100 p-4 sm:p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:gap-8 gap-8">
          {/* Delivery Details Form */}
          <div className="flex-1 basis-1/2 md:border-r md:pr-8 flex flex-col justify-start">
            <h2 className="text-2xl font-bold mb-8 text-center text-orange-700">Delivery Details</h2>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50" rows={3} />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-2 font-medium">Zipcode</label>
              <input type="text" name="zipcode" value={form.zipcode} onChange={handleChange} required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50" />
            </div>
          </div>
          {/* Payment Method Form */}
          <div className="flex-1 basis-1/2 md:pl-8 flex flex-col justify-start bg-orange-50/60 rounded-xl p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-8 text-center text-orange-700">Payment Method</h2>
            <div className="mb-8 flex flex-col gap-4">
              <label className="flex items-center cursor-pointer font-medium">
                <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")}
                  className="mr-2 accent-orange-500" /> Card
              </label>
              <label className="flex items-center cursor-pointer font-medium">
                <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")}
                  className="mr-2 accent-orange-500" /> UPI
              </label>
              <label className="flex items-center cursor-pointer font-medium">
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")}
                  className="mr-2 accent-orange-500" /> Cash On Delivery
              </label>
            </div>
            {paymentMethod === "card" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Card Number</label>
                  <input type="text" value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} maxLength={16} pattern="\d{16}" required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" placeholder="1234 5678 9012 3456" autoComplete="off" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2 font-medium">Expiry</label>
                    <input type="text" value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" placeholder="MM/YY" autoComplete="off" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 mb-2 font-medium">CVV</label>
                    <input type="password" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} maxLength={4} pattern="\d{3,4}" required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" placeholder="123" autoComplete="off" />
                  </div>
                </div>
              </div>
            )}
            {paymentMethod === "upi" && (
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">UPI ID</label>
                <input type="text" value={upi} onChange={e => setUpi(e.target.value)} required className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" placeholder="yourname@upi" />
              </div>
            )}
            {paymentMethod === "cod" && (
              <div className="mb-6 text-green-700 font-semibold">Pay with cash on delivery.</div>
            )}
          </div>
        </div>
        <div className="w-full flex justify-center mt-10">
          <button type="button" onClick={handleSubmit} className="button text-lg py-3 w-full sm:w-auto md:w-1/2 max-w-md shadow-md bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors duration-200" disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
