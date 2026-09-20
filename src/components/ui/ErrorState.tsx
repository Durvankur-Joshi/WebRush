import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Telemetry Processing Error',
  message = 'An unexpected failure occurred while computing analytical structures.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[var(--radius-lg)] border border-rose-500/30 bg-rose-950/10 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
        <AlertTriangle className="w-5 h-5" />
      </div>

      <h4 className="text-base font-semibold text-content-main mb-1.5">{title}</h4>
      <p className="text-sm text-content-muted max-w-sm mb-6 leading-relaxed font-mono">
        {message}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Retry Telemetry Ingestion
        </Button>
      )}
    </div>
  );
};
