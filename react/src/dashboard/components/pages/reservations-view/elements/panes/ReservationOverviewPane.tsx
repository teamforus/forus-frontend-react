import React from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import FormPane from '../../../../elements/forms/elements/FormPane';
import Reservation from '../../../../../props/models/Reservation';

export default function ReservationOverviewPane({ reservation }: { reservation: Reservation }) {
    const translate = useTranslate();

    return (
        <FormPane title={'Overview'} large={true}>
            <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                <KeyValueItem label={translate('reservation.labels.price')}>{reservation.amount_locale}</KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.fund')}>{reservation.fund.name}</KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.sponsor_organization')}>
                    {reservation.fund.organization.name}
                </KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.created_at')}>
                    {reservation.created_at_locale}
                </KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.expire_at')}>
                    {reservation.expire_at_locale}
                </KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.accepted_at')}>
                    {reservation.accepted_at ? reservation.accepted_at_locale : <TableEmptyValue />}
                </KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.rejected_at')}>
                    {reservation.rejected_at ? reservation.rejected_at_locale : <TableEmptyValue />}
                </KeyValueItem>
                {reservation.canceled_at && reservation.state === 'canceled' && reservation.cancellation_note && (
                    <KeyValueItem label={translate('reservation.labels.cancellation_note')}>
                        {reservation.cancellation_note}
                    </KeyValueItem>
                )}
                {reservation.rejected_at && reservation.rejection_note && (
                    <KeyValueItem label={translate('reservation.labels.rejection_note')}>
                        {reservation.rejection_note}
                    </KeyValueItem>
                )}
            </div>
        </FormPane>
    );
}
