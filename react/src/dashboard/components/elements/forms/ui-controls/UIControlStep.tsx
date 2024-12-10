import React, { useCallback } from 'react';
import classNames from 'classnames';

export default function UIControlStep({
    id,
    min = null,
    max = null,
    name,
    role = 'spinbutton',
    value = 0,
    onChange,
    step = 1,
    className,
}: {
    id?: string;
    min?: number;
    max?: number;
    name?: string;
    role?: string;
    value: number;
    step?: number;
    onChange: (value?: number) => void;
    className?: string;
}) {
    const decrease = useCallback(() => {
        onChange(min !== null ? Math.max(value - step, min) : value - step);
    }, [min, onChange, step, value]);

    const increase = useCallback(() => {
        onChange(max !== null ? Math.min(value + step, max) : value + step);
    }, [max, onChange, step, value]);

    return (
        <div
            className={classNames(`ui-control ui-control-step`, className)}
            role={role}
            aria-label="Aanpassen"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}>
            <input type="number" name={name} id={id} value={value} hidden={true} readOnly={true} />
            <div
                className="ui-control-step-icon"
                onKeyDown={(e) => (e.key == 'Enter' ? decrease() : null)}
                onClick={decrease}
                aria-label="Aantal verlagen"
                tabIndex={0}
                role="button">
                <div className="mdi mdi-minus" />
            </div>

            <div className="ui-control-step-value">{value?.toString()}</div>

            <div
                className="ui-control-step-icon"
                onKeyDown={(e) => (e.key == 'Enter' ? increase() : null)}
                onClick={increase}
                aria-label="Aantal verhogen"
                tabIndex={0}
                role="button">
                <div className="mdi mdi-plus" />
            </div>
        </div>
    );
}
