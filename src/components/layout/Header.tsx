import React from 'react';
import { Radio, Menu, X, Orbit } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, DATASET_METADATA } from '../../lib/constants';
import { Badge } from '../ui/Badge';

export interface HeaderProps {
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Observatory Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-accent-primary shadow-glow-primary">
            <Orbit className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base tracking-widest text-content-main uppercase">
                {APP_NAME}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-accent-emerald-dim text-accent-emerald border border-accent-emerald/30">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Observatory Ready
              </span>
            </div>
            <p className="text-xs text-content-dim font-medium tracking-wide">
              {APP_TAGLINE}
            </p>
          </div>
        </div>

        {/* Dataset telemetry tags (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          {Object.values(DATASET_METADATA).map((meta) => (
            <Badge key={meta.id} variant="outline" size="sm" className="bg-surface/60">
              <span
                className="w-1.5 h-1.5 rounded-full mr-1.5"
                style={{ backgroundColor: meta.accentColor }}
                aria-hidden="true"
              />
              <span className="text-content-muted">{meta.name.split(' ')[0]}:</span>
              <span className="ml-1 text-content-main font-mono">{meta.timeRange}</span>
            </Badge>
          ))}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 rounded-md text-content-muted hover:text-content-main hover:bg-surface-elevated border border-border focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
