import Fund from '../../../props/models/Fund';
import React from 'react';
import TableEmptyValue from '../table-empty-value/TableEmptyValue';
import useTranslate from '../../../hooks/useTranslate';
import Label from '../label/Label';

export default function FundStateLabels({ fund }: { fund: Fund }) {
    const translate = useTranslate();

    if (fund.archived) {
        return <Label type="default">{translate('components.organization_funds.states.archived')}</Label>;
    }

    if (fund.state === 'active') {
        return <Label type="success">{translate(`components.organization_funds.states.${fund.state}`)}</Label>;
    }

    if (fund.state === 'paused' || fund.state === 'waiting') {
        return <Label type="warning">{translate(`components.organization_funds.states.${fund.state}`)}</Label>;
    }

    if (fund.state === 'closed') {
        return <Label type="default">{translate(`components.organization_funds.states.${fund.state}`)}</Label>;
    }

    return <TableEmptyValue />;
}
