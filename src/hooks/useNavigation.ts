import { useState, useEffect, useCallback } from 'react';
import { RouteId } from '../types/common';

const VALID_ROUTES: RouteId[] = ['observatory', 'explore', 'discover', 'story'];

function parseHash(rawHash: string): { route: RouteId; params: Record<string, string> } {
  const clean = rawHash.replace(/^#\/?/, '').trim();
  const [routePart, queryPart] = clean.split('?');
  const route = VALID_ROUTES.includes(routePart?.toLowerCase() as RouteId)
    ? (routePart?.toLowerCase() as RouteId)
    : 'observatory';

  const params: Record<string, string> = {};
  if (queryPart) {
    const sp = new URLSearchParams(queryPart);
    sp.forEach((value, key) => {
      params[key] = value;
    });
  }

  return { route, params };
}

export function useNavigation(defaultRoute: RouteId = 'observatory') {
  const [navState, setNavState] = useState(() => {
    if (typeof window === 'undefined') return { route: defaultRoute, params: {} };
    return parseHash(window.location.hash);
  });

  useEffect(() => {
    const handleHashChange = () => {
      setNavState(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((route: RouteId, params?: Record<string, string>) => {
    let hash = `#${route}`;
    if (params && Object.keys(params).length > 0) {
      const sp = new URLSearchParams(params);
      hash += `?${sp.toString()}`;
    }
    window.location.hash = hash;
    setNavState({ route, params: params || {} });
  }, []);

  return {
    currentRoute: navState.route,
    routeParams: navState.params,
    navigate,
  };
}
