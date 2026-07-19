import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import type { Product } from '@/lib/api';

/**
 * Wishlist ("Saved Licences") state.
 *
 * A lightweight, self-contained store that mirrors the cart's persistence
 * model: it keeps a list of saved products in `localStorage` so a shopper can
 * bookmark licences across sessions without an account. It intentionally does
 * NOT depend on AppContext so it can be mounted independently and reused by any
 * component (card buttons, product modal, header) without coupling.
 */

export interface WishlistItem {
  id: string | number;
  name: string;
  price: string;
  category?: string;
  brand?: string;
  licenseType?: string;
  description?: string;
  /** GLB model source used to render the mini 3D preview. */
  glbSrc?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  isOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggle: (product: Product | WishlistItem) => boolean;
  add: (product: Product | WishlistItem) => void;
  remove: (id: string | number) => void;
  clear: () => void;
  has: (id: string | number) => boolean;
}

const STORAGE_KEY = 'dsm-wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function toItem(product: Product | WishlistItem): WishlistItem {
  const glbSrc =
    'glbSrc' in product && product.glbSrc
      ? product.glbSrc
      : 'link' in product && (product as Product).link
        ? (product as Product).link
        : undefined;
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    brand: product.brand,
    licenseType: product.licenseType,
    description: product.description,
    glbSrc,
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      /* ignore malformed storage */
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [items]);

  const has = useCallback(
    (id: string | number) => items.some((i) => String(i.id) === String(id)),
    [items],
  );

  const add = useCallback((product: Product | WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => String(i.id) === String(product.id))) return prev;
      return [toItem(product), ...prev];
    });
  }, []);

  const remove = useCallback((id: string | number) => {
    setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  }, []);

  /** Toggle membership. Returns the new state (true = now saved). */
  const toggle = useCallback((product: Product | WishlistItem): boolean => {
    let nowSaved = false;
    setItems((prev) => {
      const exists = prev.some((i) => String(i.id) === String(product.id));
      if (exists) {
        nowSaved = false;
        return prev.filter((i) => String(i.id) !== String(product.id));
      }
      nowSaved = true;
      return [toItem(product), ...prev];
    });
    return nowSaved;
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openWishlist = useCallback(() => setIsOpen(true), []);
  const closeWishlist = useCallback(() => setIsOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        isOpen,
        openWishlist,
        closeWishlist,
        toggle,
        add,
        remove,
        clear,
        has,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
