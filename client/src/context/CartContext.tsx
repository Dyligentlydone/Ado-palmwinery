import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Cart, CartItem, Product } from '../types';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const GUEST_CART_KEY = 'ado-guest-cart';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Guest cart lives in localStorage as CartItem-shaped rows with synthesized ids
function readGuestItems(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeGuestItems(items: CartItem[]) {
  if (items.length) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  else localStorage.removeItem(GUEST_CART_KEY);
}

const guestCart = (items: CartItem[]): Cart => ({ id: 'guest', items } as Cart);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const merged = useRef(false);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart(guestCart(readGuestItems()));
      return;
    }
    try {
      setIsLoading(true);
      // Merge any guest cart items into the account cart once
      if (!merged.current) {
        const pending = readGuestItems();
        if (pending.length) {
          for (const item of pending) {
            try { await cartAPI.addItem(item.productId, item.quantity); } catch { /* skip unavailable */ }
          }
          localStorage.removeItem(GUEST_CART_KEY);
        }
        merged.current = true;
      }
      const res = await cartAPI.get();
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  // Reset merge flag on logout so a new guest session starts fresh
  useEffect(() => {
    if (!token) merged.current = false;
  }, [token]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (token) {
      const res = await cartAPI.addItem(product.id, quantity);
      setCart(res.data);
      return;
    }
    const items = readGuestItems();
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ id: `guest-${product.id}`, productId: product.id, quantity, product } as CartItem);
    }
    writeGuestItems(items);
    setCart(guestCart(items));
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (token) {
      const res = await cartAPI.updateItem(itemId, quantity);
      setCart(res.data);
      return;
    }
    const items = readGuestItems();
    const item = items.find(i => i.id === itemId);
    if (item) item.quantity = Math.max(1, quantity);
    writeGuestItems(items);
    setCart(guestCart(items));
  };

  const removeItem = async (itemId: string) => {
    if (token) {
      const res = await cartAPI.removeItem(itemId);
      setCart(res.data);
      return;
    }
    const items = readGuestItems().filter(i => i.id !== itemId);
    writeGuestItems(items);
    setCart(guestCart(items));
  };

  const clearCart = async () => {
    if (token) await cartAPI.clear();
    localStorage.removeItem(GUEST_CART_KEY);
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
