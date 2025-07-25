import { NavLink } from 'react-router';
import React, { HTMLAttributes, ReactElement } from 'react';
import { getStateRouteUrl, useNavigateState } from './Router';
import classNames from 'classnames';

export default function StateNavLink({
    name,
    dataDusk = null,
    params = {},
    query = {},
    state = {},
    children,
    className,
    disabled = false,
    target,
    activeClass = 'active',
    activeExact = false,
    customElement = null,
    onClick = null,
    onKeyDown = null,
    tabIndex = null,
    dataAttributes = null,
}: HTMLAttributes<HTMLAnchorElement> & {
    name: string;
    dataDusk?: string;
    params?: object;
    query?: object;
    state?: object;
    children: ReactElement | Array<ReactElement | string> | string;
    disabled?: boolean;
    target?: string;
    activeClass?: string;
    activeExact?: boolean;
    customElement?: string;
    tabIndex?: number;
    onClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    dataAttributes?: object;
}) {
    const navigateState = useNavigateState();

    if (disabled) {
        return (
            <div data-dusk={dataDusk} className={className}>
                {children}
            </div>
        );
    }

    if (customElement) {
        return React.createElement(
            customElement,
            {
                className,
                'data-dusk': dataDusk,
                tabIndex,
                style: { cursor: 'pointer' },
                onKeyDown: onKeyDown,
                ...{ dataAttributes },
                onClick: (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClick?.(e);
                    navigateState(name, params, query, { state });
                },
            },
            children,
        );
    }

    return (
        <NavLink
            target={target}
            data-dusk={dataDusk}
            onClick={onClick}
            onKeyDown={onKeyDown}
            end={activeExact}
            tabIndex={tabIndex}
            className={({ isActive, isPending }) => {
                return classNames('state-nav-link', className, isPending && 'pending', isActive && activeClass);
            }}
            state={state}
            to={getStateRouteUrl(name, params, query)}
            {...dataAttributes}>
            {children}
        </NavLink>
    );
}
