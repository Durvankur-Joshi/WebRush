import React from 'react';

export interface SectionHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  level?: 'h1' | 'h2' | 'h3';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  tag,
  title,
  description,
  action,
  level = 'h2',
  className = '',
}) => {
  const HeadingTag = level;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border/60 ${className}`}>
      <div>
        {tag && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent-primary font-semibold">
              {tag}
            </span>
          </div>
        )}
        <HeadingTag className={`font-bold tracking-tight text-content-main ${
          level === 'h1' ? 'text-2xl sm:text-3xl' : level === 'h2' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
        }`}>
          {title}
        </HeadingTag>
        {description && (
          <p className="text-sm text-content-muted mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
};
