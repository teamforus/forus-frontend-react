import React, { Fragment, useState } from 'react';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import FundForm from '../../../props/models/FundForm';

export default function FundFormStateLabels({ fundForm }: { fundForm: FundForm }) {
    const [stateLabels] = useState({
        active: 'tag-success',
        archived: 'tag-default',
    });

    return (
        <Fragment>
            {stateLabels[fundForm.state] ? (
                <span className={`tag tag-sm ${stateLabels[fundForm.state] || ''}`}>{fundForm.state_locale}</span>
            ) : (
                <TableEmptyValue />
            )}
        </Fragment>
    );
}
