import React, { useCallback, useContext } from 'react';
import { mainContext } from '../../../../contexts/MainContext';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../../hooks/useEnvData';
import { useNavigateState } from '../../../../modules/state_router/Router';

export default function TopNavbarMobileButtons() {
    const translate = useTranslate();

    const envData = useEnvData();
    const navigateState = useNavigateState();

    const { setMobileMenuOpened } = useContext(mainContext);

    const hideMobileMenu = useCallback(() => {
        setMobileMenuOpened(false);
    }, [setMobileMenuOpened]);

    const startFundRequest = useCallback(
        (data: object) => {
            hideMobileMenu();
            navigateState('start', {}, data);
        },
        [hideMobileMenu, navigateState],
    );

    return (
        <div className="navbar-mobile-auth-buttons">
            {envData.config.flags.showStartButton && (
                <button
                    className="navbar-mobile-auth-button button button-primary-outline"
                    onClick={() => startFundRequest({ restore_with_email: 1 })}
                    aria-label={envData.config.flags.showStartButtonText || translate('top_navbar.start')}
                    role="button">
                    <em className="mdi mdi-plus-circle icon-start" />
                    {envData.config.flags.showStartButtonText || translate('top_navbar.start')}
                </button>
            )}

            <button
                className="navbar-mobile-auth-button button button-primary"
                onClick={() => startFundRequest({ reset: 1 })}
                role="button"
                aria-label={translate('top_navbar.buttons.login')}
                id="login_mobile">
                <em className="mdi mdi-account icon-start" />
                {translate(`top_navbar.buttons.${envData.client_key}.login`, {}, 'top_navbar.buttons.login')}
            </button>
        </div>
    );
}
