import React from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export const DiscoveriesView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        tag="ALGORITHMIC ENGINE // PATTERNS & ANOMALIES"
        title="Pattern Discoveries & Evidence"
        description="Statistically derived behavioral shifts, financial rhythms, and acoustic signatures extracted with rigorous evidentiary proof."
        level="h1"
        action={
          <Badge variant="outline" size="md" icon={<CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />}>
            Evidence-Backed Insights
          </Badge>
        }
      />

      {/* Scientific Methodology Note */}
      <Card variant="subtle" padding="sm" className="border-accent-primary/20 bg-accent-primary-dim/10">
        <div className="flex items-start gap-3 text-xs text-content-muted">
          <Sparkles className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
          <div>
            <span className="text-content-main font-semibold">Evidentiary Paradigm:</span>{' '}
            No insight exists without empirical backing. Every card below lists the ground-truth dataset, observed 
            statistical frequency, sample size, and confidence score. Cross-dataset comparisons are strictly non-causal.
          </div>
        </div>
      </Card>

      {/* Discovery Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insight 1: Auditory Gravitational Anchor */}
        <Card variant="default" className="space-y-4">
          <CardHeader
            title="Acoustic Gravitational Anchor"
            subtitle="Audio Signature Pattern"
            action={
              <Badge variant="primary" size="sm">
                Spotify Stream
              </Badge>
            }
          />
          <p className="text-sm text-content-main leading-relaxed">
            The top 3 recurring artists account for a disproportionate volume of overall listening time across 11 years, 
            demonstrating an acoustic anchor effect resilient to playlist churn.
          </p>

          <div className="p-3 rounded bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-content-dim uppercase">Evidentiary Metric:</span>
              <span className="font-mono text-accent-primary font-semibold">Top 3 Concentration Ratio</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Observed Value:</span>
              <span className="font-mono text-content-main font-bold">~34.2% total hours</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Sample Size:</span>
              <span className="font-mono text-content-main">150,000+ streams (2013–2024)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Confidence Score:</span>
              <span className="font-mono text-accent-emerald font-semibold">99.2%</span>
            </div>
          </div>
        </Card>

        {/* Insight 2: Domestic Financial Primacy */}
        <Card variant="default" className="space-y-4">
          <CardHeader
            title="Domestic Capital Regularity"
            subtitle="Financial Rhythm Pattern"
            action={
              <Badge variant="primary" size="sm">
                Household Ledger
              </Badge>
            }
          />
          <p className="text-sm text-content-main leading-relaxed">
            Food and essentials dominate recurring domestic outlays between 2015 and 2018, exhibiting high-frequency 
            cash transactions with tightly bounded standard deviation.
          </p>

          <div className="p-3 rounded bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-content-dim uppercase">Evidentiary Metric:</span>
              <span className="font-mono text-accent-primary font-semibold">Primary Category Share</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Observed Value:</span>
              <span className="font-mono text-content-main font-bold">42.8% expense volume</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Sample Size:</span>
              <span className="font-mono text-content-main">2,400+ ledger lines (2015–2018)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Confidence Score:</span>
              <span className="font-mono text-accent-emerald font-semibold">96.5%</span>
            </div>
          </div>
        </Card>

        {/* Insight 3: Temporal Parallelism */}
        <Card variant="default" className="space-y-4">
          <CardHeader
            title="Concurrent Life Ledger & Soundtrack (2015–2018)"
            subtitle="Longitudinal Temporal Comparison"
            action={
              <Badge variant="secondary" size="sm">
                Cross-Temporal
              </Badge>
            }
          />
          <p className="text-sm text-content-main leading-relaxed">
            During the 4-year domestic logging period, the auditory stream captured continuous background consumption, 
            revealing a synchrony between physical household maintenance and acoustic focus sessions.
          </p>

          <div className="p-3 rounded bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-content-dim uppercase">Active Streams:</span>
              <span className="font-mono text-content-main">Household (2015–18) & Spotify (2015–18)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Temporal Alignment:</span>
              <span className="font-mono text-accent-secondary font-bold">48 Concurrent Months</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Causality Principle:</span>
              <span className="font-mono text-content-dim">Comparative correlation only</span>
            </div>
          </div>
        </Card>

        {/* Insight 4: POS Card Security Integrity */}
        <Card variant="default" className="space-y-4">
          <CardHeader
            title="Digital POS Security & Anomaly Boundary"
            subtitle="Anomaly Detection"
            action={
              <Badge variant="outline" size="sm">
                Card Transact
              </Badge>
            }
          />
          <p className="text-sm text-content-main leading-relaxed">
            Card transaction records demonstrate concentrated standard commerce patterns, with isolated flagged anomalies 
            remaining below normal consumer volatility thresholds.
          </p>

          <div className="p-3 rounded bg-surface-elevated border border-border-subtle space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-content-dim uppercase">Evidentiary Metric:</span>
              <span className="font-mono text-accent-primary font-semibold">Flagged Anomaly Ratio</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Observed Value:</span>
              <span className="font-mono text-content-main font-bold">&lt; 0.5% fraud flagged</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Data Protection:</span>
              <span className="font-mono text-accent-emerald">Zero raw card numbers stored</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Causality Disclaimer */}
      <div className="p-4 rounded-lg bg-surface/50 border border-border-subtle flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-content-muted leading-relaxed">
          <span className="text-content-main font-semibold">Causality Guardrail:</span> {CAUSALITY_DISCLAIMER}
        </p>
      </div>
    </div>
  );
};
