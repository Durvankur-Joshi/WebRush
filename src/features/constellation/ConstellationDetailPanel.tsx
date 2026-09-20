import React from 'react';
import { ConstellationNodeData } from './types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { X, ShieldAlert, Sparkles, Activity, FileText, ArrowRight } from 'lucide-react';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export interface ConstellationDetailPanelProps {
  node: ConstellationNodeData | null;
  onClose: () => void;
  onExploreReceipts?: (node: ConstellationNodeData) => void;
}

export const ConstellationDetailPanel: React.FC<ConstellationDetailPanelProps> = ({
  node,
  onClose,
  onExploreReceipts,
}) => {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-content-dim border border-border/40 rounded-lg bg-surface/30 backdrop-blur-sm">
        <Sparkles className="w-8 h-8 text-accent-primary/40 mb-3 animate-pulse" />
        <p className="text-sm font-medium text-content-muted mb-1">
          Interactive Node Telemetry
        </p>
        <p className="text-xs max-w-xs text-content-dim leading-relaxed">
          Select or hover any node in the constellation canvas to inspect its underlying analytical evidence and behavioral context.
        </p>
      </div>
    );
  }

  const isCrossTemporal = node.source === 'cross-temporal';

  return (
    <div
      role="region"
      aria-label={`Details for ${node.label}`}
      className="h-full flex flex-col p-5 rounded-lg border border-border bg-surface-elevated/95 backdrop-blur-md shadow-xl animate-fadeIn transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: node.color }}
            />
            <span className="font-mono text-[11px] uppercase tracking-wider text-content-dim">
              {node.category.toUpperCase()} // {node.source.toUpperCase()}
            </span>
            {node.metricValue && (
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {node.metricLabel}: {node.metricValue}
              </Badge>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-content-main tracking-tight">
            {node.label}
          </h3>
          <p className="text-xs text-accent-primary font-mono">
            {node.sublabel}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label="Close telemetry detail panel"
          className="p-1 rounded text-content-muted hover:text-content-main hover:bg-surface transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1 text-xs">
        {/* What this represents */}
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-content-muted mb-1 font-semibold">
            <Activity className="w-3.5 h-3.5 text-accent-primary" />
            What This Represents
          </div>
          <p className="text-content-muted leading-relaxed pl-5">
            {node.whatItRepresents}
          </p>
        </div>

        {/* Why it matters */}
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-content-muted mb-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
            Why It Matters
          </div>
          <p className="text-content-muted leading-relaxed pl-5">
            {node.whyItMatters}
          </p>
        </div>

        {/* Evidence */}
        {node.evidence && node.evidence.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-content-muted mb-2 font-semibold">
              <FileText className="w-3.5 h-3.5 text-accent-emerald" />
              Verified Evidence
            </div>
            <div className="space-y-2 pl-5">
              {node.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded bg-surface/60 border border-border/60 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-[11px] text-content-main font-medium">
                      {ev.metric}
                    </div>
                    <div className="text-[10px] text-content-dim font-mono">
                      Period: {ev.period} {ev.comparison ? `(vs. ${ev.comparison.period}: ${ev.comparison.value}${ev.comparison.unit})` : ''}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-accent-primary">
                      {typeof ev.value === 'number' ? ev.value.toLocaleString() : ev.value}
                    </span>{' '}
                    <span className="font-mono text-[10px] text-content-muted">
                      {ev.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Temporal Comparison Disclaimer */}
        {isCrossTemporal && (
          <div className="p-2.5 rounded bg-surface/80 border border-border-subtle flex items-start gap-2 text-[11px] text-content-dim">
            <ShieldAlert className="w-3.5 h-3.5 text-accent-secondary shrink-0 mt-0.5" />
            <span className="leading-normal">
              <strong className="text-content-muted">Data Integrity:</strong> {CAUSALITY_DISCLAIMER}
            </span>
          </div>
        )}
      </div>

      {/* Footer instruction & Explorer drilldown */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2 text-[10px] text-content-dim font-mono flex-wrap">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-surface border border-border text-content-muted">Esc</kbd> to clear</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 text-[11px] px-2 font-mono">
            Dismiss
          </Button>
          {onExploreReceipts && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onExploreReceipts(node)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="h-7 text-[11px] px-2.5 font-bold font-mono"
            >
              Explore In Receipts
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
