import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ACCOUNTS, findProduct } from './data';
import { EMAIL_PATTERN } from './validation';

export interface User {
  email: string;
  name: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export type LoginResult = { ok: true } | { ok: false; error: string };

interface StoreValue {
  user: User | null;
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  lastOrderId: string | null;
  login: (email: string, password: string) => LoginResult;
  logout: () => void;
  addToCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  placeOrder: () => string;
}

const StoreContext = createContext<StoreValue | null>(null);

// Session storage keeps state across reloads but isolates each Playwright
// browser context, so tests never leak state into each other.
function load<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: state stays in memory */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => load('shoplite.user', null));
  const [cart, setCart] = useState<CartLine[]>(() => load('shoplite.cart', []));
  const [lastOrderId, setLastOrderId] = useState<string | null>(() => load('shoplite.order', null));

  useEffect(() => save('shoplite.user', user), [user]);
  useEffect(() => save('shoplite.cart', cart), [cart]);
  useEffect(() => save('shoplite.order', lastOrderId), [lastOrderId]);

  const login = useCallback((email: string, password: string): LoginResult => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return { ok: false, error: 'Email is required' };
    if (!EMAIL_PATTERN.test(normalized)) return { ok: false, error: 'Enter a valid email address' };
    if (!password) return { ok: false, error: 'Password is required' };

    const account = ACCOUNTS.find((a) => a.email === normalized);
    if (!account || account.password !== password) return { ok: false, error: 'Invalid email or password' };
    if (account.locked) return { ok: false, error: 'This account has been locked. Please contact support.' };

    setUser({ email: account.email, name: account.name });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
    setLastOrderId(null);
  }, []);

  const addToCart = useCallback((productId: string) => {
    setCart((lines) => {
      const existing = lines.find((l) => l.productId === productId);
      return existing
        ? lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + 1 } : l))
        : [...lines, { productId, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((lines) =>
      quantity <= 0
        ? lines.filter((l) => l.productId !== productId)
        : lines.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, 10) } : l)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((lines) => lines.filter((l) => l.productId !== productId));
  }, []);

  const placeOrder = useCallback(() => {
    const id = `SL-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastOrderId(id);
    setCart([]);
    return id;
  }, []);

  const value = useMemo<StoreValue>(() => {
    const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
    const subtotal = cart.reduce((sum, l) => sum + (findProduct(l.productId)?.price ?? 0) * l.quantity, 0);
    return { user, cart, cartCount, subtotal, lastOrderId, login, logout, addToCart, setQuantity, removeFromCart, placeOrder };
  }, [user, cart, lastOrderId, login, logout, addToCart, setQuantity, removeFromCart, placeOrder]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
