import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getProducts,
  getProductById,
  getTopProducts,
  searchProducts,
  aiChat,
} from "@/lib/api";
import { getStaticProducts } from "@/lib/staticCatalogue";

/**
 * The API client is designed to degrade gracefully: when the live backend is
 * unreachable it must transparently serve the catalogue bundled with the repo.
 * These tests exercise both the "backend up" and "backend down" branches by
 * stubbing global.fetch.
 */

const realFetch = global.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = realFetch;
});

describe("api fallback (backend unreachable)", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockRejectedValue(new Error("ECONNREFUSED")) as unknown as typeof fetch;
  });

  it("serves the bundled catalogue when the product list request fails", async () => {
    const res = await getProducts({ page: 1, limit: 12 });
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.products.length).toBeLessThanOrEqual(12);
    expect(res.count).toBe(getStaticProducts().length);
  });

  it("falls back for top products", async () => {
    const res = await getTopProducts(6);
    expect(res.products).toHaveLength(6);
  });

  it("falls back for a product lookup by id", async () => {
    const known = getStaticProducts()[0];
    const p = await getProductById(known.id);
    expect(p.name).toBe(known.name);
  });

  it("throws for an unknown id even in offline mode", async () => {
    await expect(getProductById("definitely-not-real")).rejects.toThrow(/not found/i);
  });

  it("returns offline chat results that reference real catalogue products", async () => {
    const res = await aiChat("windows");
    expect(res.message).toMatch(/offline/i);
    expect(Array.isArray(res.products)).toBe(true);
    expect(res.suggestions.length).toBeGreaterThan(0);
  });
});

describe("api live path (backend reachable)", () => {
  it("uses the backend response verbatim when fetch succeeds", async () => {
    const payload = {
      count: 1,
      products: [{ id: "live-1", name: "Live Product" }],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    }) as unknown as typeof fetch;

    const res = await getProducts({ page: 1, limit: 10 });
    expect(res).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledOnce();
  });

  it("falls back when the backend answers with a non-ok status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    const res = await searchProducts("microsoft");
    expect(res.products.length).toBeGreaterThan(0);
  });

  it("encodes the query string when hitting the search endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, products: [], suggestions: [] }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await searchProducts("micro soft & co");
    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toContain("micro%20soft%20%26%20co");
  });
});
