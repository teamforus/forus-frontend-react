import React from 'react';
import { LayoutType, RouteState, RouteStateConfig } from './RouterProps';

export default class RouterBuilder {
    constructor(protected states: Array<RouteState> = []) {}

    state(name: string, element: React.ReactElement, state: RouteStateConfig & { altPath?: string | Array<string> }) {
        const altPaths: Array<string> = state.altPath
            ? Array.isArray(state.altPath)
                ? state.altPath
                : [state.altPath]
            : [];

        this.states.push({
            state: { name, layout: LayoutType.dashboard, protected: true, ...state },
            element: element,
        });

        altPaths.forEach((path) => {
            this.states.push({
                state: { name, layout: LayoutType.dashboard, protected: true, ...{ ...state, path } },
                element: element,
            });
        });
    }

    getRoutes() {
        return this.states;
    }
}
