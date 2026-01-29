import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from './products';
import api from './api';
import { toast } from 'sonner';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: (skipServer?: boolean) => Promise<void>;
  fetchCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const getUser = () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (e) {
      return null;
    }
  };

  const fetchCart = useCallback(async () => {
    const user = getUser();
    if (!user) {
      setItems([]);
      return;
    }

    try {
      const { data } = await api.get('/cart');
      if (data && data.cartItems) {
        const mappedItems = data.cartItems.map((item: any) => ({
          product: {
            id: item.product._id,
            name: item.product.name,
            description: item.product.description || '', // might be missing
            price: item.product.price,
            image: item.product.imageUrl,
            category: item.product.category || 'General',
            flavor: item.product.flavor,
            weight: item.product.weight,
            inStock: (item.product.countInStock || 0) > 0,
            featured: false
          },
          quantity: item.quantity
        }));
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch user cart:', error);
      // Don't show toast on every fetch fail, might be just empty or network blip
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    const user = getUser();
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', {
        productId: product.id,
        quantity: quantity
      });
      await fetchCart();
      setIsCartOpen(true);
      toast.success("Added to cart");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  }, [navigate, fetchCart]);

  const removeItem = useCallback(async (productId: string) => {
    const user = getUser();
    if (!user) return; // Should not happen if UI is consistent

    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
      toast.success("Removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const user = getUser();
    if (!user) return;

    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    try {
      await api.put(`/cart/${productId}`, { quantity });
      await fetchCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  }, [removeItem, fetchCart]);

  const clearCart = useCallback(async (skipServer = false) => {
    if (skipServer) {
      setItems([]);
      return;
    }

    // Server clear
    const user = getUser();
    if (user) {
      try {
        await api.delete('/cart');
        setItems([]);
        toast.success("Cart cleared");
      } catch (error) {
        toast.error("Failed to clear cart");
      }
    } else {
      setItems([]);
    }
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        fetchCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
