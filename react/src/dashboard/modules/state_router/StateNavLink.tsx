import { NavLink, useHref } from 'react-router';
import React, { HTMLAttributes, ReactElement } from 'react';
import { getSafeStateRouteUrl, getStateRouteUrl, useNavigateState } from './Router';
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
    const href = useHref(getSafeStateRouteUrl(name, params, query));

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
                    e.preventDefault();

                    if (stopPropagation) {
                        e.stopPropagation();
                    }

                    onClick?.(e);

                    // Detect if Ctrl/Cmd or middle mouse button pressed
                    if (e.metaKey || e.ctrlKey || e.button === 1) {
                        window.open(href, '_blank');
                    } else {
                        navigateState(name, params, query, { state });
                    }
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
            className={({ isActive, isPending }) => {
                return classNames('state-nav-link', className, isPending && 'pending', isActive && activeClass);
            }}
            state={state}
            to={getStateRouteUrl(name, params, query)}>
            {children}
        </NavLink>
    );
}
