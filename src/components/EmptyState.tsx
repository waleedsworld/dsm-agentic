import { PackageOpen, SearchX } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  variant?: 'search' | 'default';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Premium empty state — a soft crimson-lit halo behind a lucide glyph,
 * an editorial headline and a single clear action. Used when a filter or
 * search returns nothing so the grid never reads as "broken".
 */
export default function EmptyState({
  variant = 'default',
  title = 'Nothing on the shelf',
  description = 'We could not find any licences matching your selection. Try loosening a filter or two.',
  actionLabel = 'Clear filters',
  onAction,
}: EmptyStateProps) {
  const Icon = variant === 'search' ? SearchX : PackageOpen;

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 animate-empty-in">
      <div className="relative mb-7">
        {/* ambient crimson halo */}
        <div className="absolute inset-0 -m-6 rounded-full bg-crimson/20 blur-2xl animate-empty-glow" />
        <div className="relative w-20 h-20 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
          <Icon className="w-8 h-8 text-crimson" strokeWidth={1.25} />
        </div>
      </div>
      <h3 className="font-serif text-2xl text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">{description}</p>
      {onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          className="btn-magnetic border-white/[0.1] text-foreground hover:border-crimson/40 hover:text-crimson"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
