import React from 'react';
import { StreamId } from './explorerTypes';
import { LifeAnalytics } from '../../analytics';
import { Headphones, Wallet, CreditCard, Search, X, ShieldCheck, HelpCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export interface ExplorerToolbarProps {
  activeStream: StreamId;
  onSelectStream: (stream: StreamId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  analytics: LifeAnalytics | null;
  totalMatching: number;
}

export const ExplorerToolbar: React.FC<ExplorerToolbarProps> = ({
  activeStream,
  onSelectStream,
  searchQuery,
  onSearchChange,
  analytics,
  totalMatching,
}) => {
  const getSearchPlaceholder = () => {
    switch (activeStream) {
      case 'spotify':
        return 'Search artists, tracks, albums...';
      case 'household':
        return 'Search categories, subcategories, notes...';
      case 'transactions':
        return 'Search categories, states, or merchants...';
      default:
        return 'Search receipts...';
    }
  };

  const streams: {
    id: StreamId;
    name: string;
    icon: React.ReactNode;
    count: string;
    years: string;
    badgeVariant: 'primary' | 'success' | 'warning';
  }[] = [
    {
      id: 'spotify',
      name: 'MUSIC',
      icon: <Headphones className="w-4 h-4" />,
      count: analytics ? `${analytics.spotify.totalRecords.toLocaleString()} plays` : '149,860 plays',
      years: analytics ? `${analytics.spotify.dateRange.start.slice(0, 4)}–${analytics.spotify.dateRange.end.slice(0, 4)}` : '2013–2024',
      badgeVariant: 'primary',
    },
    {
      id: 'household',
      name: 'HOUSEHOLD',
      icon: <Wallet className="w-4 h-4" />,
      count: analytics ? `${analytics.household.totalRecords.toLocaleString()} entries` : '2,461 entries',
      years: analytics ? `${analytics.household.dateRange.start.slice(0, 4)}–${analytics.household.dateRange.end.slice(0, 4)}` : '2015–2018',
      badgeVariant: 'success',
    },
    {
      id: 'transactions',
      name: 'TRANSACTIONS',
      icon: <CreditCard className="w-4 h-4" />,
      count: analytics ? `${analytics.transactions.totalRecords.toLocaleString()} records` : '8,725 records',
      years: analytics ? `${analytics.transactions.dateRange.start.slice(0, 4)}–${analytics.transactions.dateRange.end.slice(0, 4)}` : '2022–2024',
      badgeVariant: 'warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/70 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest text-accent-primary uppercase font-bold">
              RECEIPT DISCOVERY ENGINE // GRANULAR EVIDENCE
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-content-main tracking-tight font-heading">
            EXPLORE YOUR RECEIPTS
          </h1>
          <p className="text-sm sm:text-base text-accent-primary font-medium">
            Move from the big picture to the moments that prove it.
          </p>
          <p className="text-xs sm:text-sm text-content-muted max-w-2xl leading-relaxed">
            Search across the available life streams, narrow the time window, and inspect the evidence behind each pattern.
          </p>
        </div>

        {/* PII Sanitized / Safe View Trust Indicator */}
        <div className="shrink-0 flex items-center">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/80 border border-border text-xs font-mono text-content-muted hover:border-accent-emerald/40 transition-colors group relative cursor-help"
            title="Sensitive identity fields are excluded from the Explorer view."
          >
            <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
            <span className="font-semibold text-accent-emerald">SAFE VIEW</span>
            <span className="text-[11px] text-content-dim hidden sm:inline">| PII Sanitized</span>
            <HelpCircle className="w-3.5 h-3.5 text-content-dim group-hover:text-content-muted transition-colors" />

            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 w-64 p-2.5 rounded-lg bg-surface border border-border shadow-xl text-[11px] text-content-muted normal-case font-sans z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
              <strong className="text-content-main block mb-1">PII Redaction Guarantee</strong>
              Account numbers, customer IDs, full names, street addresses, and dates of birth are strictly stripped before reaching application memory.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stream Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Receipt Life Streams">
        {streams.map((s) => {
          const isActive = activeStream === s.id;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectStream(s.id)}
              className={`p-3.5 sm:p-4 rounded-lg border text-left transition-all relative flex flex-col justify-between gap-3 ${
                isActive
                  ? 'bg-surface-elevated border-accent-primary shadow-lg shadow-accent-primary/10 ring-1 ring-accent-primary/30'
                  : 'bg-surface/50 border-border/70 hover:border-border hover:bg-surface-elevated/50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded ${isActive ? 'bg-accent-primary-dim text-accent-primary' : 'bg-surface text-content-dim'}`}>
                    {s.icon}
                  </span>
                  <span className="font-mono text-xs font-bold text-content-main tracking-wider">
                    {s.name}
                  </span>
                </div>
                <Badge variant={isActive ? s.badgeVariant : 'default'} size="sm">
                  {s.years}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between w-full pt-1 border-t border-border-subtle">
                <span className="font-mono text-xs font-semibold text-content-main">
                  {s.count}
                </span>
                {isActive && (
                  <span className="text-[10px] font-mono text-accent-primary font-semibold flex items-center gap-1">
                    ACTIVE STREAM
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Global Search Input Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-content-dim absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getSearchPlaceholder()}
            aria-label="Search receipts in active stream"
            className="w-full bg-surface border border-border/80 rounded-lg pl-10 pr-24 py-2.5 text-sm text-content-main placeholder:text-content-dim focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all font-sans"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search input"
                className="p-1 rounded hover:bg-surface-elevated text-content-dim hover:text-content-main transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-[11px] font-mono text-content-dim border-l border-border pl-2">
              {totalMatching.toLocaleString()} found
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
