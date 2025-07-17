"use client";
import { useState, useEffect } from "react";
import { getCategories, getFoodItemsByCategory, type FoodItem, type Category } from "./data";
import { addToCart } from "@/lib/cart";
import { useSearchParams } from "next/navigation";
import "../css/button.css";
import "../css/navbar.css";
import Navbar from "../ui/navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Menu() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      }
    };

    loadCategories();
  }, []);

  // Load food items when category changes
  useEffect(() => {
    const loadFoodItems = async () => {
      setLoading(true);
      try {
        const items = await getFoodItemsByCategory(selectedCategory);
        setFoodItems(items);
        setError(null);
      } catch (err) {
        console.error('Error loading food items:', err);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    loadFoodItems();
  }, [selectedCategory]);

  useEffect(() => {
    const category = searchParams.get("category");
    const safeCategory = category !== null ? category : "All";
    if (safeCategory !== selectedCategory) {
      setSelectedCategory(safeCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadUserAndCart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const cartRaw = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
      const count = cartRaw ? JSON.parse(cartRaw).length : 0;
      setCartCount(count);
    };
    loadUserAndCart();
  }, []);

  const handleAddToCart = (item: FoodItem) => {
    if (!user) {
      alert('Please login or signup to add items to your cart.');
      router.push('/login');
      return;
    }
    addToCart(item, 1);
    console.log(`Added ${item.name} to cart`);
  };

  // Helper function to render image or emoji
  const renderImage = (image: string) => {
    return <span className="text-4xl">{image || '🍽️'}</span>;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-[var(--foreground)]">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Sticky Header with Navbar */}
      <div className="sticky top-0 z-50">
        <div className="bg-[var(--background)]/80 backdrop-blur-md shadow-lg border-b border-[var(--muted)]">
          <Navbar cartCount={cartCount} isAuthenticated={!!user} />
        </div>
      </div>
      {/* Categories Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">Food Categories</h2>
            <p className="text-lg text-[var(--foreground)]">Explore our diverse menu by category</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 ${selectedCategory === category.name ? 'bg-[var(--primary)] text-white shadow-lg' : 'bg-[var(--background)]/80 backdrop-blur-md text-[var(--foreground)] hover:bg-[var(--secondary)] border border-[var(--muted)]'}`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-semibold text-sm">{category.name}</div>
                  <div className="text-xs opacity-75">{category.count} items</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Menu Section */}
      <section id="menu" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">
              {selectedCategory === "All" ? "Popular Dishes" : `${selectedCategory} Menu`}
            </h2>
            <p className="text-xl text-[var(--muted)]">
              {selectedCategory === "All" 
                ? "Our most loved dishes by our customers" 
                : `Delicious ${selectedCategory.toLowerCase()} options`
              }
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
              <span className="ml-3 text-[var(--muted)]">Loading menu items...</span>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No items found</h3>
              <p className="text-[var(--muted)]">No menu items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {foodItems.map((item) => (
                <div key={item.id} className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        {renderImage(item.image)}
                      </div>
                      {item.popular && (
                        <span className="bg-[var(--primary)] text-white px-3 py-1 rounded-full text-sm font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{item.name}</h3>
                    <p className="text-[var(--muted)] mb-4">{item.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-[var(--muted)]">{item.rating}</span>
                      </div>
                      <span className="text-2xl font-bold text-[var(--primary)]">₹{item.price}</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="w-full px-5 py-2 rounded-xl font-semibold shadow transition-colors duration-200 bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                      title="Add to cart"
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 8A2.5 2.5 0 018 5.5h8A2.5 2.5 0 0118.5 8v9A2.5 2.5 0 0116 19.5H8A2.5 2.5 0 015.5 17V8z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11V9a3 3 0 016 0v2" />
                        </svg>
                        <span>Add to Cart</span>
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
