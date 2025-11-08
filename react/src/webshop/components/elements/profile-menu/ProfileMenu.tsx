import React from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function ProfileMenu({ className }: { className?: string }) {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const auth2FAState = useAuthIdentity2FAState();
    const authIdentity = useAuthIdentity();

    const translate = useTranslate();
    const navigateState = useNavigateState();

    return (
        <div className={`profile-menu ${className || ''}`}>
            <StateNavLink
                name={WebshopRoutes.VOUCHERS}
                className="profile-menu-item"
                aria-current={navigateState?.name == WebshopRoutes.VOUCHERS ? 'page' : null}>
                {translate('profile_menu.buttons.vouchers')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            <StateNavLink
                name={WebshopRoutes.BOOKMARKED_PRODUCTS}
                className="profile-menu-item"
                aria-current={navigateState?.name == WebshopRoutes.BOOKMARKED_PRODUCTS ? 'page' : null}>
                {translate('profile_menu.buttons.bookmarks')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            <StateNavLink
                className="profile-menu-item"
                name={WebshopRoutes.RESERVATIONS}
                aria-current={navigateState?.name == WebshopRoutes.RESERVATIONS ? 'page' : null}>
                {translate('profile_menu.buttons.reservations')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {appConfigs.has_physical_cards && (
                <StateNavLink
                    className="profile-menu-item"
                    name={WebshopRoutes.PHYSICAL_CARDS}
                    aria-current={navigateState?.name == WebshopRoutes.PHYSICAL_CARDS ? 'page' : null}>
                    {translate('profile_menu.buttons.physical_cards')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            {appConfigs.has_reimbursements && (
                <StateNavLink
                    className="profile-menu-item"
                    name={WebshopRoutes.REIMBURSEMENTS}
                    dataDusk="menuBtnReimbursements"
                    aria-current={navigateState?.name == WebshopRoutes.REIMBURSEMENTS ? 'page' : null}>
                    {translate('profile_menu.buttons.reimbursements')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            <StateNavLink
                className="profile-menu-item"
                name={WebshopRoutes.FUND_REQUESTS}
                role="button"
                aria-current={navigateState?.name == WebshopRoutes.FUND_REQUESTS ? 'page' : null}>
                {translate('profile_menu.buttons.fund_requests')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {appConfigs.has_payouts && (
                <StateNavLink
                    className="profile-menu-item"
                    name={WebshopRoutes.PAYOUTS}
                    role="button"
                    aria-current={navigateState?.name == WebshopRoutes.PAYOUTS ? 'page' : null}>
                    {translate('profile_menu.buttons.payouts')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            {envData.config.flags.fundsMenu && (
                <StateNavLink
                    className="profile-menu-item show-sm"
                    name={WebshopRoutes.FUNDS}
                    role="button"
                    aria-current={navigateState?.name == WebshopRoutes.FUNDS ? 'page' : null}>
                    {translate(
                        `funds.buttons.${envData.client_key}.start_request`,
                        null,
                        'funds.buttons.start_request',
                    )}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            <StateNavLink
                className="profile-menu-item"
                name={WebshopRoutes.NOTIFICATIONS}
                aria-current={navigateState?.name == WebshopRoutes.NOTIFICATIONS ? 'page' : null}>
                {translate('profile_menu.buttons.notifications')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            <StateNavLink
                className="profile-menu-item"
                name={WebshopRoutes.PREFERENCE_NOTIFICATIONS}
                aria-current={navigateState?.name == WebshopRoutes.PREFERENCE_NOTIFICATIONS ? 'page' : null}>
                {translate('profile_menu.buttons.notification_preferences')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {authIdentity?.profile && (
                <StateNavLink
                    className="profile-menu-item"
                    name={WebshopRoutes.PROFILE}
                    aria-current={navigateState?.name == WebshopRoutes.PROFILE ? 'page' : null}>
                    {translate('profile_menu.buttons.profile')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            {envData.config.sessions && (
                <StateNavLink
                    className="profile-menu-item"
                    name={WebshopRoutes.SECURITY_SESSIONS}
                    aria-current={navigateState?.name == WebshopRoutes.SECURITY_SESSIONS ? 'page' : null}>
                    {translate('profile_menu.buttons.sessions')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            <StateNavLink
                className="profile-menu-item"
                name={WebshopRoutes.IDENTITY_EMAILS}
                aria-current={navigateState?.name == WebshopRoutes.IDENTITY_EMAILS ? 'page' : null}>
                {translate('profile_menu.buttons.email_settings')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {(envData.config.flags.show2FAMenu || auth2FAState?.required) && (
                <StateNavLink
                    className="profile-menu-item"
                    name={WebshopRoutes.SECURITY_2FA}
                    aria-current={navigateState?.name == WebshopRoutes.SECURITY_2FA ? 'page' : null}>
                    {translate('profile_menu.buttons.security')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}
        </div>
    );
}
