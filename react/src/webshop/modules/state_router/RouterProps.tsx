import React from 'react';
import { Location } from 'react-router';
import { WebshopRoutes } from './RouterBuilder';

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
    fallbackState?: WebshopRoutes;
}

export interface RouteStateProps extends RouteStateConfig {
    name: WebshopRoutes;
}

export interface RouteState {
    state: RouteStateProps;
    element: React.ReactElement;
}

export interface CurrentRoute {
    params: { [key: string]: string | number };
    pathname: string;
    pathnameBase: string;
    location?: Location;
    route: {
        element?: React.ReactElement;
        path?: string;
    };
    state?: RouteStateProps;
}
