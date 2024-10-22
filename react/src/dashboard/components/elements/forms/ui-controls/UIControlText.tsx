import React, { useCallback, useRef, useState } from 'react';
import useCustomInputValidationMessage, {
    InputValidationTexts,
} from '../../../../hooks/useCustomInputValidationMessage';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../helpers/wcag';

export default function UIControlText({
    id = '',
    name = '',
    value = '',
    type = 'text',
    className = '',
    placeholder = '',
    disabled = false,
    ariaLabel = '',
    onChange = null,
    onChangeValue = null,
    inputRef = null,
    tabIndex = 0,
    autoFocus = false,
    dataDusk = null,
    rows = 5,
    validationMessages = null,
    required = false,
}: {
    id?: string;
    name?: string;
    value?: string;
    type?: 'text' | 'email' | 'textarea';
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeValue?: (value: string) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
    tabIndex?: number;
    autoFocus?: boolean;
    dataDusk?: string;
    rows?: number;
    validationMessages?: InputValidationTexts;
    required?: boolean;
}) {
    const innerInputRef = useRef<HTMLInputElement>(null);
    const customInputValidationMessage = useCustomInputValidationMessage();

    const [showClear, setShowClear] = useState(false);

    const reset = useCallback(() => {
        const input = (inputRef || innerInputRef).current;

        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, '');
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, [inputRef]);

    return (
        <div
            onFocus={() => setShowClear(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowClear(false);
                }
            }}
            className={`ui-control ui-control-text  ${className}`}
            aria-label={ariaLabel}>
            {React.createElement(type === 'textarea' ? 'textarea' : 'input', {
                ref: inputRef || innerInputRef,
                className: 'form-control',
                type: ['number', 'currency'].includes(type) ? 'number' : type == 'email' ? 'email' : 'text',
                id: id,
                name: name,
                onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
                    onChange?.(e);
                    onChangeValue?.(e?.target?.value);
                    customInputValidationMessage?.(e?.target, validationMessages);
                },
                onInvalid: (e: React.FormEvent<HTMLInputElement & HTMLTextAreaElement>) => {
                    customInputValidationMessage?.(e?.currentTarget, validationMessages);
                },
                placeholder: placeholder,
                disabled: disabled,
                value: value,
                tabIndex: tabIndex,
                autoFocus: autoFocus,
                rows: rows,
                required: required,
                'data-dusk': dataDusk,
            })}

            {(inputRef || innerInputRef).current?.value !== '' && type !== 'textarea' && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();

                        reset();
                    }}
                    onKeyDown={clickOnKeyEnter}
                    className={classNames('ui-control-clear', showClear && 'ui-control-clear-visible')}
                    aria-label="Annuleren"
                    role={'button'}
                    tabIndex={tabIndex}>
                    <em className="mdi mdi-close-circle" />
                </div>
            )}
        </div>
    );
}
