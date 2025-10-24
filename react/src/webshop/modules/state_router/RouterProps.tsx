import React from 'react';
import { Location } from 'react-router';

export enum LayoutType {
    clear,
    dashboard,
}

export interface RouteStateConfig {
    path: string;
    exact?: boolean;
    layout?: LayoutType;
    protected?: boolean;
    fallbackState?: string;
}

export interface RouteStateProps extends RouteStateConfig {
    name: string;
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
