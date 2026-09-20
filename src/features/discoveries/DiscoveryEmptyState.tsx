import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface DiscoveryEmptyStateProps {
  onReset: () => void;
}

export const DiscoveryEmptyState: React.FC<DiscoveryEmptyStateProps> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-surface/40 space-y-4 animate-fadeIn">
      <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-content-dim">
        <SearchX className="w-6 h-6 text-accent-primary" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-content-main font-heading">
          NO DISCOVERIES MATCH THIS QUERY
        </h3>
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
          No statistically verified patterns or behavior shifts matched your active search and stream filter.
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        icon={<RotateCcw className="w-3.5 h-3.5" />}
        className="font-mono text-xs"
      >
        Reset Filters
      </Button>
    </div>
  );
};
