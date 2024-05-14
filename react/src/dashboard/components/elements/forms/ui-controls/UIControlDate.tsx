import React, { useCallback } from 'react';
import DatePickerControl from '../controls/DatePickerControl';

export default function UIControlDate({
    id,
    dateMin,
    dateMax,
    format,
    value = null,
    onChange,
    placeholder = null,
    className,
}: {
    id?: string;
    dateMin?: Date;
    dateMax?: Date;
    format?: string;
    value: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
    className?: string;
}) {
    const reset = useCallback(() => {
        onChange(null);
    }, [onChange]);

    return (
        <div id={id} className={`ui-control ui-control-date ${className}`}>
            <DatePickerControl
                dateFormat={format || null}
                value={value}
                dateMin={dateMin}
                dateMax={dateMax}
                dateInitial={dateMin}
                placeholder={placeholder}
                onChange={onChange}
            />

            <div
                onClick={reset}
                onKeyDown={(e) => (e.key == 'Enter' ? reset() : null)}
                className="ui-control-clear"
                aria-label="cancel"
                role={'button'}
                tabIndex={0}>
                <div className="mdi mdi-close-circle" />
            </div>
        </div>
    );
}