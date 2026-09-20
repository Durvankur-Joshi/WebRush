import React from 'react';
import { RouteId } from '../../types/common';
import { ObservatoryView } from '../../features/observatory/ObservatoryView';
import { ExplorerView } from '../../features/explorer/ExplorerView';
import { DiscoveriesView } from '../../features/discoveries/DiscoveriesView';
import { StoryView } from '../../features/story/StoryView';

export interface RouterProps {
  currentRoute: RouteId;
  onRouteChange?: (route: RouteId) => void;
}

export const AppRouter: React.FC<RouterProps> = ({ currentRoute, onRouteChange }) => {
  switch (currentRoute) {
    case 'observatory':
      return <ObservatoryView onNavigate={onRouteChange} />;
    case 'explore':
      return <ExplorerView />;
    case 'discover':
      return <DiscoveriesView />;
    case 'story':
      return <StoryView />;
    default:
      return <ObservatoryView onNavigate={onRouteChange} />;
  }
};
