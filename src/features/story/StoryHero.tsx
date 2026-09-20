import React from 'react';
import { StorySummaryMetrics } from './storyTypes';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, Sparkles, Headphones, Wallet, CreditCard, Network } from 'lucide-react';

export interface StoryHeroProps {
  metrics: StorySummaryMetrics;
  onBeginStory: () => void;
}

export const StoryHero: React.FC<StoryHeroProps> = ({ metrics, onBeginStory }) => {
  return (
    <div className="relative rounded-2xl border border-border/80 bg-gradient-to-b from-surface/90 via-surface/50 to-background p-6 sm:p-10 lg:p-12 space-y-8 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag */}
      <div className="flex items-center gap-2">
        <Badge variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
          NARRATIVE SYNTHESIS // LIVING HISTORY
        </Badge>
        <span className="font-mono text-[10px] text-content-dim uppercase tracking-widest">
          Interactive Data Story
        </span>
      </div>

      {/* Hero Typography */}
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-content-main tracking-tight font-heading leading-tight">
          YOUR LIFE, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-sky-300 to-accent-emerald">
            IN RECEIPTS.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-accent-primary font-medium">
          “Millions of tiny moments. A few patterns tell the bigger story.”
        </p>

        <p className="text-xs sm:text-sm text-content-muted leading-relaxed max-w-2xl">
          Across 12 years of music streaming, everyday grocery ledgers, and digital card commerce,
          your data preserves more than raw receipts. Follow the interactive chapter narrative to see how
          unconscious daily choices coalesced into lasting patterns.
        </p>
      </div>

      {/* Actual Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border/70 flex items-center gap-2.5">
          <Headphones className="w-4 h-4 text-accent-primary shrink-0" />
          <div className="truncate">
            <div className="font-mono text-sm sm:text-base font-bold text-content-main truncate">
              {metrics.listeningRecords}
            </div>
            <div className="font-mono text-[10px] text-content-dim uppercase truncate">
              Audio Streams
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border/70 flex items-center gap-2.5">
          <Wallet className="w-4 h-4 text-accent-emerald shrink-0" />
          <div className="truncate">
            <div className="font-mono text-sm sm:text-base font-bold text-accent-emerald truncate">
              {metrics.householdReceipts}
            </div>
            <div className="font-mono text-[10px] text-content-dim uppercase truncate">
              Domestic Entries
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border/70 flex items-center gap-2.5">
          <CreditCard className="w-4 h-4 text-accent-secondary shrink-0" />
          <div className="truncate">
            <div className="font-mono text-sm sm:text-base font-bold text-accent-secondary truncate">
              {metrics.transactionRecords}
            </div>
            <div className="font-mono text-[10px] text-content-dim uppercase truncate">
              Card Purchases
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border/70 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
          <div className="truncate">
            <div className="font-mono text-sm sm:text-base font-bold text-content-main">
              {metrics.totalDiscoveries}
            </div>
            <div className="font-mono text-[10px] text-content-dim uppercase truncate">
              Discoveries
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border/70 flex items-center gap-2.5">
          <Network className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="truncate">
            <div className="font-mono text-sm sm:text-base font-bold text-content-main">
              {metrics.totalConnections}
            </div>
            <div className="font-mono text-[10px] text-content-dim uppercase truncate">
              Connections
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-2 flex items-center gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={onBeginStory}
          icon={<BookOpen className="w-4 h-4" />}
          iconPosition="left"
          className="font-bold tracking-wider font-mono shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40"
        >
          BEGIN STORY
        </Button>

        <span className="text-xs font-mono text-content-dim hidden sm:inline flex items-center gap-1">
          <span>5 Chapters</span> • <span>Evidence-backed narrative</span>
        </span>
      </div>
    </div>
  );
};
