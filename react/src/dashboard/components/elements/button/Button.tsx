import React, { ReactNode } from 'react';
import classNames from 'classnames';

export type ButtonType = {
    text?: string;
    content?: ReactNode | ReactNode[];
    type?: 'default' | 'primary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    dusk?: string;
    icon?: string;
    submit?: boolean;
    disabled?: boolean;
    iconEnd?: boolean;
    onClick?: (e: React.MouseEvent | React.FormEvent) => void;
    className?: string;
    disableOnClick?: boolean;
};

export function Button({
    text,
    type = 'default',
    size = null,
    content,
    dusk,
    icon,
    submit,
    disabled,
    iconEnd,
    onClick,
    className,
}: ButtonType) {
    return (
        <button
            data-dusk={dusk}
            type={submit ? 'submit' : 'button'}
            disabled={disabled}
            className={classNames(
                `button`,
                type === 'danger' && 'button-danger',
                type === 'primary' && 'button-primary',
                type === 'default' && 'button-default',
                size === 'sm' && 'button-sm',
                size === 'md' && 'button-md',
                size === 'lg' && 'button-lg',
                className || null,
            )}
            onClick={onClick}>
            {icon && !iconEnd && <em className={`mdi mdi-${icon} icon-start`} />}
            {content || text}
            {icon && iconEnd && <em className={`mdi mdi-${icon} icon-end`} />}
        </button>
    );
}
