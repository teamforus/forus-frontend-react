import React, { Fragment, useState } from 'react';
import FormError from '../errors/FormError';
import { uniqueId } from 'lodash';

export default function FormGroup({
    id,
    error,
    inline,
    label,
    input,
    required,
    className = '',
}: {
    id?: string;
    error?: string | Array<string>;
    inline?: boolean;
    label?: string | React.ReactElement | Array<React.ReactElement>;
    input?: (input_id: string) => React.ReactElement;
    required?: boolean;
    className?: string;
}) {
    const input_id = useState(id || uniqueId('input_group_id_'))[0];

    return (
        <div
            className={`form-group ${className || ''} ${inline ? 'form-group-inline' : ''} ${
                error ? 'form-group-error' : ''
            }`}>
            {label && (
                <label htmlFor={input_id} className={`form-label ${required ? 'form-label-required' : ''}`}>
                    {label}
                </label>
            )}

            {inline ? (
                <div className="form-offset">
                    {input && input(input_id)}
                    {error && <FormError error={error} />}
                </div>
            ) : (
                <Fragment>
                    {input && input(input_id)}
                    {error && <FormError error={error} />}
                </Fragment>
            )}
        </div>
    );
}
