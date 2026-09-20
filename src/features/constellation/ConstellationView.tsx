import React from 'react';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TIMELINE_ERAS } from '../../analytics/temporal';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';

export const ConstellationView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionHeader
        tag="DATA OBSERVATORY // CONSTELLATION"
        title="Temporal Comparative Constellation"
        description="A multi-dimensional celestial map plotting 11 years of receipts as interconnected nodes across acoustic, domestic, and digital commerce dimensions."
        level="h1"
        action={
          <Badge variant="primary" size="md" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Multi-Era Nodes
          </Badge>
        }
      />

      {/* Constellation Canvas Preview */}
      <Card variant="default" className="relative min-h-[380px] flex flex-col justify-between overflow-hidden">
        {/* Constellation ambient node network illustration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="15%" y1="30%" x2="45%" y2="50%" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="45%" y1="50%" x2="75%" y2="40%" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="75%" y1="40%" x2="85%" y2="75%" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="15%" cy="30%" r="6" fill="#38BDF8" />
            <circle cx="45%" cy="50%" r="8" fill="#10B981" />
            <circle cx="75%" cy="40%" r="7" fill="#F59E0B" />
            <circle cx="85%" cy="75%" r="5" fill="#A855F7" />
          </svg>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-primary" />
            <h3 className="text-base font-semibold text-content-main">
              Longitudinal Cross-Stream Node Network
            </h3>
          </div>
          <p className="text-xs text-content-muted max-w-xl leading-relaxed">
            Each cluster represents an observational epoch anchored by receipt density. Nodes transition from 
            early streaming exploration into domestic ledger maintenance, concluding in multi-facet digital commerce.
          </p>
        </div>

        {/* Temporal Nodes Preview */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
          {TIMELINE_ERAS.map((era, index) => (
            <div
              key={era.id}
              className="p-3 rounded-lg bg-surface-elevated/80 border border-border/80 backdrop-blur-sm space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase text-accent-primary">
                  Epoch 0{index + 1}
                </span>
                <span className="font-mono text-[11px] text-content-dim">
                  {era.years}
                </span>
              </div>
              <div className="text-xs font-semibold text-content-main">
                {era.name}
              </div>
              <p className="text-[11px] text-content-muted line-clamp-2">
                {era.narrativeFocus}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Causality Note */}
      <div className="p-3 rounded bg-surface/50 border border-border-subtle flex items-start gap-2.5 text-xs text-content-dim">
        <AlertCircle className="w-4 h-4 text-content-muted shrink-0 mt-0.5" />
        <div>
          <span className="text-content-main font-medium">Constellation Integrity:</span> {CAUSALITY_DISCLAIMER}
        </div>
      </div>
    </div>
  );
};
