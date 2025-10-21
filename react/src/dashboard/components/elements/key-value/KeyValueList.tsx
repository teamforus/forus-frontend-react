import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function KeyValueList({
    size = 'md',
    children,
}: {
    size?: 'md' | 'lg';
    children: ReactNode | Array<ReactNode>;
}) {
    return (
        <div
            className={classNames(
                'card-block',
                'card-block-keyvalue',
                size === 'md' && 'card-block-keyvalue-lg',
                size === 'lg' && 'card-block-keyvalue-xl',
                'card-block-keyvalue-text-sm',
            )}>
            {children}
        </div>
    );
}
