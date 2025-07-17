"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string; // Emoji or string
  category: string;
  rating: number;
  popular: boolean;
}

export default function AddMenuItem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<number | null>(null);
  const [imageInput, setImageInput] = useState<string>("");
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    popular: false,
    rating: 4.5,
    image: "" // New state for emoji
  });

  const [customizations, setCustomizations] = useState<any[]>([]);
  const [loadingCustomizations, setLoadingCustomizations] = useState(false);
  const [editingCustomization, setEditingCustomization] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    display_name: '',
    price_adjustment: 0,
    is_default: false,
    sort_order: 0
  });

  const categories = [
    { name: "Italian", icon: "🍕" },
    { name: "Burgers", icon: "🍔" },
    { name: "Salads", icon: "🥗" },
    { name: "Desserts", icon: "🍰" },
    { name: "Seafood", icon: "🐟" },
    { name: "Pasta", icon: "🍝" },
    { name: "Beverages", icon: "🥤" },
    { name: "Appetizers", icon: "🥨" }
  ];

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

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Load customizations when category changes
    if (name === 'category' && value) {
      loadCustomizationsForCategory(value);
    }
  };

  const loadCustomizationsForCategory = async (category: string) => {
    setLoadingCustomizations(true);
    try {
      const { data, error } = await supabase
        .from('category_customizations')
        .select(`
          *,
          customization_categories (
            id,
            name,
            display_name,
            description
          )
        `)
        .eq('menu_category', category)
        .order('sort_order');

      if (error) {
        console.error('Error fetching customizations:', error);
        setCustomizations([]);
        return;
      }

      // Get options for each customization category
      const customizationsWithOptions = await Promise.all(
        data.map(async (customization) => {
          const { data: options, error: optionsError } = await supabase
            .from('customization_options')
            .select('*')
            .eq('category_id', customization.customization_categories.id)
            .eq('is_active', true)
            .order('sort_order');

          if (optionsError) {
            console.error('Error fetching options:', optionsError);
            return null;
          }

          return {
            ...customization,
            options: options || []
          };
        })
      );

      setCustomizations(customizationsWithOptions.filter(Boolean));
    } catch (error) {
      console.error('Error loading customizations:', error);
      setCustomizations([]);
    } finally {
      setLoadingCustomizations(false);
    }
  };

  const handleEditCustomization = (customization: any, option: any) => {
    setEditingCustomization({ customization, option });
    setEditFormData({
      display_name: option.display_name,
      price_adjustment: option.price_adjustment,
      is_default: option.is_default,
      sort_order: option.sort_order
    });
    setShowEditModal(true);
  };

  const handleUpdateCustomization = async () => {
    if (!editingCustomization) return;

    try {
      const { error } = await supabase
        .from('customization_options')
        .update({
          display_name: editFormData.display_name,
          price_adjustment: editFormData.price_adjustment,
          is_default: editFormData.is_default,
          sort_order: editFormData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCustomization.option.id);

      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }

      // Reload customizations to reflect changes
      await loadCustomizationsForCategory(formData.category);
      setShowEditModal(false);
      setEditingCustomization(null);
      setSuccessMessage('Customization updated successfully!');
    } catch (error) {
      console.error('Error updating customization:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update customization');
    }
  };

  const handleToggleOptionActive = async (optionId: number) => {
    try {
      const { error } = await supabase
        .from('customization_options')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', optionId);

      if (error) {
        throw new Error(`Toggle failed: ${error.message}`);
      }

      // Reload customizations to reflect changes
      await loadCustomizationsForCategory(formData.category);
      setSuccessMessage('Option deactivated successfully!');
    } catch (error) {
      console.error('Error toggling option:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to toggle option');
    }
  };

  const handleAddNewOption = async (categoryId: number) => {
    try {
      const { error } = await supabase
        .from('customization_options')
        .insert({
          category_id: categoryId,
          name: 'new_option',
          display_name: 'New Option',
          price_adjustment: 0,
          is_default: false,
          is_active: true,
          sort_order: 999
        });

      if (error) {
        throw new Error(`Add failed: ${error.message}`);
      }

      // Reload customizations to reflect changes
      await loadCustomizationsForCategory(formData.category);
      setSuccessMessage('New option added successfully!');
    } catch (error) {
      console.error('Error adding option:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add option');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.image) {
        throw new Error("Please fill in all required fields, including image (emoji)");
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Please enter a valid price");
      }

      // Insert into Supabase database
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: price,
          image: formData.image,
          category: formData.category,
          rating: formData.rating,
          popular: formData.popular,
          is_active: true
        }])
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to add menu item: ${error.message}`);
      }

      if (data && data.length > 0) {
        // Success
        setSuccessMessage(`Menu item "${formData.name}" added successfully!`);
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          popular: false,
          rating: 4.5,
          image: ""
        });
        console.log('Menu item added to database:', data[0]);
      } else {
        throw new Error("Failed to add menu item - no data returned");
      }

    } catch (error) {
      console.error('Error adding menu item:', error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to add menu item");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-3xl font-extrabold text-orange-700 tracking-tight">Add Menu Item</h1>
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

      <div className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-xl rounded-2xl border border-orange-100">
          <div className="px-6 py-8 sm:p-10">
            <h3 className="text-2xl font-bold text-orange-700 mb-8">Add New Menu Item</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div>
                <label htmlFor="category" className="block text-base font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base appearance-none bg-white pr-10 font-semibold text-gray-900"
                  >
                    <option value="" disabled className="text-gray-500 font-normal">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name} className="text-gray-900 font-semibold bg-white">
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label htmlFor="name" className="block text-base font-semibold text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder="Enter the menu item name, e.g. Margherita Pizza"
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-base font-semibold text-gray-700 mb-2">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder="Enter price in ₹, e.g. 299"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-base font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                  placeholder="Describe the item, e.g. Fresh mozzarella, tomato sauce, and basil"
                />
              </div>

              {/* Image (Emoji) Input Section */}
              <div>
                <label htmlFor="image" className="block text-base font-semibold text-gray-700 mb-2">
                  Image (Emoji) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  required
                  placeholder="Paste or type an emoji, e.g. 🍕"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
                />
                {formData.image && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <div className="relative inline-block">
                      <span className="text-9xl">{formData.image}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating Dropdown */}
              <div>
                <label htmlFor="rating" className="block text-base font-semibold text-gray-700 mb-2">
                  Initial Rating
                </label>
                <div className="relative">
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base appearance-none bg-white pr-10 font-semibold text-gray-900"
                  >
                    {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5, 0].map((r) => (
                      <option key={r} value={r} className="text-gray-900 font-semibold bg-white">{r} ⭐</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Popular Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  checked={formData.popular}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="popular" className="ml-2 block text-base text-gray-900 font-medium">
                  Mark as Popular Item
                </label>
              </div>

              {/* Customization Options */}
              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Available Customizations for {formData.category}
                  </label>
                  
                  {loadingCustomizations ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading customizations...</span>
                    </div>
                  ) : customizations.length > 0 ? (
                    <div className="space-y-4">
                      {customizations.map((customization) => (
                        <div key={customization.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {customization.customization_categories.display_name}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {customization.is_required ? 'Required' : 'Optional'}
                              </span>
                              <span className="text-xs text-gray-500">
                                Max: {customization.max_selections}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3">
                            {customization.customization_categories.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Options ({customization.options.length})</span>
                              <button
                                onClick={() => handleAddNewOption(customization.customization_categories.id)}
                                className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                              >
                                + Add Option
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {customization.options.map((option: any) => (
                                <div key={option.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                  <div className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      id={`option-${option.id}`}
                                      className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                      disabled
                                      checked={option.is_default}
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {option.display_name}
                                        {option.is_default && (
                                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                            Default
                                          </span>
                                        )}
                                        {!option.is_active && (
                                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                            Inactive
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {option.price_adjustment > 0 && (
                                          <span className="text-green-600">+₹{option.price_adjustment}</span>
                                        )}
                                        {option.price_adjustment < 0 && (
                                          <span className="text-red-600">₹{option.price_adjustment}</span>
                                        )}
                                        {option.price_adjustment === 0 && (
                                          <span className="text-gray-500">No price change</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleEditCustomization(customization, option)}
                                      className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleToggleOptionActive(option.id)}
                                      className={`text-xs px-2 py-1 rounded ${
                                        option.is_active
                                          ? 'bg-red-600 text-white hover:bg-red-700'
                                          : 'bg-green-600 text-white hover:bg-green-700'
                                      }`}
                                    >
                                      {option.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">No customizations available for this category.</p>
                      <p className="text-xs mt-1">Customizations are managed in the database.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <Link
                  href="/admin"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </div>
                  ) : (
                    "Add Menu Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Customization Modal */}
      {showEditModal && editingCustomization && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Customization Option
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.display_name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Adjustment (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.price_adjustment}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editFormData.sort_order}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={editFormData.is_default}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                    Set as Default Option
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCustomization}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
                >
                  Update Option
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add a style block for custom placeholder styling */}
      <style jsx global>{`
        input::placeholder, textarea::placeholder {
          color:rgb(0, 0, 0) !important; /* orange-600 */
          font-weight: 100 !important;
          opacity: 0.5 !important;
        }
        select:invalid {
          color:rgb(0, 0, 0) !important;
          font-weight: 100 !important;
          opacity: 0.5 !important;
        }
      `}</style>
    </div>
  );
}
