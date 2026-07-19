interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

/**
 * Premium loading placeholder that mirrors the real ProductCard layout.
 * Uses a moving crimson-tinted shimmer sweep instead of a flat pulse so the
 * store feels alive while the catalogue streams in.
 */
export default function ProductCardSkeleton({ viewMode = 'grid' }: ProductCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-lg">
        <div className="skeleton-shimmer w-32 h-32 flex-shrink-0 rounded-md" />
        <div className="flex-1 flex flex-col justify-center gap-2.5">
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-4 w-16 rounded-sm" />
            <div className="skeleton-shimmer h-4 w-14 rounded-sm" />
          </div>
          <div className="skeleton-shimmer h-4 w-3/5 rounded-sm" />
          <div className="skeleton-shimmer h-3 w-4/5 rounded-sm" />
          <div className="skeleton-shimmer h-3 w-24 rounded-sm mt-1" />
        </div>
        <div className="flex flex-col items-end justify-center gap-2">
          <div className="skeleton-shimmer h-5 w-20 rounded-sm" />
          <div className="skeleton-shimmer h-3 w-14 rounded-sm" />
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group">
      <div className="skeleton-shimmer relative aspect-[3/4] rounded-md overflow-hidden mb-4">
        <div className="absolute top-3 left-3 h-4 w-16 rounded-sm bg-white/[0.05]" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-shimmer h-4 w-4/5 rounded-sm" />
        <div className="skeleton-shimmer h-3 w-3/5 rounded-sm" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton-shimmer h-4 w-16 rounded-sm" />
          <div className="skeleton-shimmer h-4 w-14 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
