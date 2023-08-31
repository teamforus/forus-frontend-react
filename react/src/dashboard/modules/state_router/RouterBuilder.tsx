import React from 'react';
import { LayoutType, RouteState, RouteStateConfig } from './RouterProps';

export default class RouterBuilder {
    constructor(protected states: Array<RouteState> = []) {}

    state(name: string, element: React.ReactElement, state: RouteStateConfig) {
        this.states.push({
            state: { name, layout: LayoutType.dashboard, protected: true, ...state },
            element: element,
        });
    }

    getRoutes() {
        return this.states;
    }
}
