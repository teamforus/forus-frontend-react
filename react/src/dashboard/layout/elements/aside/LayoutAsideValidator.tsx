import React from 'react';
import LayoutAsideNavGroup from './elements/LayoutAsideNavGroup';
import Organization from '../../../props/models/Organization';
import { hasPermission } from '../../../helpers/utils';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { IconManagement, IconManagementActive } from './icons/LayoutAsideIcons';
import LayoutAsideGroupOrganization from './groups/LayoutAsideGroupOrganization';
import LayoutAsideGroupPersonal from './groups/LayoutAsideGroupPersonal';
import LayoutAsideGroupHelp from './groups/LayoutAsideGroupHelp';
import { usePinnedMenuGroups } from './hooks/usePinnedMenuGroups';

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
                items={[
                    {
                        id: 'fund_requests',
                        name: 'Aanvragen',
                        state: 'fund-requests',
                        stateParams: { organizationId: organization?.id },
                        show:
                            appConfigs?.organizations?.funds?.fund_requests &&
                            hasPermission(organization, ['validate_records', 'manage_validators'], false),
                    },
                    {
                        id: 'requesters',
                        name: 'Klaarzetten',
                        state: 'csv-validation',
                        stateParams: { organizationId: organization?.id },
                        show: hasPermission(organization, 'validate_records'),
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
