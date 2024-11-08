import React from 'react';
import classNames from 'classnames';
import EmptyValue from '../../../../webshop/components/elements/empty-value/EmptyValue';

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
            <div className={classNames('keyvalue-value', className)}>{children || <EmptyValue />}</div>
        </div>
    );
}
