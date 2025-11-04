import React, { useCallback, useContext } from 'react';
import { mainContext } from '../../../../contexts/MainContext';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../../hooks/useEnvData';
import useStartFundRequest from '../desktop/hooks/useStartFundRequest';

export default function TopNavbarMobileButtons() {
    const envData = useEnvData();
    const { setMobileMenuOpened } = useContext(mainContext);

    const translate = useTranslate();
    const startFundRequest = useStartFundRequest();

    const startFundRequestMobile = useCallback(
        (data: object) => {
            setMobileMenuOpened(false);
            startFundRequest(data);
        },
        [setMobileMenuOpened, startFundRequest],
    );

    return (
        <div className="navbar-mobile-auth-buttons">
            {envData.config.flags.showStartButton && (
                <button
                    className="navbar-mobile-auth-button button button-primary-outline"
                    onClick={() => startFundRequestMobile({ restore_with_email: 1 })}
                    aria-label={translate('top_navbar.start_button.' + envData.client_key, null, 'top_navbar.start')}
                    role="button">
                    <em className="mdi mdi-plus-circle icon-start" />
                    {translate('top_navbar.start_button.' + envData.client_key, null, 'top_navbar.start')}
                </button>
            )}

            <button
                className="navbar-mobile-auth-button button button-primary"
                onClick={() => startFundRequestMobile({ reset: 1 })}
                role="button"
                aria-label={translate('top_navbar.buttons.login')}
                id="login_mobile">
                <em className="mdi mdi-account icon-start" />
                {translate(`top_navbar.buttons.${envData.client_key}.login`, {}, 'top_navbar.buttons.login')}
            </button>
        </div>
    );
}
