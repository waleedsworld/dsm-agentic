import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import ProductModalWrapper from "./components/ProductModalWrapper";
import GlobalAIChat from "./components/GlobalAIChat";
import SettingsPanel from "./components/SettingsPanel";
import WishlistDrawer from "./components/WishlistDrawer";
import CommandPalette from "./components/CommandPalette";

// Route-level code splitting: only the landing page (Index) ships in the
// initial bundle. Storefront/Cart/Checkout/Marketing — and their heavier
// dependencies — load on demand when the user actually navigates there.
const Storefront = lazy(() => import("./pages/Storefront"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-screen flex items-center justify-center bg-background"
  >
    <span className="sr-only">Loading page…</span>
    <div className="w-8 h-8 border-2 border-border border-t-crimson rounded-full animate-spin motion-reduce:animate-none" />
  </div>
);

const queryClient = new QueryClient();

const AppContent = () => {
  const { state, setNavigate } = useApp();
  const navigate = useNavigate();
  
  // Set navigate function in AppContext so AI actions can use it
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  // When marketing mode is disabled, show only the chatbot
  if (!state.marketingMode) {
    return (
      <div className="fixed inset-0 bg-background">
        <GlobalAIChat />
        <SettingsPanel />
      </div>
    );
  }

  // Normal marketing mode - show full website
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/store" element={<Storefront />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ProductModalWrapper />
      <GlobalAIChat />
      <SettingsPanel />
      <WishlistDrawer />
      <CommandPalette />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
