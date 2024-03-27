import React from 'react';

export default function KeyValueItem({
    label,
    children,
}: {
    label: string;
    children: number | string | React.ReactElement | Array<React.ReactElement>;
}) {
    return (
        <div className="keyvalue-item">
            <div className="keyvalue-key">{label}</div>
            <div className={(children ? '' : 'text-muted') + ' keyvalue-value'}>{children || '-'}</div>
        </div>
    );
}
