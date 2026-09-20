import React from 'react';
import { MiniChartConfig } from './discoveryTypes';
import { TrendingDown, TrendingUp, BarChart2 } from 'lucide-react';

export interface DiscoveryMiniChartProps {
  config?: MiniChartConfig;
  className?: string;
}

export const DiscoveryMiniChart: React.FC<DiscoveryMiniChartProps> = ({ config, className = '' }) => {
  if (!config || config.points.length === 0) {
    return null;
  }

  const maxValue = Math.max(...config.points.map((p) => p.value), 0.001);

  return (
    <div className={`p-3 rounded-lg bg-surface-elevated/70 border border-border/80 space-y-2.5 ${className}`}>
      {/* Optional Delta Header */}
      {config.deltaText && (
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-content-dim flex items-center gap-1">
            <BarChart2 className="w-3 h-3 text-accent-primary" /> Visual Telemetry
          </span>
          <span
            className={`font-semibold flex items-center gap-1 ${
              config.deltaPositive !== undefined
                ? config.deltaPositive
                  ? 'text-accent-emerald'
                  : 'text-accent-primary'
                : 'text-accent-primary'
            }`}
          >
            {config.deltaPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : config.deltaText.includes('-') ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {config.deltaText}
          </span>
        </div>
      )}

      {/* Mini Bar Grid */}
      <div className="space-y-1.5 pt-1">
        {config.points.map((pt, idx) => {
          const pct = Math.max(8, Math.min(100, Math.round((pt.value / maxValue) * 100)));

          return (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span
                  className={`truncate max-w-[120px] ${
                    pt.highlight ? 'text-content-main font-bold' : 'text-content-dim'
                  }`}
                >
                  {pt.label}
                </span>
                <span className="font-semibold text-content-main">
                  {typeof pt.value === 'number'
                    ? config.unit === '₹'
                      ? `₹${pt.value.toLocaleString('en-IN')}`
                      : `${pt.value.toLocaleString()}${config.unit ? `${config.unit}` : ''}`
                    : pt.value}
                  {pt.annotation && (
                    <span className="ml-1 text-[9px] text-accent-primary uppercase font-bold">
                      [{pt.annotation}]
                    </span>
                  )}
                </span>
              </div>

              {/* Bar track */}
              <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pt.highlight
                      ? 'bg-accent-primary shadow-sm shadow-accent-primary/50'
                      : 'bg-content-dim/30'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
