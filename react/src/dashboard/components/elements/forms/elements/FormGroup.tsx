import React, { useState } from 'react';
import FormError from '../errors/FormError';
import { uniqueId } from 'lodash';
import classNames from 'classnames';
import FormGroupInfo from './FormGroupInfo';

export default function FormGroup({
    id,
    error,
    label,
    input,
    info,
    hint,
    required,
    className = '',
}: {
    id?: string;
    error?: string | Array<string>;
    label?: string | React.ReactElement | Array<React.ReactElement>;
    input?: (input_id: string) => React.ReactElement;
    info?: string | React.ReactElement | Array<React.ReactElement>;
    hint?: string | React.ReactElement | Array<React.ReactElement>;
    required?: boolean;
    className?: string;
}) {
    const input_id = useState(id || uniqueId('input_group_id_'))[0];

    return (
        <div className={classNames('form-group', error && 'form-group-error', className)}>
            {label && (
                <label htmlFor={input_id} className={classNames(`form-label`, required && 'form-label-required')}>
                    {label}
                </label>
            )}

            {info ? <FormGroupInfo info={info}>{input && input(input_id)}</FormGroupInfo> : input && input(input_id)}
            {error && <FormError error={error} />}
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    );
}
