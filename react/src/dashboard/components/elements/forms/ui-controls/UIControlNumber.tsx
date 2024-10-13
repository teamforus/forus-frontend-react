import React, { useCallback, useRef, useState } from 'react';
import useCustomInputValidationMessage, {
    InputValidationTexts,
} from '../../../../hooks/useCustomInputValidationMessage';
import classNames from 'classnames';
import { clickOnKeyEnter } from '../../../../helpers/wcag';

export default function UIControlNumber({
    id = '',
    name = '',
    value = null,
    type = 'number',
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
    min = null,
    max = null,
    step = 0.01,
    precision = 2,
    validationMessages = null,
}: {
    id?: string;
    name?: string;
    value?: number;
    type?: 'number' | 'currency';
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    ariaLabel?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeValue?: (value: number) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
    tabIndex?: number;
    autoFocus?: boolean;
    dataDusk?: string;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    validationMessages?: InputValidationTexts;
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
            className={`ui-control ui-control-text ${type === 'currency' ? 'ui-control-currency' : ''} ${className}`}
            aria-label={ariaLabel}>
            {type === 'currency' && <div className="ui-control-currency-icon">€</div>}

            <input
                ref={inputRef || innerInputRef}
                className={'form-control'}
                type={'number'}
                id={id}
                step={step}
                name={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
                    onChange?.(e);
                    onChangeValue?.(parseFloat(parseFloat(e?.target?.value).toFixed(precision)));
                    customInputValidationMessage?.(e?.target, validationMessages);
                }}
                min={min}
                max={max}
                placeholder={placeholder}
                disabled={disabled}
                value={value || ''}
                tabIndex={tabIndex}
                autoFocus={autoFocus}
                data-dusk={dataDusk}
            />

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
        </div>
    );
}
