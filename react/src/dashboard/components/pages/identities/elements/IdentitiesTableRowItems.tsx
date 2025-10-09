import React, { Fragment, ReactNode } from 'react';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import TableDateTime from '../../../elements/tables/elements/TableDateTime';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import TableDateOnly from '../../../elements/tables/elements/TableDateOnly';
import Organization from '../../../../props/models/Organization';

export default function IdentitiesTableRowItems({
    actions = null,
    identity,
    organization,
}: {
    actions?: ReactNode | ReactNode[];
    identity: SponsorIdentity;
    organization: Organization;
}) {
    return (
        <Fragment>
            <td>{identity.id}</td>
            <td>{identity?.type_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.given_name?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.family_name?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity.email || <TableEmptyValue />}</td>
            {organization.bsn_enabled && <td>{identity.bsn || <TableEmptyValue />}</td>}
            <td>{identity?.records?.client_number?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>
                <TableDateOnly value={identity?.records?.birth_date?.[0]?.value_locale} />
            </td>
            <td>
                <TableDateTime value={identity.last_login_at_locale} />
            </td>
            <td>
                <TableDateTime value={identity.last_activity_at_locale} />
            </td>
            <td>{identity?.records?.city?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.street?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.house_number?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.house_number_addition?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.postal_code?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.municipality_name?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{identity?.records?.neighborhood_name?.[0]?.value_locale || <TableEmptyValue />}</td>

            <td className={'table-td-actions text-right'}>{actions}</td>
        </Fragment>
    );
}
