import React, { MouseEventHandler } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export interface IdentityMenuGroupItemProps {
    id?: string;
    name?: string;
    state?: DashboardRoutes;
    href?: string;
    stateParams?: object;
    dusk?: string;
    show?: boolean;
    target?: '_blank' | 'self';
    rel?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function LayoutAsideNavGroupItem({
    id = null,
    name,
    dusk,
    state,
    href,
    target,
    stateParams,
    onClick,
}: IdentityMenuGroupItemProps) {
    if (!state) {
        return (
            <a
                id={id}
                target={target}
                href={href}
                data-dusk={dusk}
                onClick={onClick}
                className="sidebar-nav-group-item">
                {name}
            </a>
        );
    }

    return (
        <StateNavLink
            id={id}
            name={state}
            params={stateParams}
            target={target}
            dataDusk={dusk}
            onClick={onClick}
            className="sidebar-nav-group-item">
            {name}
        </StateNavLink>
    );
}
