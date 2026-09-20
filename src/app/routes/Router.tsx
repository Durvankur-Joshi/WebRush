import React, { Suspense, lazy } from 'react';
import { RouteId } from '../../types/common';
import { ObservatoryView } from '../../features/observatory';
import { LoadingState } from '../../components/ui/LoadingState';

// Route-level code splitting for non-initial feature views
const ExplorerView = lazy(() =>
  import('../../features/explorer').then((m) => ({ default: m.ExplorerView }))
);
const DiscoveriesView = lazy(() =>
  import('../../features/discoveries').then((m) => ({ default: m.DiscoveriesView }))
);
const StoryView = lazy(() =>
  import('../../features/story').then((m) => ({ default: m.StoryView }))
);

export interface RouterProps {
  currentRoute: RouteId;
  routeParams?: Record<string, string>;
  onRouteChange?: (route: RouteId, params?: Record<string, string>) => void;
}

export const AppRouter: React.FC<RouterProps> = ({ currentRoute, routeParams, onRouteChange }) => {
  return (
    <Suspense
      fallback={
        <div className="py-16">
          <LoadingState
            message="Initializing Telemetry Module..."
            subtext="Loading feature assets offline without external dependencies."
          />
        </div>
      }
    >
      {(() => {
        switch (currentRoute) {
          case 'observatory':
            return <ObservatoryView onNavigate={onRouteChange} />;
          case 'explore':
            return <ExplorerView initialParams={routeParams} onNavigate={onRouteChange} />;
          case 'discover':
            return <DiscoveriesView onNavigate={onRouteChange} />;
          case 'story':
            return <StoryView initialParams={routeParams} onNavigate={onRouteChange} />;
          default:
            return <ObservatoryView onNavigate={onRouteChange} />;
        }
      })()}
    </Suspense>
  );
};
