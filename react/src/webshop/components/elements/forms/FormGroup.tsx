import React, { useState } from 'react';
import { uniqueId } from 'lodash';
import classNames from 'classnames';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';

export default function FormGroup({
    id,
    error,
    label,
    input,
    required,
    className = '',
    hidden = false,
}: {
    id?: string;
    error?: string | Array<string>;
    label?: string | React.ReactElement | Array<React.ReactElement>;
    input?: (input_id: string) => React.ReactElement;
    required?: boolean;
    className?: string;
    hidden?: boolean;
}) {
    const input_id = useState(id || uniqueId('input_group_id_'))[0];

    return (
        <div className={classNames('form-group', error && 'form-group-error', className)} hidden={hidden}>
            {label && (
                <label htmlFor={input_id} className={classNames('form-label', required && 'form-label-required')}>
                    {label}
                </label>
            )}

            {input && input(input_id)}
            {error && <FormError error={error} />}
        </div>
    );
}
