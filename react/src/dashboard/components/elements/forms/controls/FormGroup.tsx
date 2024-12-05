import React, { Fragment, useState } from 'react';
import FormError from '../errors/FormError';
import { uniqueId } from 'lodash';
import classNames from 'classnames';

export default function FormGroup({
    id,
    error,
    inline,
    inlineSize,
    label,
    input,
    required,
    className = '',
}: {
    id?: string;
    error?: string | Array<string>;
    inline?: boolean;
    inlineSize?: 'sm' | 'md' | 'lg';
    label?: string | React.ReactElement | Array<React.ReactElement>;
    input?: (input_id: string) => React.ReactElement;
    required?: boolean;
    className?: string;
}) {
    const input_id = useState(id || uniqueId('input_group_id_'))[0];

    return (
        <div
            className={classNames(
                'form-group',
                inline && 'form-group-inline',
                inlineSize === 'sm' && 'form-group-inline-sm',
                inlineSize === 'md' && 'form-group-inline-md',
                inlineSize === 'lg' && 'form-group-inline-lg',
                error && 'form-group-error',
                className,
            )}>
            {label && (
                <label htmlFor={input_id} className={classNames(`form-label`, required && 'form-label-required')}>
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
