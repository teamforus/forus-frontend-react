import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function BlockKeyValueList({
    items,
}: {
    items: Array<{ label: string; value: string | ReactNode | ReactNode[] }>;
}) {
    return (
        <div className={classNames('block', 'block-key-value-list')}>
            {items?.map((item, index) => (
                <div className="block-key-value-list-item" key={index}>
                    <div className="key-value-list-item-label">{item.label}</div>
                    <div className="key-value-list-item-value">{item.value || '-'}</div>
                </div>
            ))}
        </div>
    );
}
