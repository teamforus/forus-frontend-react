import React, { Fragment, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAppConfigs from '../../hooks/useAppConfigs';
import useAssetUrl from '../../hooks/useAssetUrl';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import classNames from 'classnames';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';

import StateNavLink from '../../modules/state_router/StateNavLink';
import DropdownPlatform from './DropdownPlatform';
import DropdownAbout from './DropdownAbout';
import useActiveMenuDropdown from '../../hooks/useActiveMenuDropdown';
import HelpCenter from '../../components/elements/HelpCenter';
import { useNavigateState } from '../../modules/state_router/Router';
import UserDropdown from '../../components/elements/UserDropdown';
import useUserAuthDropdown from '../../hooks/useUserAuthDropdown';
import useSetUserAuthDropdown from '../../hooks/useSetUserAuthDropdown';

export default function LayoutHeader() {
    const authIdentity = useAuthIdentity();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();
    const location = useLocation();
    const navigateState = useNavigateState();
    const activeMenuDropdown = useActiveMenuDropdown();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();
    const showUserAuthDropdown = useUserAuthDropdown();
    const setShowUserAuthDropdown = useSetUserAuthDropdown();

    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [shownMenuGroup, setShownMenuGroup] = useState('home');
    const [shownSubMenuGroup, setShownSubMenuGroup] = useState('basic-functions');
    const [platformRoutes] = useState([
        '/basisfuncties',
        '/me-app',
        '/cms',
        '/fondsen',
        '/website',
        '/managementinformatie',
        '/rollen',
        '/rollen/deelnemer',
        '/rollen/aanbieder',
        '/rollen/sponsor',
        '/rollen/beoordelaar',
    ]);
    const [aboutUsRoutes] = useState(['/ons-verhaal', '/project-innovatiebudget-2023']);

    if (!appConfigs) {
        return null;
    }

    return (
        <Fragment>
            <div className="layout-header">
                <div className="layout-header-wrapper hide-sm">
                    <StateNavLink
                        name={'home'}
                        className="layout-header-logo"
                        onClick={() => setActiveMenuDropdown(null)}>
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
                            className={`layout-header-menu-item ${
                                platformRoutes.includes(location.pathname) ? 'active' : ''
                            }`}
                            onClick={() => {
                                setActiveMenuDropdown(activeMenuDropdown == 'platform' ? null : 'platform');
                            }}>
                            Platform
                            <em className={`mdi mdi-menu-${activeMenuDropdown === 'platform' ? 'up' : 'down'}`} />
                        </div>
                        <div
                            className={`layout-header-menu-item ${
                                aboutUsRoutes.includes(location.pathname) ? 'active' : ''
                            }`}
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
                            className={classNames('layout-header-auth clickable', showUserAuthDropdown && 'active')}
                            onClick={() => setShowUserAuthDropdown(!showUserAuthDropdown)}>
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
                            {showUserAuthDropdown && <UserDropdown />}
                        </div>
                    ) : (
                        <div className="layout-header-auth">
                            <div className="button-group">
                                <StateNavLink name={'sign-in'} className="button button-sm button-light">
                                    Inloggen
                                </StateNavLink>
                                <StateNavLink name={'book-demo'} className="button button-sm button-primary">
                                    Gratis demo
                                </StateNavLink>
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
                            <Fragment>
                                <span
                                    className={`layout-header-identifier`}
                                    onClick={() => setShowUserAuthDropdown(!showUserAuthDropdown)}>
                                    {authIdentity?.email}
                                </span>
                            </Fragment>
                        ) : (
                            <Fragment>
                                <img
                                    className="layout-header-login-icon"
                                    src={assetUrl('/assets/img/icon-login.svg')}
                                    alt=""
                                />
                                <StateNavLink
                                    name={'sign-in'}
                                    className="button button-text button-login"
                                    role="button">
                                    Inloggen
                                </StateNavLink>
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
                        <StateNavLink
                            name="home"
                            className="mobile-menu-group-header"
                            onClick={() => {
                                setShowMobileMenu(false);
                            }}>
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
                                    <div className="mobile-menu-group-header">
                                        <StateNavLink name={'basic-functions'} onClick={() => setShowMobileMenu(false)}>
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
                                        </StateNavLink>
                                        <em
                                            className={`mdi mdi-menu-${
                                                shownSubMenuGroup.includes('basic-functions') ? 'up' : 'down'
                                            } pull-right`}
                                            onClick={(e) => {
                                                setShownSubMenuGroup(
                                                    shownSubMenuGroup != 'basic-functions' ? 'basic-functions' : '',
                                                );
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        />
                                    </div>

                                    {shownSubMenuGroup == 'basic-functions' && (
                                        <Fragment>
                                            <div className="mobile-menu-items">
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('funds');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-platform/funds.svg`)}
                                                        alt=""
                                                    />
                                                    Fondsen
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('website');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-platform/websites.svg`)}
                                                        alt=""
                                                    />
                                                    Websites
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('cms');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-platform/cms.svg`)}
                                                        alt=""
                                                    />
                                                    CMS
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('me-app');
                                                        setShowMobileMenu(false);
                                                    }}>
                                                    <img
                                                        className="mobile-menu-item-icon"
                                                        src={assetUrl(`/assets/img/icons-platform/me-app.svg`)}
                                                        alt=""
                                                    />
                                                    Me-app
                                                    <em className={`mdi mdi-arrow-right`} />
                                                </a>
                                                <a
                                                    className="mobile-menu-item"
                                                    onClick={() => {
                                                        navigateState('information');
                                                        setShowMobileMenu(false);
                                                    }}>
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
                                    <div className="mobile-menu-group-header">
                                        <StateNavLink name={'roles-main'} onClick={() => setShowMobileMenu(false)}>
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
                                        </StateNavLink>
                                        <em
                                            className={`mdi mdi-menu-${
                                                shownSubMenuGroup.includes('roles') ? 'up' : 'down'
                                            } pull-right`}
                                            onClick={(e) => {
                                                setShownSubMenuGroup(shownSubMenuGroup != 'roles' ? 'roles' : '');
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
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
                        <StateNavLink
                            name="contacts"
                            className={`mobile-menu-group-header`}
                            onClick={() => {
                                setShowMobileMenu(false);
                            }}>
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
