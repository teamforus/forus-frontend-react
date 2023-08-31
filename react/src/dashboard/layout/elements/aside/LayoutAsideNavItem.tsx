import { MouseEventHandler } from 'react';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { NavLink } from 'react-router-dom';
import React from 'react';

interface IdentityMenuItemProps {
    id?: string;
    name: string;
    icon: string;
    route: string;
    show: boolean;
    target?: string;
    routeParams: object;
    dusk?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function LayoutAsideNavItem({
    id,
    name,
    show,
    icon,
    dusk,
    route,
    routeParams,
    onClick,
    target,
}: IdentityMenuItemProps) {
    const to = getStateRouteUrl(route, routeParams);

    return (
        show && (
            <NavLink
                id={id}
                onClick={onClick}
                to={to || '/'}
                data-dusk={dusk}
                target={target}
                className="sidebar-nav-item">
                <div className="sidebar-nav-item-arrow">
                    <div className="mdi mdi-menu-right"></div>
                </div>

                <div className="sidebar-nav-item-icon">
                    <img src={`./assets/img/menu/icon-${icon}.svg`} alt="Item" />
                    <img src={`./assets/img/menu/icon-${icon}-hover.svg`} alt="Item" className={'hover'} />
                    <img src={`./assets/img/menu/icon-${icon}-active.svg`} alt="Item" className={'active'} />
                </div>
                {name}
            </NavLink>
        )
    );
}
