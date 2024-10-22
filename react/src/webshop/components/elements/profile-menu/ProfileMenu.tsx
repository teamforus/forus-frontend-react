import React from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';

export default function ProfileMenu({ className }: { className?: string }) {
    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const auth2FAState = useAuthIdentity2FAState();

    const translate = useTranslate();
    const navigateState = useNavigateState();

    return (
        <div className={`profile-menu ${className || ''}`}>
            <StateNavLink
                name="vouchers"
                className="profile-menu-item"
                aria-current={navigateState?.name == 'vouchers' ? 'page' : null}>
                {translate('profile_menu.buttons.vouchers')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            <StateNavLink
                name="bookmarked-products"
                className="profile-menu-item"
                aria-current={navigateState?.name == 'bookmarked-products' ? 'page' : null}>
                {translate('profile_menu.buttons.bookmarks')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            <StateNavLink
                className="profile-menu-item"
                name="reservations"
                aria-current={navigateState?.name == 'reservations' ? 'page' : null}>
                {translate('profile_menu.buttons.reservations')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {appConfigs.has_reimbursements && (
                <StateNavLink
                    className="profile-menu-item"
                    name="reimbursements"
                    dataDusk="menuBtnReimbursements"
                    aria-current={navigateState?.name == 'reimbursements' ? 'page' : null}>
                    {translate('profile_menu.buttons.reimbursements')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            <StateNavLink
                className="profile-menu-item"
                name="fund-requests"
                role="button"
                aria-current={navigateState?.name == 'fund-requests' ? 'page' : null}>
                {translate('profile_menu.buttons.fund_requests')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {appConfigs.has_payouts && (
                <StateNavLink
                    className="profile-menu-item"
                    name="payouts"
                    role="button"
                    aria-current={navigateState?.name == 'payouts' ? 'page' : null}>
                    {translate('profile_menu.buttons.payouts')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            {envData.config.flags.fundsMenu && (
                <StateNavLink
                    className="profile-menu-item show-sm"
                    name="funds"
                    role="button"
                    aria-current={navigateState?.name == 'funds' ? 'page' : null}>
                    {translate(
                        `funds.buttons.${envData.client_key}.start_request`,
                        null,
                        'funds.buttons.start_request',
                    )}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            {appConfigs.records.list && (
                <StateNavLink
                    className="profile-menu-item"
                    name="records"
                    aria-current={navigateState?.name == 'records' ? 'page' : null}>
                    {translate('profile_menu.buttons.records')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            <StateNavLink
                className="profile-menu-item"
                name="notifications"
                aria-current={navigateState?.name == 'notifications' ? 'page' : null}>
                {translate('profile_menu.buttons.notifications')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            <StateNavLink
                className="profile-menu-item"
                name="preferences-notifications"
                aria-current={navigateState?.name == 'preferences-notifications' ? 'page' : null}>
                {translate('profile_menu.buttons.notification_preferences')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {envData.config.sessions && (
                <StateNavLink
                    className="profile-menu-item"
                    name="security-sessions"
                    aria-current={navigateState?.name == 'security-sessions' ? 'page' : null}>
                    {translate('profile_menu.buttons.sessions')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}

            <StateNavLink
                className="profile-menu-item"
                name="identity-emails"
                aria-current={navigateState?.name == 'identity-emails' ? 'page' : null}>
                {translate('profile_menu.buttons.email_settings')}
                <em className="mdi mdi-arrow-right" aria-hidden="true" />
            </StateNavLink>

            {(envData.config.flags.show2FAMenu || auth2FAState?.required) && (
                <StateNavLink
                    className="profile-menu-item"
                    name="security-2fa"
                    aria-current={navigateState?.name == 'security-2fa' ? 'page' : null}>
                    {translate('profile_menu.buttons.security')}
                    <em className="mdi mdi-arrow-right" aria-hidden="true" />
                </StateNavLink>
            )}
        </div>
    );
}
