import React, { MouseEventHandler, useCallback, useContext, useEffect, useState } from 'react';
import { mainContext } from '../../contexts/MainContext';
import { strLimit } from '../../helpers/string';

import IconEmail from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-email.svg';
import IconNotifications from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-notifications.svg';
import IconSecurity from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-security.svg';
import IconSessions from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-sessions.svg';
import IconAuthorizeDevice from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-authorize-device.svg';
import IconSignOut from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-sign-out.svg';

import IconValidator from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-validator.svg';
import IconProvider from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-provider.svg';
import IconSponsor from '../../../../assets/forus-platform/resources/_platform-common/assets/img/menu/icon-dropdown-sponsor.svg';

import ClickOutside from '../../components/elements/click-outside/ClickOutside';
import { Announcements } from '../../components/elements/announcements/Accouncements';
import { useOrganizationService } from '../../services/OrganizationService';
import SelectControl from '../../components/elements/select-control/SelectControl';
import { getStateRouteUrl, useStateRoutes } from '../../modules/state_router/Router';
import { NavLink, useNavigate } from 'react-router-dom';
import HeaderNotifications from './blocks/HeaderNotifications';
import SelectControlOptionsOrganization from '../../components/elements/select-control/templates/SelectControlOptionsOrganization';
import ModalAuthPincode from '../../components/modals/ModalAuthPincode';
import Organization from '../../props/models/Organization';
import { useAnnouncementService } from '../../services/AnnouncementService';
import Announcement from '../../props/models/Announcement';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import useAppConfigs from '../../hooks/useAppConfigs';
import useOpenModal from '../../hooks/useOpenModal';
import useAssetUrl from '../../hooks/useAssetUrl';
import useThumbnailUrl from '../../hooks/useThumbnailUrl';
import useAuthIdentity2FAState from '../../hooks/useAuthIdentity2FAState';

interface IdentityMenuItemProps {
    url?: string;
    href?: string;
    name: string;
    icon: React.ReactElement;
    dusk?: string;
    active?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
}

const IdentityMenuItem = ({ url, href, name, icon, dusk, active, onClick }: IdentityMenuItemProps) => {
    if (url) {
        return (
            <NavLink to={url} data-dusk={dusk} className={() => `auth-user-menu-item ${active ? 'active' : ''}`}>
                <div className="auth-user-menu-item-icon">{icon}</div>
                {name}
            </NavLink>
        );
    }

    return (
        <a href={href} className={`auth-user-menu-item ${active ? 'active' : ''}`} onClick={onClick}>
            <div className="auth-user-menu-item-icon">{icon}</div>
            {name}
        </a>
    );
};

export const LayoutHeader = () => {
    const openModal = useOpenModal();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();
    const authIdentity2FAState = useAuthIdentity2FAState();
    const assetUrl = useAssetUrl();
    const thumbnailUrl = useThumbnailUrl();

    const { envData, organizations, activeOrganization, setActiveOrganization } = useContext(mainContext);
    const { route } = useStateRoutes();

    const [showIdentityMenu, setShowIdentityMenu] = useState(false);
    const [organizationAnnouncements, setOrganizationAnnouncements] = useState<Array<Announcement>>(null);

    const navigate = useNavigate();
    const organizationService = useOrganizationService();
    const announcementService = useAnnouncementService();

    const [roles] = useState({
        provider: 'Aanbieder',
        sponsor: 'Sponsor',
        validator: 'Validator',
    });

    const openAuthPincodeModal = useCallback(
        (e) => {
            e?.preventDefault();
            setShowIdentityMenu(false);
            openModal((modal) => {
                return <ModalAuthPincode modal={modal} />;
            });
        },
        [openModal],
    );

    useEffect(() => {
        if (!activeOrganization?.id) {
            return;
        }

        announcementService.list(activeOrganization.id).then((res) => {
            setOrganizationAnnouncements(res.data.data);
        });
    }, [activeOrganization?.id, announcementService]);

    return (
        <header className="app app-header">
            <div className="wrapper">
                {/*System announcements*/}
                {organizationAnnouncements && <Announcements announcements={organizationAnnouncements} />}
                {/*System announcements*/}
                {appConfigs?.announcements && <Announcements announcements={appConfigs?.announcements} />}
            </div>
            <div className="wrapper flex-row relative">
                {!activeOrganization && (
                    <a href="" className="header-logo">
                        <img alt="Logo" className="header-logo-img" src={assetUrl('/assets/img/logo.svg')} />
                    </a>
                )}

                {activeOrganization && (
                    <div className="header-organization-switcher form">
                        {organizations && (
                            <SelectControl
                                value={activeOrganization}
                                options={organizations}
                                allowSearch={true}
                                onChange={(value: Organization) => {
                                    organizationService.use(value.id);
                                    setActiveOrganization(value);
                                    navigate(
                                        getStateRouteUrl(route.state.fallbackState || route.state.name, {
                                            ...route.params,
                                            organizationId: value.id,
                                        }),
                                    );
                                }}
                                optionsComponent={SelectControlOptionsOrganization}
                            />
                        )}
                    </div>
                )}

                <div className="flex-grow">&nbsp;</div>

                {activeOrganization && <HeaderNotifications organization={activeOrganization} />}

                {authIdentity && (
                    <div className="header-auth">
                        <div
                            className="auth-user"
                            data-dusk="userProfile"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowIdentityMenu(!showIdentityMenu);
                            }}>
                            <div className="auth-user-details">
                                <div className="auth-user-name" data-dusk="identityEmail">
                                    {strLimit(authIdentity.email || authIdentity.address, 32)}
                                </div>
                                <div className="auth-user-role">{roles[envData.client_type]}</div>
                            </div>

                            <img
                                src={activeOrganization?.logo?.sizes?.thumbnail || thumbnailUrl('organization')}
                                alt="Organization logo"
                                className="auth-user-img"
                            />

                            <div className="auth-user-caret">
                                <em className={showIdentityMenu ? 'mdi mdi-chevron-up' : 'mdi mdi-chevron-down'} />
                            </div>

                            {showIdentityMenu && (
                                <ClickOutside
                                    onClickOutside={() => setShowIdentityMenu(false)}
                                    className="auth-user-menu">
                                    <IdentityMenuItem
                                        name={'E-mail instellingen'}
                                        url={getStateRouteUrl('preferences-emails')}
                                        dusk={'btnUserEmails'}
                                        icon={<IconEmail />}
                                    />
                                    <IdentityMenuItem
                                        name={'Notificatievoorkeuren'}
                                        url={getStateRouteUrl('preferences-notifications')}
                                        icon={<IconNotifications />}
                                    />
                                    {(activeOrganization?.allow_2fa_restrictions || authIdentity2FAState?.required) && (
                                        <IdentityMenuItem
                                            name="Beveiliging"
                                            url={getStateRouteUrl('security-2fa')}
                                            icon={<IconSecurity />}
                                        />
                                    )}
                                    <IdentityMenuItem
                                        name="Sessies"
                                        url={getStateRouteUrl('security-sessions')}
                                        icon={<IconSessions />}
                                    />

                                    {activeOrganization && <div className="auth-user-menu-sep" />}

                                    <IdentityMenuItem
                                        name="Autoriseer apparaat"
                                        onClick={openAuthPincodeModal}
                                        icon={<IconAuthorizeDevice />}
                                    />

                                    {activeOrganization && <div className="auth-user-menu-sep" />}

                                    <div className="auth-user-menu-title">Kies je rol</div>

                                    <IdentityMenuItem
                                        name="Beoordelaar"
                                        active={envData.client_type == 'validator'}
                                        href={appConfigs.fronts.url_validator}
                                        dusk={'btnUserLogout'}
                                        icon={<IconValidator />}
                                    />

                                    <IdentityMenuItem
                                        name="Sponsor"
                                        active={envData.client_type == 'sponsor'}
                                        href={appConfigs.fronts.url_sponsor}
                                        dusk={'btnUserLogout'}
                                        icon={<IconSponsor />}
                                    />

                                    <IdentityMenuItem
                                        name="Aanbieder"
                                        active={envData.client_type == 'provider'}
                                        href={appConfigs.fronts.url_provider}
                                        dusk={'btnUserLogout'}
                                        icon={<IconProvider />}
                                    />

                                    {activeOrganization && <div className="auth-user-menu-sep" />}

                                    <IdentityMenuItem
                                        name="Uitloggen"
                                        url={getStateRouteUrl('sign-out')}
                                        dusk={'btnUserLogout'}
                                        icon={<IconSignOut />}
                                    />
                                </ClickOutside>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};
