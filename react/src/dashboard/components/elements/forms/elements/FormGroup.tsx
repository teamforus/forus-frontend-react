import React, { useState } from 'react';
import FormError from '../errors/FormError';
import { uniqueId } from 'lodash';
import classNames from 'classnames';
import FormGroupInfo from './FormGroupInfo';

export default function FormGroup({
    id,
    error = null,
    label = null,
    input = null,
    info = null,
    hint = null,
    required = false,
    className = null,
    textAlign = null,
}: {
    id?: string;
    error?: string | Array<string>;
    label?: string | React.ReactElement | Array<React.ReactElement>;
    input?: (id: string) => React.ReactElement;
    info?: string | React.ReactElement | Array<React.ReactElement>;
    hint?: string | React.ReactElement | Array<React.ReactElement>;
    required?: boolean;
    className?: string;
    textAlign?: 'center' | null;
}) {
    const input_id = useState(id || uniqueId('input_group_id_'))[0];

    return (
        <div
            className={classNames(
                'form-group',
                error && 'form-group-error',
                textAlign === 'center' && 'text-center',
                className,
            )}>
            {label && (
                <label htmlFor={input_id} className={classNames('form-label', required && 'form-label-required')}>
                    {label}
                </label>
            )}

            {info ? <FormGroupInfo info={info}>{input && input(input_id)}</FormGroupInfo> : input && input(input_id)}
            {error && <FormError error={error} />}
            {hint && <div className="form-hint">{hint}</div>}
        </div>
    );
}
