import { classList } from '../../../helpers/utils';
import React from 'react';

export type ModalButton = {
    text?: string;
    type?: string;
    icon?: string;
    iconEnd?: boolean;
    onClick: (e) => void;
    className?: string;
};

export function ModalButton({
    submit,
    button,
    type,
    text,
}: {
    submit?: boolean;
    button: ModalButton;
    type: string;
    text: string;
}) {
    return (
        <button
            type={submit ? 'submit' : 'button'}
            className={classList([`button`, `button-${button.type || type}`, button.className || null])}
            onClick={button.onClick}>
            {button.icon && !button.iconEnd && <em className={`mdi mdi-${button.icon} icon-start`} />}
            {button.text || text}
            {button.icon && button.iconEnd && <em className={`mdi mdi-${button.icon} icon-end`} />}
        </button>
    );
}
