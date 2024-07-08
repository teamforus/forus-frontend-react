import React, { Fragment, useEffect, useState } from 'react';
import useAppConfigs from '../../hooks/useAppConfigs';
import useAssetUrl from '../../hooks/useAssetUrl';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import classNames from 'classnames';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';

import StateNavLink from '../../modules/state_router/StateNavLink';
import IconSponsor from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/sponsor-icon.svg';
import IconProvider from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/provider-icon.svg';
import IconValidator from '../../../../assets/forus-website/resources/_website-common/assets/img/header-menu/validator-icon.svg';
import { useLocation } from 'react-router-dom';
import DropdownPlatform from './DropdownPlatform';
import DropdownAbout from './DropdownAbout';
import useActiveMenuDropdown from '../../hooks/useActiveMenuDropdown';

export default function LayoutHeader() {
    const authIdentity = useAuthIdentity();
    const appConfigs = useAppConfigs();

    const location = useLocation();

    const assetUrl = useAssetUrl();
    const activeMenuDropdown = useActiveMenuDropdown();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();

    const [showMenu, setShowMenu] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [shownMenuGroup, setShownMenuGroup] = useState('home');

    useEffect(() => {
        setShowMenu(false);
    }, [location]);

    if (!appConfigs) {
        return null;
    }

    return (
        <Fragment>
            <div className="layout-header">
                <div className="layout-header-wrapper hide-sm">
                    <StateNavLink name={'home'} className="layout-header-logo">
                        <img src={assetUrl('/assets/img/logo.svg')} alt="" />
                    </StateNavLink>
                    <div className="layout-header-menu">
                        <StateNavLink
                            name={'home'}
                            className="layout-header-menu-item"
                            activeExact={true}
                            onClick={() => setActiveMenuDropdown(null)}>
                            Home
                        </StateNavLink>
                        <StateNavLink
                            name={'platform'}
                            className="layout-header-menu-item"
                            activeExact={true}
                            onClick={() => {
                                setActiveMenuDropdown(activeMenuDropdown == 'platform' ? null : 'platform');
                            }}>
                            Platform
                            <em className={`mdi mdi-menu-${activeMenuDropdown === 'platform' ? 'up' : 'down'}`} />
                        </StateNavLink>
                        <StateNavLink
                            name={'about'}
                            className="layout-header-menu-item"
                            activeExact={true}
                            onClick={() => {
                                setActiveMenuDropdown(activeMenuDropdown == 'about' ? null : 'about');
                            }}>
                            Over ons
                            <em className={`mdi mdi-menu-${activeMenuDropdown === 'about' ? 'up' : 'down'}`} />
                        </StateNavLink>
                        <StateNavLink
                            name={'contacts'}
                            className="layout-header-menu-item"
                            activeExact={true}
                            onClick={() => setActiveMenuDropdown(null)}>
                            Contact
                        </StateNavLink>
                    </div>
                    {authIdentity ? (
                        <div
                            className={classNames('layout-header-auth clickable', showMenu && 'active')}
                            onClick={() => setShowMenu(!showMenu)}>
                            <div className="layout-header-auth-content">
                                <div className="layout-header-auth-details">
                                    <div className="layout-header-auth-details-identifier">
                                        {authIdentity?.email || authIdentity?.address}
                                    </div>
                                    <div className="layout-header-auth-details-label">Uw profiel</div>
                                </div>
                                <div className="layout-header-auth-media">
                                    <img src={assetUrl('/assets/img/website-profile.svg')} alt="" />
                                </div>
                            </div>
                            <div className="layout-header-auth-toggle">
                                <em className="mdi mdi-menu-down" />
                            </div>
                            {showMenu && (
                                <div className="layout-header-auth-menu" onClick={(e) => e.stopPropagation()}>
                                    {appConfigs.fronts?.url_sponsor && (
                                        <a
                                            className="layout-header-auth-menu-item"
                                            href={appConfigs.fronts?.url_sponsor}
                                            onClick={() => setShowMenu(false)}
                                            target={'_blank'}
                                            rel="noreferrer">
                                            <IconSponsor />
                                            Sponsor
                                        </a>
                                    )}
                                    {appConfigs.fronts?.url_provider && (
                                        <a
                                            className="layout-header-auth-menu-item"
                                            href={appConfigs.fronts?.url_provider}
                                            onClick={() => setShowMenu(false)}
                                            target={'_blank'}
                                            rel="noreferrer">
                                            <IconProvider /> Aanbieder
                                        </a>
                                    )}
                                    {appConfigs.fronts?.url_validator && (
                                        <a
                                            className="layout-header-auth-menu-item"
                                            href={appConfigs.fronts?.url_validator}
                                            onClick={() => setShowMenu(false)}
                                            target={'_blank'}
                                            rel="noreferrer">
                                            <IconValidator /> Beoordelaar
                                        </a>
                                    )}
                                    <div className="layout-header-auth-menu-separator" />
                                    <StateNavLink name={'sign-out'} className="layout-header-auth-menu-item">
                                        <em className="mdi mdi-logout" />
                                        Uitloggen
                                    </StateNavLink>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="layout-header-auth">
                            <div className="button-group">
                                <StateNavLink name={'sign-in'} className="button button-light button-sm">
                                    Inloggen
                                </StateNavLink>
                                <div className="button button-primary button-sm">Gratis demo</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="layout-header-wrapper show-sm-flex">
                    <StateNavLink name={'home'} className="layout-header-logo">
                        <img src={assetUrl('/assets/img/logo.svg')} alt="" />
                    </StateNavLink>
                    <div className="layout-header-menu">
                        {authIdentity ? (
                            <span>authIdentity?.email</span>
                        ) : (
                            <Fragment>
                                <img
                                    className="layout-header-login-icon"
                                    src={assetUrl('/assets/img/icon-login.svg')}
                                    alt=""
                                />
                                <div className="button button-text button-login" role="button">
                                    Inloggen
                                </div>
                            </Fragment>
                        )}
                        {showMobileMenu ? (
                            <em className="mdi mdi-close menu-icon-close" onClick={() => setShowMobileMenu(false)} />
                        ) : (
                            <em className="mdi mdi-menu" onClick={() => setShowMobileMenu(true)} />
                        )}
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="block block-mobile-menu show-sm">
                    <div className={`mobile-menu-group active`}>
                        <div className="mobile-menu-group-header">Home</div>
                    </div>

                    <div
                        className={`mobile-menu-group`}
                        onClick={() => {
                            setShownMenuGroup(shownMenuGroup != 'platform' ? 'platform' : '');
                        }}>
                        <div className="mobile-menu-group-header">
                            Platform
                            <em
                                className={`mdi mdi-menu-${
                                    shownMenuGroup.includes('platform') ? 'up' : 'down'
                                } pull-right`}
                            />
                        </div>

                        {shownMenuGroup == 'platform' && (
                            <div className="mobile-menu-items">
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-icon"
                                        src={assetUrl(`/assets/img/icons-platform/funds.svg`)}
                                        alt=""
                                    />
                                    Fondsen
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-icon"
                                        src={assetUrl(`/assets/img/icons-platform/websites.svg`)}
                                        alt=""
                                    />
                                    Websites
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-icon"
                                        src={assetUrl(`/assets/img/icons-platform/cms.svg`)}
                                        alt=""
                                    />
                                    CMS
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-icon"
                                        src={assetUrl(`/assets/img/icons-platform/me-app.svg`)}
                                        alt=""
                                    />
                                    Me-app
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-icon"
                                        src={assetUrl(`/assets/img/icons-platform/notifications.svg`)}
                                        alt=""
                                    />
                                    Managementinformatie
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                            </div>
                        )}
                    </div>

                    <div
                        className={`mobile-menu-group`}
                        onClick={() => {
                            setShownMenuGroup(shownMenuGroup != 'about' ? 'about' : '');
                        }}>
                        <div className="mobile-menu-group-header">
                            Over ons
                            <em
                                className={`mdi mdi-menu-${
                                    shownMenuGroup.includes('about') ? 'up' : 'down'
                                } pull-right`}
                            />
                        </div>

                        {shownMenuGroup == 'about' && (
                            <div className="mobile-menu-items">
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-img"
                                        src={assetUrl(`/assets/img/about-us/our-story.png`)}
                                        alt=""
                                    />
                                    <div className="mobile-menu-item-info">
                                        <div className="mobile-menu-item-title">Ons verhaal</div>
                                        <div className="mobile-menu-item-description">
                                            Ontdek meer over onze organisatie.
                                        </div>
                                    </div>
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                                <a className="mobile-menu-item">
                                    <img
                                        className="mobile-menu-item-img"
                                        src={assetUrl(`/assets/img/about-us/project.png`)}
                                        alt=""
                                    />
                                    <div className="mobile-menu-item-info">
                                        <div className="mobile-menu-item-title">Project Innovatiebudget 2023</div>
                                        <div className="mobile-menu-item-description">
                                            Naar een merkbaar en meetbaar verschil - In samenwerking met gemeenten
                                            Eemsdelta en Westerkwartier.
                                        </div>
                                    </div>
                                    <em className={`mdi mdi-arrow-right`} />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className={`mobile-menu-group`}>
                        <div className="mobile-menu-group-header">Contact</div>
                    </div>
                </div>
            )}

            {activeMenuDropdown === 'platform' && <DropdownPlatform />}
            {activeMenuDropdown === 'about' && <DropdownAbout />}
        </Fragment>
    );
}
