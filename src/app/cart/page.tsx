"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getFoodItems } from "../components/menu/data";
import {
  getCartItems,
  saveCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotalPrice,
  mergeCartWithDatabaseItems,
  type CartItem
} from "@/lib/cart";
import "../components/css/button.css";

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  // Load cart items from DB/localStorage and menu items from database
  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      try {
        // Load all menu items from database
        const menuItems = await getFoodItems();
        setAllMenuItems(menuItems);

        let loadedCart: CartItem[] = [];
        if (user) {
          // Fetch cart from DB
          const { data, error } = await supabase
            .from('user_carts')
            .select('cart_data')
            .eq('user_id', user.id)
            .single();
          if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
            console.error('Error fetching cart from DB:', error);
          }
          if (data && data.cart_data) {
            loadedCart = data.cart_data;
          } else {
            // If no cart in DB, check localStorage (guest cart)
            loadedCart = getCartItems();
            // Save guest cart to DB for this user
            if (loadedCart.length > 0) {
              await supabase.from('user_carts').upsert({ user_id: user.id, cart_data: loadedCart });
              clearCart(); // Clear guest cart from localStorage
            }
          }
        } else {
          // Not logged in, use localStorage
          loadedCart = getCartItems();
        }
        const mergedCartItems = mergeCartWithDatabaseItems(loadedCart, menuItems);
        setCartItems(mergedCartItems);
      } catch (error) {
        console.error('Error loading cart data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCartData();
    // Only reload when user changes
  }, [user]);

  // Save cart to DB/localStorage when cartItems change
  useEffect(() => {
    if (loading) return; // Don't save while loading
    const saveCart = async () => {
      if (user) {
        await supabase.from('user_carts').upsert({ user_id: user.id, cart_data: cartItems });
      } else {
        saveCartItems(cartItems);
      }
    };
    saveCart();
  }, [cartItems, user, loading]);

  const updateQuantity = (id: number, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(id, newQuantity);
    setCartItems(updatedCart);
  };

  const removeItem = (id: number) => {
    const updatedCart = removeFromCart(id);
    setCartItems(updatedCart);
  };

  const getTotalPrice = () => {
    return getCartTotalPrice();
  };

  const getTotalItems = () => {
    return getCartItemCount();
  };

  const handleCheckout = () => {
    router.push('/payment');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
    if (user) {
      supabase.from('user_carts').upsert({ user_id: user.id, cart_data: [] });
    }
  };

  // Helper function to render image or emoji
  const renderImage = (image_url: string, image_alt?: string) => {
    if (image_url && image_url.startsWith('http')) {
      return (
        <img 
          src={image_url} 
          alt={image_alt || 'Menu item image'}
          className="w-16 h-16 object-cover rounded-lg"
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    // If it's an emoji or missing, render as text
    return <span className="text-2xl">🍽️</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Header */}
        <div className="bg-[var(--background)]/80 backdrop-blur-md shadow-lg border-b border-[var(--muted)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">🍽️</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] bg-clip-text text-transparent">
                  FoodHub Cart
                </h1>
              </div>
              
              <button
                onClick={handleContinueShopping}
                className="button" 
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-2xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-12">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-[var(--primary)] mb-4">Your cart is empty</h2>
            <p className="text-xl text-[var(--foreground)] mb-8">
              Looks like you haven't added any delicious items to your cart yet.
            </p>
            <button
              onClick={handleContinueShopping}
              className="button text-lg px-8 py-4"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Browse Menu</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="bg-[var(--background)]/80 backdrop-blur-md shadow-lg border-b border-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🍽️</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] bg-clip-text text-transparent">
                FoodHub Cart
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-[var(--foreground)]">
                {getTotalItems()} items
              </span>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={handleContinueShopping}
                className="button button-secondary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8">
              <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">Your Cart Items</h2>
              
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${index}-${item.customizations ? JSON.stringify(item.customizations) : 'default'}`} className="flex items-center space-x-4 p-4 bg-[var(--muted)]/50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-[var(--secondary)] rounded-lg flex items-center justify-center">
                        {renderImage(item.image, item.name)}
                        {item.image && item.image.startsWith('http') && (
                          <span className="text-2xl hidden">🍽️</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">{item.name}</h3>
                      <p className="text-[var(--foreground)]">{item.description}</p>
                      
                      {/* Customizations Display */}
                      {item.customizations && (
                        <div className="mt-2 space-y-1">
                          <div className="text-sm text-[var(--foreground)]">
                            <span className="font-medium">Spice Level:</span> {item.customizations.spiceLevel}
                          </div>
                          {Array.isArray(item.customizations.extraToppings) && item.customizations.extraToppings.length > 0 && (
                            <div className="text-sm text-[var(--foreground)]">
                              <span className="font-medium">Extra Toppings:</span> {item.customizations.extraToppings.join(', ')}
                            </div>
                          )}
                          {item.customizations.specialInstructions && (
                            <div className="text-sm text-[var(--foreground)]">
                              <span className="font-medium">Special Instructions:</span> {item.customizations.specialInstructions}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-[var(--foreground)]">{item.rating}</span>
                        {item.popular && (
                          <span className="bg-[var(--primary)] text-white px-2 py-1 rounded-full text-xs font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-[var(--primary)] mt-2">
                        ₹{item.customizations?.extraToppings?.length ? 
                          item.price + (item.customizations.extraToppings.length * 20) : 
                          item.price}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="button"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="w-12 text-center font-semibold text-[var(--foreground)]">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="button"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                        title="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8 sticky top-32">
              <h2 className="text-2xl font-bold text-[var(--primary)] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-[var(--foreground)]">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between text-[var(--foreground)]">
                  <span>Delivery Fee</span>
                  <span>₹40</span>
                </div>
                <div className="flex justify-between text-[var(--foreground)]">
                  <span>Tax</span>
                  <span>₹{(getTotalPrice() * 0.05).toFixed(0)}</span>
                </div>
                <div className="border-t pt-4 border-[var(--muted)]">
                  <div className="flex justify-between text-xl font-bold text-[var(--primary)]">
                    <span>Total</span>
                    <span>₹{(getTotalPrice() + 40 + (getTotalPrice() * 0.05)).toFixed(0)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full button text-lg py-4 mb-4"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span>Proceed to Checkout</span>
                </span>
              </button>
              
              <div className="text-center">
                <p className="text-sm text-[var(--muted)]">
                  Free delivery on orders above ₹500
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 