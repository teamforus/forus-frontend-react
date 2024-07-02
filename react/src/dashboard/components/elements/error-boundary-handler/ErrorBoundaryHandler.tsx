import BlockException from '../../../../webshop/components/pages/block-exception/BlockException';
import { ErrorBoundary } from 'react-error-boundary';
import React, { Fragment, ReactNode } from 'react';

export default function ErrorBoundaryHandler({
    type = 'block',
    front = 'webshop',
    children,
}: {
    type?: 'main' | 'block';
    front?: 'webshop' | 'dashboard';
    children: ReactNode | Array<ReactNode>;
}) {
    return (
        <ErrorBoundary
            fallback={
                <Fragment>
                    {type == 'main' ? (
                        <div className={'wrapper'} style={{ padding: '60px 0' }}>
                            <BlockException front={front} />
                        </div>
                    ) : (
                        <BlockException front={front} />
                    )}
                </Fragment>
            }>
            {children}
        </ErrorBoundary>
    );
}
