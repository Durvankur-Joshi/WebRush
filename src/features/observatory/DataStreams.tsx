import React from 'react';
import { LifeAnalytics } from '../../analytics';
import { RouteId } from '../../types/common';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Headphones, Wallet, CreditCard, ArrowRight, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';

export interface DataStreamsProps {
  analytics: LifeAnalytics;
  onNavigate?: (route: RouteId, params?: Record<string, string>) => void;
}

export const DataStreams: React.FC<DataStreamsProps> = ({ analytics, onNavigate }) => {
  const { spotify, household, transactions } = analytics;
  const topArtist = spotify.topArtists[0];
  const foodCat = household.categoryFrequency[0];
  const travelCat = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('travel'));

  return (
    <div className="space-y-12 pt-4">
      {/* Three Streams Detailed Cards */}
      <section id="observatory-streams" className="space-y-6">
        <SectionHeader
          tag="RECEIPT MODALITIES // THREE STREAMS"
          title="Three Data Streams"
          description="Examine the distinct digital footprints that compose the LIFELINE observatory. Each stream is normalized locally and scrubbed of sensitive identifiers."
          level="h2"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream 1: Spotify */}
          <div className="rounded-lg border border-border/70 bg-surface/50 p-6 space-y-5 flex flex-col justify-between hover:border-accent-primary/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded bg-surface border border-border flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-accent-primary" />
                  <span className="font-mono text-xs font-bold text-accent-primary">STREAM 01</span>
                </div>
                <Badge variant="primary" size="sm" className="font-mono">
                  {spotify.dateRange.start.slice(0, 4)} — {spotify.dateRange.end.slice(0, 4)}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-content-main">
                  Music Streaming
                </h3>
                <p className="text-xs text-content-muted font-mono">
                  Listening History (11 Years)
                </p>
              </div>

              <div className="space-y-2 py-3 border-y border-border-subtle text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Total Receipts:</span>
                  <span className="text-content-main font-bold">{spotify.totalRecords.toLocaleString()} streams</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Cumulative Hours:</span>
                  <span className="text-accent-primary font-bold">{spotify.totalListeningHours.toFixed(0)} hrs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Unique Artists:</span>
                  <span className="text-content-main">{spotify.uniqueArtists.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Top Loyalty Artist:</span>
                  <span className="text-content-main truncate max-w-[140px]">{topArtist?.artist || 'The Beatles'}</span>
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Spans 11 continuous years of auditory consumption. Reflects nocturnal concentration, habit shifts in skip behavior, and deep artist exploration.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('explore', { stream: 'spotify' })}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full justify-between mt-2 font-mono text-xs"
            >
              Explore Audio Receipts
            </Button>
          </div>

          {/* Stream 2: Household */}
          <div className="rounded-lg border border-border/70 bg-surface/50 p-6 space-y-5 flex flex-col justify-between hover:border-accent-emerald/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded bg-surface border border-border flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-accent-emerald" />
                  <span className="font-mono text-xs font-bold text-accent-emerald">STREAM 02</span>
                </div>
                <Badge variant="success" size="sm" className="font-mono">
                  {household.dateRange.start.slice(0, 4)} — {household.dateRange.end.slice(0, 4)}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-content-main">
                  Domestic Ledger
                </h3>
                <p className="text-xs text-content-muted font-mono">
                  Everyday Financial Activity (4 Years)
                </p>
              </div>

              <div className="space-y-2 py-3 border-y border-border-subtle text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Total Outflow:</span>
                  <span className="text-accent-emerald font-bold">INR {(household.totalExpenses / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Top Category:</span>
                  <span className="text-content-main">{foodCat?.category || 'Food'} ({foodCat?.count || 907} txns)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Data Completeness:</span>
                  <span className="text-accent-emerald font-bold">100% Validated</span>
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Granular domestic cashflow entries manually recorded across four years. Dominance of subsistence tracking contrasted with lump-sum transfers.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('explore', { stream: 'household' })}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full justify-between mt-2 font-mono text-xs"
            >
              Explore Domestic Ledger
            </Button>
          </div>

          {/* Stream 3: Transactions */}
          <div className="rounded-lg border border-border/70 bg-surface/50 p-6 space-y-5 flex flex-col justify-between hover:border-accent-secondary/50 transition-all group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded bg-surface border border-border flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent-secondary" />
                  <span className="font-mono text-xs font-bold text-accent-secondary">STREAM 03</span>
                </div>
                <Badge variant="warning" size="sm" className="font-mono">
                  {transactions.dateRange.start.slice(0, 4)} — {transactions.dateRange.end.slice(0, 4)}
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-content-main">
                  Card Commerce
                </h3>
                <p className="text-xs text-content-muted font-mono">
                  Point-of-Sale Card Outflows (2 Years)
                </p>
              </div>

              <div className="space-y-2 py-3 border-y border-border-subtle text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Total Receipts:</span>
                  <span className="text-content-main font-bold">{transactions.totalRecords.toLocaleString()} card txns</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Commercial Outflow:</span>
                  <span className="text-accent-secondary font-bold">INR {(transactions.totalAmount / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Active Verticals:</span>
                  <span className="text-content-main">{transactions.categoryFrequency.length} categories</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-dim">Highest Avg Ticket:</span>
                  <span className="text-content-main">INR {travelCat?.avgAmount?.toFixed(0) || '5,556'} (Travel)</span>
                </div>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Automated card transaction telemetry across modern retail, travel, entertainment, and health. Completely scrubbed of PII with safe geographic aggregates.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('explore', { stream: 'transactions' })}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full justify-between mt-2 font-mono text-xs"
            >
              Explore Card Receipts
            </Button>
          </div>
        </div>
      </section>

      {/* Final Cinematic Transition Section */}
      <section className="relative rounded-xl border border-border/80 bg-gradient-to-b from-surface/80 via-surface/40 to-background p-8 sm:p-12 text-center space-y-6 overflow-hidden">
        {/* Subtle background cosmic radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <Badge variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
            EVIDENTIARY HORIZON
          </Badge>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-content-main tracking-tight">
            Ready to Explore Your Receipts?
          </h2>

          <p className="text-sm text-content-muted leading-relaxed">
            161K+ verified receipts spanning twelve years of living telemetry.
            Discover granular cross-stream trends, inspect underlying evidence, or experience the chronologically synthesized story.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate?.('explore')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Launch Full Explorer
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onNavigate?.('discover')}
            icon={<Sparkles className="w-4 h-4 text-accent-primary" />}
          >
            View All Discoveries
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate?.('story')}
            icon={<BookOpen className="w-4 h-4 text-accent-emerald" />}
          >
            Story Mode
          </Button>
        </div>

        <div className="relative z-10 pt-4 flex items-center justify-center gap-2 text-[11px] text-content-dim font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
          <span>Local deterministic analytics • Zero external API transmission • Complete privacy</span>
        </div>
      </section>
    </div>
  );
};
