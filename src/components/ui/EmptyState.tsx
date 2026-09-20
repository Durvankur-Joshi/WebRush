import React from 'react';
import { Database } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Observation Data',
  description = 'No telemetry matches the selected filter parameters.',
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/40 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-content-dim mb-4">
        {icon || <Database className="w-5 h-5" />}
      </div>
      <h4 className="text-base font-semibold text-content-main mb-1.5">{title}</h4>
      <p className="text-sm text-content-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
