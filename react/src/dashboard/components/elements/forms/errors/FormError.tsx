import React, { Fragment, useMemo } from 'react';
import classNames from 'classnames';

export default function FormError({
    error,
    duskPrefix,
    textAlign,
    textWeight,
}: {
    error?: string | Array<string>;
    duskPrefix?: string;
    textAlign?: 'center';
    textWeight?: 'semibold';
}) {
    const errorsList = useMemo(() => (error ? (Array.isArray(error) ? error : [error]) : []), [error]);

    return (
        <Fragment>
            {errorsList.map((error, index) => (
                <div
                    className={classNames(
                        'form-error',
                        textAlign === 'center' && 'text-center',
                        textWeight === 'semibold' && 'text-semibold',
                    )}
                    data-dusk={duskPrefix ? `${duskPrefix}${(index + 1)?.toString()}` : null}
                    key={index}>
                    {error}
                </div>
            ))}
        </Fragment>
    );
}
