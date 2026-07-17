/**
 * API Client for DSM-3D Backend
 * Base URL: http://localhost:5051 (or set VITE_API_BASE env var)
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5051';

export interface Product {
  id: string | number;
  name: string;
  folder: string;
  filename: string;
  link: string;
  viewer: string;
  category: string;
  brand: string;
  licenseType: string;
  price: string;
  description: string;
  tags: string[];
  status: string;
  whatsIncluded?: string[];
  platform?: string;
  validity?: string;
}

export interface ProductsResponse {
  count: number;
  products: Product[];
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface SearchResponse {
  count: number;
  products: Product[];
  suggestions: string[];
}

export interface AISearchResponse {
  intent: string;
  filters: Record<string, string[]>;
  productIds: string[];
  suggestions: string[];
}

export interface AIChatResponse {
  message: string;
  actions: AIAction[];
  suggestions: string[];
  products?: Product[]; // Products found during search
}

export interface AIAction {
  type: 'OPEN_PRODUCT' | 'NAVIGATE' | 'APPLY_FILTERS' | 'SET_SEARCH' | 'SCROLL_TO';
  payload: Record<string, any>;
}

// ── Offline fallback ────────────────────────────────────────────────────────
// When the backend is unreachable (fresh clone, offline demo, static deploy)
// we serve the catalogue bundled with the repo so the UI still works.
import {
  localGetProducts,
  localGetTopProducts,
  localGetProductById,
  localSearchProducts,
  getStaticProducts,
} from './staticCatalogue';

let offlineNotified = false;
function noteOffline(context: string) {
  if (!offlineNotified) {
    offlineNotified = true;
    // eslint-disable-next-line no-console
    console.info(`[DSM] Backend unavailable — serving the bundled catalogue offline (${context}).`);
  }
}

/** Try the live backend; on any failure, fall back to the local catalogue. */
async function withFallback<T>(live: () => Promise<T>, offline: () => T, context: string): Promise<T> {
  try {
    return await live();
  } catch {
    noteOffline(context);
    return offline();
  }
}

// ── API Client Functions ───────────────────────────────────────────────────

export async function getTopProducts(limit = 10): Promise<ProductsResponse> {
  return withFallback(
    async () => {
      const res = await fetch(`${API_BASE}/products/top?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch top products');
      return res.json();
    },
    () => localGetTopProducts(limit),
    'top products',
  );
}

export async function getProducts(params: {
  page?: number;
  limit?: number;
  sort?: string;
  brand?: string[];
  category?: string[];
  licenseType?: string[];
  q?: string;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sort) searchParams.set('sort', params.sort);
  if (params.q) searchParams.set('q', params.q);
  params.brand?.forEach(b => searchParams.append('brand', b));
  params.category?.forEach(c => searchParams.append('category', c));
  params.licenseType?.forEach(l => searchParams.append('licenseType', l));

  return withFallback(
    async () => {
      const res = await fetch(`${API_BASE}/products?${searchParams}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    () => localGetProducts(params),
    'product list',
  );
}

export async function getProductById(id: string | number): Promise<Product> {
  return withFallback(
    async () => {
      const res = await fetch(`${API_BASE}/products/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
      return res.json();
    },
    () => {
      const p = localGetProductById(id);
      if (!p) throw new Error(`Product ${id} not found in catalogue`);
      return p;
    },
    `product ${id}`,
  );
}

export async function searchProducts(query: string): Promise<SearchResponse> {
  return withFallback(
    async () => {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    () => localSearchProducts(query),
    'search',
  );
}

export async function aiSearch(query: string): Promise<AISearchResponse> {
  return withFallback(
    async () => {
      const res = await fetch(`${API_BASE}/ai-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('AI search failed');
      return res.json();
    },
    () => {
      const { products, suggestions } = localSearchProducts(query);
      return {
        intent: 'search',
        filters: {},
        productIds: products.map((p) => String(p.id)),
        suggestions,
      };
    },
    'ai search',
  );
}

export async function aiChat(message: string, context?: Record<string, any>): Promise<AIChatResponse> {
  return withFallback(
    async () => {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context }),
      });
      if (!res.ok) throw new Error('AI chat failed');
      return res.json();
    },
    () => offlineChat(message),
    'ai chat',
  );
}

/**
 * A lightweight offline concierge. It can't reason like the live model, but it
 * matches the message against the bundled catalogue so the chat still surfaces
 * real products (and honestly tells you it's running offline).
 */
function offlineChat(message: string): AIChatResponse {
  const { products, suggestions } = localSearchProducts(message);
  if (products.length) {
    return {
      message: `I'm running in offline demo mode, but here are ${products.length} matching ${products.length === 1 ? 'licence' : 'licences'} from the catalogue. Connect the DSM backend for the full AI concierge.`,
      actions: [
        { type: 'OPEN_PRODUCT', payload: { id: products[0].id } },
      ],
      suggestions: suggestions.length ? suggestions : ['Microsoft Office', 'Windows 11', 'AutoCAD'],
      products,
    };
  }
  return {
    message: "I'm running in offline demo mode. Try searching for a brand like Microsoft, Autodesk or Adobe, or connect the DSM backend for the full AI concierge.",
    actions: [],
    suggestions: ['Microsoft Office', 'Windows Server', 'AutoCAD', 'Kaspersky'],
    products: getStaticProducts().slice(0, 6),
  };
}

export async function productChat(message: string, productId: string | number): Promise<AIChatResponse> {
  const res = await fetch(`${API_BASE}/ai/product-chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, productId }),
  });
  if (!res.ok) throw new Error('Product chat failed');
  return res.json();
}

