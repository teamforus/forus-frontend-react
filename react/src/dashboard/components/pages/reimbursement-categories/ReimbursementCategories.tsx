import React, { Fragment } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockReimbursementCategories from '../../elements/block-reimbursement-categories/BlockReimbursementCategories';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ReimbursementCategories() {
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.REIMBURSEMENTS}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    Declaraties
                </StateNavLink>

                <div className="breadcrumb-item active">Declaratie categorieën</div>
            </div>

            <BlockReimbursementCategories />
        </Fragment>
    );
}
