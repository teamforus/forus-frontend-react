import React, { useCallback, useRef, useState } from 'react';
import { uniqueId } from 'lodash';

export default function UIControlCheckbox({
    id = '',
    name = '',
    label = '',
    value = '',
    checked,
    slim = false,
    className = '',
    disabled = false,
    onChange = null,
    onChangeValue = null,
}: {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    slim?: boolean;
    checked?: boolean;
    className?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeValue?: (checked: boolean) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [innerId] = useState(id || uniqueId('ui_control_checkbox_'));

    const toggleCheckbox = useCallback((e: React.KeyboardEvent) => {
        if (['Enter', 'Space'].includes(e?.key)) {
            inputRef.current.click();
        }
    }, []);

    return (
        <span
            className={`ui-control ui-control-checkbox ${className} ${
                slim ? 'ui-control-checkbox-slim' : ''
            } ${className} ${disabled ? 'disabled' : ''}`}>
            <input
                className="form-control"
                hidden={true}
                tabIndex={-1}
                type="checkbox"
                id={innerId}
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
                htmlFor={innerId}
                tabIndex={0}
                aria-checked={inputRef?.current?.checked}
                onKeyDown={toggleCheckbox}>
                <span className="ui-checkbox-box">
                    <em className="mdi mdi-check" />
                </span>
                {label}
            </label>
        </span>
    );
}
