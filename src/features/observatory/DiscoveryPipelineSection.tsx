import React from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Database, Cpu, Network, ShieldCheck, BookOpen, ArrowRight } from 'lucide-react';

export const DiscoveryPipelineSection: React.FC = () => {
  const pipelineSteps = [
    {
      step: '01',
      tag: 'RAW RECEIPTS',
      title: 'Multi-Modal Ingestion',
      metric: '161,046 Records',
      description: 'Ingests 11 years of streaming logs, 4 years of domestic ledgers, and multi-facet card commerce with strict client-side PII sanitization.',
      icon: Database,
      color: '#38BDF8',
      accentBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
    },
    {
      step: '02',
      tag: 'PATTERN ENGINE',
      title: 'Algorithmic Rhythm',
      metric: 'Statistical Deltas',
      description: 'Detects structural transitions: 2015 skip collapse, nocturnal listening clustering, and ticket-size divergence.',
      icon: Cpu,
      color: '#818CF8',
      accentBg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    },
    {
      step: '03',
      tag: 'CONNECTION ENGINE',
      title: 'Knowledge Constellation',
      metric: '11 Dimension Links',
      description: 'Constructs an interactive topological graph mapping parallel temporal epochs and shared life rhythm anchors.',
      icon: Network,
      color: '#10B981',
      accentBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      step: '04',
      tag: 'EVIDENCE ENGINE',
      title: 'Empirical Verification',
      metric: '100% Proven Proof',
      description: 'Attaches sample sizes (n), observed metric values, comparative periods, and direct Explorer drill-downs to every claim.',
      icon: ShieldCheck,
      color: '#F59E0B',
      accentBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    },
    {
      step: '05',
      tag: 'INTERACTIVE STORY',
      title: 'Data-Backed Narrative',
      metric: '5 Editorial Chapters',
      description: 'Transforms verified discoveries into an interactive step-by-step editorial story with zero ungrounded causal speculation.',
      icon: BookOpen,
      color: '#EC4899',
      accentBg: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    },
  ];

  return (
    <section id="observatory-pipeline" className="space-y-6 pt-2">
      <SectionHeader
        tag="INNOVATION & ARCHITECTURE // HOW LIFELINE CONNECTS THE DOTS"
        title="The Discovery Engine Pipeline"
        description="LIFELINE is not a database browser. Our multi-stage deterministic intelligence architecture ingests fragmented digital receipts, extracts empirical patterns, maps cross-modal relationships, and synthesizes verifiable life stories."
        level="h2"
      />

      {/* 5-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {pipelineSteps.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === pipelineSteps.length - 1;

          return (
            <div
              key={item.step}
              className="relative p-4 rounded-xl bg-surface/50 border border-border/70 hover:border-border transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Step number & Tag */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-content-dim tracking-wider">
                    {item.step}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-elevated border border-border-subtle text-content-muted">
                    {item.tag}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="space-y-1.5 pt-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.accentBg} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-content-main tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <div className="font-mono text-[10px] text-accent-primary font-semibold">
                    {item.metric}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-content-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Visual flow indicator */}
              <div className="pt-3 mt-3 border-t border-border-subtle/50 flex items-center justify-between text-[10px] font-mono text-content-dim">
                <span>Phase {item.step}</span>
                {!isLast && (
                  <ArrowRight className="w-3.5 h-3.5 text-content-dim hidden lg:block" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Evaluator Flow Summary Callout */}
      <div className="p-3.5 rounded-lg bg-surface-elevated/40 border border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-content-main font-medium">
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          <span>Core Paradigm:</span>
          <span className="text-accent-primary font-bold">RAW RECEIPTS</span>
          <span className="text-content-dim">→</span>
          <span className="text-accent-secondary font-bold">PATTERNS</span>
          <span className="text-content-dim">→</span>
          <span className="text-accent-emerald font-bold">CONNECTIONS</span>
          <span className="text-content-dim">→</span>
          <span className="text-accent-primary font-bold">EVIDENCE</span>
          <span className="text-content-dim">→</span>
          <span className="text-pink-400 font-bold">STORY</span>
        </div>

        <span className="text-content-dim text-[11px]">
          100% Client-Side Ingestion · Zero External AI Dependencies · Zero PII
        </span>
      </div>
    </section>
  );
};
