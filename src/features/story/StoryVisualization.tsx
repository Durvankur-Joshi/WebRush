import React from 'react';
import { StoryVisualizationConfig } from './storyTypes';
import { TrendingDown, TrendingUp, BarChart3 } from 'lucide-react';

export interface StoryVisualizationProps {
  config?: StoryVisualizationConfig;
  className?: string;
}

export const StoryVisualization: React.FC<StoryVisualizationProps> = ({ config, className = '' }) => {
  if (!config || config.dataPoints.length === 0) {
    return null;
  }

  const maxValue = Math.max(...config.dataPoints.map((p) => p.value), 0.001);

  return (
    <div className={`p-4 sm:p-6 rounded-xl bg-surface border border-border/80 shadow-md space-y-4 ${className}`}>
      {/* Visualization Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-content-dim uppercase font-bold tracking-wider">
            <BarChart3 className="w-3.5 h-3.5 text-accent-primary" />
            Evidentiary Visualization
          </div>
          <h4 className="text-sm sm:text-base font-bold text-content-main font-heading">
            {config.title}
          </h4>
        </div>

        {config.deltaText && (
          <div
            className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border ${
              config.deltaPositive !== undefined
                ? config.deltaPositive
                  ? 'bg-accent-emerald-dim/30 text-accent-emerald border-accent-emerald/30'
                  : 'bg-accent-primary-dim/30 text-accent-primary border-accent-primary/30'
                : 'bg-surface-elevated text-accent-primary border-border'
            }`}
          >
            {config.deltaPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : config.deltaText.includes('-') ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : null}
            <span>{config.deltaText}</span>
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="space-y-2.5 pt-1">
        {config.type === 'before-after' ? (
          // Before / After Comparison Layout
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {config.dataPoints.map((pt, idx) => {
              const isHighlight = pt.highlight;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border text-center space-y-1.5 transition-all ${
                    isHighlight
                      ? 'bg-surface-elevated border-accent-primary ring-1 ring-accent-primary/40'
                      : 'bg-surface-elevated/40 border-border/70'
                  }`}
                >
                  <span className="font-mono text-xs text-content-dim uppercase block">
                    {pt.label}
                  </span>
                  <div
                    className={`font-mono text-xl sm:text-2xl font-black ${
                      isHighlight ? 'text-accent-primary' : 'text-content-main'
                    }`}
                  >
                    {pt.value}
                    {config.unit ? config.unit : ''}
                  </div>
                  {pt.annotation && (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface border border-border text-content-muted">
                      {pt.annotation}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Horizontal Distribution / Bars Layout
          <div className="space-y-2">
            {config.dataPoints.map((pt, idx) => {
              const pct = Math.max(6, Math.min(100, Math.round((pt.value / maxValue) * 100)));
              const isHighlight = pt.highlight;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`truncate max-w-[180px] ${isHighlight ? 'text-content-main font-bold' : 'text-content-dim'}`}>
                      {pt.label}
                    </span>
                    <span className="font-bold text-content-main">
                      {config.unit === '₹'
                        ? `₹${pt.value.toLocaleString('en-IN')}`
                        : `${pt.value.toLocaleString()}${config.unit ? ` ${config.unit}` : ''}`}
                      {pt.annotation && (
                        <span className="ml-1.5 text-[10px] text-accent-primary uppercase font-bold">
                          [{pt.annotation}]
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Visual Bar with Animation */}
                  <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isHighlight
                          ? 'bg-accent-primary shadow-sm shadow-accent-primary/60'
                          : 'bg-content-dim/30'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Caption Footnote */}
      {config.caption && (
        <p className="text-[11px] font-mono text-content-dim pt-2 border-t border-border-subtle">
          * {config.caption}
        </p>
      )}
    </div>
  );
};
