/**
 * Static catalogue fallback.
 *
 * The storefront normally talks to the DSM backend (see `api.ts`). When that
 * backend is unreachable — a fresh clone, an offline demo, or the static
 * deploy — we fall back to the catalogue that ships with the repo so the site
 * still renders real products instead of an empty grid.
 *
 * `catalogueProducts.json` only carries the essentials (id, name, category,
 * price). We enrich each entry here into the full `Product` shape the UI
 * expects, deriving the brand, a filter-friendly category bucket, a licence
 * type and a short description, and mapping each product onto one of the 3D
 * models bundled in `public/models/` so the cards stay visually alive offline.
 */

import type {
  Product,
  ProductsResponse,
  SearchResponse,
} from './api';
import rawCatalogue from '@/data/catalogueProducts.json';
import modelIndex from '@/data/modelIndex.json';

interface RawProduct {
  id: number;
  name: string;
  category: string;
  price: string;
  folder?: string;
  oldPrice?: string;
}

const MODELS = modelIndex as string[];

// The brands the storefront filter knows about, longest-match first so
// "SketchUp" wins before a stray "Sketch" ever could.
const KNOWN_BRANDS = [
  'Microsoft',
  'Autodesk',
  'Adobe',
  'Kaspersky',
  'SketchUp',
  'Chaos',
];

function deriveBrand(name: string, category: string): string {
  const hay = `${name} ${category}`.toLowerCase();
  for (const brand of KNOWN_BRANDS) {
    if (hay.includes(brand.toLowerCase())) return brand;
  }
  // A few common families the raw feed labels loosely.
  if (hay.includes('windows') || hay.includes('office') || hay.includes('sql') || hay.includes('exchange') || hay.includes('sharepoint')) {
    return 'Microsoft';
  }
  if (hay.includes('autocad') || hay.includes('revit') || hay.includes('3ds max') || hay.includes('maya')) {
    return 'Autodesk';
  }
  return 'DSM';
}

// Map the raw feed's 34 granular categories onto the five buckets the filter
// sidebar exposes.
function deriveCategory(name: string, category: string): string {
  const hay = `${name} ${category}`.toLowerCase();
  if (hay.includes('office') || hay.includes('word') || hay.includes('excel') || hay.includes('outlook') || hay.includes('visio') || hay.includes('project')) {
    return 'Office';
  }
  if (hay.includes('autocad') || hay.includes('revit') || hay.includes('cad') || hay.includes('3ds') || hay.includes('maya') || hay.includes('inventor') || hay.includes('sketchup') || hay.includes('chaos') || hay.includes('vray')) {
    return 'CAD & Engineering';
  }
  if (hay.includes('adobe') || hay.includes('photoshop') || hay.includes('illustrator') || hay.includes('creative') || hay.includes('design')) {
    return 'Design & Creativity';
  }
  if (hay.includes('windows') || hay.includes('server') || hay.includes('os ')) {
    return 'Operating Systems';
  }
  if (hay.includes('kaspersky') || hay.includes('security') || hay.includes('antivirus') || hay.includes('defender') || hay.includes('cal')) {
    return 'Security & Utility';
  }
  return 'Office';
}

function deriveLicenseType(name: string): string {
  const hay = name.toLowerCase();
  if (hay.includes('subscription') || hay.includes('365') || hay.includes('annual')) return 'Subscription';
  if (hay.includes('mak')) return 'MAK';
  if (hay.includes('cal')) return 'Device CAL';
  return 'Lifetime';
}

function priceToNumber(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function normalize(raw: RawProduct, index: number): Product {
  const brand = deriveBrand(raw.name, raw.category);
  const category = deriveCategory(raw.name, raw.category);
  const licenseType = deriveLicenseType(raw.name);
  const model = MODELS.length ? MODELS[index % MODELS.length] : '';
  return {
    id: raw.id,
    name: raw.name,
    folder: raw.folder ?? '',
    filename: model ? `${model}.glb` : '',
    link: model ? `/models/${model}.glb` : '',
    viewer: '',
    category,
    brand,
    licenseType,
    price: raw.price,
    description: `Genuine ${brand} licence — ${raw.category}. Instant delivery, official activation.`,
    tags: [brand, category, licenseType].filter(Boolean),
    status: 'available',
    platform: brand === 'Microsoft' || brand === 'Autodesk' ? 'Windows' : 'Cross-platform',
    validity: licenseType === 'Subscription' ? '1 year' : 'Perpetual',
  };
}

let cache: Product[] | null = null;

export function getStaticProducts(): Product[] {
  if (!cache) {
    cache = (rawCatalogue as RawProduct[]).map(normalize);
  }
  return cache;
}

function applySort(list: Product[], sort?: string): Product[] {
  const sorted = [...list];
  switch (sort) {
    case 'price-low':
      sorted.sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price));
      break;
    case 'price-high':
      sorted.sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    // 'popular' / default keeps the catalogue's natural order.
  }
  return sorted;
}

export function localGetProducts(params: {
  page?: number;
  limit?: number;
  sort?: string;
  brand?: string[];
  category?: string[];
  licenseType?: string[];
  q?: string;
}): ProductsResponse {
  let list = getStaticProducts();

  if (params.brand?.length) {
    list = list.filter((p) => params.brand!.includes(p.brand));
  }
  if (params.category?.length) {
    list = list.filter((p) => params.category!.includes(p.category));
  }
  if (params.licenseType?.length) {
    list = list.filter((p) => params.licenseType!.includes(p.licenseType));
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }

  list = applySort(list, params.sort);

  const limit = params.limit ?? 20;
  const page = params.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(list.length / limit));
  const start = (page - 1) * limit;
  const products = list.slice(start, start + limit);

  return { count: list.length, products, page, limit, totalPages };
}

export function localGetTopProducts(limit = 10): ProductsResponse {
  const products = getStaticProducts().slice(0, limit);
  return { count: products.length, products, totalPages: 1 };
}

export function localGetProductById(id: string | number): Product | undefined {
  const wanted = String(id);
  return getStaticProducts().find((p) => String(p.id) === wanted);
}

export function localSearchProducts(query: string): SearchResponse {
  const q = query.toLowerCase().trim();
  const products = q
    ? getStaticProducts().filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    : [];
  const suggestions = Array.from(new Set(products.map((p) => p.brand))).slice(0, 5);
  return { count: products.length, products: products.slice(0, 30), suggestions };
}
