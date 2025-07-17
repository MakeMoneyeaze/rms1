import { supabase } from "@/lib/supabase";

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string; // Emoji or string from menu_items
  category: string;
  rating: number;
  popular: boolean;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
}

// Fetch categories from database
export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching categories:', error);
      return getDefaultCategories();
    }

    // Get item counts for each category
    const categoriesWithCounts = await Promise.all(
      data.map(async (category) => {
        const { count } = await supabase
          .from('menu_items')
          .select('*', { count: 'exact', head: true })
          .eq('category', category.name)
          .eq('is_active', true);

        return {
          name: category.name,
          icon: category.icon || '🍽️',
          count: count || 0
        };
      })
    );

    // Add "All" category with total count
    const totalCount = categoriesWithCounts.reduce((sum, cat) => sum + cat.count, 0);
    return [
      { name: "All", icon: "🍽️", count: totalCount },
      ...categoriesWithCounts
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return getDefaultCategories();
  }
}

// Fetch food items from database
export async function getFoodItems(): Promise<FoodItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('popular', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching food items:', error);
      return getDefaultFoodItems();
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '🍽️',
      category: item.category,
      rating: item.rating || 4.5,
      popular: item.popular || false
    }));
  } catch (error) {
    console.error('Error fetching food items:', error);
    return getDefaultFoodItems();
  }
}

// Get food items by category
export async function getFoodItemsByCategory(category: string): Promise<FoodItem[]> {
  if (category === "All") {
    return getFoodItems();
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('popular', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching food items by category:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '🍽️',
      category: item.category,
      rating: item.rating || 4.5,
      popular: item.popular || false
    }));
  } catch (error) {
    console.error('Error fetching food items by category:', error);
    return [];
  }
}

// Get popular food items
export async function getPopularFoodItems(limit: number = 6): Promise<FoodItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('popular', true)
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching popular food items:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: item.image || '🍽️',
      category: item.category,
      rating: item.rating || 4.5,
      popular: item.popular || false
    }));
  } catch (error) {
    console.error('Error fetching popular food items:', error);
    return [];
  }
}

// Get food item by ID
export async function getFoodItemById(id: number): Promise<FoodItem | null> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching food item by ID:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      image: data.image || '🍽️',
      category: data.category,
      rating: data.rating || 4.5,
      popular: data.popular || false
    };
  } catch (error) {
    console.error('Error fetching food item by ID:', error);
    return null;
  }
}

// Get customization options for a category
export async function getCustomizationsForCategory(category: string) {
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
      console.error('Error fetching customizations for category:', error);
      return [];
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

    return customizationsWithOptions.filter(Boolean);
  } catch (error) {
    console.error('Error fetching customizations:', error);
    return [];
  }
}

// Fallback default categories
function getDefaultCategories(): Category[] {
  return [
    { name: "All", icon: "🍽️", count: 6 },
    { name: "Desserts", icon: "🍰", count: 1 },
    { name: "Italian", icon: "🍕", count: 2 },
    { name: "Burgers", icon: "🍔", count: 1 },
    { name: "Salads", icon: "🥗", count: 1 },
    { name: "Seafood", icon: "🐟", count: 1 }
  ];
}

// Fallback default food items
function getDefaultFoodItems(): FoodItem[] {
  return [
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Fresh mozzarella, tomato sauce, and basil",
      price: 299,
      image: "🍕",
      category: "Italian",
      rating: 4.8,
      popular: true
    },
    {
      id: 2,
      name: "Chicken Burger",
      description: "Grilled chicken with lettuce, tomato, and special sauce",
      price: 199,
      image: "🍔",
      category: "Burgers",
      rating: 4.6,
      popular: true
    },
    {
      id: 3,
      name: "Caesar Salad",
      description: "Fresh romaine lettuce, parmesan cheese, and croutons",
      price: 149,
      image: "🥗",
      category: "Salads",
      rating: 4.5,
      popular: false
    },
    {
      id: 4,
      name: "Pasta Carbonara",
      description: "Spaghetti with eggs, cheese, and pancetta",
      price: 249,
      image: "🍝",
      category: "Italian",
      rating: 4.7,
      popular: true
    },
    {
      id: 5,
      name: "Chocolate Cake",
      description: "Rich chocolate cake with vanilla ice cream",
      price: 129,
      image: "🍰",
      category: "Desserts",
      rating: 4.9,
      popular: false
    },
    {
      id: 6,
      name: "Grilled Salmon",
      description: "Fresh salmon with herbs and lemon butter sauce",
      price: 399,
      image: "🐟",
      category: "Seafood",
      rating: 4.8,
      popular: true
    }
  ];
} 