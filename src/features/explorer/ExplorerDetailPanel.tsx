import React, { useEffect } from 'react';
import { ExplorerReceipt } from './explorerTypes';
import { X, ShieldCheck, Sparkles, Calendar, Clock, Database } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export interface ExplorerDetailPanelProps {
  receipt: ExplorerReceipt | null;
  onClose: () => void;
}

export const ExplorerDetailPanel: React.FC<ExplorerDetailPanelProps> = ({
  receipt,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!receipt) return null;

  return (
    <div
      role="dialog"
      aria-label="Receipt Details and Evidence"
      aria-modal="true"
      className="p-5 rounded-lg bg-surface border border-accent-primary/40 shadow-xl space-y-6 animate-fadeIn sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto"
    >
      {/* 1. Header with Stream & Close */}
      <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm" className="font-mono uppercase">
              {receipt.stream} STREAM
            </Badge>
            {receipt.statusBadge && (
              <Badge variant="outline" size="sm">
                {receipt.statusBadge}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold text-content-main font-heading leading-snug pt-1">
            {receipt.title}
          </h3>
          <p className="text-xs text-accent-primary font-medium">
            {receipt.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail panel"
          className="p-1.5 rounded-lg text-content-dim hover:text-content-main hover:bg-surface-elevated transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Key Timestamp & Amount/Duration Callout */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-elevated/70 border border-border text-xs font-mono">
        <div>
          <span className="text-content-dim block text-[10px] uppercase">Recorded Timestamp</span>
          <span className="text-content-main font-bold flex items-center gap-1 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-accent-primary" />
            {receipt.date}
          </span>
          {receipt.timeFormatted && receipt.timeFormatted !== 'Logged' && (
            <span className="text-content-muted text-[11px] flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {receipt.timeFormatted} hrs
            </span>
          )}
        </div>

        <div>
          <span className="text-content-dim block text-[10px] uppercase">
            {receipt.amountFormatted ? 'Transaction Magnitude' : 'Playback Duration'}
          </span>
          <span className="text-base font-bold text-content-main block mt-0.5">
            {receipt.amountFormatted || receipt.durationFormatted || 'N/A'}
          </span>
        </div>
      </div>

      {/* 3. Evidence Connection (THIS RECEIPT SUPPORTS) */}
      {receipt.supportedDiscoveries.length > 0 && (
        <div className="p-4 rounded-lg bg-accent-primary-dim/30 border border-accent-primary/50 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-primary" />
            <span className="font-mono text-xs font-bold text-accent-primary uppercase tracking-wider">
              THIS RECEIPT SUPPORTS
            </span>
          </div>

          {receipt.supportedDiscoveries.map((disc, idx) => (
            <div key={idx} className="space-y-1.5 border-l-2 border-accent-primary pl-3">
              <h4 className="text-xs font-bold text-content-main">
                {disc.title}
              </h4>
              <p className="text-xs text-content-muted leading-relaxed">
                {disc.reason}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 4. Granular Sanitized Metadata Attributes */}
      <div className="space-y-2">
        <span className="font-mono text-[11px] text-content-dim uppercase font-semibold flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-accent-primary" />
          Receipt Metadata Record
        </span>

        <div className="rounded-lg border border-border/80 bg-surface/50 divide-y divide-border-subtle text-xs font-mono">
          {receipt.metadata.map((item, idx) => (
            <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
              <span className="text-content-dim">{item.label}</span>
              <span className="text-content-main font-medium text-right truncate max-w-[180px]" title={item.value}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Safe View PII Scrubbing Guarantee */}
      <div className="p-3 rounded-lg bg-accent-emerald-dim/20 border border-accent-emerald/30 text-xs font-mono flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-[11px]">
          <span className="font-bold text-accent-emerald uppercase block">PII Sanitize Verification</span>
          <p className="text-content-muted leading-tight font-sans">
            Personal names, account keys, street addresses, and customer identifiers were scrubbed before entering memory.
          </p>
        </div>
      </div>
    </div>
  );
};
