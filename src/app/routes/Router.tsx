import React from 'react';
import { RouteId } from '../../types/common';
import { ObservatoryView } from '../../features/observatory/ObservatoryView';
import { ExplorerView } from '../../features/explorer/ExplorerView';
import { DiscoveriesView } from '../../features/discoveries/DiscoveriesView';
import { StoryView } from '../../features/story/StoryView';

export interface RouterProps {
  currentRoute: RouteId;
  routeParams?: Record<string, string>;
  onRouteChange?: (route: RouteId, params?: Record<string, string>) => void;
}

export const AppRouter: React.FC<RouterProps> = ({ currentRoute, routeParams, onRouteChange }) => {
  switch (currentRoute) {
    case 'observatory':
      return <ObservatoryView onNavigate={onRouteChange} />;
    case 'explore':
      return <ExplorerView initialParams={routeParams} onNavigate={onRouteChange} />;
    case 'discover':
      return <DiscoveriesView onNavigate={onRouteChange} />;
    case 'story':
      return <StoryView />;
    default:
      return <ObservatoryView onNavigate={onRouteChange} />;
  }
};
