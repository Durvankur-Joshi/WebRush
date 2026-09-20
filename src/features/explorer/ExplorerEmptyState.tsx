import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface ExplorerEmptyStateProps {
  hasQuery: boolean;
  onClearFilters: () => void;
}

export const ExplorerEmptyState: React.FC<ExplorerEmptyStateProps> = ({
  hasQuery,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border bg-surface/40 space-y-4 animate-fadeIn">
      <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-content-dim">
        <SearchX className="w-6 h-6 text-accent-primary" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-bold text-content-main font-heading">
          {hasQuery ? 'NO MATCHING RECEIPTS FOUND' : 'NO RECEIPTS MATCH THIS QUERY'}
        </h3>
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
          {hasQuery
            ? 'We could not find any receipts matching your search keywords within the active filter parameters.'
            : 'Try widening the year range, resetting the category, or removing active filters to inspect records.'}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onClearFilters}
        icon={<RotateCcw className="w-3.5 h-3.5" />}
      >
        Clear All Filters
      </Button>
    </div>
  );
};
