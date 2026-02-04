import React, { useState } from 'react';
import ButtonType, { ButtonVariant } from '../../../../props/elements/ButtonType';
import classNames from 'classnames';

export type ModalButton = ButtonType;

export function ModalButton({
    submit,
    button,
    type,
    text,
    dusk = null,
    disabled = false,
}: {
    submit?: boolean;
    button: ModalButton;
    type: ButtonVariant;
    text: string;
    dusk?: string;
    disabled?: boolean;
}) {
    const [disabledByClick, setDisabledByClick] = useState(false);
    const resolvedType = button.type || type;

    return (
        <button
            data-dusk={dusk}
            type={submit ? 'submit' : 'button'}
            disabled={disabled || disabledByClick}
            className={classNames(
                'button',
                resolvedType === 'default' && 'button-default',
                resolvedType === 'primary' && 'button-primary',
                resolvedType === 'primary-outline' && 'button-primary-outline',
                resolvedType === 'primary-light' && 'button-primary-light',
                resolvedType === 'primary-variant' && 'button-primary-variant',
                resolvedType === 'secondary' && 'button-secondary',
                resolvedType === 'danger' && 'button-danger',
                resolvedType === 'text' && 'button-text',
                resolvedType === 'text-primary' && 'button-text-primary',
                resolvedType === 'text-padless' && 'button-text-padless',
                resolvedType === 'dashed' && 'button-dashed',
                resolvedType === 'default-dashed' && 'button-default-dashed',
                button.className || null,
            )}
            onClick={(e) => {
                if (button.disableOnClick === true) {
                    setDisabledByClick(true);
                }

                button.onClick(e, setDisabledByClick);
            }}>
            {button.icon && !button.iconEnd && <em className={`mdi mdi-${button.icon} icon-start`} />}
            {button.text || text}
            {button.icon && button.iconEnd && <em className={`mdi mdi-${button.icon} icon-end`} />}
        </button>
    );
}
