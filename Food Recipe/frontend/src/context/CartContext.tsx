/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { CartItem } from '../types/Cart'; 
import { CartState } from '../types/Cart';

const API_BASE_URL = 'http://localhost:8000';

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: { items: CartItem[]; total_price: number; total_items: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: number; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: number }
  | { type: 'CLEAR_CART' };

interface CartContextType extends CartState {
  addToCart: (ingredientId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
  loading: false,
  error: null,
};

// Reducer (keeping the same as before)
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items,
        totalPrice: action.payload.total_price,
        totalItems: action.payload.total_items,
        loading: false,
        error: null,
      };
    
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.ingredient.id === action.payload.ingredient.id
      );
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const newTotalPrice = newItems.reduce(
        (sum, item) => sum + (parseFloat(item.ingredient.price) * item.quantity), 0
      );
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        totalPrice: newTotalPrice,
        totalItems: newTotalItems,
        error: null,
      };
    }
    
    case 'UPDATE_ITEM': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const updatedTotalPrice = updatedItems.reduce(
        (sum, item) => sum + (parseFloat(item.ingredient.price) * item.quantity), 0
      );
      const updatedTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItems,
        totalPrice: updatedTotalPrice,
        totalItems: updatedTotalItems,
      };
    }
    
    case 'REMOVE_ITEM': {
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredTotalPrice = filteredItems.reduce(
        (sum, item) => sum + (parseFloat(item.ingredient.price) * item.quantity), 0
      );
      const filteredTotalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        totalPrice: filteredTotalPrice,
        totalItems: filteredTotalItems,
      };
    }
    
    case 'CLEAR_CART':
      return { ...initialState, loading: false };
    
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { 
    token, 
    sessionKey,
    isGuest,
    sessionExpiry,
    initializeGuestSession,
    clearGuestSession,
    getAuthHeaders,
    mergeGuestCart
  } = useAuth();

  // Get appropriate headers for API calls
  const getRequestHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Using auth token for request');
    } else if (sessionKey) {
      headers['X-Guest-Session'] = sessionKey;
      console.log('Using guest session for request:', sessionKey);
    } else {
      console.log('No auth token or session key available');
    }

    return headers;
  };

  // Create axios instance with appropriate headers
  const createAuthAxios = () => {
    const headers = getRequestHeaders();
    console.log('Request headers:', headers);
    
    return axios.create({
      baseURL: API_BASE_URL,
      headers,
      timeout: 10000, // 10 second timeout
    });
  };

  // Initialize guest session if needed and wait for it to complete
  const ensureGuestSession = async (): Promise<boolean> => {
    if (!token && !sessionKey) {
      console.log('Initializing guest session...');
      try {
        await initializeGuestSession();
        // Wait a bit for the session to be set
        return new Promise((resolve) => {
          const checkSession = () => {
            if (sessionKey) {
              resolve(true);
            } else {
              setTimeout(checkSession, 50);
            }
          };
          checkSession();
        });
      } catch (error) {
        console.error('Failed to initialize guest session:', error);
        return false;
      }
    }
    return true;
  };

  // Fetch cart from API
  const fetchCart = async () => {
    console.log('Fetching cart...', { token: !!token, sessionKey: !!sessionKey });
    
    // Ensure we have either a token or session key
    if (!token && !sessionKey) {
      const sessionInitialized = await ensureGuestSession();
      if (!sessionInitialized) {
        console.error('Failed to initialize session for cart fetch');
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize session' });
        return;
      }
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const authAxios = createAuthAxios();
      console.log('Making GET request to:', `${API_BASE_URL}/api/shop/platform-ingredients-cart/`);
      const response = await authAxios.get(`${API_BASE_URL}/api/shop/platform-ingredients-cart/`);
      console.log('Cart fetch response:', response.data);
      
      dispatch({ 
        type: 'SET_CART', 
        payload: { 
          items: response.data.items || [], 
          total_price: response.data.total_price || 0,
          total_items: response.data.total_items || 0
        } 
      });
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        // User not authenticated, try to reinitialize guest session
        if (!token) {
          console.log('401 error, attempting to reinitialize guest session...');
          try {
            await initializeGuestSession();
            // Retry fetching cart after reinitializing
            setTimeout(() => fetchCart(), 100);
            return;
          } catch (sessionError) {
            console.error('Failed to reinitialize guest session:', sessionError);
          }
        }
        dispatch({ type: 'SET_CART', payload: { items: [], total_price: 0, total_items: 0 } });
      } else if (error.response?.status === 404) {
        // Cart not found, initialize empty cart
        dispatch({ type: 'SET_CART', payload: { items: [], total_price: 0, total_items: 0 } });
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to fetch cart';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        toast.error('Failed to load cart');
      }
    }
  };

  // Add item to cart
  const addToCart = async (ingredientId: number, quantity: number) => {
    console.log('Adding to cart:', { ingredientId, quantity });
    
    if (!token && !sessionKey) {
      const sessionInitialized = await ensureGuestSession();
      if (!sessionInitialized) {
        toast.error('Failed to initialize session');
        return;
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const authAxios = createAuthAxios();
      console.log('Making POST request to:', `${API_BASE_URL}/api/shop/platform-ingredients-cart/add/`);
      
      const requestData = {
        ingredient_id: ingredientId,
        quantity: quantity,
      };
      console.log('Request data:', requestData);

      const response = await authAxios.post(`${API_BASE_URL}/api/shop/platform-ingredients-cart/add/`, requestData);
      console.log('Add to cart response:', response.data);
      
      dispatch({ type: 'ADD_ITEM', payload: response.data });
      await fetchCart(); // Refresh cart to get updated totals
      toast.success(`Added ${quantity} item(s) to cart`);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to add item to cart';
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: number, quantity: number) => {
    if (!token && !sessionKey) {
      toast.error('Session expired. Please refresh the page.');
      return;
    }
    try {
      const authAxios = createAuthAxios();
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      await authAxios.put(`${API_BASE_URL}/api/shop/platform-ingredients-cart/item/${itemId}/`, {
        quantity: quantity,
      });
      toast.success('Cart updated');
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      
      // Revert local change and fetch fresh data
      await fetchCart();
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Failed to update cart item';
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId: number) => {
    if (!token && !sessionKey) {
      toast.error('Session expired. Please refresh the page.');
      return;
    }
    try {
      const authAxios = createAuthAxios();
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      await authAxios.delete(`${API_BASE_URL}/api/shop/platform-ingredients-cart/item/${itemId}/`);
      toast.success('Item removed from cart');
    } catch (error: any) {
      console.error('Error removing cart item:', error);
      
      // Revert local change and fetch fresh data
      await fetchCart();
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'Failed to remove cart item';
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!token && !sessionKey) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    try {
      const authAxios = createAuthAxios();
      dispatch({ type: 'CLEAR_CART' });
      await authAxios.post(`${API_BASE_URL}/api/shop/platform-ingredients-cart/clear/`);
      toast.success('Cart cleared');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      
      // Revert and fetch fresh data
      await fetchCart();
      
      const errorMessage = error.response?.data?.error || 'Failed to clear cart';
      toast.error(errorMessage);
    }
  };

  // Merge guest cart when user logs in
  const handleUserLogin = async () => {
    if (token && sessionKey) {
      try {
        // Merge guest cart if it exists
        if (mergeGuestCart) {
          await mergeGuestCart();
        }
        
        // Fetch updated cart after merge
        await fetchCart();
      } catch (error) {
        console.error('Error merging guest cart:', error);
        // Still fetch user cart even if merge fails
        await fetchCart();
      }
    }
  };

  // Handle session expiry for guests
  const handleSessionExpiry = () => {
    if (isGuest && sessionExpiry && new Date() > new Date(sessionExpiry)) {
      // Session expired, clear local cart and reinitialize
      dispatch({ type: 'CLEAR_CART' });
      initializeGuestSession();
    }
  };

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    if (token) {
      handleUserLogin();
    } else {
      // Add a small delay to ensure auth context is fully initialized
      const timer = setTimeout(() => {
        fetchCart();
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle guest session changes
  useEffect(() => {
    if (sessionKey && !token) {
      fetchCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey]);

  // Check session expiry periodically for guests
  useEffect(() => {
    if (isGuest) {
      const interval = setInterval(handleSessionExpiry, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isGuest, sessionExpiry]);

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'guest_session') {
        fetchCart();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle window/tab close to potentially clear guest session
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clear if it's a guest session and user is closing all tabs
      // This is optional - you might want to persist guest sessions
      if (isGuest && sessionKey) {
        // You can implement logic here to determine if this is the last tab
        // For now, we'll let the backend handle session cleanup
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGuest, sessionKey]);

  const contextValue: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;