import React, { useState } from 'react';
import { DiscoveryViewModel } from './discoveryTypes';
import { DiscoveryCard } from './DiscoveryCard';
import { DiscoveryEmptyState } from './DiscoveryEmptyState';
import { Button } from '../../components/ui/Button';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export interface DiscoveryGridProps {
  discoveries: DiscoveryViewModel[];
  onShowEvidence: (discovery: DiscoveryViewModel) => void;
  onExploreReceipts: (discovery: DiscoveryViewModel) => void;
  onResetFilters: () => void;
}

export const DiscoveryGrid: React.FC<DiscoveryGridProps> = ({
  discoveries,
  onShowEvidence,
  onExploreReceipts,
  onResetFilters,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (discoveries.length === 0) {
    return <DiscoveryEmptyState onReset={onResetFilters} />;
  }

  // First top discovery is featured
  const featured = discoveries[0];
  const remaining = discoveries.slice(1);
  const INITIAL_LIMIT = 6;
  const visibleRemaining = showAll ? remaining : remaining.slice(0, INITIAL_LIMIT);

  return (
    <div className="space-y-8">
      {/* 1. Featured Editorial Discovery Banner */}
      {featured && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-content-dim font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
            Lead Algorithmic Finding
          </div>
          <DiscoveryCard
            discovery={featured}
            onShowEvidence={onShowEvidence}
            onExploreReceipts={onExploreReceipts}
            isFeatured={true}
          />
        </div>
      )}

      {/* 2. Remaining Discoveries Grid */}
      {remaining.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-content-dim uppercase tracking-wider font-semibold">
              Verified Discoveries ({discoveries.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleRemaining.map((disc) => (
              <DiscoveryCard
                key={disc.id}
                discovery={disc}
                onShowEvidence={onShowEvidence}
                onExploreReceipts={onExploreReceipts}
              />
            ))}
          </div>

          {/* View All Toggle Button */}
          {remaining.length > INITIAL_LIMIT && (
            <div className="pt-4 flex justify-center">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowAll(!showAll)}
                icon={showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                iconPosition="right"
                className="font-mono text-xs"
              >
                {showAll ? 'Show Fewer Discoveries' : `View All Discoveries (${discoveries.length})`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
