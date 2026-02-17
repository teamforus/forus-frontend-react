import classNames from 'classnames';
import React, { ReactNode } from 'react';

export type LabelType = 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'light' | 'default-outline';

export default function Label({
    children,
    type,
    className,
    dusk,
    round = false,
    nowrap = false,
    size,
}: {
    children?: ReactNode | ReactNode[];
    type?: LabelType;
    className?: string;
    dusk?: string;
    round?: boolean;
    nowrap?: boolean;
    size?: 'sm' | 'xl';
}) {
    return (
        <div
            data-dusk={dusk}
            className={classNames(
                'label',
                type === 'success' && 'label-success',
                type === 'warning' && 'label-warning',
                type === 'danger' && 'label-danger',
                type === 'default' && 'label-default',
                type === 'primary' && 'label-primary',
                type === 'light' && 'label-light',
                type === 'default-outline' && 'label-default-outline',
                round && 'label-round',
                nowrap && 'nowrap',
                size === 'sm' && 'label-sm',
                size === 'xl' && 'label-xl',
                className,
            )}>
            {children}
        </div>
    );
}
