import React from 'react';

export interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  change?: {
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
  };
  accentColor?: string;
  className?: string;
}

export const Metric: React.FC<MetricProps> = ({
  label,
  value,
  unit,
  subtext,
  change,
  accentColor,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-[var(--radius-lg)] bg-surface border border-border/80 hover:border-border transition-colors ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-content-dim font-medium">
          {label}
        </span>
        {accentColor && (
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-content-main tabular-nums font-mono-code">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-content-muted font-medium">
            {unit}
          </span>
        )}
      </div>

      {(subtext || change) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-subtle text-xs text-content-muted">
          {change && (
            <span
              className={`font-mono font-medium ${
                change.trend === 'up'
                  ? 'text-accent-emerald'
                  : change.trend === 'down'
                  ? 'text-rose-400'
                  : 'text-content-muted'
              }`}
            >
              {change.trend === 'up' ? '▲ ' : change.trend === 'down' ? '▼ ' : ''}
              {change.value}
            </span>
          )}
          {subtext && <span className="truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
