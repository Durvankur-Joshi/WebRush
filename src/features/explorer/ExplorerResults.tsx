import React from 'react';
import { ExplorerReceipt } from './explorerTypes';
import { ExplorerResultCard } from './ExplorerResultCard';
import { ExplorerEmptyState } from './ExplorerEmptyState';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface ExplorerResultsProps {
  receipts: ExplorerReceipt[];
  isLoading: boolean;
  selectedReceipt: ExplorerReceipt | null;
  onSelectReceipt: (receipt: ExplorerReceipt) => void;
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onClearFilters: () => void;
  hasQuery: boolean;
}

export const ExplorerResults: React.FC<ExplorerResultsProps> = ({
  receipts,
  isLoading,
  selectedReceipt,
  onSelectReceipt,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
  hasQuery,
}) => {
  // Skeleton Loading Cards
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading receipts">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-surface/40 border border-border animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-surface-elevated rounded w-32" />
                <div className="h-4 bg-surface-elevated rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-surface-elevated rounded w-3/4" />
                <div className="h-3 bg-surface-elevated rounded w-1/2" />
              </div>
              <div className="pt-2 border-t border-border-subtle flex justify-between">
                <div className="h-3 bg-surface-elevated rounded w-20" />
                <div className="h-3 bg-surface-elevated rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (receipts.length === 0) {
    return <ExplorerEmptyState hasQuery={hasQuery} onClearFilters={onClearFilters} />;
  }

  // Compute visible page buttons
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* 1. Results Card Stream */}
      <div className="space-y-3" role="feed" aria-label="Receipt artifacts feed">
        {receipts.map((receipt) => (
          <ExplorerResultCard
            key={receipt.id}
            receipt={receipt}
            isSelected={selectedReceipt?.id === receipt.id}
            onSelect={onSelectReceipt}
          />
        ))}
      </div>

      {/* 2. Pagination & Page Size Toolbar */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-content-dim">
            <span>Show per page:</span>
            <div className="flex items-center gap-1">
              {[25, 50].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onPageSizeChange(size)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    pageSize === size
                      ? 'bg-accent-primary text-background font-bold'
                      : 'bg-surface hover:bg-surface-elevated text-content-muted border border-border'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Page Navigation Buttons */}
          <div className="flex items-center gap-1 justify-center">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
              aria-label="First page"
              className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-content-muted hover:text-content-main border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Previous page"
              className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-content-muted hover:text-content-main border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-1">
              {getPageNumbers().map((p, idx) =>
                p === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-content-dim">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPageChange(p as number)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`min-w-[28px] h-7 px-2 rounded text-xs font-mono transition-colors ${
                      p === page
                        ? 'bg-accent-primary text-background font-bold'
                        : 'bg-surface hover:bg-surface-elevated text-content-muted hover:text-content-main border border-border'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Next page"
              className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-content-muted hover:text-content-main border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
              className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-content-muted hover:text-content-main border border-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
