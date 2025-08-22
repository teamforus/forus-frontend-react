import React from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { useStateRoutes } from '../../../../modules/state_router/Router';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export const TopNavbarDesktopLogo = () => {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const { route } = useStateRoutes();

    return (
        <StateNavLink name={'home'} className="navbar-desktop-logo" disabled={route?.state?.name === 'home'}>
            {/* Creates alt: Go to home page of name.municipality.nl*/}
            <img
                src={assetUrl(`/assets/img/logo-normal.svg`)}
                alt={translate(
                    `logo_title`,
                    {
                        host: window.location.host,
                    },
                    `logo_alt_text.home`,
                )}
            />
        </StateNavLink>
    );
};
