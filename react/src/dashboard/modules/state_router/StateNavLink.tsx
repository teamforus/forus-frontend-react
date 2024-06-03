import { NavLink } from 'react-router-dom';
import React, { HTMLAttributes, ReactElement } from 'react';
import { getStateRouteUrl } from './Router';

export default function StateNavLink({
    name,
    params = {},
    children,
    className,
    disabled = false,
    target,
}: HTMLAttributes<HTMLAnchorElement> & {
    name: string;
    params?: object;
    children: ReactElement | Array<ReactElement | string> | string;
    disabled?: boolean;
    target?: string;
}) {
    if (disabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <NavLink target={target} className={() => className} to={getStateRouteUrl(name, params)}>
            {children}
        </NavLink>
    );
}
