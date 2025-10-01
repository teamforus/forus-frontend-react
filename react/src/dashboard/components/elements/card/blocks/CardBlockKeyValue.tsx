import React, { ReactNode } from 'react';
import TableEmptyValue from '../../table-empty-value/TableEmptyValue';
import classNames from 'classnames';

export default function CardBlockKeyValue({
    size = 'sm',
    items,
}: {
    size?: 'sm' | 'md';
    items: Array<{ label: string; value: ReactNode | ReactNode[] }>;
}) {
    return (
        <div
            className={classNames(
                'card-block',
                'card-block-keyvalue',
                size === 'sm' && 'card-block-keyvalue-sm',
                size === 'md' && 'card-block-keyvalue-md',
            )}>
            {items?.map((item, index) => (
                <div className="keyvalue-item" key={index}>
                    <div className="keyvalue-key">{item.label}</div>
                    <div className="keyvalue-value text-black">{item.value ?? <TableEmptyValue />}</div>
                </div>
            ))}
        </div>
    );
}
