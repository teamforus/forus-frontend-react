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
import HelpCenter from '../../components/elements/HelpCenter';
import { useNavigateState } from '../../modules/state_router/Router';

export default function LayoutHeader() {
    const authIdentity = useAuthIdentity();
    const appConfigs = useAppConfigs();

    const location = useLocation();

    const assetUrl = useAssetUrl();
    const navigateState = useNavigateState();
    const activeMenuDropdown = useActiveMenuDropdown();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();

    const [showMenu, setShowMenu] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [shownMenuGroup, setShownMenuGroup] = useState('home');
    const [shownSubMenuGroup, setShownSubMenuGroup] = useState('basic-functions');

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
                        <div
                            className="layout-header-menu-item"
                            onClick={() => {
                                setActiveMenuDropdown(activeMenuDropdown == 'platform' ? null : 'platform');
                            }}>
                            Platform
                            <em className={`mdi mdi-menu-${activeMenuDropdown === 'platform' ? 'up' : 'down'}`} />
                        </div>
                        <div
                            className="layout-header-menu-item"
                            onClick={() => {
                                setActiveMenuDropdown(activeMenuDropdown == 'about' ? null : 'about');
                            }}>
                            Over ons
                            <em className={`mdi mdi-menu-${activeMenuDropdown === 'about' ? 'up' : 'down'}`} />
                        </div>
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
                            <span className={`layout-header-identifier`}>{authIdentity?.email}</span>
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
                            <em className="mdi mdi-menu menu-icon-toggle" onClick={() => setShowMobileMenu(true)} />
                        )}
                    </div>
                </div>
            </div>

            {showMobileMenu && (
                <div className="block block-mobile-menu show-sm">
                    <div className={`mobile-menu-group active`}>
                        <StateNavLink name="home" className="mobile-menu-group-header">
                            Home
                        </StateNavLink>
                    </div>

                    <div
                        className={`mobile-menu-group`}
                        onClick={(e) => {
                            setShownMenuGroup(shownMenuGroup != 'platform' ? 'platform' : '');
                            e.stopPropagation();
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
                            <Fragment>
                                <div
                                    className={`mobile-submenu-group ${
                                        shownSubMenuGroup == 'basic-functions' ? 'active' : ''
                                    }`}>
                                    <div
                                        className="mobile-menu-group-header"
                                        onClick={(e) => {
                                            setShownSubMenuGroup(
                                                shownSubMenuGroup != 'basic-functions' ? 'basic-functions' : '',
                                            );
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}>
                                        <img
                                            className="mobile-submenu-image"
                                            src={assetUrl(
                                                `/assets/img/icon-basic-functions${
                                                    shownSubMenuGroup == 'basic-functions' ? '-active' : ''
                                                }.svg`,
                                            )}
                                            alt=""
                                        />
                                        Basisfuncties
                                        <em
                                            className={`mdi mdi-menu-${
                                                shownSubMenuGroup.includes('basic-functions') ? 'up' : 'down'
                                            } pull-right`}
                                        />
                                    </div>

                                    {shownSubMenuGroup == 'basic-functions' && (
                                        <Fragment>
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

                                            <HelpCenter />
                                        </Fragment>
                                    )}
                                </div>

                                <div className={`mobile-submenu-group ${shownSubMenuGroup == 'roles' ? 'active' : ''}`}>
                                    <div
                                        className="mobile-menu-group-header"
                                        onClick={(e) => {
                                            setShownSubMenuGroup(shownSubMenuGroup != 'roles' ? 'roles' : '');
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}>
                                        <img
                                            className="mobile-submenu-image"
                                            src={assetUrl(
                                                `/assets/img/icon-roles${
                                                    shownSubMenuGroup == 'roles' ? '-active' : ''
                                                }.svg`,
                                            )}
                                            alt=""
                                        />
                                        Rollen
                                        <em
                                            className={`mdi mdi-menu-${
                                                shownSubMenuGroup.includes('roles') ? 'up' : 'down'
                                            } pull-right`}
                                        />
                                    </div>

                                    {shownSubMenuGroup == 'roles' && (
                                        <Fragment>
                                            <div className="mobile-menu-items">
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('roles-requester');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-roles/requester.svg`)}
                                                        alt=""
                                                    />
                                                    Deelnemer / Aanvrager
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('roles-provider');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-roles/provider.svg`)}
                                                        alt=""
                                                    />
                                                    Aanbieder
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('roles-sponsor');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-roles/sponsor.svg`)}
                                                        alt=""
                                                    />
                                                    Sponsor
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('roles-validator');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-roles/validator.svg`)}
                                                        alt=""
                                                    />
                                                    Beoordelaar
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                            </div>

                                            <HelpCenter />
                                        </Fragment>
                                    )}
                                </div>
                            </Fragment>
                        )}
                    </div>

                    <div
                        className={`mobile-menu-group`}
                        onClick={(e) => {
                            setShownMenuGroup(shownMenuGroup != 'about' ? 'about' : '');
                            e.stopPropagation();
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
                                <a
                                    className="mobile-menu-item"
                                    onClick={() => {
                                        navigateState('about-us');
                                        setShowMobileMenu(false);
                                    }}>
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
                                <a
                                    className="mobile-menu-item"
                                    onClick={() => {
                                        navigateState('about-us-innovation');
                                        setShowMobileMenu(false);
                                    }}>
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
                        <StateNavLink name="contacts" className={`mobile-menu-group-header`}>
                            Contact
                        </StateNavLink>
                    </div>
                </div>
            )}

            {activeMenuDropdown === 'platform' && <DropdownPlatform />}
            {activeMenuDropdown === 'about' && <DropdownAbout />}
        </Fragment>
    );
}
