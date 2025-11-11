import React, { useCallback, useContext, useRef } from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import ClickOutside from '../../../../../dashboard/components/elements/click-outside/ClickOutside';
import { strLimit } from '../../../../../dashboard/helpers/string';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import { mainContext } from '../../../../contexts/MainContext';
import { authContext } from '../../../../contexts/AuthContext';
import useAuthIdentity2FAState from '../../../../hooks/useAuthIdentity2FAState';
import ModalAuthPincode from '../../../modals/ModalAuthPincode';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import useEnvData from '../../../../hooks/useEnvData';
import IdentityAvatar from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/identity-avatar.svg';
import IdentityAvatarAccount from '../../../../../../assets/forus-webshop/resources/webshop-vergoedingen/assets/img/identity-avatar.svg';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export const TopNavbarDesktopMenuUser = () => {
    const authIdentity = useAuthIdentity();
    const openModal = useOpenModal();

    const { signOut } = useContext(authContext);
    const { userMenuOpened, setUserMenuOpened } = useContext(mainContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const menuRef = useRef<HTMLDivElement>(null);
    const auth2faState = useAuthIdentity2FAState();

    const translate = useTranslate();

    const hideUserMenu = useCallback(() => {
        setUserMenuOpened(false);
    }, [setUserMenuOpened]);

    const openPinCodePopup = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            hideUserMenu();

            openModal((modal) => <ModalAuthPincode modal={modal} />);
        },
        [openModal, hideUserMenu],
    );

    if (!authIdentity) {
        return;
    }

    return (
        <div
            className={'navbar-desktop-user-profile'}
            onBlur={(e) => {
                if (userMenuOpened && !e.currentTarget.contains(e.relatedTarget)) {
                    menuRef?.current?.focus();
                }
            }}>
            <div
                id="user_menu"
                className="navbar-desktop-user-wrapper"
                data-dusk="userProfile"
                onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpened((userMenuOpened) => !userMenuOpened);
                }}
                aria-haspopup="true"
                tabIndex={0}
                aria-expanded={userMenuOpened ? 'true' : 'false'}
                onKeyDown={clickOnKeyEnter}
                role="button"
                ref={menuRef}
                aria-label={translate('top_navbar.user_menu.aria_label')}>
                <div className="navbar-desktop-user-avatar">
                    {envData?.config?.flags?.navbarCombined ? <IdentityAvatarAccount /> : <IdentityAvatar />}
                </div>

                <div className="navbar-desktop-user-caret">
                    <em className={`mdi ${userMenuOpened ? 'mdi-chevron-up' : 'mdi-chevron-down'}`} />
                </div>

                {userMenuOpened && (
                    <ClickOutside
                        onClickOutside={hideUserMenu}
                        className={'navbar-desktop-user-menu'}
                        aria-labelledby="user_menu">
                        <div className="triangle" />
                        <div
                            className="inner"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setUserMenuOpened(false);
                                    menuRef?.current?.focus();
                                }

                                e.stopPropagation();
                            }}>
                            {authIdentity?.email && (
                                <div className="auth-user-menu-user">
                                    <span className="text-strong-half">
                                        {translate('top_navbar.user_menu.auth_as')} <br />
                                    </span>
                                    {strLimit(authIdentity?.email, 27)}
                                </div>
                            )}

                            {authIdentity?.email && <div className="auth-user-menu-separator" />}

                            <StateNavLink
                                id="vouchers"
                                name={WebshopRoutes.VOUCHERS}
                                className="auth-user-menu-item"
                                tabIndex={0}>
                                <em className="mdi mdi-ticket-percent-outline" />
                                {translate('top_navbar.user_menu.my_vouchers')}
                            </StateNavLink>

                            <div
                                id="open_pincode_popup"
                                tabIndex={0}
                                className="auth-user-menu-item"
                                onClick={(e) => openPinCodePopup(e)}
                                onKeyDown={clickOnKeyEnter}
                                role="button">
                                <em className="mdi mdi-cellphone" />
                                {translate('top_navbar.user_menu.authorize')}
                            </div>

                            <StateNavLink
                                id="bookmarked_products"
                                name={WebshopRoutes.BOOKMARKED_PRODUCTS}
                                className="auth-user-menu-item"
                                tabIndex={0}>
                                <em className="mdi mdi-cards-heart-outline" />
                                {translate('top_navbar.user_menu.bookmarks')}
                            </StateNavLink>

                            <StateNavLink
                                id="reservations"
                                name={WebshopRoutes.RESERVATIONS}
                                className="auth-user-menu-item"
                                dataDusk="btnReservations"
                                tabIndex={0}>
                                <em className="mdi mdi-calendar-outline" />
                                {translate('top_navbar.user_menu.reservations')}
                            </StateNavLink>

                            {appConfigs.has_physical_cards && (
                                <StateNavLink
                                    id="physical_cards"
                                    name={WebshopRoutes.PHYSICAL_CARDS}
                                    className="auth-user-menu-item"
                                    dataDusk="btnPhysicalCards"
                                    tabIndex={0}>
                                    <em className="mdi mdi-credit-card-multiple-outline" />
                                    {translate('top_navbar.user_menu.physical_cards')}
                                </StateNavLink>
                            )}

                            {appConfigs.has_reimbursements && (
                                <StateNavLink
                                    id="reimbursements"
                                    name={WebshopRoutes.REIMBURSEMENTS}
                                    className="auth-user-menu-item"
                                    dataDusk="btnReimbursements"
                                    tabIndex={0}>
                                    <em className="mdi mdi-receipt-outline" />
                                    {translate('top_navbar.user_menu.reimbursements')}
                                </StateNavLink>
                            )}

                            <StateNavLink
                                id="fund-requests"
                                name={WebshopRoutes.FUND_REQUESTS}
                                className="auth-user-menu-item"
                                dataDusk="btnFundRequests"
                                tabIndex={0}>
                                <em className="mdi mdi-card-account-details-outline" />
                                {translate('top_navbar.user_menu.fund_requests')}
                            </StateNavLink>

                            {appConfigs.has_payouts && (
                                <StateNavLink
                                    id="payouts"
                                    name={WebshopRoutes.PAYOUTS}
                                    className="auth-user-menu-item"
                                    dataDusk="btnPayouts"
                                    tabIndex={0}>
                                    <em className="mdi mdi-wallet-plus-outline" />
                                    {translate('top_navbar.user_menu.payouts')}
                                </StateNavLink>
                            )}

                            <StateNavLink
                                name={WebshopRoutes.NOTIFICATIONS}
                                className="auth-user-menu-item"
                                tabIndex={0}>
                                <em className="mdi mdi-bell-outline" />
                                {translate('top_navbar.user_menu.notifications')}
                            </StateNavLink>

                            <StateNavLink
                                id="notification_preferences"
                                name={WebshopRoutes.PREFERENCE_NOTIFICATIONS}
                                className="auth-user-menu-item"
                                tabIndex={0}>
                                <em className="mdi mdi-cog-outline" />
                                {translate('top_navbar.user_menu.preferences_notifications')}
                            </StateNavLink>

                            {authIdentity?.profile && (
                                <StateNavLink
                                    id="profile"
                                    name={WebshopRoutes.PROFILE}
                                    className="auth-user-menu-item"
                                    tabIndex={0}>
                                    <em className="mdi mdi-account-check" />
                                    {translate('top_navbar.user_menu.profile')}
                                </StateNavLink>
                            )}

                            {envData.config.sessions && (
                                <StateNavLink
                                    name={WebshopRoutes.SECURITY_SESSIONS}
                                    className="auth-user-menu-item"
                                    tabIndex={0}>
                                    <em className="mdi mdi-shield-account" />
                                    {translate('top_navbar.user_menu.security_sessions')}
                                </StateNavLink>
                            )}

                            <StateNavLink
                                id="identity_emails"
                                name={WebshopRoutes.IDENTITY_EMAILS}
                                className="auth-user-menu-item"
                                dataDusk="btnUserEmails"
                                tabIndex={0}>
                                <em className="mdi mdi-at" />
                                {translate('top_navbar.user_menu.preferences_emails')}
                            </StateNavLink>

                            {(envData.config.flags.show2FAMenu || auth2faState?.required) && (
                                <StateNavLink
                                    name={WebshopRoutes.SECURITY_2FA}
                                    className="auth-user-menu-item"
                                    tabIndex={0}>
                                    <em className="mdi mdi-security" />
                                    {translate('top_navbar.user_menu.security_2fa')}
                                </StateNavLink>
                            )}

                            <div className="auth-user-menu-separator" />
                            <div
                                id="sign_out"
                                className="auth-user-menu-item"
                                onClick={() => signOut()}
                                onKeyDown={clickOnKeyEnter}
                                role="button"
                                data-dusk="btnUserLogout"
                                tabIndex={0}>
                                <em className="mdi mdi-logout" />
                                {translate('top_navbar.user_menu.logout')}
                            </div>
                        </div>
                    </ClickOutside>
                )}
            </div>
        </div>
    );
};
