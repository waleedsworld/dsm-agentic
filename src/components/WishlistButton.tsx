import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/api';
import { useWishlist, type WishlistItem } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: Product | WishlistItem;
  /**
   * `overlay` — circular glass button intended to float over a product card /
   * model. `inline` — a bordered button that sits in a details CTA row.
   */
  variant?: 'overlay' | 'inline';
  className?: string;
}

/**
 * A self-contained heart toggle that saves/removes a licence from the wishlist
 * and surfaces lightweight toast feedback. Drop it onto any card or detail view
 * — it reads its own saved state from the wishlist context.
 */
export default function WishlistButton({
  product,
  variant = 'overlay',
  className,
}: WishlistButtonProps) {
  const { toggle, has } = useWishlist();
  const saved = has(product.id);

  const handleClick = (e: React.MouseEvent) => {
    // Cards wrap the whole tile in an onClick that opens the product — don't
    // let saving bubble up and open the modal at the same time.
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggle(product);
    if (nowSaved) {
      toast.success('Saved to your list', { description: product.name });
    } else {
      toast('Removed from your list', { description: product.name });
    }
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved list' : 'Save for later'}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
          saved
            ? 'border-crimson/40 bg-crimson/10 text-crimson'
            : 'border-white/[0.1] text-[#FEFEFE] hover:border-crimson/30 hover:text-crimson',
          className,
        )}
      >
        <Heart className={cn('h-4 w-4', saved && 'fill-crimson')} strokeWidth={1.75} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved list' : 'Save for later'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300',
        saved
          ? 'border-crimson/40 bg-crimson/20 text-crimson'
          : 'border-white/[0.12] bg-black/30 text-white/80 hover:border-crimson/40 hover:text-crimson',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-crimson')} strokeWidth={1.75} />
    </button>
  );
}
