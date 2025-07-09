import React, { Fragment, useMemo } from 'react';

export default function FormError({
    error,
    duskPrefix,
    className = '',
}: {
    error?: string | Array<string>;
    duskPrefix?: string;
    className?: string;
}) {
    const errorsList = useMemo(() => (error ? (Array.isArray(error) ? error : [error]) : []), [error]);

    return (
        <Fragment>
            {errorsList.map((error, index) => (
                <div
                    className={`form-error ${className}`}
                    data-dusk={duskPrefix ? `${duskPrefix}${(index + 1)?.toString()}` : null}
                    key={index}>
                    {error}
                </div>
            ))}
        </Fragment>
    );
}
