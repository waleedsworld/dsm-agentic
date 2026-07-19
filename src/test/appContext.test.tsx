import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { AppProvider, useApp, CartItem } from "@/contexts/AppContext";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

const sampleItem = {
  id: "office-2021",
  name: "Microsoft Office 2021",
  price: "AED 499.00",
  category: "Productivity",
  brand: "Microsoft",
  licenseType: "Retail",
  link: "/models/office-2021.glb",
};

function renderApp() {
  return renderHook(() => useApp(), { wrapper });
}

describe("AppContext cart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("throws when used outside the provider", () => {
    // React logs the thrown render error; silence it so the suite output stays clean.
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useApp())).toThrow(/must be used within AppProvider/);
    spy.mockRestore();
  });

  it("starts with an empty cart", () => {
    const { result } = renderApp();
    expect(result.current.state.cartItems).toEqual([]);
    expect(result.current.cartItemCount).toBe(0);
    expect(result.current.cartTotal).toBe(0);
  });

  it("adds an item and derives the total from the parsed price", () => {
    const { result } = renderApp();
    act(() => result.current.addToCart(sampleItem));

    expect(result.current.state.cartItems).toHaveLength(1);
    const line = result.current.state.cartItems[0];
    expect(line.unitPrice).toBe(499);
    expect(line.quantity).toBe(1);
    expect(line.glbSrc).toBe("/models/office-2021.glb");
    expect(result.current.cartItemCount).toBe(1);
    expect(result.current.cartTotal).toBe(499);
  });

  it("increments quantity instead of duplicating the same product", () => {
    const { result } = renderApp();
    act(() => result.current.addToCart(sampleItem));
    act(() => result.current.addToCart(sampleItem));

    expect(result.current.state.cartItems).toHaveLength(1);
    expect(result.current.state.cartItems[0].quantity).toBe(2);
    expect(result.current.cartItemCount).toBe(2);
    expect(result.current.cartTotal).toBe(998);
  });

  it("matches items across string and numeric ids", () => {
    const { result } = renderApp();
    act(() => result.current.addToCart({ ...sampleItem, id: 7 }));
    act(() => result.current.addToCart({ ...sampleItem, id: "7" }));

    expect(result.current.state.cartItems).toHaveLength(1);
    expect(result.current.state.cartItems[0].quantity).toBe(2);
  });

  it("parses prices that contain thousands separators", () => {
    const { result } = renderApp();
    act(() =>
      result.current.addToCart({ ...sampleItem, id: "server", price: "AED 1,299.50" }),
    );
    expect(result.current.state.cartItems[0].unitPrice).toBe(1299.5);
    expect(result.current.cartTotal).toBe(1299.5);
  });

  it("falls back to a deterministic model path when none is supplied", () => {
    const { result } = renderApp();
    act(() =>
      result.current.addToCart({ id: "no-model", name: "Mystery", price: "AED 10.00" }),
    );
    expect(result.current.state.cartItems[0].glbSrc).toBe("/models/no-model.glb");
  });

  it("updates quantity but never drops below one", () => {
    const { result } = renderApp();
    act(() => result.current.addToCart(sampleItem));
    act(() => result.current.updateCartQuantity(sampleItem.id, 5));
    expect(result.current.state.cartItems[0].quantity).toBe(5);
    expect(result.current.cartTotal).toBe(2495);

    act(() => result.current.updateCartQuantity(sampleItem.id, 0));
    expect(result.current.state.cartItems[0].quantity).toBe(1);

    act(() => result.current.updateCartQuantity(sampleItem.id, -3));
    expect(result.current.state.cartItems[0].quantity).toBe(1);
  });

  it("removes a single item without touching the rest", () => {
    const { result } = renderApp();
    act(() => result.current.addToCart(sampleItem));
    act(() => result.current.addToCart({ ...sampleItem, id: "windows-11", name: "Windows 11" }));
    act(() => result.current.removeFromCart(sampleItem.id));

    expect(result.current.state.cartItems).toHaveLength(1);
    expect(result.current.state.cartItems[0].id).toBe("windows-11");
  });

  it("clears the entire cart", () => {
    const { result } = renderApp();
    act(() => result.current.addToCart(sampleItem));
    act(() => result.current.addToCart({ ...sampleItem, id: "windows-11" }));
    act(() => result.current.clearCart());
    expect(result.current.state.cartItems).toEqual([]);
    expect(result.current.cartItemCount).toBe(0);
  });

  it("persists the cart to localStorage and rehydrates it on remount", () => {
    const first = renderApp();
    act(() => first.result.current.addToCart(sampleItem));
    act(() => first.result.current.updateCartQuantity(sampleItem.id, 3));

    const stored = JSON.parse(localStorage.getItem("dsm-cart") || "[]") as CartItem[];
    expect(stored).toHaveLength(1);
    expect(stored[0].quantity).toBe(3);

    const second = renderApp();
    expect(second.result.current.state.cartItems).toHaveLength(1);
    expect(second.result.current.cartItemCount).toBe(3);
    expect(second.result.current.cartTotal).toBe(1497);
  });
});

describe("AppContext preferences", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to dark theme + marketing mode and persists changes", () => {
    const { result } = renderApp();
    expect(result.current.state.theme).toBe("dark");
    expect(result.current.state.marketingMode).toBe(true);

    act(() => result.current.setTheme("light"));
    act(() => result.current.setMarketingMode(false));

    const prefs = JSON.parse(localStorage.getItem("dsm-preferences") || "{}");
    expect(prefs.theme).toBe("light");
    expect(prefs.marketingMode).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("updates search query and filters through the AI action dispatcher", () => {
    const { result } = renderApp();
    act(() => result.current.applyAIAction({ type: "SET_SEARCH", payload: { query: "office" } }));
    expect(result.current.state.searchQuery).toBe("office");

    act(() =>
      result.current.applyAIAction({ type: "APPLY_FILTERS", payload: { brand: ["Adobe"] } }),
    );
    expect(result.current.state.filters.brand).toEqual(["Adobe"]);
  });
});
