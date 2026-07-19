import { Heart, ShoppingBag, Trash2, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductModelViewer from '@/components/ProductModelViewer';
import { useWishlist, type WishlistItem } from '@/contexts/WishlistContext';
import { useApp } from '@/contexts/AppContext';

/**
 * Slide-out panel listing every saved licence. Lets a shopper move a saved
 * item straight into the cart, open its detail modal, remove it, or bulk-move
 * everything into the cart. Rendered once at the app root and driven by the
 * wishlist context's open state, so any component can pop it open.
 */
export default function WishlistDrawer() {
  const { items, isOpen, closeWishlist, remove, clear } = useWishlist();
  const { addToCart, openProduct } = useApp();

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
      brand: item.brand,
      licenseType: item.licenseType,
      glbSrc: item.glbSrc,
    });
    toast.success('Added to cart', { description: item.name });
  };

  const handleMoveAll = () => {
    if (items.length === 0) return;
    items.forEach((item) =>
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        brand: item.brand,
        licenseType: item.licenseType,
        glbSrc: item.glbSrc,
      }),
    );
    toast.success(`Moved ${items.length} ${items.length === 1 ? 'item' : 'items'} to cart`);
    clear();
    closeWishlist();
  };

  const handleView = (item: WishlistItem) => {
    closeWishlist();
    openProduct(item.id);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeWishlist()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-surface-card border-theme flex flex-col p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <SheetTitle className="flex items-center gap-2 text-[#FEFEFE] font-serif text-2xl">
            <Heart className="h-5 w-5 text-crimson fill-crimson" />
            Saved Licences
          </SheetTitle>
          <p className="text-xs text-[#B1B2B3]/70 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="w-14 h-14 rounded-full border border-white/[0.08] flex items-center justify-center mb-5">
              <Heart className="w-6 h-6 text-[#B1B2B3]/50" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-xl text-[#FEFEFE] mb-2">Nothing saved yet</h3>
            <p className="text-sm text-[#B1B2B3]/60 mb-6">
              Tap the heart on any licence to keep it here for later.
            </p>
            <Button
              asChild
              variant="outline"
              className="border-white/[0.1] text-[#FEFEFE]"
              onClick={closeWishlist}
            >
              <Link to="/store">
                Browse the store
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <ul className="px-4 py-4 space-y-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="group flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-crimson/30 transition-colors"
                  >
                    <button
                      onClick={() => handleView(item)}
                      className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-secondary"
                      aria-label={`View ${item.name}`}
                    >
                      {item.glbSrc ? (
                        <ProductModelViewer
                          glbSrc={item.glbSrc}
                          fallbackIcon={
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg font-serif text-[#FEFEFE]/30">
                                {item.name.charAt(0)}
                              </span>
                            </div>
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-lg font-serif text-[#FEFEFE]/30">
                            {item.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleView(item)}
                        className="block text-left w-full"
                      >
                        <h4 className="text-sm font-medium text-[#FEFEFE] truncate hover:text-crimson transition-colors">
                          {item.name}
                        </h4>
                      </button>
                      <p className="text-[11px] text-[#B1B2B3]/60 truncate">
                        {item.brand}
                        {item.licenseType ? ` · ${item.licenseType}` : ''}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-serif text-sm text-[#FEFEFE]">{item.price}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center gap-1 px-2 py-1 rounded-sm bg-crimson/10 text-crimson text-[11px] font-medium hover:bg-crimson/20 transition-colors"
                            aria-label={`Add ${item.name} to cart`}
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Add
                          </button>
                          <button
                            onClick={() => remove(item.id)}
                            className="p-1 rounded-sm text-[#B1B2B3]/50 hover:text-crimson hover:bg-white/[0.04] transition-colors"
                            aria-label={`Remove ${item.name} from saved list`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="border-t border-white/[0.06] p-4 space-y-2">
              <Button
                onClick={handleMoveAll}
                className="w-full bg-crimson hover:bg-crimson-dark text-[#FEFEFE]"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Move all to cart
              </Button>
              <button
                onClick={() => {
                  clear();
                  toast('Saved list cleared');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[#B1B2B3]/60 hover:text-crimson transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear saved list
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
