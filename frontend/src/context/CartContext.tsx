import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Cart, CartItem, Product } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  updateItemQuantity: (cartItemId: number, productId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number, productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getProductQuantity: (productId: number) => number;
  isLoading: boolean;
}

const defaultCart: Cart = {
  cartId: 0,
  items: [],
  totalItems: 0,
  subtotal: 0,
  deliveryFee: 0,
  discount: 0,
  totalAmount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [cart, setCart] = useState<Cart>(() => {
    const local = localStorage.getItem('guest_cart');
    return local ? JSON.parse(local) : defaultCart;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const calculateCartTotals = (items: CartItem[]): Cart => {
    let subtotal = 0;
    let totalItems = 0;

    items.forEach((item) => {
      subtotal += item.unitPrice * item.quantity;
      totalItems += item.quantity;
    });

    const deliveryFee = subtotal > 0 ? (subtotal >= 199 ? 0 : 25) : 0;
    const totalAmount = subtotal + deliveryFee;

    return {
      cartId: 0,
      items,
      totalItems,
      subtotal,
      deliveryFee,
      discount: 0,
      totalAmount,
    };
  };

  const fetchServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; data: Cart }>('/cart');
      if (res.data.success && res.data.data) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load server cart', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCart();
    }
  }, [isAuthenticated, fetchServerCart]);

  const addItem = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const res = await api.post<{ success: boolean; data: Cart }>('/cart/items', {
          productId: product.id,
          quantity,
        });
        if (res.data.success && res.data.data) {
          setCart(res.data.data);
        }
      } catch (err) {
        console.error('Failed to add item to cart', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local storage guest cart
      setCart((prev) => {
        const existingIdx = prev.items.findIndex((i) => i.productId === product.id);
        let newItems: CartItem[];

        if (existingIdx > -1) {
          newItems = [...prev.items];
          newItems[existingIdx].quantity += quantity;
          newItems[existingIdx].itemTotal = newItems[existingIdx].quantity * newItems[existingIdx].unitPrice;
        } else {
          const newItem: CartItem = {
            id: Date.now(),
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            brand: product.brand,
            unit: product.unit,
            quantityDescription: product.quantity,
            image: product.image,
            unitPrice: product.price,
            mrp: product.mrp,
            quantity,
            itemTotal: product.price * quantity,
            maxAvailableStock: product.stockQuantity,
          };
          newItems = [...prev.items, newItem];
        }

        const updated = calculateCartTotals(newItems);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateItemQuantity = async (cartItemId: number, productId: number, quantity: number) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const res = await api.put<{ success: boolean; data: Cart }>(`/cart/items/${cartItemId}`, {
          quantity,
        });
        if (res.data.success && res.data.data) {
          setCart(res.data.data);
        }
      } catch (err) {
        console.error('Failed to update cart item', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart((prev) => {
        let newItems: CartItem[];
        if (quantity <= 0) {
          newItems = prev.items.filter((i) => i.productId !== productId);
        } else {
          newItems = prev.items.map((item) => {
            if (item.productId === productId) {
              return {
                ...item,
                quantity,
                itemTotal: quantity * item.unitPrice,
              };
            }
            return item;
          });
        }
        const updated = calculateCartTotals(newItems);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeItem = async (cartItemId: number, productId: number) => {
    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const res = await api.delete<{ success: boolean; data: Cart }>(`/cart/items/${cartItemId}`);
        if (res.data.success && res.data.data) {
          setCart(res.data.data);
        }
      } catch (err) {
        console.error('Failed to remove cart item', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCart((prev) => {
        const newItems = prev.items.filter((i) => i.productId !== productId);
        const updated = calculateCartTotals(newItems);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await api.delete('/cart');
    }
    setCart(defaultCart);
    localStorage.removeItem('guest_cart');
  };

  const getProductQuantity = (productId: number): number => {
    const item = cart.items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        getProductQuantity,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
