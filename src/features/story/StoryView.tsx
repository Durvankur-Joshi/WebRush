import React from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export const StoryView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        tag="SYNTHESIS // LIFE NARRATIVE"
        title="Your Life, In Receipts"
        description="A grounded narrative reconstruction transforming fragmented digital transactions into a living personal history, strictly backed by evidentiary receipt records."
        level="h1"
        action={
          <Badge variant="outline" size="md" icon={<CheckCircle className="w-3.5 h-3.5 text-accent-emerald" />}>
            Empirical Life Arc
          </Badge>
        }
      />

      {/* Narrative Chapters Timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:-translate-x-px before:w-0.5 before:bg-border/60">
        {/* Chapter 1: 2013-2014 */}
        <div className="relative flex flex-col md:flex-row items-start gap-6 group">
          <div className="hidden md:block w-1/2 text-right pr-8">
            <span className="font-mono text-xs text-accent-primary font-bold uppercase tracking-widest">
              Chapter I // 2013 – 2014
            </span>
            <h3 className="text-base font-semibold text-content-main mt-1">
              The Acoustic Awakening
            </h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              Early streaming habits emerge through desktop web players. Playlists fluctuate with frequent skipping 
              as musical preferences are actively tested and curated.
            </p>
          </div>

          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center text-accent-primary z-10 shadow-glow-primary">
            <Clock className="w-3.5 h-3.5" />
          </div>

          <div className="w-full md:w-1/2 pl-12 md:pl-8">
            <Card variant="default">
              <div className="md:hidden mb-2">
                <span className="font-mono text-xs text-accent-primary font-bold uppercase">
                  Chapter I // 2013 – 2014
                </span>
                <h3 className="text-base font-semibold text-content-main">
                  The Acoustic Awakening
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-content-muted">
                  <span>Dominant Signal:</span>
                  <Badge variant="success" size="sm">Spotify Web Player</Badge>
                </div>
                <div className="flex items-center justify-between text-content-muted">
                  <span>Evidentiary Footprint:</span>
                  <span className="font-mono text-content-main">Early stream logs & autoplay clicks</span>
                </div>
                <div className="flex items-center justify-between text-content-muted">
                  <span>Behavioral Trait:</span>
                  <span className="font-mono text-accent-secondary">High track skipping rate</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Chapter 2: 2015-2018 */}
        <div className="relative flex flex-col md:flex-row-reverse items-start gap-6 group">
          <div className="hidden md:block w-1/2 text-left pl-8">
            <span className="font-mono text-xs text-accent-primary font-bold uppercase tracking-widest">
              Chapter II // 2015 – 2018
            </span>
            <h3 className="text-base font-semibold text-content-main mt-1">
              Domestic Grounding & Daily Ledgers
            </h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              A period of disciplined domestic recordkeeping. Daily cash and bank transactions log transportation, 
              groceries, and emerging digital entertainment subscriptions.
            </p>
          </div>

          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-elevated border-2 border-accent-primary flex items-center justify-center text-accent-primary z-10">
            <BookOpen className="w-3.5 h-3.5" />
          </div>

          <div className="w-full md:w-1/2 pl-12 md:pl-8">
            <Card variant="default">
              <div className="md:hidden mb-2">
                <span className="font-mono text-xs text-accent-primary font-bold uppercase">
                  Chapter II // 2015 – 2018
                </span>
                <h3 className="text-base font-semibold text-content-main">
                  Domestic Grounding & Daily Ledgers
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-content-muted">
                  <span>Dual Signals:</span>
                  <div className="flex gap-1">
                    <Badge variant="primary" size="sm">Household Ledger</Badge>
                    <Badge variant="success" size="sm">Spotify Stream</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-content-muted">
                  <span>Recorded Volume:</span>
                  <span className="font-mono text-content-main">2,400+ ledger entries</span>
                </div>
                <div className="flex items-center justify-between text-content-muted">
                  <span>Key Outlays:</span>
                  <span className="font-mono text-content-main">Train fares, snacks, data packs</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Chapter 3: 2022-2024 */}
        <div className="relative flex flex-col md:flex-row items-start gap-6 group">
          <div className="hidden md:block w-1/2 text-right pr-8">
            <span className="font-mono text-xs text-accent-secondary font-bold uppercase tracking-widest">
              Chapter III // 2022 – 2024
            </span>
            <h3 className="text-base font-semibold text-content-main mt-1">
              The Digital Commerce Grid
            </h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              Transition into modern multi-facet point-of-sale card transactions across retail and entertainment, 
              coinciding with mature, steady auditory streaming footprints.
            </p>
          </div>

          <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-elevated border-2 border-accent-secondary flex items-center justify-center text-accent-secondary z-10">
            <Clock className="w-3.5 h-3.5" />
          </div>

          <div className="w-full md:w-1/2 pl-12 md:pl-8">
            <Card variant="default">
              <div className="md:hidden mb-2">
                <span className="font-mono text-xs text-accent-secondary font-bold uppercase">
                  Chapter III // 2022 – 2024
                </span>
                <h3 className="text-base font-semibold text-content-main">
                  The Digital Commerce Grid
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-content-muted">
                  <span>Dominant Signal:</span>
                  <Badge variant="secondary" size="sm">Sanitized POS Transact</Badge>
                </div>
                <div className="flex items-center justify-between text-content-muted">
                  <span>Velocity:</span>
                  <span className="font-mono text-content-main">10,000+ card transactions</span>
                </div>
                <div className="flex items-center justify-between text-content-muted">
                  <span>PII Status:</span>
                  <span className="text-accent-emerald font-semibold">100% Anonymous & Scrubbed</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Causality Statement */}
      <div className="p-4 rounded-lg bg-surface/50 border border-border-subtle text-xs text-content-dim font-sans">
        <strong className="text-content-muted">Historical Authenticity Disclaimer:</strong> {CAUSALITY_DISCLAIMER}
      </div>
    </div>
  );
};
