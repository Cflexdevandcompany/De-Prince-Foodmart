import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { calculateCartTotals, readCartFromStorage, saveCartToStorage, type CartItem } from '../lib/cart';

const API_BASE = 'http://localhost:4000/api';

type CartContextValue = {
  items: CartItem[];
  cartOpen: boolean;
  validationWarnings: string[];
  itemCount: number;
  subtotal: number;
  total: number;
  hasUnavailableItems: boolean;
  isLoading: boolean;
  setCartOpen: (value: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  validateCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setItems(readCartFromStorage());
  }, []);

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const totals = useMemo(() => calculateCartTotals(items), [items]);

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + quantity, price: item.price || entry.price }
            : entry,
        );
      }
      return [...current, { ...item, quantity }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) => {
      if (quantity <= 0) return current.filter((entry) => entry.productId !== productId);
      return current.map((entry) => (entry.productId === productId ? { ...entry, quantity } : entry));
    });
  };

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((entry) => entry.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const validateCart = async () => {
    if (items.length === 0) {
      setValidationWarnings([]);
      return;
    }

    setIsLoading(true);
    const notices: string[] = [];

    const validated = await Promise.all(
      items.map(async (item) => {
        try {
          const response = await fetch(`${API_BASE}/products/${item.slug}`);
          const json = await response.json();

          if (!json.success || !json.data) {
            notices.push(`${item.name} is no longer available.`);
            return null;
          }

          const currentItem = json.data as {
            price?: number;
            inStock?: boolean;
            name?: string;
          };

          if (currentItem.price != null && Number(currentItem.price) !== item.price) {
            notices.push(`${item.name} price updated from ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(item.price)} to ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(currentItem.price))}.`);
          }

          if (currentItem.inStock === false) {
            notices.push(`${item.name} is currently out of stock.`);
          }

          return {
            ...item,
            name: currentItem.name || item.name,
            price: currentItem.price != null ? Number(currentItem.price) : item.price,
            inStock: currentItem.inStock ?? item.inStock ?? true,
          } satisfies CartItem;
        } catch (_error) {
          notices.push(`${item.name} is unavailable right now.`);
          return null;
        }
      }),
    );

    const filtered = validated.filter(Boolean) as CartItem[];
    setItems(filtered);
    setValidationWarnings(notices);
    setIsLoading(false);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartOpen,
        validationWarnings,
        itemCount: totals.itemCount,
        subtotal: totals.subtotal,
        total: totals.total,
        hasUnavailableItems: totals.hasUnavailable,
        isLoading,
        setCartOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        validateCart,
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
