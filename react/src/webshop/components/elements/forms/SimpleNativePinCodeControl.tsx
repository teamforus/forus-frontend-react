import React, { ChangeEvent, useEffect } from 'react';

export function SimpleNativePinCodeControl({
    className,
    value,
    onChange,
    blockSize,
    blockCount,
    valueType = 'num',
    cantDeleteSize = 0,
    ariaLabel,
    autoFocus = false,
}: {
    className?: string;
    value: string;
    onChange: (val: string) => void;
    blockSize: number;
    blockCount: number;
    valueType?: 'num' | 'text';
    cantDeleteSize?: number;
    ariaLabel?: string;
    autoFocus?: boolean;
}) {
    const maxLength = blockSize * blockCount;

    const inputRef = React.useRef<HTMLInputElement>(null);

    const formatWithSeparators = (raw: string) => {
        const blocks: string[] = [];

        for (let i = 0; i < raw.length; i += blockSize) {
            blocks.push(raw.slice(i, i + blockSize));
        }

        return blocks.join('-');
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(valueType === 'num' ? /[^0-9]/g : /[^0-9A-Za-z]/g, '');

        // lock prefix
        if (cantDeleteSize > 0 && !input.startsWith(value.slice(0, cantDeleteSize))) {
            input = value.slice(0, cantDeleteSize) + input.slice(cantDeleteSize);
        }

        // enforce max length
        if (input.length > maxLength) {
            input = input.slice(0, maxLength);
        }

        onChange(input);
    };

    useEffect(() => {
        setTimeout(() => {
            if (autoFocus) {
                inputRef.current?.focus();
            }
        }, 100);
    }, [autoFocus]);

    return (
        <input
            ref={inputRef}
            autoFocus={autoFocus}
            type={valueType === 'num' ? 'tel' : 'text'}
            className={className}
            value={formatWithSeparators(value)}
            onChange={handleChange}
            aria-label={ariaLabel}
        />
    );
}
