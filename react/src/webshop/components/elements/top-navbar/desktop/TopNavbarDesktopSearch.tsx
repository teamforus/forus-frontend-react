import React from 'react';
import TopNavbarSearch from '../TopNavbarSearch';
import useEnvData from '../../../../hooks/useEnvData';

export const TopNavbarDesktopSearch = ({ autoFocus = false }: { autoFocus?: boolean }) => {
    const envData = useEnvData();

    return (
        <div className="navbar-desktop-search">
            {envData.config.flags.genericSearch && <TopNavbarSearch autoFocus={autoFocus} />}
        </div>
    );
};
