import React from 'react';
import { StreamCoverageItem } from './viewModel';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Badge } from '../../components/ui/Badge';
import { Layers, Headphones, Wallet, CreditCard, Shield } from 'lucide-react';

export interface DataCoverageProps {
  coverage: StreamCoverageItem[];
}

export const DataCoverage: React.FC<DataCoverageProps> = ({ coverage }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'music':
        return <Headphones className="w-4 h-4 text-accent-primary" />;
      case 'household':
        return <Wallet className="w-4 h-4 text-accent-emerald" />;
      case 'transactions':
        return <CreditCard className="w-4 h-4 text-accent-secondary" />;
      default:
        return <Layers className="w-4 h-4 text-accent-primary" />;
    }
  };

  return (
    <section id="observatory-coverage" className="space-y-6 pt-4">
      <SectionHeader
        tag="COVERAGE // MULTI-STREAM SPECTRUM"
        title="Data Coverage"
        description="Three distinct receipt streams recorded across twelve years, capturing acoustic routines, domestic sustenance, and digital card commerce."
        level="h2"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coverage.map((item) => (
          <div
            key={item.id}
            className="relative rounded-lg border border-border/70 bg-surface/40 backdrop-blur-sm p-5 space-y-4 hover:border-border transition-all group overflow-hidden"
          >
            {/* Top Color Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-1 transition-all group-hover:h-1.5"
              style={{ backgroundColor: item.accentColor }}
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-surface border border-border/80">
                  {getIcon(item.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-content-main tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-content-muted font-mono">
                    {item.subtitle}
                  </p>
                </div>
              </div>
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                {item.dateRange}
              </Badge>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 gap-2 py-2 border-y border-border-subtle text-xs">
              <div>
                <span className="text-[10px] text-content-dim font-mono block">Receipt Volume</span>
                <span className="font-mono font-bold text-content-main text-sm">
                  {item.recordCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-content-dim font-mono block">{item.keyMetricLabel}</span>
                <span className="font-mono font-bold text-sm" style={{ color: item.accentColor }}>
                  {item.keyMetricValue}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-content-muted leading-relaxed">
              {item.description}
            </p>

            {/* Stream badge */}
            <div className="flex items-center justify-between text-[11px] text-content-dim pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: item.accentColor }}
                />
                {item.badge}
              </span>
              <span>{item.rawRecordCount.toLocaleString()} rows</span>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset Reality Note */}
      <div className="p-3 rounded border border-border-subtle bg-surface/20 flex items-start gap-2.5 text-xs text-content-dim">
        <Shield className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
        <span>
          <strong className="text-content-muted">Data Reality Note:</strong>{' '}
          These streams originate from real-world datasets spanning distinct observation periods.
          They are analyzed independently and compared chronologically without implying continuous single-individual identity.
        </span>
      </div>
    </section>
  );
};
