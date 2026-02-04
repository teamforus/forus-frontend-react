import React, { useState } from 'react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';

export default function InputRadioControl({
    id,
    fill,
    value,
    label,
    narrow,
    compact,
    checked,
    onChange,
}: {
    id?: string;
    fill?: boolean;
    value?: string;
    label?: string;
    narrow?: boolean;
    compact?: boolean;
    checked?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    const [inputId] = useState(id || uniqueId('input_radio_'));

    return (
        <label
            htmlFor={inputId}
            className={classNames('radio', narrow && 'radio-narrow', compact && 'radio-compact', fill && 'radio-fill')}>
            <input
                id={inputId}
                name="name"
                value={value}
                type="radio"
                checked={checked}
                onChange={(e) => onChange(e)}
            />

            <div className="radio-label">
                <div className="radio-circle"></div>
                {label}
            </div>
        </label>
    );
}
