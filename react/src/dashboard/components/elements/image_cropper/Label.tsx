import React, { ReactNode } from 'react';
import classNames from 'classnames';

export type LabelType =
    | 'success'
    | 'warning'
    | 'danger'
    | 'default'
    | 'text'
    | 'primary'
    | 'danger_light'
    | 'primary_light';

export default function Label({
    children,
    type,
    dusk,
    className,
    disabled = false,
}: {
    children: ReactNode | ReactNode[];
    type: LabelType;
    dusk?: string;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <div
            data-dusk={dusk}
            className={classNames(
                'label',
                type === 'text' && 'label-text',
                type === 'danger' && 'label-danger',
                type === 'default' && 'label-default',
                type === 'warning' && 'label-warning',
                type === 'primary' && 'label-primary',
                type === 'success' && 'label-success',
                type === 'danger_light' && 'label-danger-light',
                type === 'primary_light' && 'label-primary-light',
                disabled && 'disabled',
                className,
            )}>
            {children}
        </div>
    );
}
