import React, { Fragment, useMemo } from 'react';

export default function FormError({ error }: { error?: string | Array<string> }) {
    const errorsList = useMemo(() => (error ? (Array.isArray(error) ? error : [error]) : []), [error]);

    return (
        <Fragment>
            {errorsList.map((error, index) => (
                <div className={'form-error'} key={index}>
                    {error}
                </div>
            ))}
        </Fragment>
    );
}
