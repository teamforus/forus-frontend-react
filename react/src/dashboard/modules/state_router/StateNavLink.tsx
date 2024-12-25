import { NavLink } from 'react-router-dom';
import React, { HTMLAttributes, ReactElement } from 'react';
import { getStateRouteUrl, useNavigateState } from './Router';

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
    stopPropagation = true,
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
    stopPropagation?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
    const navigateState = useNavigateState();

    if (disabled) {
        return customElement ? (
            React.createElement(customElement, { className, 'data-dusk': dataDusk, tabIndex }, children)
        ) : (
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
                onClick: (e) => {
                    if (stopPropagation) {
                        e.stopPropagation();
                    }

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
            onClick={(e) => {
                if (stopPropagation) {
                    e.stopPropagation();
                }

                onClick?.(e);
            }}
            onKeyDown={onKeyDown}
            end={activeExact}
            tabIndex={tabIndex}
            className={({ isActive, isPending }) =>
                ['state-nav-link', className, isPending ? 'pending' : '', isActive ? activeClass : ''].join(' ')
            }
            state={state}
            to={getStateRouteUrl(name, params, query)}>
            {children}
        </NavLink>
    );
}
