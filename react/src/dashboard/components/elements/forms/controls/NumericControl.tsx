import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { uniqueId } from 'lodash';

export default function NumericControl({
    id,
    value,
    onSubmit,
    minValue,
    maxValue,
    applyText,
}: {
    id?: string;
    value?: number;
    minValue?: number;
    maxValue?: number;
    applyText?: string;
    onSubmit: (value: number) => void;
}) {
    const [viewValue, setViewValue] = useState(value);
    const elementId = useMemo(() => id || uniqueId('numeric_control_'), [id]);

    useEffect(() => {
        setViewValue(value);
    }, [value]);

    return (
        <div className="form-numeric" id={elementId}>
            <div className={classNames('form-numeric-btn', viewValue <= minValue && 'disabled')}>
                <em className="mdi mdi-minus icon-start" onClick={() => setViewValue((viewValue) => viewValue - 1)} />
            </div>

            <div className="form-numeric-value">{viewValue}</div>

            <div className={classNames('form-numeric-btn', viewValue >= maxValue && 'disabled')}>
                <em className="mdi mdi-plus icon-end" onClick={() => setViewValue((viewValue) => viewValue + 1)} />
            </div>

            {viewValue != value && (
                <div className="form-numeric-actions">
                    <div className="button button-default button-sm" onClick={() => onSubmit(viewValue)}>
                        {applyText}
                    </div>
                </div>
            )}
        </div>
    );
}
