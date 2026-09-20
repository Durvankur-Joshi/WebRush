import React from 'react';
import { DiscoveryFilterType, DiscoverySortOption } from './discoveryTypes';
import { Search, X, ArrowUpDown, Headphones, Wallet, CreditCard, Sparkles } from 'lucide-react';

export interface DiscoveryFiltersProps {
  activeFilter: DiscoveryFilterType;
  onSelectFilter: (f: DiscoveryFilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: DiscoverySortOption;
  onSortChange: (s: DiscoverySortOption) => void;
  totalMatching: number;
}

export const DiscoveryFilters: React.FC<DiscoveryFiltersProps> = ({
  activeFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalMatching,
}) => {
  const filterTabs: { id: DiscoveryFilterType; label: string; icon?: React.ReactNode }[] = [
    { id: 'ALL', label: 'All Discoveries' },
    { id: 'spotify', label: 'Music', icon: <Headphones className="w-3 h-3" /> },
    { id: 'household', label: 'Household', icon: <Wallet className="w-3 h-3" /> },
    { id: 'transactions', label: 'Card POS', icon: <CreditCard className="w-3 h-3" /> },
    { id: 'cross-temporal', label: 'Cross-Stream', icon: <Sparkles className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Stream Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 flex-wrap p-1 rounded-lg bg-surface border border-border" role="tablist">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent-primary text-background font-bold shadow-sm'
                    : 'text-content-muted hover:text-content-main hover:bg-surface-elevated'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono self-end md:self-auto">
          <span className="text-content-dim flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Order:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as DiscoverySortOption)}
            aria-label="Sort discoveries"
            className="bg-surface border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-mono cursor-pointer"
          >
            <option value="confidence">Highest Confidence</option>
            <option value="impact">Highest Significance</option>
            <option value="recent">Observational Period</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-content-dim absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter discoveries by title, keyword, period, or pattern type..."
          aria-label="Search discoveries"
          className="w-full bg-surface border border-border/80 rounded-lg pl-10 pr-24 py-2 text-xs text-content-main placeholder:text-content-dim focus:outline-none focus:border-accent-primary font-sans"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear discovery search"
              className="p-1 rounded hover:bg-surface-elevated text-content-dim hover:text-content-main transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[11px] font-mono text-content-dim border-l border-border pl-2">
            {totalMatching} results
          </span>
        </div>
      </div>
    </div>
  );
};
