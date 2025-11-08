import React, { HTMLInputTypeAttribute } from 'react';
import FormGroup from './FormGroup';

export default function FormGroupInput({
    id,
    type,
    error,
    label,
    info,
    required,
    className = '',
    value = '',
    setValue,
}: {
    id?: string;
    type?: HTMLInputTypeAttribute;
    error?: string | Array<string>;
    label?: string;
    info?: string | React.ReactElement | Array<React.ReactElement>;
    required?: boolean;
    className?: string;
    value?: string;
    setValue?: (value?: string) => void;
}) {
    return (
        <FormGroup
            id={id}
            label={label}
            info={info}
            error={error}
            required={required}
            className={className}
            input={(id) => (
                <input
                    id={id}
                    type={type}
                    placeholder={label}
                    value={value}
                    className={'form-control'}
                    onChange={(e) => setValue(e.target.value)}
                />
            )}
        />
    );
}
