import React from 'react';
import Organization from '../../../../props/models/Organization';
import LayoutAsideNavGroup from '../elements/LayoutAsideNavGroup';
import { IconOrganization, IconOrganizationActive } from '../icons/LayoutAsideIcons';
import { hasPermission } from '../../../../helpers/utils';
import useEnvData from '../../../../hooks/useEnvData';

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
                    state: 'employees',
                    stateParams: { organizationId: organization?.id },
                    show: hasPermission(organization, 'manage_employees'),
                    dusk: 'employeesPage',
                },
                {
                    id: 'organization-security',
                    name: 'Beveiliging',
                    state: 'organization-security',
                    stateParams: { organizationId: organization?.id },
                    show: organization.allow_2fa_restrictions && hasPermission(organization, 'manage_organization'),
                },
                {
                    id: 'organization-logs',
                    name: 'Activiteitenlogboek',
                    state: 'organization-logs',
                    stateParams: { organizationId: organization?.id },
                    show: envData.client_type == 'sponsor',
                    dusk: 'eventLogsPage',
                },
                {
                    id: 'offices',
                    name: 'Vestigingen',
                    state: 'offices',
                    stateParams: { organizationId: organization?.id },
                    show: envData.client_type == 'provider' && hasPermission(organization, 'manage_offices'),
                },
                {
                    id: 'organization_settings',
                    name: 'Instellingen',
                    state: 'organizations-edit',
                    stateParams: { organizationId: organization?.id },
                    show: hasPermission(organization, 'manage_organization'),
                },
                {
                    name: 'Marketplace',
                    state: 'features',
                    stateParams: { organizationId: organization?.id },
                    show: envData.client_type == 'sponsor' && !envData.config.features_hide,
                },
            ]}
        />
    );
}
