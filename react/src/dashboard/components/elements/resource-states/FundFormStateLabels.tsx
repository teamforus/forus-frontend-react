import React from 'react';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import FundForm from '../../../props/models/FundForm';
import Label from '../label/Label';

export default function FundFormStateLabels({ fundForm }: { fundForm: FundForm }) {
    if (fundForm.state == 'active') {
        return <Label type="success">{fundForm.state_locale}</Label>;
    }

    if (fundForm.state == 'archived') {
        return <Label type="default">{fundForm.state_locale}</Label>;
    }

    return <TableEmptyValue />;
}
