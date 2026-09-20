import React, { useState } from 'react';
import { Discovery } from '../../analytics';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ChevronDown, ChevronUp, FileText, CheckCircle2, TrendingUp, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export interface DiscoveryPreviewProps {
  discoveries: Discovery[];
  onViewAllDiscoveries?: () => void;
  onExploreEvidence?: (discovery: Discovery) => void;
}

export const DiscoveryPreview: React.FC<DiscoveryPreviewProps> = ({
  discoveries,
  onViewAllDiscoveries,
  onExploreEvidence,
}) => {
  // Set of expanded discovery IDs
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([discoveries[0]?.id || '']));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'spotify':
        return <Badge variant="primary" size="sm">Spotify Stream</Badge>;
      case 'household':
        return <Badge variant="success" size="sm">Household Ledger</Badge>;
      case 'transactions':
        return <Badge variant="warning" size="sm">Card Commerce</Badge>;
      default:
        return <Badge variant="default" size="sm">Temporal Comparison</Badge>;
    }
  };

  return (
    <section id="observatory-discoveries" className="space-y-6 pt-4">
      <SectionHeader
        tag="DISCOVERY ENGINE // VERIFIED PATTERNS"
        title="The First Things We Found"
        description="Every discovery is grounded in strict numeric thresholds and traced directly back to verifiable evidence. Zero hallucinated narrative."
        level="h2"
        action={
          onViewAllDiscoveries && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllDiscoveries}
              icon={<Sparkles className="w-3.5 h-3.5 text-accent-primary" />}
            >
              Explore All Discoveries
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discoveries.map((disc) => {
          const isExpanded = expandedIds.has(disc.id);

          return (
            <div
              key={disc.id}
              className={`rounded-lg border transition-all ${
                isExpanded
                  ? 'border-accent-primary/70 bg-surface/70 shadow-lg shadow-accent-primary/5'
                  : 'border-border/70 bg-surface/40 hover:border-border'
              } p-5 space-y-4`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getSourceBadge(disc.source)}
                    <span className="font-mono text-[10px] text-content-dim uppercase">
                      {disc.period}
                    </span>
                    <span className="font-mono text-[10px] text-accent-emerald flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {(disc.confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-content-main leading-snug">
                    {disc.title}
                  </h3>
                  <p className="text-xs font-mono text-accent-primary">
                    {disc.subtitle}
                  </p>
                </div>
              </div>

              {/* Narrative description */}
              <p className="text-xs text-content-muted leading-relaxed">
                {disc.description}
              </p>

              {/* Expand Evidence Trigger Button */}
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2 flex-wrap">
                <button
                  onClick={() => toggleExpand(disc.id)}
                  aria-expanded={isExpanded}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent-primary hover:text-sky-300 transition-colors focus:outline-none focus:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {isExpanded ? 'HIDE EVIDENCE' : 'SHOW EVIDENCE'}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-content-dim font-mono">
                    {disc.evidence.length} data point{disc.evidence.length > 1 ? 's' : ''}
                  </span>

                  {onExploreEvidence && (
                    <button
                      type="button"
                      onClick={() => onExploreEvidence(disc)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-accent-primary hover:text-sky-300 transition-colors bg-accent-primary-dim px-2 py-0.5 rounded border border-accent-primary/20 hover:border-accent-primary/50"
                      title="Drill-down to raw receipts verifying this pattern"
                    >
                      <span>EXPLORE EVIDENCE</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Evidentiary Breakdown */}
              {isExpanded && (
                <div
                  role="region"
                  aria-label={`Evidence for ${disc.title}`}
                  className="mt-3 pt-3 border-t border-border-subtle space-y-3 animate-fadeIn"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wider text-content-dim font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" />
                    Verified Evidence Breakdown
                  </div>

                  <div className="space-y-2.5">
                    {disc.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="p-3 rounded bg-surface-elevated/70 border border-border/80 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="font-medium text-content-main">
                            {ev.metric}
                          </span>
                          <span className="font-mono text-accent-primary font-bold">
                            {typeof ev.value === 'number' ? ev.value.toLocaleString() : ev.value}{' '}
                            <span className="text-[10px] text-content-dim font-normal">{ev.unit}</span>
                          </span>
                        </div>

                        {/* Visual Proportion Bar */}
                        <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-accent-primary h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(15, ev.unit === '%' ? (typeof ev.value === 'number' ? ev.value : 50) : 75))}%`,
                            }}
                          />
                        </div>

                        {/* Comparison / Period Metadata */}
                        <div className="flex items-center justify-between text-[10px] text-content-dim font-mono pt-1">
                          <span>Period: {ev.period}</span>
                          {ev.comparison && (
                            <span className="text-accent-secondary">
                              vs. {ev.comparison.period}: {ev.comparison.value}{ev.comparison.unit}
                            </span>
                          )}
                          {ev.sampleSize && (
                            <span>n = {ev.sampleSize.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {disc.source === 'cross-temporal' && (
                    <div className="p-2 rounded bg-surface/50 border border-border-subtle text-[10px] text-content-dim flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-accent-secondary shrink-0 mt-0.5" />
                      <span>Strict non-causal temporal comparison across distinct historical receipt streams.</span>
                    </div>
                  )}

                  {onExploreEvidence && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => onExploreEvidence(disc)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                        className="font-mono text-xs"
                      >
                        Inspect Supporting Receipts in Explorer
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
