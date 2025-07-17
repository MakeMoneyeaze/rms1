import type { FoodItem } from "@/app/components/menu/data";

export interface CartItem extends FoodItem {
  quantity: number;
  customizations?: {
    spiceLevel: string;
    specialInstructions: string;
    extraToppings: string[];
  };
}

const CART_STORAGE_KEY = 'foodhub_cart';

// Custom event for cart updates
const CART_UPDATE_EVENT = 'cart-updated';

// Dispatch cart update event
const dispatchCartUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT));
  }
};

// Listen for cart updates
export const onCartUpdate = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const handleCartUpdate = () => callback();
  window.addEventListener(CART_UPDATE_EVENT, handleCartUpdate);
  
  return () => window.removeEventListener(CART_UPDATE_EVENT, handleCartUpdate);
};

// Get cart items from localStorage
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save cart items to localStorage
export const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    dispatchCartUpdate();
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Add item to cart
export const addToCart = (item: FoodItem & { customizations?: any }, quantity: number = 1): CartItem[] => {
  const currentCart = getCartItems();
  
  // For customized items, always add as new item to preserve customizations
  if (item.customizations) {
    const newItem: CartItem = {
      ...item,
      quantity,
      customizations: item.customizations
    };
    const updatedCart = [...currentCart, newItem];
    saveCartItems(updatedCart);
    return updatedCart;
  }
  
  // For regular items, check for existing items
  const existingItemIndex = currentCart.findIndex(cartItem => 
    cartItem.id === item.id && !cartItem.customizations
  );
  
  let updatedCart: CartItem[];
  
  if (existingItemIndex >= 0) {
    // Item already exists, update quantity
    updatedCart = currentCart.map((cartItem, index) => 
      index === existingItemIndex 
        ? { ...cartItem, quantity: cartItem.quantity + quantity }
        : cartItem
    );
  } else {
    // Add new item
    updatedCart = [...currentCart, { ...item, quantity }];
  }
  
  saveCartItems(updatedCart);
  return updatedCart;
};

// Update item quantity in cart
export const updateCartItemQuantity = (itemId: number, quantity: number): CartItem[] => {
  if (quantity < 1) {
    return removeFromCart(itemId);
  }
  
  const currentCart = getCartItems();
  const updatedCart = currentCart.map(item => 
    item.id === itemId ? { ...item, quantity } : item
  );
  
  saveCartItems(updatedCart);
  return updatedCart;
};

// Remove item from cart
export const removeFromCart = (itemId: number): CartItem[] => {
  const currentCart = getCartItems();
  const updatedCart = currentCart.filter(item => item.id !== itemId);
  
  saveCartItems(updatedCart);
  return updatedCart;
};

// Clear entire cart
export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);
  dispatchCartUpdate();
};

// Get total number of items in cart
export const getCartItemCount = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

// Get total price of cart
export const getCartTotalPrice = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => {
    const basePrice = item.price * item.quantity;
    const toppingsPrice = item.customizations?.extraToppings?.length ? 
      item.customizations.extraToppings.length * 20 * item.quantity : 0;
    return total + basePrice + toppingsPrice;
  }, 0);
};

// Merge cart with database items to get latest data
export const mergeCartWithDatabaseItems = (cartItems: CartItem[], dbItems: FoodItem[]): CartItem[] => {
  return cartItems
    .map(cartItem => {
      const dbItem = dbItems.find(item => item.id === cartItem.id);
      return dbItem ? { ...dbItem, quantity: cartItem.quantity } : cartItem;
    })
    .filter(item => dbItems.some(dbItem => dbItem.id === item.id)); // Remove items that no longer exist in DB
}; 