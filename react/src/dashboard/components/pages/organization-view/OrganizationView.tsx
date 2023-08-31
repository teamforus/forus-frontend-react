import React, { useContext, useEffect } from 'react';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useNavigate, useParams } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { mainContext } from '../../../contexts/MainContext';

export default function OrganizationView() {
    const { id } = useParams();
    const { fetchOrganizations, setOrganizations, setActiveOrganization } = useContext(mainContext);
    const organizationService = useOrganizationService();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrganizations().then((organizations) => {
            const organization = organizations.find((organization) => organization.id == parseInt(id));

            if (organization) {
                organizationService.use(organization?.id);
                setActiveOrganization(organization);
            }

            setOrganizations(organizations);
            navigate(getStateRouteUrl('organizations'));
        });
    }, [fetchOrganizations, navigate, organizationService, setActiveOrganization, setOrganizations, id]);

    return <></>;
}
