import React from 'react';
import Organization from '../../../../props/models/Organization';
import LayoutAsideNavGroup from '../elements/LayoutAsideNavGroup';
import { IconHelp, IconHelpActive } from '../icons/LayoutAsideIcons';
import useEnvData from '../../../../hooks/useEnvData';

export default function LayoutAsideGroupHelp({
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
            id="menu_support"
            name="Ondersteuning"
            icon={<IconHelp />}
            iconActive={<IconHelpActive />}
            pinnedGroups={pinnedGroups}
            setPinnedGroups={setPinnedGroups}
            items={[
                {
                    name: 'Feedback',
                    state: 'feedback',
                    stateParams: { organizationId: organization?.id },
                    show: true,
                },
                {
                    name: 'Helpcenter',
                    href: envData?.config?.help_link,
                    target: '_blank',
                    rel: 'noreferrer',
                    show: !!envData?.config?.help_link,
                },
            ]}
        />
    );
}
