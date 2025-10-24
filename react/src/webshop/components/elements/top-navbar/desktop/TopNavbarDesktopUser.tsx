import React, { Fragment } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useEnvData from '../../../../hooks/useEnvData';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { TopNavbarDesktopMenuUser } from './TopNavbarDesktopMenuUser';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import { strLimit } from '../../../../../dashboard/helpers/string';
import useStartFundRequest from './hooks/useStartFundRequest';

export const TopNavbarDesktopUser = () => {
    const envData = useEnvData();
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();
    const startFundRequest = useStartFundRequest();

    return (
        <div className="navbar-desktop-user">
            <div className="navbar-desktop-user-buttons">
                {!authIdentity ? (
                    <Fragment>
                        {envData.config.flags.showStartButton && (
                            <button
                                className="button button-primary-outline"
                                onClick={() => startFundRequest({ restore_with_email: 1 })}
                                aria-label={translate(
                                    'top_navbar.start_button.' + envData.client_key,
                                    null,
                                    'top_navbar.start',
                                )}
                                role="button">
                                <em className="mdi mdi-plus-circle" />
                                <span>
                                    {translate(
                                        'top_navbar.start_button.' + envData.client_key,
                                        null,
                                        'top_navbar.start',
                                    )}
                                </span>
                            </button>
                        )}

                        <button
                            className={
                                envData?.config?.flags?.navbarCombined ? 'button button-text' : 'button button-primary'
                            }
                            onClick={() => startFundRequest({ reset: 1 })}
                            role="button"
                            aria-label={translate(`home.header.${envData.client_key}.button`, {}, 'home.header.button')}
                            id="start_modal"
                            data-dusk="btnStart">
                            <em className="mdi mdi-account icon-start" />
                            {translate(`home.header.${envData.client_key}.button`, {}, 'home.header.button')}
                        </button>
                    </Fragment>
                ) : (
                    <Fragment>
                        {!envData?.config?.flags?.navbarCombined ? (
                            <StateNavLink
                                name={'vouchers'}
                                className="navbar-desktop-user-button-vouchers button button-primary"
                                dataDusk="userVouchers"
                                id="vouchers">
                                <em className="mdi mdi-ticket-confirmation" />
                                {translate(
                                    `top_navbar.buttons.${envData.client_key}.voucher`,
                                    {},
                                    'top_navbar.buttons.voucher',
                                )}
                            </StateNavLink>
                        ) : (
                            <Fragment>
                                {authIdentity?.email && (
                                    <div className="navbar-desktop-user-email">{strLimit(authIdentity?.email, 27)}</div>
                                )}
                            </Fragment>
                        )}
                    </Fragment>
                )}
            </div>

            <TopNavbarDesktopMenuUser />
        </div>
    );
};
