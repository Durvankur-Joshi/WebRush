import React, { useEffect } from 'react';
import { DiscoveryViewModel } from './discoveryTypes';
import { X, Sparkles, Activity, FileText, ArrowRight, ShieldCheck, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export interface DiscoveryEvidencePanelProps {
  discovery: DiscoveryViewModel | null;
  onClose: () => void;
  onExploreReceipts: (discovery: DiscoveryViewModel) => void;
}

export const DiscoveryEvidencePanel: React.FC<DiscoveryEvidencePanelProps> = ({
  discovery,
  onClose,
  onExploreReceipts,
}) => {
  // Global Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!discovery) return null;

  const isCrossTemporal = discovery.source === 'cross-temporal';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Evidence for ${discovery.title}`}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-fadeIn"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-accent-primary/50 bg-surface shadow-2xl p-6 sm:p-8 space-y-6">
        {/* 1. Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                EVIDENTIARY AUDIT // {discovery.categoryLabel}
              </Badge>
              <span className="font-mono text-[10px] text-accent-emerald flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {Math.round(discovery.confidence * 100)}% Confidence
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-content-main font-heading leading-snug pt-1">
              {discovery.title}
            </h2>
            <p className="text-xs sm:text-sm text-accent-primary font-mono font-medium">
              {discovery.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence panel"
            className="p-1.5 rounded-lg text-content-dim hover:text-content-main hover:bg-surface-elevated transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Structured Questions Section */}
        <div className="space-y-5 text-xs font-sans">
          {/* WHAT WAS DISCOVERED? */}
          <div className="space-y-1.5 p-3.5 rounded-lg bg-surface-elevated/70 border border-border">
            <div className="font-mono text-[11px] uppercase tracking-wider text-accent-primary font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              What Was Discovered?
            </div>
            <p className="text-content-main leading-relaxed text-sm font-medium pl-5">
              {discovery.subtitle}
            </p>
          </div>

          {/* WHY DOES LIFELINE SAY THIS? */}
          <div className="space-y-1.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-content-dim font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent-secondary" />
              Why Does LIFELINE Say This?
            </div>
            <p className="text-content-muted leading-relaxed pl-5 text-xs sm:text-sm">
              {discovery.description}
            </p>
          </div>

          {/* WHAT DATA SUPPORTS IT? */}
          <div className="space-y-2.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-accent-emerald font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              What Data Supports It?
            </div>

            <div className="space-y-2 pl-5">
              {discovery.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-surface-elevated/50 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <span className="font-medium text-content-main text-xs sm:text-sm block">
                      {ev.metric}
                    </span>
                    <span className="text-[11px] text-content-dim font-mono block">
                      Observational Window: {ev.period}{' '}
                      {ev.comparison ? `(vs. ${ev.comparison.period}: ${ev.comparison.value}${ev.comparison.unit})` : ''}
                      {ev.sampleSize ? ` | Sample Size n = ${ev.sampleSize.toLocaleString()}` : ''}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-base sm:text-lg font-bold text-accent-primary">
                      {typeof ev.value === 'number' ? ev.value.toLocaleString() : ev.value}
                    </span>{' '}
                    <span className="font-mono text-xs text-content-muted">
                      {ev.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WHEN DID IT HAPPEN & SOURCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5 pt-1">
            <div className="p-2.5 rounded bg-surface-elevated/40 border border-border-subtle font-mono text-[11px]">
              <span className="text-content-dim block uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-accent-primary" /> Temporal Epoch
              </span>
              <span className="text-content-main font-bold block mt-0.5">
                {discovery.period}
              </span>
            </div>

            <div className="p-2.5 rounded bg-surface-elevated/40 border border-border-subtle font-mono text-[11px]">
              <span className="text-content-dim block uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-accent-emerald" /> Primary Source Stream
              </span>
              <span className="text-content-main font-bold block mt-0.5 uppercase">
                {discovery.source} telemetry
              </span>
            </div>
          </div>

          {/* Cross-temporal non-causal disclaimer */}
          {isCrossTemporal && (
            <div className="p-3 rounded-lg bg-surface/80 border border-accent-secondary/30 flex items-start gap-2.5 text-[11px] text-content-dim font-mono">
              <AlertCircle className="w-4 h-4 text-accent-secondary shrink-0 mt-0.5" />
              <span>
                <strong className="text-content-main">Strict Non-Causal Grounding:</strong> {CAUSALITY_DISCLAIMER}
              </span>
            </div>
          )}
        </div>

        {/* 3. Footer Action: EXPLORE THESE RECEIPTS */}
        <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
          <span className="text-content-dim">
            Press <kbd className="px-1 py-0.5 rounded bg-surface-elevated border border-border text-content-muted">Esc</kbd> to close
          </span>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onExploreReceipts(discovery);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              className="font-bold"
            >
              Explore Supporting Receipts →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
