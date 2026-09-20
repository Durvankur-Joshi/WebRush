import React from 'react';
import { Shell } from '../components/layout/Shell';
import { AppRouter } from './routes/Router';
import { useNavigation } from '../hooks/useNavigation';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export const App: React.FC = () => {
  const { currentRoute, navigate } = useNavigation('observatory');

  return (
    <ErrorBoundary>
      <Shell currentRoute={currentRoute} onRouteChange={navigate}>
        <AppRouter currentRoute={currentRoute} onRouteChange={navigate} />
      </Shell>
    </ErrorBoundary>
  );
};

export default App;
