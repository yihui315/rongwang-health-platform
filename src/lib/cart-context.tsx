'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartState } from '@/types';

interface CartContextType {
  cart: CartState;
  addItem: (slug: string, name: string, price: number) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'rongwang-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isHydrated]);

  const calculateTotals = (items: CartItem[]): { total: number; itemCount: number } => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    return { total, itemCount };
  };

  const addItem = (slug: string, name: string, price: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(item => item.slug === slug);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = prevCart.items.map(item =>
          item.slug === slug ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...prevCart.items, { slug, name, price, quantity: 1 }];
      }

      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    });
  };

  const removeItem = (slug: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.slug !== slug);
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    });
  };

  const updateQuantity = (slug: string, quantity: number) => {
    setCart(prevCart => {
      let newItems: CartItem[];

      if (quantity <= 0) {
        newItems = prevCart.items.filter(item => item.slug !== slug);
      } else {
        newItems = prevCart.items.map(item =>
          item.slug === slug ? { ...item, quantity } : item
        );
      }

      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0, itemCount: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
