import React, { useCallback } from 'react';
import classNames from 'classnames';
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
    dataDusk = null,
}: {
    id?: string;
    dateMin?: Date;
    dateMax?: Date;
    format?: string;
    value: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
    className?: string;
    dataDusk?: string;
}) {
    const reset = useCallback(() => {
        onChange(null);
    }, [onChange]);

    return (
        <div id={id} className={classNames('ui-control', 'ui-control-date', className)} data-dusk={dataDusk}>
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
                aria-label="Annuleren"
                role={'button'}
                tabIndex={0}>
                <div className="mdi mdi-close-circle" />
            </div>
        </div>
    );
}
