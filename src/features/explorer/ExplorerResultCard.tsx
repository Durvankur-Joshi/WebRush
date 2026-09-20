import React from 'react';
import { ExplorerReceipt } from './explorerTypes';
import { Headphones, Wallet, CreditCard, Clock, Calendar, Sparkles, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export interface ExplorerResultCardProps {
  receipt: ExplorerReceipt;
  isSelected: boolean;
  onSelect: (receipt: ExplorerReceipt) => void;
}

export const ExplorerResultCard: React.FC<ExplorerResultCardProps> = ({
  receipt,
  isSelected,
  onSelect,
}) => {
  const getStreamIcon = () => {
    switch (receipt.stream) {
      case 'spotify':
        return <Headphones className="w-3.5 h-3.5 text-accent-primary" />;
      case 'household':
        return <Wallet className="w-3.5 h-3.5 text-accent-emerald" />;
      case 'transactions':
        return <CreditCard className="w-3.5 h-3.5 text-accent-secondary" />;
      default:
        return null;
    }
  };

  const getBadgeVariant = () => {
    if (receipt.statusBadge === 'Skipped') return 'warning';
    if (receipt.statusBadge === 'Completed') return 'success';
    if (receipt.statusBadge === 'EXPENSE') return 'default';
    if (receipt.statusBadge === 'INCOME') return 'success';
    return 'primary';
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(receipt)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(receipt);
        }
      }}
      aria-label={`Receipt: ${receipt.title} - ${receipt.subtitle}`}
      aria-pressed={isSelected}
      className={`p-3.5 sm:p-4 rounded-lg border text-left transition-all cursor-pointer relative group flex flex-col justify-between gap-3 focus:outline-none focus:ring-2 focus:ring-accent-primary ${
        isSelected
          ? 'bg-surface-elevated border-accent-primary shadow-md shadow-accent-primary/10 ring-1 ring-accent-primary'
          : 'bg-surface/60 border-border/70 hover:border-border hover:bg-surface-elevated/60'
      }`}
    >
      {/* Top Meta Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-surface border border-border">
            {getStreamIcon()}
          </span>
          <span className="font-mono text-[10px] uppercase text-content-dim">
            {receipt.stream}
          </span>
          <span className="text-content-dim">•</span>
          <span className="font-mono text-[10px] text-content-dim flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {receipt.date}
          </span>
          {receipt.timeFormatted && receipt.timeFormatted !== 'Logged' && (
            <span className="font-mono text-[10px] text-content-dim flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {receipt.timeFormatted}
            </span>
          )}
        </div>

        {receipt.statusBadge && (
          <Badge variant={getBadgeVariant()} size="sm">
            {receipt.statusBadge}
          </Badge>
        )}
      </div>

      {/* Main Title & Subtitle */}
      <div className="space-y-1">
        <div className="text-sm font-bold text-content-main leading-snug group-hover:text-accent-primary transition-colors line-clamp-1">
          {receipt.title}
        </div>
        <div className="text-xs text-content-muted font-sans line-clamp-1">
          {receipt.subtitle}
        </div>
      </div>

      {/* Bottom Metric & Evidence Match Tag */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2 text-xs font-mono">
        <div>
          {receipt.amountFormatted ? (
            <span
              className={`font-bold ${
                receipt.amountRaw && receipt.amountRaw > 0
                  ? 'text-accent-emerald'
                  : 'text-content-main'
              }`}
            >
              {receipt.amountFormatted}
            </span>
          ) : receipt.durationFormatted ? (
            <span className="text-content-dim">
              Played: <strong className="text-content-main">{receipt.durationFormatted}</strong>
            </span>
          ) : (
            <span className="text-content-dim">{receipt.category}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {receipt.supportedDiscoveries.length > 0 && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-primary bg-accent-primary-dim px-2 py-0.5 rounded border border-accent-primary/20"
              title={receipt.supportedDiscoveries[0].title}
            >
              <Sparkles className="w-3 h-3 text-accent-primary" />
              Supports Discovery
            </span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-content-dim group-hover:text-accent-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
