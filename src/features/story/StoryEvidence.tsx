import React from 'react';
import { EvidenceItem } from '../../analytics/evidence';
import { CheckCircle2, ShieldCheck, Calendar } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export interface StoryEvidenceProps {
  evidence: EvidenceItem[];
  source: string;
  period: string;
  className?: string;
}

export const StoryEvidence: React.FC<StoryEvidenceProps> = ({
  evidence,
  source,
  period,
  className = '',
}) => {
  return (
    <div className={`p-4 sm:p-5 rounded-xl bg-surface/60 border border-border/70 space-y-4 ${className}`}>
      {/* Evidence Section Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
          <span className="font-mono text-xs uppercase font-bold text-content-main tracking-wider">
            Verified Evidence Breakdown
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm" className="font-mono uppercase text-[10px]">
            {source} stream
          </Badge>
          <span className="font-mono text-[10px] text-content-dim flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {period}
          </span>
        </div>
      </div>

      {/* Evidence Metrics Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {evidence.map((ev, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-surface-elevated/60 border border-border-subtle flex flex-col justify-between gap-1.5"
          >
            <span className="text-xs font-medium text-content-main">
              {ev.metric}
            </span>

            <div className="flex items-baseline justify-between pt-1 border-t border-border-subtle">
              <span className="font-mono text-[10px] text-content-dim">
                Period: {ev.period}
                {ev.sampleSize ? ` (n=${ev.sampleSize.toLocaleString()})` : ''}
              </span>
              <span className="font-mono text-sm font-bold text-accent-primary">
                {typeof ev.value === 'number' ? ev.value.toLocaleString() : ev.value}{' '}
                <span className="text-[10px] font-normal text-content-muted">{ev.unit}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Non-causal Grounding Note */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-content-dim pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
        <span>Strictly empirical values verified against normalized digital receipt logs.</span>
      </div>
    </div>
  );
};
