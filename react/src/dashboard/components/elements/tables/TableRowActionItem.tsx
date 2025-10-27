import React, { ReactNode } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function TableRowActionItem({
    type,
    name,
    icon,
    params,
    disable,
    onClick,
    children,
}: {
    type: 'link' | 'button';
    name?: DashboardRoutes;
    icon?: 'mdi-eye';
    params?: object;
    disable?: boolean;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    children?: ReactNode | ReactNode[];
}) {
    if (type === 'link') {
        return (
            <StateNavLink name={name} params={params} className={classNames('dropdown-item', disable && 'disabled')}>
                {icon && <em className={classNames('mdi icon-start', icon)} />} {children}
            </StateNavLink>
        );
    }

    return (
        <div onClick={onClick} className={classNames('dropdown-item', disable && 'disabled')}>
            {icon && <em className={classNames('mdi icon-start', icon)} />} {children}
        </div>
    );
}
