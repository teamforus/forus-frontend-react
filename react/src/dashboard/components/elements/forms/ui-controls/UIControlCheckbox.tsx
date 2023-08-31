import React, { useCallback, useRef } from 'react';

export default function UIControlCheckbox({
    id = '',
    name = '',
    label = '',
    value = '',
    checked,
    className = '',
    disabled = false,
    onChange = null,
    onChangeValue = null,
}: {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    checked?: boolean;
    className?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeValue?: (checked: boolean) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleCheckbox = useCallback((e) => {
        if (e?.key == 'Enter') {
            e.target.checked = !e.target.checked;
        }
    }, []);

    return (
        <div className={`ui-control ui-control-checkbox ${className} ${disabled ? 'disabled' : ''}`}>
            <input
                className="form-control"
                hidden={true}
                tabIndex={-1}
                type="checkbox"
                id={id}
                ref={inputRef}
                name={name}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={(e) => {
                    onChange ? onChange(e) : null;
                    onChangeValue ? onChangeValue(e.target.checked) : null;
                }}
            />
            <label
                className="ui-checkbox-label"
                htmlFor={id}
                role="checkbox"
                tabIndex={0}
                aria-checked={inputRef?.current?.checked}
                onClick={toggleCheckbox}>
                <div className="ui-checkbox-box">
                    <div className="mdi mdi-check" />
                </div>
                {label}
            </label>
        </div>
    );
}
