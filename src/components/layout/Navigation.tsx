import React from 'react';
import { Compass, Search, Sparkles, BookOpen } from 'lucide-react';
import { RouteId } from '../../types/common';
import { NAVIGATION_ROUTES } from '../../lib/constants';

const ICON_MAP = {
  Compass,
  Search,
  Sparkles,
  BookOpen,
};

export interface NavigationProps {
  currentRoute: RouteId;
  onRouteChange: (route: RouteId) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  onRouteChange,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav
        aria-label="Primary Observatory Navigation"
        className="hidden md:flex items-center gap-1 border-b border-border/80 bg-surface/60 px-4 py-2"
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center gap-1">
          {NAVIGATION_ROUTES.map((route) => {
            const Icon = ICON_MAP[route.icon as keyof typeof ICON_MAP] || Compass;
            const isActive = currentRoute === route.id;

            return (
              <button
                key={route.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onRouteChange(route.id)}
                className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 relative ${
                  isActive
                    ? 'text-accent-primary bg-surface-elevated border border-accent-primary/30 shadow-sm'
                    : 'text-content-muted hover:text-content-main hover:bg-surface-elevated/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-primary' : 'text-content-dim'}`} />
                <span>{route.label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-accent-primary rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Accessible Navigation Drawer */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
          className="fixed inset-0 z-50 md:hidden bg-background/80 backdrop-blur-sm"
        >
          <div className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-surface border-l border-border p-6 shadow-observatory-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-content-dim">
                  Observatory Modules
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="text-xs font-mono px-2 py-1 rounded bg-surface-elevated text-content-muted hover:text-content-main border border-border"
                >
                  ESC / Close
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {NAVIGATION_ROUTES.map((route) => {
                  const Icon = ICON_MAP[route.icon as keyof typeof ICON_MAP] || Compass;
                  const isActive = currentRoute === route.id;

                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => {
                        onRouteChange(route.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg text-left text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent-primary-dim text-accent-primary border border-accent-primary/30'
                          : 'text-content-muted hover:text-content-main hover:bg-surface-elevated border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="font-medium">{route.label}</div>
                        <div className="text-[11px] text-content-dim mt-0.5 leading-tight">
                          {route.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border-subtle">
              <p className="text-[11px] font-mono text-content-dim">
                LIFELINE v1.0.0 // LOCAL-OFFLINE
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
