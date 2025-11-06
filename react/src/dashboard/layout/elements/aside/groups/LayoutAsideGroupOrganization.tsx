import React from 'react';
import Organization, { Permission } from '../../../../props/models/Organization';
import LayoutAsideNavGroup from '../elements/LayoutAsideNavGroup';
import { IconOrganization, IconOrganizationActive } from '../icons/LayoutAsideIcons';
import { hasPermission } from '../../../../helpers/utils';
import useEnvData from '../../../../hooks/useEnvData';
import { DashboardRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function LayoutAsideGroupOrganization({
    organization,
    pinnedGroups,
    setPinnedGroups,
}: {
    organization: Organization;
    pinnedGroups: Array<string>;
    setPinnedGroups: React.Dispatch<React.SetStateAction<Array<string>>>;
}) {
    const envData = useEnvData();

    return (
        <LayoutAsideNavGroup
            id="menu_organization"
            name="Organisatie"
            icon={<IconOrganization />}
            iconActive={<IconOrganizationActive />}
            pinnedGroups={pinnedGroups}
            setPinnedGroups={setPinnedGroups}
            dusk={'asideMenuGroupOrganization'}
            items={[
                {
                    id: 'employees',
                    name: 'Medewerkers',
                    state: DashboardRoutes.EMPLOYEES,
                    stateParams: { organizationId: organization?.id },
                    show: hasPermission(organization, Permission.MANAGE_EMPLOYEES),
                    dusk: 'employeesPage',
                },
                {
                    id: 'organization-security',
                    name: 'Beveiliging',
                    state: DashboardRoutes.ORGANIZATION_SECURITY,
                    stateParams: { organizationId: organization?.id },
                    show:
                        organization.allow_2fa_restrictions &&
                        hasPermission(organization, Permission.MANAGE_ORGANIZATION),
                },
                {
                    id: 'organization-logs',
                    name: 'Activiteitenlogboek',
                    state: DashboardRoutes.ORGANIZATION_LOGS,
                    stateParams: { organizationId: organization?.id },
                    show: envData.client_type == 'sponsor',
                    dusk: 'eventLogsPage',
                },
                {
                    id: 'offices',
                    name: 'Vestigingen',
                    state: DashboardRoutes.OFFICES,
                    stateParams: { organizationId: organization?.id },
                    show: envData.client_type == 'provider' && hasPermission(organization, Permission.MANAGE_OFFICES),
                },
                {
                    id: 'organization_settings',
                    name: 'Instellingen',
                    state: DashboardRoutes.ORGANIZATION_EDIT,
                    stateParams: { organizationId: organization?.id },
                    show: hasPermission(organization, Permission.MANAGE_ORGANIZATION),
                },
                {
                    name: 'Marketplace',
                    state: DashboardRoutes.FEATURES,
                    stateParams: { organizationId: organization?.id },
                    show: envData.client_type == 'sponsor' && !envData.config.features_hide,
                },
            ]}
        />
    );
}
