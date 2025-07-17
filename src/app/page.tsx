"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import "./components/css/button.css";
import "./components/css/navbar.css";
import { getCategories, getPopularFoodItems, type FoodItem, type Category } from "./components/menu/data";
import { addToCart, getCartItemCount, onCartUpdate } from "@/lib/cart";
import Navbar from "./components/ui/navbar";
import Image from "next/image";
import Head from "next/head";
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '800'] });
import Hero from "./components/ui/hero";


export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularItems, setPopularItems] = useState<FoodItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categoryItems, setCategoryItems] = useState<FoodItem[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Load categories and popular items
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        const popularData = await getPopularFoodItems(6);
        setPopularItems(popularData);
      } catch (error) {
        console.error('Error loading menu data:', error);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenuData();
  }, []);

  // Load cart count and user data
  useEffect(() => {
    const loadUserAndCart = async () => {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Load cart count from localStorage
      const count = getCartItemCount();
      setCartCount(count);
      
      setLoading(false);
    };

    loadUserAndCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Listen for cart updates
  useEffect(() => {
    const unsubscribe = onCartUpdate(() => {
      const newCount = getCartItemCount();
      setCartCount(newCount);
    });

    return unsubscribe;
  }, []);

  // Fetch items for selected category
  useEffect(() => {
    const fetchCategoryItems = async () => {
      setCategoryLoading(true);
      try {
        const { getFoodItemsByCategory } = await import("./components/menu/data");
        const items = await getFoodItemsByCategory(selectedCategory);
        setCategoryItems(items);
      } catch (error) {
        setCategoryItems([]);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategoryItems();
  }, [selectedCategory]);

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  const handleAddToCart = (item: FoodItem) => {
    if (!user) {
      alert('Please login or signup to add items to your cart.');
      router.push('/login');
      return;
    }
    // Redirect to product detail page for customization
    router.push(`/components/item?id=${item.id}`);
  };

  const handleViewMenu = () => {
    // Scroll to menu section
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to render images (updated for real/emoji fallback)
  const renderImage = (imageUrl: string) => {
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt="Dish"
          className="w-full h-48 object-cover rounded-2xl mb-4 shadow-md group-hover:scale-105 transition-transform duration-300"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = 'https://placehold.co/400x300/CCCCCC/000000?text=Image+Not+Found';
          }}
        />
      );
    }
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-2xl mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
        <span className="text-gray-600">No Image</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans bg-white text-black ${inter.className} ${poppins.className}`}>
      {/* Navbar */}
      <Navbar cartCount={cartCount} isAuthenticated={!!user} />
      <Hero />
      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2 text-[var(--primary)]">Why Choose FoodHub?</h2>
            <p className="text-lg text-[var(--foreground)]">We're committed to providing the best food delivery experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-[var(--background)] rounded-xl p-6 border border-[var(--muted)] shadow">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-[var(--secondary)] rounded-full">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Fast Delivery</h3>
              <p className="text-[var(--foreground)]">Get your food delivered in 30 minutes or less</p>
            </div>
            <div className="text-center bg-[var(--background)] rounded-xl p-6 border border-[var(--muted)] shadow">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-[var(--secondary)] rounded-full">
                <span className="text-2xl">🥗</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Fresh Ingredients</h3>
              <p className="text-[var(--foreground)]">We use only the freshest and highest quality ingredients</p>
            </div>
            <div className="text-center bg-[var(--background)] rounded-xl p-6 border border-[var(--muted)] shadow">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-[var(--secondary)] rounded-full">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-lg font-bold mb-2 text-[var(--foreground)]">Best Quality</h3>
              <p className="text-[var(--foreground)]">Rated 4.8+ stars by thousands of satisfied customers</p>
            </div>
          </div>
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
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-[var(--foreground)] text-sm">
            <p>&copy; 2024 FoodHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
