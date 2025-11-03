import React from 'react';
import { DashboardRoutes } from './RouterBuilder';

export enum LayoutType {
    clear,
    dashboard,
    landing,
    landingClear,
    landingClearNew,
}

export interface RouteStateConfig {
    path: string;
    exact?: boolean;
    layout?: LayoutType;
    protected?: boolean;
    fallbackState?: DashboardRoutes;
}

export interface RouteStateProps extends RouteStateConfig {
    name: DashboardRoutes;
}

export interface RouteState {
    state: RouteStateProps;
    element: React.ReactElement;
}

export interface CurrentRoute {
    params: { [key: string]: string | number };
    pathname: string;
    pathnameBase: string;
    route: {
        element?: React.ReactElement;
        path?: string;
    };
    state?: RouteStateProps;
}
