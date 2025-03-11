import React from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import StateNavLink from '../../../modules/state_router/StateNavLink';
export default function OrganizationsNoPermissions() {
    const activeOrganization = useActiveOrganization();
    const title = 'Geen rechten';
    const description = 'U heeft geen rechten om deze actie uit te voeren.';

    return (
        <>
            <div>
                <div className="block block-breadcrumbs">
                    <StateNavLink className="breadcrumb-item" name={'organizations'} activeExact={true}>
                        {activeOrganization.name}
                    </StateNavLink>
                    <div className="breadcrumb-item active">{title}</div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">{title}</div>
                    </div>

                    <div className="card-section">
                        <div className="block block-markdown">{description}</div>
                    </div>
                </div>
            </div>
        </>
    );
}
