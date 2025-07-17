"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getFoodItemById, getCustomizationsForCategory, type FoodItem } from "../menu/data";
import { addToCart } from "@/lib/cart";
import "../css/button.css";

export default function ItemDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get('id');
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<{[key: string]: any}>({});
  const [availableCustomizations, setAvailableCustomizations] = useState<any[]>([]);
  const [loadingCustomizations, setLoadingCustomizations] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    loadUser();
  }, []);

  // Load item data and customizations
  useEffect(() => {
    const loadItem = async () => {
      if (!itemId) {
        router.push('/');
        return;
      }

      try {
        const itemData = await getFoodItemById(parseInt(itemId));
        if (itemData) {
          setItem(itemData);
          
          // Load customizations for this category
          setLoadingCustomizations(true);
          const categoryCustomizations = await getCustomizationsForCategory(itemData.category);
          setAvailableCustomizations(categoryCustomizations);
          
          // Initialize default customizations
          const defaultCustomizations: {[key: string]: any} = {};
          categoryCustomizations.forEach((customization: any) => {
            const defaultOption = customization.options.find((opt: any) => opt.is_default);
            if (defaultOption) {
              if (customization.max_selections > 1) {
                defaultCustomizations[customization.customization_categories.name] = [];
              } else {
                defaultCustomizations[customization.customization_categories.name] = defaultOption.name;
              }
            } else {
              if (customization.max_selections > 1) {
                defaultCustomizations[customization.customization_categories.name] = [];
              } else {
                defaultCustomizations[customization.customization_categories.name] = '';
              }
            }
          });
          setCustomizations(defaultCustomizations);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading item:', error);
        router.push('/');
      } finally {
        setLoading(false);
        setLoadingCustomizations(false);
      }
    };

    loadItem();
  }, [itemId, router]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleCustomizationChange = (categoryName: string, value: any, isMultiSelect: boolean = false) => {
    setCustomizations(prev => {
      if (isMultiSelect) {
        const currentValues = prev[categoryName] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v: string) => v !== value)
          : [...currentValues, value];
        return { ...prev, [categoryName]: newValues };
      } else {
        return { ...prev, [categoryName]: value };
      }
    });
  };

  const handleSpecialInstructionsChange = (instructions: string) => {
    setCustomizations(prev => ({ ...prev, specialInstructions: instructions }));
  };

  const calculateTotalPrice = () => {
    if (!item) return 0;
    const basePrice = item.price * quantity;
    
    // Calculate price adjustments from customizations
    let adjustments = 0;
    Object.keys(customizations).forEach(categoryName => {
      const customization = availableCustomizations.find(c => c.customization_categories.name === categoryName);
      if (customization) {
        const values = customizations[categoryName];
        if (Array.isArray(values)) {
          // Multi-select customization
          values.forEach((value: string) => {
            const option = customization.options.find((opt: any) => opt.name === value);
            if (option) {
              adjustments += option.price_adjustment * quantity;
            }
          });
        } else if (values) {
          // Single-select customization
          const option = customization.options.find((opt: any) => opt.name === values);
          if (option) {
            adjustments += option.price_adjustment * quantity;
          }
        }
      }
    });
    
    return basePrice + adjustments;
  };

  const handleAddToCart = () => {
    if (!item || !user) return;

    // Create customized item with customizations
    const customizedItem = {
      ...item,
      customizations: {
        quantity,
        spiceLevel: customizations.spiceLevel,
        specialInstructions: customizations.specialInstructions,
        extraToppings: customizations.extraToppings
      }
    };

    // Add to cart with quantity
    addToCart(customizedItem, quantity);
    
    // Show success message and redirect
    alert('Item added to cart successfully!');
    router.push('/cart');
  };

  const handleBackToMenu = () => {
    router.push('/');
  };

  // Helper function to render image or emoji
  const renderImage = (image_url: string, image_alt?: string) => {
    if (image_url && image_url.startsWith('http')) {
      return (
        <img 
          src={image_url} 
          alt={image_alt || 'Menu item image'}
          className="w-32 h-32 object-cover rounded-xl"
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
    return <span className="text-5xl">🍽️</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--foreground)]">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">Product not found</h2>
          <button onClick={handleBackToMenu} className="button">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-[var(--background)]/80 backdrop-blur-md shadow-lg border-b border-[var(--muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleBackToMenu}
                className="p-2 text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🍽️</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] bg-clip-text text-transparent">
                Product Details
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-6">
            <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center mb-6">
                  {renderImage(item.image, item.name)}
                  {item.image && item.image.startsWith('http') && (
                    <span className="text-5xl hidden">🍽️</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-[var(--primary)]">{item.name}</h1>
                {item.popular && (
                  <span className="bg-[var(--primary)] text-white px-4 py-2 rounded-full text-sm font-medium">
                    Popular
                  </span>
                )}
              </div>
              
              <p className="text-lg text-[var(--foreground)] mb-6">{item.description}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500 text-xl">★</span>
                  <span className="text-lg text-[var(--foreground)]">{item.rating}</span>
                  <span className="text-[var(--muted)]">•</span>
                  <span className="text-[var(--foreground)]">Category: {item.category}</span>
                </div>
                <span className="text-3xl font-bold text-[var(--primary)]">₹{item.price}</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8">
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="button"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24">
                    <line x1="6" y1="12" x2="18" y2="12" stroke="#22223B" strokeWidth="3" strokeLinecap="round" className="group-hover:stroke-white" />
                  </svg>
                </button>
                
                <span className="text-2xl font-bold text-[var(--foreground)] w-16 text-center">
                  {quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= 10}
                  className="button"
                >
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24">
                    <line x1="12" y1="6" x2="12" y2="18" stroke="#22223B" strokeWidth="3" strokeLinecap="round" className="group-hover:stroke-white" />
                    <line x1="6" y1="12" x2="18" y2="12" stroke="#22223B" strokeWidth="3" strokeLinecap="round" className="group-hover:stroke-white" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Dynamic Customization Options */}
            {loadingCustomizations ? (
              <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                  <span className="ml-3 text-[var(--foreground)]">Loading customization options...</span>
                </div>
              </div>
            ) : availableCustomizations.length > 0 ? (
              <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-6">Customize Your Order</h3>
                
                <div className="space-y-6">
                  {availableCustomizations.map((customization) => (
                    <div key={customization.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-[var(--foreground)]">
                          {customization.customization_categories.display_name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {customization.is_required && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                          {customization.max_selections > 1 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Max {customization.max_selections}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-[var(--muted)]">
                        {customization.customization_categories.description}
                      </p>
                      
                      {customization.max_selections > 1 ? (
                        // Multi-select options
                        <div className="grid grid-cols-2 gap-3">
                          {customization.options.map((option: any) => {
                            const isSelected = customizations[customization.customization_categories.name]?.includes(option.name);
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleCustomizationChange(customization.customization_categories.name, option.name, true)}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-[var(--primary)] bg-[var(--secondary)] text-[var(--primary)]'
                                    : 'border-[var(--muted)] hover:border-[var(--primary)]'
                                }`}
                              >
                                <div className="text-left">
                                  <div className="font-medium text-[var(--foreground)]">{option.display_name}</div>
                                  {option.price_adjustment > 0 && (
                                    <div className="text-xs text-green-600">+₹{option.price_adjustment}</div>
                                  )}
                                  {option.price_adjustment < 0 && (
                                    <div className="text-xs text-red-600">₹{option.price_adjustment}</div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        // Single-select options
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {customization.options.map((option: any) => {
                            const isSelected = customizations[customization.customization_categories.name] === option.name;
                            return (
                              <button
                                key={option.id}
                                onClick={() => handleCustomizationChange(customization.customization_categories.name, option.name)}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-[var(--primary)] bg-[var(--secondary)] text-[var(--primary)]'
                                    : 'border-[var(--muted)] hover:border-[var(--primary)]'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="font-medium text-[var(--foreground)]">{option.display_name}</div>
                                  {option.price_adjustment > 0 && (
                                    <div className="text-xs text-green-600">+₹{option.price_adjustment}</div>
                                  )}
                                  {option.price_adjustment < 0 && (
                                    <div className="text-xs text-red-600">₹{option.price_adjustment}</div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Special Instructions */}
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--foreground)] mb-3">Special Instructions</h4>
                    <textarea
                      value={customizations.specialInstructions || ''}
                      onChange={(e) => handleSpecialInstructionsChange(e.target.value)}
                      placeholder="Any special requests or dietary requirements?"
                      className="w-full p-3 border-2 border-[var(--muted)] rounded-lg focus:border-[var(--primary)] focus:outline-none transition-colors duration-200 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Order Summary */}
            <div className="bg-[var(--background)]/80 backdrop-blur-md rounded-2xl shadow-xl border border-[var(--muted)] p-8">
              <h3 className="text-xl font-bold text-[var(--primary)] mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[var(--foreground)]">
                  <span>Base Price ({quantity}x)</span>
                  <span>₹{item.price * quantity}</span>
                </div>
                
                {/* Dynamic customization price breakdown */}
                {Object.keys(customizations).map(categoryName => {
                  const customization = availableCustomizations.find(c => c.customization_categories.name === categoryName);
                  if (!customization) return null;
                  
                  const values = customizations[categoryName];
                  if (!values || (Array.isArray(values) && values.length === 0)) return null;
                  
                  let totalAdjustment = 0;
                  if (Array.isArray(values)) {
                    values.forEach((value: string) => {
                      const option = customization.options.find((opt: any) => opt.name === value);
                      if (option) {
                        totalAdjustment += option.price_adjustment * quantity;
                      }
                    });
                  } else {
                    const option = customization.options.find((opt: any) => opt.name === values);
                    if (option) {
                      totalAdjustment += option.price_adjustment * quantity;
                    }
                  }
                  
                  if (totalAdjustment !== 0) {
                    return (
                      <div key={categoryName} className="flex justify-between text-[var(--foreground)]">
                        <span>{customization.customization_categories.display_name}</span>
                        <span>₹{totalAdjustment}</span>
                      </div>
                    );
                  }
                  return null;
                })}
                
                <div className="border-t pt-3 border-[var(--muted)]">
                  <div className="flex justify-between text-xl font-bold text-[var(--primary)]">
                    <span>Total</span>
                    <span>₹{calculateTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!user}
                className="w-full button text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  <span>{user ? 'Add to Cart' : 'Sign in to Add to Cart'}</span>
                </span>
              </button>

              {!user && (
                <p className="text-center text-sm text-[var(--muted)] mt-3">
                  Please sign in to add items to your cart
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
