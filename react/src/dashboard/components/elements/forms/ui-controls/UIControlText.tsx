import React, { useRef } from 'react';

export default function UIControlText({
    id = '',
    name = '',
    value = '',
    className = '',
    placeholder = '',
    disabled = false,
    onChange = null,
    onChangeValue = null,
}: {
    id?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangeValue?: (value: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className={`ui-control ui-control-text ${className}`}>
            <input
                ref={inputRef}
                className="form-control"
                type="text"
                id={id}
                name={name}
                onChange={(e) => {
                    onChange ? onChange(e) : null;
                    onChangeValue ? onChangeValue(e?.target?.value) : null;
                }}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
            />
            <div className="ui-control-clear" onClick={() => (inputRef.current.value = '')}>
                <div className="mdi mdi-close-circle" />
            </div>
        </div>
    );
}
