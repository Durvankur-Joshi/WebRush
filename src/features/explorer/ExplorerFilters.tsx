import React, { useState } from 'react';
import { ExplorerFilterState, HourRange } from './explorerTypes';
import { Filter, X, RotateCcw, ChevronDown, ChevronUp, Sparkles, Clock, Music, Tag, MapPin, CreditCard, Layers } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export interface FilterOptions {
  years: number[];
  categories: string[];
  subcategories: string[];
  modes: string[];
  states: string[];
}

export interface ExplorerFiltersProps {
  filters: ExplorerFilterState;
  filterOptions: FilterOptions;
  onFilterChange: (patch: Partial<ExplorerFilterState>) => void;
  onResetFilters: () => void;
  onClearDiscoveryDrillDown?: () => void;
  onBackToDiscovery?: () => void;
}

export const ExplorerFilters: React.FC<ExplorerFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onResetFilters,
  onClearDiscoveryDrillDown,
  onBackToDiscovery,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  // Compute active chips
  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];

  if (filters.search.trim()) {
    activeChips.push({
      key: 'search',
      label: `"${filters.search.trim()}"`,
      onRemove: () => onFilterChange({ search: '', page: 1 }),
    });
  }

  if (filters.year !== 'all') {
    activeChips.push({
      key: 'year',
      label: `Year: ${filters.year}`,
      onRemove: () => onFilterChange({ year: 'all', page: 1 }),
    });
  }

  if (filters.category !== 'all') {
    activeChips.push({
      key: 'category',
      label: `Category: ${filters.category}`,
      onRemove: () => onFilterChange({ category: 'all', page: 1 }),
    });
  }

  if (filters.subcategory !== 'all') {
    activeChips.push({
      key: 'subcategory',
      label: `Subcategory: ${filters.subcategory}`,
      onRemove: () => onFilterChange({ subcategory: 'all', page: 1 }),
    });
  }

  if (filters.hourRange !== 'all') {
    const hourLabels: Record<HourRange, string> = {
      all: 'All Hours',
      morning: 'Morning (06:00–12:00)',
      afternoon: 'Afternoon (12:00–18:00)',
      evening: 'Evening (18:00–24:00)',
      night: 'Night (00:00–06:00)',
      evening_night: 'Evening & Night (18:00–06:00)',
    };
    activeChips.push({
      key: 'hourRange',
      label: `Hours: ${hourLabels[filters.hourRange]}`,
      onRemove: () => onFilterChange({ hourRange: 'all', page: 1 }),
    });
  }

  if (filters.stream === 'spotify' && filters.skipped !== 'all') {
    activeChips.push({
      key: 'skipped',
      label: filters.skipped === 'skipped' ? 'Skipped Only' : 'Completed Only',
      onRemove: () => onFilterChange({ skipped: 'all', page: 1 }),
    });
  }

  if (filters.stream === 'household' && filters.direction !== 'all') {
    activeChips.push({
      key: 'direction',
      label: `Direction: ${filters.direction.toUpperCase()}`,
      onRemove: () => onFilterChange({ direction: 'all', page: 1 }),
    });
  }

  if (filters.stream === 'household' && filters.mode !== 'all') {
    activeChips.push({
      key: 'mode',
      label: `Mode: ${filters.mode}`,
      onRemove: () => onFilterChange({ mode: 'all', page: 1 }),
    });
  }

  if (filters.stream === 'transactions' && filters.state !== 'all') {
    activeChips.push({
      key: 'state',
      label: `Region: ${filters.state}`,
      onRemove: () => onFilterChange({ state: 'all', page: 1 }),
    });
  }

  const hasActiveFilters = activeChips.length > 0 || !!filters.discoveryDrillDown;

  return (
    <div className="space-y-4">
      {/* 1. Discovery Drill-Down Context Banner if active */}
      {filters.discoveryDrillDown && (
        <div className="p-4 rounded-lg bg-accent-primary-dim/30 border border-accent-primary/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                EVIDENCE MODE
              </Badge>
              <span className="font-mono text-[10px] text-content-dim uppercase">
                Observed Pattern Drill-Down
              </span>
            </div>
            <div className="text-sm font-bold text-content-main">
              EXPLORING EVIDENCE FOR: <span className="text-accent-primary font-semibold">{filters.discoveryDrillDown.title}</span>
            </div>
            {filters.discoveryDrillDown.filterDescription && (
              <p className="text-xs text-content-muted">
                {filters.discoveryDrillDown.filterDescription}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {onBackToDiscovery && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToDiscovery}
                className="text-xs font-mono"
              >
                Back to Discovery
              </Button>
            )}
            {onClearDiscoveryDrillDown && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearDiscoveryDrillDown}
                icon={<X className="w-3.5 h-3.5" />}
                className="text-xs font-mono"
              >
                Clear Evidence Filter
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. Mobile Filter Toggle Button */}
      <div className="sm:hidden flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
        <button
          type="button"
          onClick={() => setMobileExpanded(!mobileExpanded)}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-content-main"
          aria-expanded={mobileExpanded}
        >
          <Filter className="w-4 h-4 text-accent-primary" />
          <span>RECEIPT FILTERS</span>
          {activeChips.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-accent-primary text-background text-[10px] font-bold">
              {activeChips.length}
            </span>
          )}
          {mobileExpanded ? <ChevronUp className="w-4 h-4 text-content-dim ml-1" /> : <ChevronDown className="w-4 h-4 text-content-dim ml-1" />}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-accent-primary hover:underline font-mono"
          >
            Reset
          </button>
        )}
      </div>

      {/* 3. Adaptive Filter Controls Panel */}
      <div className={`${mobileExpanded ? 'block' : 'hidden'} sm:block p-4 rounded-lg bg-surface/60 border border-border/80 space-y-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent-primary" />
            <span className="font-mono text-xs font-bold text-content-main tracking-wider uppercase">
              Filter Parameters
            </span>
            <span className="font-mono text-[10px] text-content-dim">
              ({filters.stream.toUpperCase()} STREAM)
            </span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              icon={<RotateCcw className="w-3 h-3 text-content-dim" />}
              className="text-xs text-content-dim hover:text-content-main h-7 px-2"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Filter Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Year Filter (Global) */}
          <div>
            <label className="block text-[11px] font-mono text-content-dim uppercase mb-1">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) =>
                onFilterChange({
                  year: e.target.value === 'all' ? 'all' : Number(e.target.value),
                  page: 1,
                })
              }
              aria-label="Filter by Year"
              className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans"
            >
              <option value="all">All Available Years</option>
              {filterOptions.years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* STREAM SPECIFIC: MUSIC */}
          {filters.stream === 'spotify' && (
            <>
              {/* Time of Day */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time of Day
                </label>
                <select
                  value={filters.hourRange}
                  onChange={(e) =>
                    onFilterChange({
                      hourRange: e.target.value as HourRange,
                      page: 1,
                    })
                  }
                  aria-label="Filter by Time of Day"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans"
                >
                  <option value="all">All Hours (00:00–24:00)</option>
                  <option value="morning">Morning (06:00–12:00)</option>
                  <option value="afternoon">Afternoon (12:00–18:00)</option>
                  <option value="evening">Evening (18:00–24:00)</option>
                  <option value="night">Night (00:00–06:00)</option>
                  <option value="evening_night">Evening & Night (18:00–06:00)</option>
                </select>
              </div>

              {/* Skip Status */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1">
                  Playback Completion
                </label>
                <select
                  value={filters.skipped}
                  onChange={(e) =>
                    onFilterChange({
                      skipped: e.target.value as 'all' | 'skipped' | 'completed',
                      page: 1,
                    })
                  }
                  aria-label="Filter by Skip Status"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans"
                >
                  <option value="all">All Playback Events</option>
                  <option value="completed">Completed Streams</option>
                  <option value="skipped">Skipped Before End</option>
                </select>
              </div>

              {/* Top Artist / Category */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <Music className="w-3 h-3" /> Filter by Artist
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    onFilterChange({
                      category: e.target.value,
                      page: 1,
                    })
                  }
                  aria-label="Filter by Artist"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans truncate"
                >
                  <option value="all">All Artists</option>
                  {filterOptions.categories.slice(0, 100).map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* STREAM SPECIFIC: HOUSEHOLD */}
          {filters.stream === 'household' && (
            <>
              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    onFilterChange({
                      category: e.target.value,
                      subcategory: 'all',
                      page: 1,
                    })
                  }
                  aria-label="Filter by Category"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans truncate"
                >
                  <option value="all">All Categories</option>
                  {filterOptions.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Subcategory
                </label>
                <select
                  value={filters.subcategory}
                  onChange={(e) =>
                    onFilterChange({
                      subcategory: e.target.value,
                      page: 1,
                    })
                  }
                  aria-label="Filter by Subcategory"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans truncate"
                >
                  <option value="all">All Subcategories</option>
                  {filterOptions.subcategories.slice(0, 100).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Flow Direction */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1">
                  Flow Direction
                </label>
                <select
                  value={filters.direction}
                  onChange={(e) =>
                    onFilterChange({
                      direction: e.target.value as 'all' | 'income' | 'expense',
                      page: 1,
                    })
                  }
                  aria-label="Filter by Flow Direction"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans"
                >
                  <option value="all">All Flows (Income & Expense)</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Income Only</option>
                </select>
              </div>

              {/* Payment Mode */}
              {filterOptions.modes.length > 0 && (
                <div>
                  <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment Mode
                  </label>
                  <select
                    value={filters.mode}
                    onChange={(e) =>
                      onFilterChange({
                        mode: e.target.value,
                        page: 1,
                      })
                    }
                    aria-label="Filter by Payment Mode"
                    className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans truncate"
                  >
                    <option value="all">All Modes</option>
                    {filterOptions.modes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* STREAM SPECIFIC: TRANSACTIONS */}
          {filters.stream === 'transactions' && (
            <>
              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Category Facet
                </label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    onFilterChange({
                      category: e.target.value,
                      page: 1,
                    })
                  }
                  aria-label="Filter by Category"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans truncate"
                >
                  <option value="all">All Categories</option>
                  {filterOptions.categories.map((c) => (
                    <option key={c} value={c}>
                      {c.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region / State */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Region / State
                </label>
                <select
                  value={filters.state}
                  onChange={(e) =>
                    onFilterChange({
                      state: e.target.value,
                      page: 1,
                    })
                  }
                  aria-label="Filter by Region or State"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans truncate"
                >
                  <option value="all">All States</option>
                  {filterOptions.states.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-[11px] font-mono text-content-dim uppercase mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time of Day
                </label>
                <select
                  value={filters.hourRange}
                  onChange={(e) =>
                    onFilterChange({
                      hourRange: e.target.value as HourRange,
                      page: 1,
                    })
                  }
                  aria-label="Filter by Time of Day"
                  className="w-full bg-surface-elevated border border-border rounded px-2.5 py-1.5 text-xs text-content-main focus:outline-none focus:border-accent-primary font-sans"
                >
                  <option value="all">All Hours</option>
                  <option value="morning">Morning (06:00–12:00)</option>
                  <option value="afternoon">Afternoon (12:00–18:00)</option>
                  <option value="evening">Evening (18:00–24:00)</option>
                  <option value="night">Night (00:00–06:00)</option>
                  <option value="evening_night">Evening & Night (18:00–06:00)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Active Filter Chips Row */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1" aria-label="Active Filters">
          <span className="font-mono text-[10px] uppercase text-content-dim font-bold">
            ACTIVE FILTERS:
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-accent-primary-dim text-accent-primary border border-accent-primary/30">
            {filters.stream.toUpperCase()}
          </span>

          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-surface-elevated hover:bg-surface-muted text-content-main border border-border hover:border-accent-primary/40 transition-colors group"
              title="Click to remove filter"
            >
              <span>{chip.label}</span>
              <X className="w-3 h-3 text-content-dim group-hover:text-accent-primary" />
            </button>
          ))}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-mono text-accent-primary hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
