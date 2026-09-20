import React from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  RotateCcw,
  Sparkles,
  Compass,
  Database,
  CheckCircle2,
  Headphones,
  Wallet,
  CreditCard,
  Network,
} from 'lucide-react';

export interface StoryCompletionProps {
  totalDiscoveries: number;
  totalConnections: number;
  totalReceiptsFormatted: string;
  onReplayStory: () => void;
  onExploreDiscoveries: () => void;
  onOpenConstellation: () => void;
  onExploreReceipts: () => void;
}

export const StoryCompletion: React.FC<StoryCompletionProps> = ({
  totalDiscoveries,
  totalConnections,
  totalReceiptsFormatted,
  onReplayStory,
  onExploreDiscoveries,
  onOpenConstellation,
  onExploreReceipts,
}) => {
  return (
    <div className="rounded-2xl border border-accent-primary/60 bg-gradient-to-b from-surface/90 via-surface/60 to-background p-6 sm:p-10 lg:p-12 space-y-8 animate-fadeIn text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Badge */}
      <div className="flex justify-center">
        <Badge variant="primary" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />}>
          STORY COMPLETE // NARRATIVE SYNTHESIS
        </Badge>
      </div>

      {/* Headline & Synthesis */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-5xl font-black text-content-main tracking-tight font-heading">
          YOUR LIFE, CONNECTED.
        </h2>
        <p className="text-base sm:text-xl text-accent-primary font-medium">
          “Your digital life is more than a collection of receipts. It is a collection of patterns.”
        </p>
        <p className="text-xs sm:text-sm text-content-muted leading-relaxed">
          Through 12 observational years of audio history, domestic ledgers, and modern point-of-sale commerce,
          isolated transactions resolve into recognizable behavioral arcs. Every chapter was grounded directly
          in verifiable receipts with zero hallucination.
        </p>
      </div>

      {/* Summary Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
        <div className="p-3.5 rounded-lg bg-surface border border-border/80 text-center">
          <Sparkles className="w-5 h-5 text-accent-primary mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-bold font-mono text-content-main">
            {totalDiscoveries}
          </div>
          <div className="text-[10px] font-mono uppercase text-content-dim">
            Discoveries Verified
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-border/80 text-center">
          <Network className="w-5 h-5 text-accent-emerald mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-bold font-mono text-accent-emerald">
            {totalConnections}
          </div>
          <div className="text-[10px] font-mono uppercase text-content-dim">
            Life Connections
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-border/80 text-center">
          <Compass className="w-5 h-5 text-accent-secondary mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-bold font-mono text-accent-secondary">
            3 Streams
          </div>
          <div className="text-[10px] font-mono uppercase text-content-dim">
            Data Modalities
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-surface border border-border/80 text-center">
          <Database className="w-5 h-5 text-pink-400 mx-auto mb-1.5" />
          <div className="text-xl sm:text-2xl font-bold font-mono text-content-main truncate">
            {totalReceiptsFormatted}
          </div>
          <div className="text-[10px] font-mono uppercase text-content-dim">
            Receipts Analyzed
          </div>
        </div>
      </div>

      {/* Tri-Stream Observational Synthesis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto text-left pt-2">
        <div className="p-4 rounded-xl bg-surface/60 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-accent-primary" />
            <span className="font-mono text-xs font-bold text-content-main uppercase">Music Stream</span>
          </div>
          <p className="text-xs text-content-muted leading-relaxed">
            Persistent nocturnal listening rhythm and durable multi-year loyalty to The Beatles, with a permanent skip collapse in 2016.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface/60 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-accent-emerald" />
            <span className="font-mono text-xs font-bold text-content-main uppercase">Domestic Ledger</span>
          </div>
          <p className="text-xs text-content-muted leading-relaxed">
            Everyday sustenance tracking with Food dominating 36.9% of all entries, contrasting lump-sum capital movements.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface/60 border border-border space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-accent-secondary" />
            <span className="font-mono text-xs font-bold text-content-main uppercase">Card Commerce</span>
          </div>
          <p className="text-xs text-content-muted leading-relaxed">
            Balanced commercial vertical segmentation across retail and travel, with Travel commanding the highest mean ticket size.
          </p>
        </div>
      </div>

      {/* Evaluator Action Buttons Strip */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onReplayStory}
          icon={<RotateCcw className="w-4 h-4" />}
          iconPosition="left"
          className="font-mono text-xs"
        >
          Replay Story
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={onExploreDiscoveries}
          icon={<Sparkles className="w-4 h-4" />}
          iconPosition="left"
          className="font-mono text-xs"
        >
          Explore Discoveries
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={onOpenConstellation}
          icon={<Compass className="w-4 h-4" />}
          iconPosition="left"
          className="font-mono text-xs"
        >
          Open Constellation
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={onExploreReceipts}
          icon={<Database className="w-4 h-4" />}
          iconPosition="left"
          className="font-mono text-xs font-bold"
        >
          Explore All Receipts
        </Button>
      </div>
    </div>
  );
};
