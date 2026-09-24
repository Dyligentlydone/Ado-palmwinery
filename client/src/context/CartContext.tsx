import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Cart } from '../types';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!token) { setCart(null); return; }
    try {
      setIsLoading(true);
      const res = await cartAPI.get();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    const res = await cartAPI.addItem(productId, quantity);
    setCart(res.data);
  };

  const updateItem = async (itemId: string, quantity: number) => {
    const res = await cartAPI.updateItem(itemId, quantity);
    setCart(res.data);
  };

  const removeItem = async (itemId: string) => {
    const res = await cartAPI.removeItem(itemId);
    setCart(res.data);
  };

  const clearCart = async () => {
    await cartAPI.clear();
    setCart(null);
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, itemCount, isLoading, addToCart, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
