import React, { useMemo, useState } from 'react';
import PreviewPageFooter from '../../components/elements/PreviewPageFooter';
import useAssetUrl from '../../hooks/useAssetUrl';
import HelpCenter from '../../components/elements/HelpCenter';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function DropdownPlatform() {
    const assetUrl = useAssetUrl();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();

    const menus = useMemo(() => {
        return [
            {
                key: 'basic-functions',
                title: 'Basisfuncties',
                name: 'basic-functions',
                iconPrefix: 'icons-platform',
                items: [
                    { key: 'funds', name: 'funds', title: 'Fondsen' },
                    { key: 'websites', name: 'website', title: 'Websites' },
                    { key: 'cms', name: 'cms', title: 'CMS' },
                    { key: 'me-app', name: 'me-app', title: 'Me-app' },
                    { key: 'notifications', name: 'information', title: 'Managementinformatie' },
                ],
            },
            {
                key: 'roles',
                title: 'Rollen',
                name: 'roles-main',
                iconPrefix: 'icons-roles',
                items: [
                    { key: 'requester', name: 'roles-requester', title: 'Deelnemer / Aanvrager' },
                    { key: 'provider', name: 'roles-provider', title: 'Aanbieder' },
                    { key: 'sponsor', name: 'roles-sponsor', title: 'Sponsor' },
                    { key: 'validator', name: 'roles-validator', title: 'Beoordelaar' },
                ],
            },
        ];
    }, []);

    const [activeMenu, setActiveMenu] = useState(menus[0]);

    return (
        <div className="block block-page-list">
            <div className="block-page-list-main">
                <div className="block-page-list-main-section">
                    <div className="block-page-list-main-description">
                        <div className="block-page-list-main-description-title">Platform</div>
                        <div className="block-page-list-main-description-list">
                            {menus?.map((menu) => (
                                <div
                                    key={menu.key}
                                    className={`block-page-list-main-description-list-item ${
                                        activeMenu.key == menu.key ? 'active' : ''
                                    }`}
                                    onClick={() => setActiveMenu(menu)}>
                                    <img
                                        className="list-item-image"
                                        src={assetUrl(
                                            `/assets/img/icon-${menu.key}${
                                                activeMenu.key == menu.key ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    {menu.title}
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="block-page-list-main-details">
                        <StateNavLink
                            name={activeMenu.name}
                            className="block-page-list-main-details-title"
                            onClick={() => setActiveMenuDropdown(null)}>
                            <img
                                className="details-list-image"
                                src={assetUrl(`/assets/img/icon-${activeMenu.key}-active.svg`)}
                                alt=""
                            />
                            {activeMenu.title}
                        </StateNavLink>

                        <div className="block-page-list-main-details-list">
                            {activeMenu.items.map((item) => (
                                <StateNavLink
                                    key={item.key}
                                    name={item.name}
                                    className="block-page-list-main-details-list-item"
                                    onClick={() => setActiveMenuDropdown(null)}>
                                    <img
                                        className="details-list-image details-list-image-normal"
                                        src={assetUrl(`/assets/img/${activeMenu.iconPrefix}/${item.key}.svg`)}
                                        alt=""
                                    />
                                    <img
                                        className="details-list-image details-list-image-active"
                                        src={assetUrl(`/assets/img/${activeMenu.iconPrefix}/${item.key}-active.svg`)}
                                        alt=""
                                    />
                                    <div className="details-list-title">{item.title}</div>
                                    <em className={'mdi mdi-arrow-right'} />
                                </StateNavLink>
                            ))}
                        </div>

                        <HelpCenter />
                    </div>
                </div>

                <PreviewPageFooter />
            </div>

            <div className="block-page-list-backdrop" onClick={() => setActiveMenuDropdown(null)} />
            <div className="dropdown-close" onClick={() => setActiveMenuDropdown(null)}>
                <em className="mdi mdi-close" />
            </div>
        </div>
    );
}
