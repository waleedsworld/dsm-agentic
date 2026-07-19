import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Home,
  Store,
  ShoppingBag,
  CreditCard,
  Sun,
  Moon,
  Trash2,
  Box,
  Command as CommandIcon,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { getProducts, type Product } from "@/lib/api";

/**
 * CommandPalette — a global ⌘K / Ctrl+K quick launcher.
 *
 * A keyboard-first way to move around the storefront: jump to any page,
 * search the whole catalogue and open a product instantly, flip the theme,
 * or empty the cart — all without touching the mouse. Self-contained: it
 * reuses the existing cmdk `command` UI primitives and the AppContext, and is
 * mounted once from App. Opens on ⌘K / Ctrl+K, "/" (outside inputs), or a
 * `dsm:open-command-palette` window event.
 */
const CommandPalette = () => {
  const navigate = useNavigate();
  const {
    state,
    openProduct,
    setTheme,
    clearCart,
    cartItemCount,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const loadedRef = useRef(false);

  // Global keyboard + custom-event triggers.
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        node.isContentEditable === true
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      // "/" opens it too, but never while typing in a field.
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !isEditable(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    const onOpenEvent = () => setOpen(true);

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("dsm:open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("dsm:open-command-palette", onOpenEvent);
    };
  }, []);

  // Lazily load the catalogue the first time the palette is opened.
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;
    getProducts({ limit: 60, sort: "popular" })
      .then((res) => {
        if (!cancelled) setProducts(res.products ?? []);
      })
      .catch(() => {
        loadedRef.current = false; // allow a retry next open
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const productItems = useMemo(() => products.slice(0, 40), [products]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search products or type a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Go to">
          <CommandItem value="home overview" onSelect={() => go("/")}>
            <Home className="mr-2" />
            <span>Home</span>
          </CommandItem>
          <CommandItem value="store catalogue browse products" onSelect={() => go("/store")}>
            <Store className="mr-2" />
            <span>Storefront</span>
          </CommandItem>
          <CommandItem value="cart basket" onSelect={() => go("/cart")}>
            <ShoppingBag className="mr-2" />
            <span>Cart</span>
            {cartItemCount > 0 && (
              <CommandShortcut>{cartItemCount} item{cartItemCount === 1 ? "" : "s"}</CommandShortcut>
            )}
          </CommandItem>
          <CommandItem value="checkout pay buy" onSelect={() => go("/checkout")}>
            <CreditCard className="mr-2" />
            <span>Checkout</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            value="toggle theme dark light appearance"
            onSelect={() => {
              setTheme(state.theme === "dark" ? "light" : "dark");
            }}
          >
            {state.theme === "dark" ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
            <span>Switch to {state.theme === "dark" ? "light" : "dark"} mode</span>
          </CommandItem>
          {cartItemCount > 0 && (
            <CommandItem
              value="clear empty cart"
              onSelect={() => {
                clearCart();
                setOpen(false);
              }}
            >
              <Trash2 className="mr-2" />
              <span>Empty cart</span>
            </CommandItem>
          )}
        </CommandGroup>

        {productItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Products">
              {productItems.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.brand ?? ""} ${p.category ?? ""}`}
                  onSelect={() => {
                    setOpen(false);
                    openProduct(p);
                  }}
                >
                  <Box className="mr-2 opacity-70" />
                  <span className="truncate">{p.name}</span>
                  {p.price && <CommandShortcut>{p.price}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      <div className="flex items-center justify-end gap-1 border-t px-3 py-2 text-[11px] text-muted-foreground">
        <CommandIcon className="h-3 w-3" />
        <span>K to open anywhere</span>
      </div>
    </CommandDialog>
  );
};

export default CommandPalette;
