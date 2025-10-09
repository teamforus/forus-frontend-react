import React, { Fragment, ReactNode, useMemo } from 'react';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Organization from '../../../../props/models/Organization';
import SponsorProfileRelation from '../../../../props/models/Sponsor/SponsorProfileRelation';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';

export default function ProfileRelationsTableRowItem({
    actions = null,
    relation,
    identity,
    organization,
}: {
    actions?: ReactNode | ReactNode[];
    relation: SponsorProfileRelation;
    identity: SponsorIdentity;
    organization: Organization;
}) {
    const relatedIdentity = useMemo(() => {
        return relation?.identity_id === identity?.id ? relation.related_identity : relation.identity;
    }, [relation, identity]);

    return (
        <Fragment>
            <td>{relatedIdentity?.id}</td>
            <td>{relation?.type_locale || <TableEmptyValue />}</td>
            <td>{relation?.subtype_locale || <TableEmptyValue />}</td>
            <td>{relation?.living_together_locale || <TableEmptyValue />}</td>
            <td>{relatedIdentity?.records?.given_name?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{relatedIdentity?.records?.family_name?.[0]?.value_locale || <TableEmptyValue />}</td>
            <td>{relatedIdentity?.email || <TableEmptyValue />}</td>
            {organization.bsn_enabled && <td>{relatedIdentity?.bsn || <TableEmptyValue />}</td>}
            <td className={'table-td-actions text-right'}>{actions}</td>
        </Fragment>
    );
}
