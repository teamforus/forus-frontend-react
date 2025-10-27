import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import useAppConfigs from '../../../../hooks/useAppConfigs';
import { mainContext } from '../../../../contexts/MainContext';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../../hooks/useEnvData';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import { useVoucherService } from '../../../../services/VoucherService';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import { useStateRoutes } from '../../../../modules/state_router/Router';
import { authContext } from '../../../../contexts/AuthContext';
import useOpenModal from '../../../../../dashboard/hooks/useOpenModal';
import useTopMenuItems from '../helpers/useTopMenuItems';
import useAuthIdentity2FAState from '../../../../hooks/useAuthIdentity2FAState';
import ModalAuthPincode from '../../../modals/ModalAuthPincode';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useSelectControlKeyEventHandlers from '../../../../../dashboard/components/elements/select-control/hooks/useSelectControlKeyEventHandlers';
import TopNavbarMobileButtons from './TopNavbarMobileButtons';
import useMobileLangSelector from '../../../../hooks/useMobileLangSelector';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function TopNavbarMobileMenu() {
    const translate = useTranslate();

    const { signOut } = useContext(authContext);
    const menuItems = useTopMenuItems();
    const { route } = useStateRoutes();

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const openModal = useOpenModal();
    const langSelector = useMobileLangSelector();

    const authIdentity = useAuthIdentity();
    const authIdentity2FAState = useAuthIdentity2FAState();

    const voucherService = useVoucherService();

    const [vouchers, setVouchers] = useState<Array<Voucher>>([]);

    const { mobileMenuOpened, setMobileMenuOpened } = useContext(mainContext);

    const selectorRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLLabelElement>(null);

    const { onKeyDown, onBlur } = useSelectControlKeyEventHandlers(
        selectorRef,
        placeholderRef,
        mobileMenuOpened,
        setMobileMenuOpened,
    );

    const hideMobileMenu = useCallback(() => {
        setMobileMenuOpened(false);
    }, [setMobileMenuOpened]);

    const onSignOut = useCallback(() => {
        signOut();
        hideMobileMenu();
    }, [hideMobileMenu, signOut]);

    const openPinCodePopup = useCallback(() => {
        openModal((modal) => <ModalAuthPincode modal={modal} />);
    }, [openModal]);

    useEffect(() => {
        if (!authIdentity) {
            return;
        }

        voucherService.list().then((res) => setVouchers(res.data.data));
    }, [authIdentity, voucherService]);

    if (!mobileMenuOpened) {
        return null;
    }

    return (
        <div className="block block-mobile-menu" ref={selectorRef} onKeyDown={onKeyDown} onBlur={onBlur}>
            <div className="mobile-menu-group mobile-menu-group-main">
                {langSelector}

                <div className="mobile-menu-group-header">{translate('top_navbar.main_menu')}</div>
                <div className="mobile-menu-items">
                    {menuItems.map((menuItem) => (
                        <Fragment key={menuItem.id}>
                            {['social_media_items', 'logout_item'].indexOf(menuItem.id) == -1 && !menuItem.href && (
                                <StateNavLink
                                    className="mobile-menu-item"
                                    name={menuItem.state}
                                    params={menuItem.stateParams}
                                    target={menuItem.target || '_blank'}
                                    activeExact={true}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    onClick={hideMobileMenu}>
                                    <em className="mobile-menu-item-icon mdi mdi-arrow-right" aria-hidden="true" />
                                    {translate(
                                        menuItem.nameTranslate,
                                        {},
                                        menuItem.nameTranslateDefault || menuItem.nameTranslate,
                                    )}
                                </StateNavLink>
                            )}

                            {['social_media_items', 'logout_item'].indexOf(menuItem.id) == -1 && menuItem.href && (
                                <a
                                    className="mobile-menu-item"
                                    href={menuItem.href}
                                    target={menuItem.target || '_blank'}
                                    onKeyDown={clickOnKeyEnter}
                                    tabIndex={0}
                                    onClick={hideMobileMenu}>
                                    <em className="mobile-menu-item-icon mdi mdi-arrow-right" aria-hidden="true" />
                                    {translate(
                                        menuItem.nameTranslate,
                                        {},
                                        menuItem.nameTranslateDefault || menuItem.nameTranslate,
                                    )}
                                </a>
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>
            <div className="mobile-menu-group">
                <div className="mobile-menu-group-header">{translate('top_navbar.user_menu.title')}</div>
                <div className="mobile-menu-items">
                    {authIdentity && vouchers?.length > 0 && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.VOUCHERS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.VOUCHERS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-ticket-percent-outline" />
                            {translate(
                                `top_navbar.buttons.mobile.dropdown.${envData.client_key}.vouchers`,
                                {},
                                'top_navbar.buttons.mobile.dropdown.vouchers',
                            )}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <div
                            className="mobile-menu-item"
                            onClick={() => {
                                hideMobileMenu();
                                openPinCodePopup();
                            }}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="button">
                            <em className="mobile-menu-item-icon mdi mdi-cellphone" />
                            {translate(
                                `top_navbar.buttons.mobile.dropdown.${envData.client_key}.authorize`,
                                {},
                                'top_navbar.buttons.mobile.dropdown.authorize',
                            )}
                        </div>
                    )}

                    {authIdentity && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.BOOKMARKED_PRODUCTS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.BOOKMARKED_PRODUCTS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-cards-heart-outline" />
                            {translate(
                                `top_navbar.buttons.mobile.dropdown.${envData.client_key}.bookmarked_products`,
                                {},
                                'top_navbar.buttons.mobile.dropdown.bookmarked_products',
                            )}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.RESERVATIONS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.RESERVATIONS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-calendar-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.reservations')}
                        </StateNavLink>
                    )}

                    {appConfigs.has_physical_cards && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.PHYSICAL_CARDS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.PHYSICAL_CARDS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-credit-card-multiple-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.physical_cards')}
                        </StateNavLink>
                    )}

                    {authIdentity && appConfigs.has_reimbursements && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.REIMBURSEMENTS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.REIMBURSEMENTS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-receipt-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.reimbursements')}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.FUND_REQUESTS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.FUND_REQUESTS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-card-account-details-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.fund_requests')}
                        </StateNavLink>
                    )}

                    {authIdentity && appConfigs.has_payouts && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.PAYOUTS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.PAYOUTS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-wallet-plus-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.payouts')}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.NOTIFICATIONS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.NOTIFICATIONS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-bell-ring-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.notifications')}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.PREFERENCE_NOTIFICATIONS}
                            onClick={hideMobileMenu}
                            aria-current={
                                route.state?.name == WebshopRoutes.PREFERENCE_NOTIFICATIONS ? 'true' : undefined
                            }
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-cog-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.preferences_notifications')}
                        </StateNavLink>
                    )}

                    {authIdentity?.profile && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.PROFILE}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.PROFILE ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-account-check" />
                            {translate('top_navbar.buttons.mobile.dropdown.profile')}
                        </StateNavLink>
                    )}

                    {authIdentity && envData.config.sessions && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.SECURITY_SESSIONS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.SECURITY_SESSIONS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-shield-account-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.sessions')}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.IDENTITY_EMAILS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.IDENTITY_EMAILS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-email-outline" />
                            {translate('top_navbar.buttons.mobile.dropdown.preferences_emails')}
                        </StateNavLink>
                    )}

                    {authIdentity && (envData.config.flags.show2FAMenu || authIdentity2FAState?.required) && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.SECURITY_2FA}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.SECURITY_2FA ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-security" />
                            {translate('top_navbar.buttons.mobile.dropdown.security')}
                        </StateNavLink>
                    )}

                    {authIdentity && appConfigs.records.list && (
                        <StateNavLink
                            className="mobile-menu-item"
                            name={WebshopRoutes.RECORDS}
                            onClick={hideMobileMenu}
                            aria-current={route.state?.name == WebshopRoutes.RECORDS ? 'true' : undefined}
                            onKeyDown={clickOnKeyEnter}
                            tabIndex={0}
                            role="link">
                            <em className="mobile-menu-item-icon mdi mdi-format-list-bulleted" />
                            {translate('top_navbar.buttons.mobile.dropdown.records')}
                        </StateNavLink>
                    )}

                    {authIdentity && (
                        <a
                            role="button"
                            tabIndex={0}
                            className="mobile-menu-item"
                            onClick={onSignOut}
                            onKeyDown={clickOnKeyEnter}
                            aria-label={translate('top_navbar.buttons.logout')}>
                            <em className="mobile-menu-item-icon mdi mdi-logout" />
                            {translate('top_navbar.buttons.logout')}
                        </a>
                    )}

                    {!authIdentity && <TopNavbarMobileButtons />}
                </div>
            </div>
        </div>
    );
}
