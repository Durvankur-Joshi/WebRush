import React from 'react';
import { ExplorerSummaryMetrics, SortOption, StreamId } from './explorerTypes';
import { ArrowUpDown, Database } from 'lucide-react';

export interface ExplorerSummaryProps {
  summary: ExplorerSummaryMetrics;
  startIndex: number;
  endIndex: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  stream: StreamId;
}

export const ExplorerSummary: React.FC<ExplorerSummaryProps> = ({
  summary,
  startIndex,
  endIndex,
  sortBy,
  onSortChange,
  stream,
}) => {
  const getSortOptions = (): { value: SortOption; label: string }[] => {
    switch (stream) {
      case 'spotify':
        return [
          { value: 'recent', label: 'Most Recent Stream' },
          { value: 'oldest', label: 'Oldest Stream' },
          { value: 'magnitude', label: 'Longest Played Duration' },
        ];
      case 'household':
        return [
          { value: 'recent', label: 'Most Recent Date' },
          { value: 'oldest', label: 'Oldest Date' },
          { value: 'magnitude', label: 'Highest Amount (₹)' },
        ];
      case 'transactions':
        return [
          { value: 'recent', label: 'Most Recent Transaction' },
          { value: 'oldest', label: 'Oldest Transaction' },
          { value: 'magnitude', label: 'Highest Ticket Size (₹)' },
        ];
      default:
        return [
          { value: 'recent', label: 'Most Recent' },
          { value: 'oldest', label: 'Oldest' },
        ];
    }
  };

  return (
    <div className="space-y-3 pt-2">
      {/* 1. Contextual Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-surface border border-border/70 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-content-dim">
            {summary.metric1.label}
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-content-main">
            {summary.metric1.value}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-surface border border-border/70 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-content-dim">
            {summary.metric2.label}
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-accent-primary">
            {summary.metric2.value}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-surface border border-border/70 flex flex-col justify-between">
          <span className="text-[10px] font-mono uppercase text-content-dim">
            {summary.metric3.label}
          </span>
          <span className="text-base sm:text-lg font-bold font-mono text-accent-emerald truncate" title={summary.metric3.value}>
            {summary.metric3.value}
          </span>
        </div>

        {summary.metric4 && (
          <div className="p-3 rounded-lg bg-surface border border-border/70 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-content-dim">
              {summary.metric4.label}
            </span>
            <span className="text-base sm:text-lg font-bold font-mono text-accent-secondary">
              {summary.metric4.value}
            </span>
          </div>
        )}
      </div>

      {/* 2. Count & Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border-subtle text-xs font-mono">
        <div className="flex items-center gap-2 text-content-muted">
          <Database className="w-3.5 h-3.5 text-accent-primary" />
          <span>
            {summary.totalMatching > 0 ? (
              <>
                Showing <strong className="text-content-main">{startIndex}–{endIndex}</strong> of{' '}
                <strong className="text-content-main">{summary.totalMatching.toLocaleString()}</strong> matching receipts
              </>
            ) : (
              '0 matching receipts'
            )}
          </span>
        </div>

        {summary.totalMatching > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-content-dim flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label="Sort receipts"
              className="bg-surface-elevated border border-border rounded px-2 py-1 text-xs text-content-main focus:outline-none focus:border-accent-primary font-mono cursor-pointer"
            >
              {getSortOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
