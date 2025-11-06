import React from 'react';
import LayoutAsideNavGroup from './elements/LayoutAsideNavGroup';
import Organization, { Permission } from '../../../props/models/Organization';
import { hasPermission } from '../../../helpers/utils';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { IconManagement, IconManagementActive } from './icons/LayoutAsideIcons';
import LayoutAsideGroupOrganization from './groups/LayoutAsideGroupOrganization';
import LayoutAsideGroupPersonal from './groups/LayoutAsideGroupPersonal';
import LayoutAsideGroupHelp from './groups/LayoutAsideGroupHelp';
import { usePinnedMenuGroups } from './hooks/usePinnedMenuGroups';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function LayoutAsideValidator({ organization }: { organization: Organization }) {
    const appConfigs = useAppConfigs();

    const [pinnedGroups, setPinnedGroups] = usePinnedMenuGroups('pinnedMenuGroupsValidator');

    return (
        <div className="sidebar-nav">
            {/* Beheer */}
            <LayoutAsideNavGroup
                id="menu_management"
                name="Beheer"
                icon={<IconManagement />}
                iconActive={<IconManagementActive />}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
                dusk={'asideMenuGroupFundRequests'}
                items={[
                    {
                        id: 'fund_requests',
                        name: 'Aanvragen',
                        state: DashboardRoutes.FUND_REQUESTS,
                        stateParams: { organizationId: organization?.id },
                        show:
                            appConfigs?.organizations?.funds?.fund_requests &&
                            hasPermission(
                                organization,
                                [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS],
                                false,
                            ),
                        dusk: 'fundRequestsPage',
                    },
                    {
                        id: 'requesters',
                        name: 'Klaarzetten',
                        state: DashboardRoutes.CSV_VALIDATION,
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(
                            organization,
                            [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS],
                            false,
                        ),
                    },
                ]}
            />

            {/* Organisatie */}
            <LayoutAsideGroupOrganization
                organization={organization}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />

            {/* Persoonlijke instellingen */}
            <LayoutAsideGroupPersonal
                organization={organization}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />

            {/* Ondersteuning */}
            <LayoutAsideGroupHelp
                organization={organization}
                pinnedGroups={pinnedGroups}
                setPinnedGroups={setPinnedGroups}
            />
        </div>
    );
}
