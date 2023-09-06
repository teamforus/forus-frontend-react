import { NavLink } from 'react-router-dom';
import React, { HTMLAttributes, ReactElement } from 'react';
import { getStateRouteUrl } from './Router';

export default function StateNavLink({
    name,
    params,
    children,
    className,
}: HTMLAttributes<HTMLAnchorElement> & {
    name: string;
    params: object;
    children: ReactElement | Array<ReactElement> | string;
}) {
    return (
        <NavLink className={() => className} to={getStateRouteUrl(name, params)}>
            {children}
        </NavLink>
    );
}
