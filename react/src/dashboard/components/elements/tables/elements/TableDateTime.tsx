import React, { Fragment } from 'react';
import TableEmptyValue from '../../table-empty-value/TableEmptyValue';

export default function TableDateTime({ value }: { value: string }) {
    if (!value || typeof value !== 'string') {
        return <TableEmptyValue />;
    }

    return value.includes(' - ') ? (
        <Fragment>
            <div className="text-primary text-medium">{value?.split(' - ')[0]}</div>
            <div>{value?.split(' - ')[1]}</div>
        </Fragment>
    ) : (
        <Fragment>{value}</Fragment>
    );
}
