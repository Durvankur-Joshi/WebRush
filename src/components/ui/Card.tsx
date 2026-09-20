import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-[var(--radius-lg)] transition-all duration-200';

  const variantClasses = {
    default: 'bg-surface border border-border/80 shadow-observatory-sm',
    elevated: 'bg-surface-elevated border border-border shadow-observatory-md',
    subtle: 'bg-surface/50 border border-border-subtle',
    interactive: 'bg-surface border border-border/80 hover:border-border-highlight/50 hover:bg-surface-elevated cursor-pointer shadow-observatory-sm hover:shadow-observatory-md',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-content-main tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-content-muted mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
