import classNames from 'classnames';
import React, { ReactNode } from 'react';

export type LabelType =
    | 'success'
    | 'warning'
    | 'danger'
    | 'danger-light'
    | 'default'
    | 'text'
    | 'primary'
    | 'primary-light';

export default function Label({
    children,
    type,
    className,
    dusk,
    icon,
    iconPosition = 'start',
    iconOnClick,
    nowrap,
}: {
    children?: ReactNode | ReactNode[];
    type?: LabelType;
    className?: string;
    dusk?: string;
    icon?: string;
    iconPosition?: 'start' | 'end' | 'close';
    iconOnClick?: React.MouseEventHandler<HTMLElement>;
    nowrap?: boolean;
}) {
    const iconClassName = classNames(
        iconPosition === 'close' ? 'label-close' : iconPosition === 'end' ? 'icon-end' : 'icon-start',
    );

    const iconElement = icon ? (
        <em className={classNames('mdi', `mdi-${icon}`, iconClassName)} onClick={iconOnClick} />
    ) : null;

    return (
        <div
            data-dusk={dusk}
            className={classNames(
                'label',
                type === 'success' && 'label-success',
                type === 'warning' && 'label-warning',
                type === 'danger' && 'label-danger',
                type === 'danger-light' && 'label-danger-light',
                type === 'default' && 'label-default',
                type === 'text' && 'label-text',
                type === 'primary' && 'label-primary',
                type === 'primary-light' && 'label-primary-light',
                nowrap && 'nowrap',
                className,
            )}>
            {iconPosition === 'start' && iconElement}
            {children}
            {iconPosition !== 'start' && iconElement}
        </div>
    );
}
