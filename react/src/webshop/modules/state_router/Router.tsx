import { useCallback, useState } from 'react';
import { generatePath, matchRoutes, useLocation, useNavigate, createSearchParams, useHref } from 'react-router-dom';
import { CurrentRoute, RouteState } from './RouterProps';
import router from '../../router/routes';
import { NavigateOptions } from 'react-router';

const useCurrentRoute = (routes: Array<RouteState>): CurrentRoute => {
    const location = useLocation();
    const matchRoute = matchRoutes(
        routes.map((route) => ({
            path: route.state.path,
            element: route.element,
        })),
        location.pathname,
    );

    const match = matchRoute?.find((match) => match);
    const state = getRoutes().find((route) => route.state.path == match?.route?.path);

    return { ...match, state: state?.state, location };
};

export const getRoutes = (): Array<RouteState> => {
    return router.getRoutes();
};

export const getStateRouteUrl = (name: string, params = {}, query = {}): string | null => {
    const route = getRoutes().find((route) => route.state?.name == name);
    const routePath = route ? generatePath(route.state.path, params) : null;
    const routeQuery = createSearchParams(query).toString();

    if (!route) {
        console.error(`Error: route "${name}" not found!`, route);
    }

    return `${routePath}${routeQuery ? `?${routeQuery}` : ''}`;
};

export const useNavigateState = () => {
    const navigate = useNavigate();

    return useCallback(
        (name: string, params: object = null, query: object = null, options: NavigateOptions = null) => {
            navigate(getStateRouteUrl(name, params || {}, query || {}), options || {});
        },
        [navigate],
    );
};

export const useStateHref = (name: string, params = {}, query = {}) => {
    return useHref(getStateRouteUrl(name, params, query));
};

export const useStateRoutes = (): { routes: Array<RouteState>; route: CurrentRoute } => {
    const [routes] = useState(getRoutes());
    const route = useCurrentRoute(routes);

    return { routes, route };
};

export const useStateParams = function <T = { [key: string]: never }>(): T {
    return useStateRoutes()?.route?.location?.state || {};
};
