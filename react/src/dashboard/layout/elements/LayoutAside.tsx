import React from 'react';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import useEnvData from '../../hooks/useEnvData';
import LayoutAsideValidator from './aside/LayoutAsideValidator';
import LayoutAsideSponsor from './aside/LayoutAsideSponsor';
import LayoutAsideProvider from './aside/LayoutAsideProvider';

export const LayoutAside = () => {
    const envData = useEnvData();
    const activeOrganization = useActiveOrganization();

    return (
        <aside className="app app-sidebar">
            {activeOrganization && envData.client_type == 'sponsor' && (
                <LayoutAsideSponsor organization={activeOrganization} />
            )}

            {activeOrganization && envData.client_type == 'provider' && (
                <LayoutAsideProvider organization={activeOrganization} />
            )}

            {activeOrganization && envData.client_type == 'validator' && (
                <LayoutAsideValidator organization={activeOrganization} />
            )}
        </aside>
    );
};
