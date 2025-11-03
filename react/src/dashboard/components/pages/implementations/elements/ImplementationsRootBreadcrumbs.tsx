import React, { Fragment } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useActiveOrganization from '../../../../hooks/useActiveOrganization';
import Implementation from '../../../../props/models/Implementation';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function ImplementationsRootBreadcrumbs({ implementation }: { implementation: Implementation | null }) {
    const activeOrganization = useActiveOrganization();

    if (activeOrganization?.implementations.length === 0) {
        return null;
    }

    if (activeOrganization?.implementations.length === 1) {
        return (
            <StateNavLink
                name={DashboardRoutes.IMPLEMENTATION}
                params={{ organizationId: activeOrganization.id, id: activeOrganization.implementations[0]?.id }}
                activeExact={true}
                className="breadcrumb-item">
                Website instellingen
            </StateNavLink>
        );
    }

    return (
        <Fragment>
            <StateNavLink
                name={DashboardRoutes.IMPLEMENTATIONS}
                params={{ organizationId: activeOrganization.id }}
                activeExact={true}
                className="breadcrumb-item">
                Websites
            </StateNavLink>
            {implementation && (
                <StateNavLink
                    name={DashboardRoutes.IMPLEMENTATION}
                    params={{ organizationId: activeOrganization.id, id: implementation.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {implementation.name}
                </StateNavLink>
            )}
        </Fragment>
    );
}
