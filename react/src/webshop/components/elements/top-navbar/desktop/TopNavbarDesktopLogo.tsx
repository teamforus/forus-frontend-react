import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { useStateRoutes } from '../../../../modules/state_router/Router';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';
import useEnvData from '../../../../hooks/useEnvData';

export const TopNavbarDesktopLogo = () => {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const envData = useEnvData();

    const { route } = useStateRoutes();

    return (
        <StateNavLink
            name={WebshopRoutes.HOME}
            className="navbar-desktop-logo"
            disabled={route?.state?.name === WebshopRoutes.HOME}>
            <img
                src={assetUrl(`/assets/img/logo-normal.svg`)}
                alt={
                    route?.state?.name === WebshopRoutes.HOME
                        ? translate(`logo_alt_text.home.${envData.client_key}`, {}, 'logo_alt_text.home.default')
                        : translate(`logo_alt_text.pages.${envData.client_key}`, {}, 'logo_alt_text.pages.default')
                }
            />
        </StateNavLink>
    );
};
