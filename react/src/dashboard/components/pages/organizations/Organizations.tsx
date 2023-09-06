import React, { useCallback, useContext, useEffect, useState } from 'react';
import { mainContext } from '../../../contexts/MainContext';
import { authContext } from '../../../contexts/AuthContext';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import Organization from '../../../props/models/Organization';

export default function Organizations() {
    const { envData, organizations } = useContext(mainContext);
    const { token } = useContext(authContext);
    const [selected_organization_key] = useState('active_organization');
    const organizationService = useOrganizationService();
    const navigate = useNavigate();

    const getLastUsedOrganization = useCallback(
        (organizations: Array<Organization>) => {
            const selectedOrganizationId = localStorage.getItem(selected_organization_key);
            const organization = organizations.find((item) => item.id.toString() == selectedOrganizationId);

            return organization?.id || organizations[0]?.id;
        },
        [selected_organization_key],
    );

    const redirectToDashboard = useCallback(
        (organizationId: number, organizations: Array<Organization>) => {
            const organization = organizations.find((organization) => organization.id == organizationId);
            const routes = organizationService
                .getAvailableRoutes(envData.client_type, organization)
                .map((route) => route.name);

            if (routes.length == 0) {
                return navigate(getStateRouteUrl('no-permission'));
            }

            navigate(getStateRouteUrl(routes[0], { organizationId }));
        },
        [envData, navigate, organizationService],
    );

    const autoSelectOrganization = useCallback(
        function (organizations: Array<Organization>, redirect = true) {
            const selectedOrganizationId = getLastUsedOrganization(organizations);

            if (selectedOrganizationId) {
                organizationService.use(selectedOrganizationId);

                if (redirect) {
                    redirectToDashboard(selectedOrganizationId, organizations);
                }
            } else {
                navigate(getStateRouteUrl('organizations-create'));
            }
        },
        [getLastUsedOrganization, organizationService, redirectToDashboard, navigate],
    );

    useEffect(() => {
        if (!token) {
            return navigate(getStateRouteUrl('home'));
        }

        if (envData && organizations) {
            autoSelectOrganization(organizations);
        }
    }, [envData, navigate, organizations, token, autoSelectOrganization]);

    return <></>;
}
