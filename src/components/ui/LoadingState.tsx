import React from 'react';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Aggregating Observatory Telemetry...',
  subtext = 'Processing analytical structures offline with zero external network overhead.',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-[var(--radius-lg)] border border-border-subtle bg-surface/30 ${className}`}>
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
        {/* Orbital rings */}
        <div className="absolute inset-0 rounded-full border border-accent-primary/20 animate-ping opacity-25" />
        <div className="w-12 h-12 rounded-full border-2 border-t-accent-primary border-r-transparent border-b-accent-primary/30 border-l-transparent animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
      </div>

      <div className="font-mono text-sm text-content-main font-medium tracking-wide mb-1">
        {message}
      </div>
      <div className="text-xs text-content-muted max-w-sm">
        {subtext}
      </div>
    </div>
  );
};
