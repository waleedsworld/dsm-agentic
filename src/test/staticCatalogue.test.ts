import { describe, it, expect } from "vitest";
import {
  getStaticProducts,
  localGetProducts,
  localGetTopProducts,
  localGetProductById,
  localSearchProducts,
} from "@/lib/staticCatalogue";

describe("static catalogue fallback", () => {
  it("normalises every catalogue entry into a full Product", () => {
    const products = getStaticProducts();
    expect(products.length).toBeGreaterThan(100);
    for (const p of products.slice(0, 25)) {
      expect(p.name).toBeTruthy();
      expect(p.brand).toBeTruthy();
      expect(p.category).toBeTruthy();
      expect(p.licenseType).toBeTruthy();
      expect(p.description).toContain(p.brand);
    }
  });

  it("maps each product onto a bundled 3D model", () => {
    const withModels = getStaticProducts().filter((p) => p.link.startsWith("/models/"));
    expect(withModels.length).toBe(getStaticProducts().length);
  });

  it("paginates and never overflows the requested page size", () => {
    const page1 = localGetProducts({ page: 1, limit: 20 });
    expect(page1.products.length).toBeLessThanOrEqual(20);
    expect(page1.totalPages).toBeGreaterThanOrEqual(1);
    expect(page1.count).toBe(getStaticProducts().length);

    const page2 = localGetProducts({ page: 2, limit: 20 });
    const overlap = page1.products.some((a) => page2.products.some((b) => a.id === b.id));
    expect(overlap).toBe(false);
  });

  it("filters by brand", () => {
    const res = localGetProducts({ brand: ["Microsoft"], limit: 500 });
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.products.every((p) => p.brand === "Microsoft")).toBe(true);
  });

  it("sorts by price ascending and descending", () => {
    const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
    const low = localGetProducts({ sort: "price-low", limit: 500 }).products.map((p) => num(p.price));
    const high = localGetProducts({ sort: "price-high", limit: 500 }).products.map((p) => num(p.price));
    expect([...low].sort((a, b) => a - b)).toEqual(low);
    expect([...high].sort((a, b) => b - a)).toEqual(high);
  });

  it("returns a bounded set of top products", () => {
    expect(localGetTopProducts(10).products.length).toBe(10);
  });

  it("looks products up by id", () => {
    const first = getStaticProducts()[0];
    expect(localGetProductById(first.id)?.name).toBe(first.name);
    expect(localGetProductById("does-not-exist")).toBeUndefined();
  });

  it("searches by name, brand and category", () => {
    const res = localSearchProducts("windows");
    expect(res.products.length).toBeGreaterThan(0);
    expect(
      res.products.every((p) =>
        `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes("windows"),
      ),
    ).toBe(true);
    expect(localSearchProducts("").products.length).toBe(0);
  });
});
