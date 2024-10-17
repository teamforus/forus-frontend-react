import React from 'react';
import classNames from 'classnames';

export default function KeyValueItem({
    label,
    children,
    className,
}: {
    label: string;
    children: number | string | React.ReactElement | Array<React.ReactElement>;
    className?: string;
}) {
    return (
        <div className="keyvalue-item">
            <div className="keyvalue-key">{label}</div>
            <div className={classNames(!children && 'text-muted', 'keyvalue-value', className)}>{children || '-'}</div>
        </div>
    );
}
