import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-mono font-medium uppercase tracking-wider rounded-[var(--radius-sm)] border';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantClasses = {
    default: 'bg-surface-elevated text-content-muted border-border/80',
    primary: 'bg-accent-primary-dim text-accent-primary border-accent-primary/30',
    secondary: 'bg-accent-secondary-dim text-accent-secondary border-accent-secondary/30',
    success: 'bg-accent-emerald-dim text-accent-emerald border-accent-emerald/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    outline: 'bg-transparent text-content-main border-border',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
