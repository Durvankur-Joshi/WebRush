import React from 'react';
import { DiscoveriesSummaryMetrics } from './discoveryTypes';
import { Sparkles, Network, Database, Layers } from 'lucide-react';

export interface DiscoveriesHeroProps {
  metrics: DiscoveriesSummaryMetrics;
  totalReceiptsFormatted: string;
}

export const DiscoveriesHero: React.FC<DiscoveriesHeroProps> = ({
  metrics,
  totalReceiptsFormatted,
}) => {
  return (
    <div className="space-y-6 border-b border-border/70 pb-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-accent-primary uppercase font-bold">
            EVIDENTIARY HORIZON // PATTERN MINING
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-content-main tracking-tight font-heading">
          DISCOVERIES
        </h1>

        <p className="text-lg sm:text-xl text-accent-primary font-medium">
          “Your life leaves patterns behind.”
        </p>

        <p className="text-sm sm:text-base text-content-muted max-w-3xl leading-relaxed">
          Across years of listening, spending, movement, and everyday moments, recurring patterns begin to emerge.
          Each discovery below is grounded in strict numeric thresholds and traced directly back to verifiable receipts.
        </p>
      </div>

      {/* Metric Counters (Computed from actual LifeAnalytics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-lg bg-surface border border-border/80 flex items-center gap-3">
          <div className="p-2 rounded bg-surface-elevated text-accent-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-content-main">
              {metrics.totalDiscoveries}
            </div>
            <div className="text-[10px] font-mono uppercase text-content-dim">
              Verified Discoveries
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-border/80 flex items-center gap-3">
          <div className="p-2 rounded bg-surface-elevated text-accent-emerald">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-accent-emerald">
              {metrics.totalConnections}
            </div>
            <div className="text-[10px] font-mono uppercase text-content-dim">
              Life Connections
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-border/80 flex items-center gap-3">
          <div className="p-2 rounded bg-surface-elevated text-accent-secondary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-accent-secondary">
              {metrics.totalStreams}
            </div>
            <div className="text-[10px] font-mono uppercase text-content-dim">
              Multi-Modal Streams
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-border/80 flex items-center gap-3">
          <div className="p-2 rounded bg-surface-elevated text-pink-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold font-mono text-content-main truncate">
              {totalReceiptsFormatted}
            </div>
            <div className="text-[10px] font-mono uppercase text-content-dim">
              Underlying Receipts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
