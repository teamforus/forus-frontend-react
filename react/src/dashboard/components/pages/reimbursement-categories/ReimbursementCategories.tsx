import React, { Fragment } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockReimbursementCategories from '../../elements/block-reimbursement-categories/BlockReimbursementCategories';

export default function ReimbursementCategories() {
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name="reimbursements"
                    params={{ organizationId: activeOrganization.id }}>
                    Declaraties
                </StateNavLink>

                <div className="breadcrumb-item active">Declaratie categorieën</div>
            </div>

            <BlockReimbursementCategories />
        </Fragment>
    );
}
