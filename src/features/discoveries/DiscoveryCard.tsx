import React from 'react';
import { DiscoveryViewModel } from './discoveryTypes';
import { DiscoveryMiniChart } from './DiscoveryMiniChart';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FileText, ArrowRight, CheckCircle2, Headphones, Wallet, CreditCard, Sparkles } from 'lucide-react';

export interface DiscoveryCardProps {
  discovery: DiscoveryViewModel;
  onShowEvidence: (discovery: DiscoveryViewModel) => void;
  onExploreReceipts: (discovery: DiscoveryViewModel) => void;
  isFeatured?: boolean;
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  discovery,
  onShowEvidence,
  onExploreReceipts,
  isFeatured = false,
}) => {
  const getSourceBadge = () => {
    switch (discovery.source) {
      case 'spotify':
        return (
          <Badge variant="primary" size="sm" icon={<Headphones className="w-3 h-3" />}>
            Music Stream
          </Badge>
        );
      case 'household':
        return (
          <Badge variant="success" size="sm" icon={<Wallet className="w-3 h-3" />}>
            Household Ledger
          </Badge>
        );
      case 'transactions':
        return (
          <Badge variant="warning" size="sm" icon={<CreditCard className="w-3 h-3" />}>
            Card Commerce
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm" icon={<Sparkles className="w-3 h-3" />}>
            Cross-Temporal
          </Badge>
        );
    }
  };

  const getSignificanceBadge = () => {
    if (discovery.significance === 'critical') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-pink-500/10 text-pink-400 border border-pink-500/30">
          Critical Shift
        </span>
      );
    }
    if (discovery.significance === 'high') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-accent-primary-dim text-accent-primary border border-accent-primary/30">
          High Impact
        </span>
      );
    }
    return null;
  };

  return (
    <article
      aria-label={`Discovery: ${discovery.title}`}
      className={`rounded-xl border transition-all flex flex-col justify-between ${
        isFeatured
          ? 'p-6 sm:p-8 bg-surface-elevated/70 border-accent-primary/60 shadow-xl shadow-accent-primary/5 hover:border-accent-primary'
          : 'p-5 sm:p-6 bg-surface/50 border-border/70 hover:border-border hover:bg-surface/80'
      } space-y-5 group`}
    >
      {/* Top Meta Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-accent-primary">
              {discovery.categoryLabel}
            </span>
            {getSignificanceBadge()}
          </div>

          <div className="flex items-center gap-2">
            {getSourceBadge()}
            <span className="font-mono text-[10px] text-accent-emerald flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {Math.round(discovery.confidence * 100)}% Conf
            </span>
          </div>
        </div>

        {/* Title and Narrative */}
        <div className="space-y-2">
          <h3
            className={`font-bold text-content-main leading-snug group-hover:text-accent-primary transition-colors ${
              isFeatured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
            }`}
          >
            {discovery.title}
          </h3>
          <p className="text-xs sm:text-sm font-mono text-accent-primary">
            {discovery.subtitle}
          </p>
          <p className="text-xs text-content-muted leading-relaxed line-clamp-3">
            {discovery.description}
          </p>
        </div>
      </div>

      {/* Mini Visual Evidence Telemetry */}
      {discovery.miniChart && (
        <div className="pt-1">
          <DiscoveryMiniChart config={discovery.miniChart} />
        </div>
      )}

      {/* Bottom Footer & Action Triggers */}
      <div className="pt-3 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <span className="text-content-dim">
          Observational Epoch: <strong className="text-content-main">{discovery.period}</strong>
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowEvidence(discovery)}
            icon={<FileText className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Show Evidence
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onExploreReceipts(discovery)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            className="text-xs font-mono"
          >
            Explore Receipts
          </Button>
        </div>
      </div>
    </article>
  );
};
