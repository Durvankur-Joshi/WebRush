import { useState, useEffect, useCallback } from 'react';
import { RouteId } from '../types/common';

const VALID_ROUTES: RouteId[] = ['observatory', 'explore', 'discover', 'story'];

export function useNavigation(defaultRoute: RouteId = 'observatory') {
  const getInitialRoute = (): RouteId => {
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (VALID_ROUTES.includes(hash as RouteId)) {
      return hash as RouteId;
    }
    return defaultRoute;
  };

  const [currentRoute, setCurrentRoute] = useState<RouteId>(getInitialRoute);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (VALID_ROUTES.includes(hash as RouteId)) {
        setCurrentRoute(hash as RouteId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((route: RouteId) => {
    window.location.hash = `#${route}`;
    setCurrentRoute(route);
  }, []);

  return {
    currentRoute,
    navigate,
  };
}
