import { ReactNode, useEffect, useMemo, useState } from 'react';
import React from 'react';
import LayoutAsideNavGroupItem, { IdentityMenuGroupItemProps } from './LayoutAsideNavGroupItem';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { getStateRouteUrl, useStateRoutes } from '../../../../modules/state_router/Router';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

const isSubPath = (basePath: string, path: string) => {
    const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return normalizedPath.startsWith(normalizedBasePath);
};

export default function LayoutAsideNavGroup({
    id,
    icon,
    iconActive = null,
    dusk,
    name,
    state,
    stateParams,
    items,
    show = true,
    pinnedGroups,
    setPinnedGroups,
}: {
    id: string;
    name: string;
    icon: ReactNode;
    iconActive?: ReactNode;
    dusk?: string;
    state?: DashboardRoutes;
    stateParams?: object;
    show?: boolean;
    pinnedGroups: Array<string>;
    setPinnedGroups: React.Dispatch<React.SetStateAction<Array<string>>>;
    items?: Array<IdentityMenuGroupItemProps>;
}) {
    const { route: activeRoute } = useStateRoutes();
    const [closed, setClosed] = useState(false);

    const activeItems = useMemo(() => {
        return items?.filter((item) => item.show);
    }, [items]);

    const groupState = useMemo(() => {
        if (state && show) {
            return { state, stateParams };
        }

        return activeItems?.[0] ? { state: activeItems[0].state, stateParams: activeItems[0].stateParams } : null;
    }, [show, state, stateParams, activeItems]);

    const isActive = useMemo(() => {
        const activeState = activeRoute?.state?.name;

        if (activeState === state || items?.some((item) => item.state === activeState)) {
            return true;
        }

        if (
            groupState?.state &&
            isSubPath(getStateRouteUrl(groupState.state, groupState.stateParams), activeRoute?.pathname)
        ) {
            return true;
        }

        return items?.some(
            (item) => item.state && isSubPath(getStateRouteUrl(item.state, item.stateParams), activeRoute?.pathname),
        );
    }, [activeRoute?.state?.name, state, items, groupState, activeRoute?.pathname]);

    const isOpen = useMemo(() => {
        return (isActive || pinnedGroups.includes(id)) && !closed;
    }, [id, isActive, pinnedGroups, closed]);

    const hasItems = useMemo(() => {
        return activeItems?.length > 0;
    }, [activeItems?.length]);

    useEffect(() => {
        if (!isActive) {
            setClosed(false);
        }
    }, [isActive]);

    if (!groupState?.state) {
        return null;
    }

    return (
        <div id={id} className={classNames('sidebar-nav-group', isActive && 'sidebar-nav-group-active')}>
            <StateNavLink
                className="sidebar-nav-group-header"
                name={groupState.state}
                params={groupState.stateParams}
                dataDusk={dusk}>
                <div className="sidebar-nav-group-header-icon">
                    <div className="sidebar-nav-group-header-icon-default">{icon}</div>
                    <div className="sidebar-nav-group-header-icon-active">{iconActive}</div>
                </div>
                <div className="sidebar-nav-group-header-title">{name}</div>
                <div
                    className="sidebar-nav-group-header-toggle"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (isActive) {
                            if (!closed) {
                                setPinnedGroups((pinnedGroups) => {
                                    return pinnedGroups.filter((group) => group !== id);
                                });
                            }

                            setClosed(!closed);
                        } else {
                            setPinnedGroups((pinnedGroups) => {
                                return pinnedGroups.includes(id)
                                    ? pinnedGroups.filter((group) => group !== id)
                                    : [...pinnedGroups, id];
                            });
                        }
                    }}>
                    {hasItems && (
                        <em className={classNames('mdi', classNames(isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'))} />
                    )}
                </div>
            </StateNavLink>

            {hasItems && isOpen && (
                <div className="sidebar-nav-group-items">
                    {activeItems?.map((item, index) => (
                        <LayoutAsideNavGroupItem
                            key={index}
                            id={item.id}
                            name={item.name}
                            state={item.state}
                            href={item.href}
                            stateParams={item.stateParams}
                            dusk={item.dusk}
                            show={item.show}
                            target={item.target}
                            rel={item.rel}
                            onClick={item.onClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
