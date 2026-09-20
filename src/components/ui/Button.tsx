import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 
    'inline-flex items-center justify-center font-medium transition-colors duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    'disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-[var(--radius-md)]';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 tracking-wide',
    md: 'text-sm px-3.5 py-2 gap-2 tracking-wide',
    lg: 'text-base px-5 py-2.5 gap-2.5 tracking-wide',
  };

  const variantClasses = {
    primary: 'bg-accent-primary text-background hover:bg-sky-400 active:bg-sky-500 font-semibold shadow-sm',
    secondary: 'bg-surface-elevated text-content-main hover:bg-surface-muted border border-border hover:border-border-highlight/40',
    outline: 'bg-transparent text-content-main border border-border hover:border-accent-primary hover:text-accent-primary',
    ghost: 'bg-transparent text-content-muted hover:text-content-main hover:bg-surface-elevated',
    subtle: 'bg-accent-primary-dim text-accent-primary hover:bg-sky-500/25 border border-accent-primary/20',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!isLoading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
