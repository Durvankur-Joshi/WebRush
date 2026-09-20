import React from 'react';
import { HeroMetrics } from './viewModel';
import { ChevronDown, Sparkles, ShieldCheck, Compass } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export interface HeroSectionProps {
  metrics: HeroMetrics;
  onEnter: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ metrics, onEnter }) => {
  return (
    <section
      aria-label="Observatory Introduction"
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-border/40"
    >
      {/* Top telemetry tag */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="primary" size="sm" icon={<Compass className="w-3.5 h-3.5" />}>
          MACRO DATA OBSERVATORY
        </Badge>
        <Badge variant="success" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Zero PII Exfiltration
        </Badge>
      </div>

      {/* Primary Editorial Heading */}
      <div className="max-w-4xl space-y-4 mb-10">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-content-main leading-[1.05]">
          YOUR LIFE,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-sky-300 to-accent-emerald">
            IN RECEIPTS.
          </span>
        </h1>
        <p className="text-base sm:text-xl text-content-muted font-normal max-w-2xl leading-relaxed">
          Millions of tiny moments.
          <br />
          <span className="text-content-dim">
            A few patterns tell the bigger story.
          </span>
        </p>
      </div>

      {/* Dynamically Derived Macro Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mb-10">
        {/* Metric 1: Total Receipts */}
        <div className="p-4 rounded-lg bg-surface/50 border border-border/60 backdrop-blur-sm space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-content-dim">
            Total Receipts
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-accent-primary">
            {metrics.totalReceiptsFormatted}
          </div>
          <div className="text-[11px] text-content-muted">
            {metrics.totalReceiptsRaw.toLocaleString()} verified events
          </div>
        </div>

        {/* Metric 2: Years Covered */}
        <div className="p-4 rounded-lg bg-surface/50 border border-border/60 backdrop-blur-sm space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-content-dim">
            Temporal Span
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-content-main">
            {metrics.yearsCovered}{' '}
            <span className="text-base font-normal text-content-muted">Years</span>
          </div>
          <div className="text-[11px] text-content-muted font-mono">
            {metrics.yearsRange}
          </div>
        </div>

        {/* Metric 3: Data Streams */}
        <div className="p-4 rounded-lg bg-surface/50 border border-border/60 backdrop-blur-sm space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-content-dim">
            Data Streams
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-accent-emerald">
            {metrics.streamCount}{' '}
            <span className="text-base font-normal text-content-muted">Streams</span>
          </div>
          <div className="text-[11px] text-content-muted">
            Music, Household, Card POS
          </div>
        </div>

        {/* Metric 4: Total Audio Hours */}
        <div className="p-4 rounded-lg bg-surface/50 border border-border/60 backdrop-blur-sm space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-content-dim">
            Audio Stream Volume
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-accent-secondary">
            {metrics.totalHoursFormatted}
          </div>
          <div className="text-[11px] text-content-muted font-mono">
            {metrics.totalHoursRaw.toLocaleString()} listening hours
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={onEnter}
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent-primary text-background font-semibold text-xs tracking-wide hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background transition-all shadow-lg shadow-accent-primary/10"
        >
          <Sparkles className="w-4 h-4" />
          ENTER THE OBSERVATORY
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <span className="text-xs text-content-dim font-mono">
          Scroll to explore the multi-stream life constellation ↓
        </span>
      </div>
    </section>
  );
};
