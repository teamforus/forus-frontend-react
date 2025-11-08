import React, { useContext, useEffect } from 'react';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useParams } from 'react-router';
import { useNavigateState } from '../../../modules/state_router/Router';
import { mainContext } from '../../../contexts/MainContext';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function OrganizationsView() {
    const { id } = useParams();
    const { fetchOrganizations, setOrganizations, setActiveOrganization } = useContext(mainContext);
    const organizationService = useOrganizationService();
    const navigateState = useNavigateState();

    useEffect(() => {
        fetchOrganizations().then((organizations) => {
            const organization = organizations.find((organization) => organization.id == parseInt(id));

            if (organization) {
                organizationService.use(organization?.id);
                setActiveOrganization(organization);
            }

            setOrganizations(organizations);
            navigateState(DashboardRoutes.ORGANIZATIONS);
        });
    }, [fetchOrganizations, navigateState, organizationService, setActiveOrganization, setOrganizations, id]);

    return <></>;
}
