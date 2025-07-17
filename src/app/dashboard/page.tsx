"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import "../components/css/button.css";
import "../components/css/navbar.css";
import { getCategories, getFoodItemsByCategory, type FoodItem, type Category } from "../components/menu/data";
import { addToCart, getCartItemCount, onCartUpdate } from "@/lib/cart";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<Category[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Load food items when category changes
  useEffect(() => {
    const loadFoodItems = async () => {
      setMenuLoading(true);
      try {
        const items = await getFoodItemsByCategory(selectedCategory);
        setFoodItems(items);
      } catch (err) {
        console.error('Error loading food items:', err);
      } finally {
        setMenuLoading(false);
      }
    };

    loadFoodItems();
  }, [selectedCategory]);

  // Load user data and cart count
  useEffect(() => {
    const loadUserAndCart = async () => {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      
      // Load cart count from localStorage
      const count = getCartItemCount();
      setCartCount(count);
      
      setLoading(false);
    };

    loadUserAndCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else {
        setUser(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Listen for cart updates
  useEffect(() => {
    const unsubscribe = onCartUpdate(() => {
      const newCount = getCartItemCount();
      setCartCount(newCount);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  const handleAddToCart = (item: FoodItem) => {
    // Redirect to product detail page for customization
    router.push(`/components/item?id=${item.id}`);
  };

  const handleViewMenu = () => {
    router.push('/components/menu');
  };

  // Helper function to render image or emoji
  const renderImage = (image: string) => {
    return <span className="text-4xl">{image || '🍽️'}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-[var(--background)] text-[var(--foreground)]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50">
        <div className="bg-[var(--background)] shadow-lg border-b border-[var(--muted)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🍽️</span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--primary)]">
                  FoodHub Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Cart Icon */}
                <button 
                  onClick={handleCartClick}
                  className="relative p-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                  title="View cart"
                >
                  <span className="sr-only">View cart</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-[var(--primary)] text-white text-xs font-medium flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => router.push('/components/Orders')}
                  className="button"
                  title="Your order's"
                >
                  <span className="flex items-center space-x-1">
                    <span>Your order's</span>
                  </span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-[var(--foreground)] font-medium">
                    {user?.user_metadata?.first_name || user?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="button"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Welcome Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[var(--primary)] mb-4">
              Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-xl text-[var(--foreground)]">
              Ready to explore our delicious menu? Browse by category or view all items.
            </p>
          </div>
        </div>
      </section>
      {/* Categories Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--primary)] mb-4">Browse by Category</h2>
            <p className="text-lg text-[var(--foreground)]">Filter our menu by your favorite categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-4 rounded-xl transition-all duration-300 hover:scale-105 border ${selectedCategory === category.name ? 'bg-[var(--primary)] text-white shadow-lg border-[var(--primary)]' : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--secondary)] border-[var(--muted)]'}`}
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
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--primary)] mb-4">
              {selectedCategory === "All" ? "All Menu Items" : `${selectedCategory} Menu`}
            </h2>
            <p className="text-lg text-[var(--foreground)]">
              {selectedCategory === "All" 
                ? "Explore our complete menu" 
                : `Delicious ${selectedCategory.toLowerCase()} options`
              }
            </p>
          </div>
          {menuLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--muted)]"></div>
              <span className="ml-3 text-[var(--foreground)]">Loading menu items...</span>
            </div>
          ) : foodItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-[var(--primary)] mb-2">No items found</h3>
              <p className="text-[var(--foreground)]">No menu items available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {foodItems.map((item) => (
                <div key={item.id} className="bg-[var(--background)] rounded-xl p-6 border border-[var(--muted)]">
                  <div className="mb-4">{renderImage(item.image)}</div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{item.name}</h3>
                  <p className="text-[var(--foreground)] mb-2">{item.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-yellow-500">★ {item.rating}</span>
                    <span className="text-lg font-bold text-[var(--primary)]">₹{item.price}</span>
                  </div>
                  <button onClick={() => handleAddToCart(item)} className="button w-full mt-2">Add to Cart</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-[var(--background)] text-[var(--foreground)] py-10 border-t border-[var(--muted)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-extrabold mb-3 text-[var(--primary)]">FoodHub</h3>
              <p className="text-[var(--foreground)]">Delicious food delivered to your doorstep.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[var(--foreground)]">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline text-[var(--foreground)]">Menu</a></li>
                <li><a href="#" className="hover:underline text-[var(--foreground)]">About Us</a></li>
                <li><a href="#" className="hover:underline text-[var(--foreground)]">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[var(--foreground)]">Support</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline text-[var(--foreground)]">Help Center</a></li>
                <li><a href="#" className="hover:underline text-[var(--foreground)]">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline text-[var(--foreground)]">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-[var(--foreground)]">Contact</h4>
              <ul className="space-y-1 text-[var(--foreground)]">
                <li>📧 info@foodhub.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>📍 123 Food Street, Cuisine City</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--primary)] mt-8 pt-6 text-center text-[var(--foreground)] text-sm">
            <p>&copy; 2024 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}