import React, { useCallback, useRef } from 'react';
import useCustomInputValidationMessage, {
    InputValidationTexts,
} from '../../../../hooks/useCustomInputValidationMessage';

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
    tabIndex = null,
    autoFocus = false,
    min = null,
    max = null,
    step = 0.01,
    dusk = null,
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
    min?: number;
    max?: number;
    step?: number;
    dusk?: string;
    precision?: number;
    validationMessages?: InputValidationTexts;
}) {
    const innerInputRef = useRef<HTMLInputElement>(null);
    const customInputValidationMessage = useCustomInputValidationMessage();

    // todo: poc
    /*const [showClear, setShowClear] = useState(false);*/

    const reset = useCallback(() => {
        (inputRef || innerInputRef).current.value = '';
    }, [inputRef]);

    return (
        <div
            /*onFocus={() => setShowClear(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowClear(false);
                }
            }}*/
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
                    onChange ? onChange(e) : null;
                    onChangeValue ? onChangeValue(parseFloat(parseFloat(e?.target?.value).toFixed(precision))) : null;
                    customInputValidationMessage?.(e, validationMessages);
                }}
                min={min}
                max={max}
                placeholder={placeholder}
                disabled={disabled}
                value={value || ''}
                tabIndex={tabIndex}
                autoFocus={autoFocus}
                data-dusk={dusk}
            />

            {/*{showClear && (*/}
            <div
                onClick={reset}
                onKeyDown={(e) => (e.key == 'Enter' ? reset() : null)}
                className="ui-control-clear"
                aria-label="cancel"
                role={'button'}
                tabIndex={0}>
                <div className="mdi mdi-close-circle" />
            </div>
            {/*)}*/}
        </div>
    );
}
