import React, { Fragment, useCallback, useContext } from 'react';
import useEnvData from '../../../../hooks/useEnvData';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import { mainContext } from '../../../../contexts/MainContext';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import { useStateRoutes } from '../../../../modules/state_router/Router';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import useLangSelector from '../../../../hooks/useLangSelector';
import classNames from 'classnames';
import useAuthIdentity from '../../../../hooks/useAuthIdentity';
import TopNavbarMobileMenu from './TopNavbarMobileMenu';
import TopNavbarMobileButtons from './TopNavbarMobileButtons';
import TopNavbarSearch from '../TopNavbarSearch';
import Announcements from '../../announcements/Announcements';
import useAppConfigs from '../../../../hooks/useAppConfigs';

export const TopNavbarMobile = () => {
    const { showSearchBox, setShowSearchBox, mobileMenuOpened, setMobileMenuOpened } = useContext(mainContext);

    const assetUrl = useAssetUrl();
    const appConfigs = useAppConfigs();
    const { route } = useStateRoutes();

    const envData = useEnvData();
    const translate = useTranslate();
    const authIdentity = useAuthIdentity();

    const toggleSearchBox = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();

            setShowSearchBox((showSearchBox) => !showSearchBox);
            setMobileMenuOpened(false);
        },
        [setMobileMenuOpened, setShowSearchBox],
    );

    const openMobileMenu = useCallback(
        ($e: React.MouseEvent & { target?: { tagName?: string } }) => {
            if ($e?.target?.tagName != 'A') {
                $e.stopPropagation();
                $e.preventDefault();
            }

            setMobileMenuOpened((mobileMenuOpened) => !mobileMenuOpened);
            setShowSearchBox(false);
        },
        [setMobileMenuOpened, setShowSearchBox],
    );

    const langSelector = useLangSelector();

    return (
        <div className="block block-navbar-mobile">
            {appConfigs?.announcements && (
                <div className="navbar-mobile-section">
                    <Announcements announcements={appConfigs?.announcements} />
                </div>
            )}

            <div className="navbar-mobile-section">
                <div
                    className={classNames('navbar-mobile-button', mobileMenuOpened && 'active')}
                    aria-expanded={mobileMenuOpened}
                    onClick={openMobileMenu}
                    role={'button'}
                    onKeyDown={clickOnKeyEnter}
                    tabIndex={0}>
                    <em
                        className={classNames(
                            'navbar-mobile-button-icon',
                            `mdi`,
                            mobileMenuOpened ? 'mdi-close' : 'mdi-menu',
                        )}
                    />
                    {translate(mobileMenuOpened ? 'top_navbar.items.menu.close' : 'top_navbar.items.menu.show')}
                </div>

                <StateNavLink
                    name={'home'}
                    className="navbar-mobile-logo"
                    title={translate('top_navbar.open_home')}
                    disabled={route?.state?.name === 'home'}
                    tabIndex={0}>
                    <img
                        src={assetUrl(`/assets/img/logo-normal-mobile.svg`)}
                        alt={translate(`logo_alt_text.${envData.client_key}`, {}, envData.client_key)}
                    />
                </StateNavLink>

                <div className="navbar-mobile-lang">{langSelector}</div>

                {envData.config?.flags?.genericSearch ? (
                    <div
                        className="navbar-mobile-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSearchBox(e);
                        }}
                        aria-expanded={showSearchBox}
                        aria-controls={'navbar-search'}
                        role="button"
                        onKeyDown={(e) => {
                            clickOnKeyEnter(e, true);
                        }}
                        tabIndex={0}>
                        <em className="navbar-mobile-button-icon mdi mdi-magnify" />
                        {translate('top_navbar.items.search')}
                    </div>
                ) : (
                    <div className="navbar-mobile-button" aria-hidden="true" />
                )}
            </div>

            {mobileMenuOpened ? (
                <TopNavbarMobileMenu />
            ) : (
                <div className="navbar-mobile-section">
                    {showSearchBox ? (
                        <TopNavbarSearch autoFocus={true} />
                    ) : (
                        <Fragment>{!authIdentity && <TopNavbarMobileButtons />}</Fragment>
                    )}
                </div>
            )}
        </div>
    );
};
