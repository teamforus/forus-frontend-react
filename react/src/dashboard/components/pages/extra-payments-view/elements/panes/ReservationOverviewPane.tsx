import React from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import TableEmptyValue from '../../../../elements/table-empty-value/TableEmptyValue';
import KeyValueItem from '../../../../elements/key-value/KeyValueItem';
import FormPane from '../../../../elements/forms/elements/FormPane';
import classNames from 'classnames';
import StateNavLink from '../../../../../modules/state_router/StateNavLink';
import Reservation from '../../../../../props/models/Reservation';
import Organization from '../../../../../props/models/Organization';

export default function ReservationOverviewPane({
    reservation,
    organization,
}: {
    reservation: Reservation;
    organization: Organization;
}) {
    const translate = useTranslate();

    return (
        <FormPane title={'Reservation details'} large={true}>
            <div className="card-block card-block-keyvalue card-block-keyvalue-md card-block-keyvalue-text-sm">
                <KeyValueItem label={translate('reservation.labels.price')}>{reservation.price_locale}</KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.fund')}>{reservation.fund.name}</KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.sponsor_organization')}>
                    {reservation.fund.organization.name}
                </KeyValueItem>
                <KeyValueItem label={translate('reservation.labels.product')}>
                    <StateNavLink
                        name={'sponsor-product'}
                        params={{
                            organizationId: organization.id,
                            productId: reservation.product?.id,
                        }}
                        className={classNames(
                            'text-primary text-semibold text-inherit',
                            reservation.product?.deleted ? 'text-line-through' : 'text-decoration-link',
                        )}>
                        {reservation.product?.name}
                    </StateNavLink>
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
            </div>
        </FormPane>
    );
}
