import React, { useState } from 'react';
import { RouteId } from '../../types/common';
import { CAUSALITY_DISCLAIMER } from '../../lib/constants';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export interface ShellProps {
  currentRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({
  currentRoute,
  onRouteChange,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-content-main relative">
      {/* Subtle cosmic grid background */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #38BDF8 1px, transparent 1px), linear-gradient(to bottom, #38BDF8 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} 
      />

      {/* Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Navigation */}
      <Navigation
        currentRoute={currentRoute}
        onRouteChange={onRouteChange}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Responsive Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Status Footer */}
      <footer className="border-t border-border/60 bg-surface/40 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-content-dim">
              Evidentiary Core Offline Active
            </span>
          </div>

          <p className="text-center sm:text-right max-w-2xl text-[11px] leading-relaxed text-content-dim font-sans">
            {CAUSALITY_DISCLAIMER}
          </p>
        </div>
      </footer>
    </div>
  );
};
