import React, { useState } from 'react';
import PreviewPageFooter from '../../components/elements/PreviewPageFooter';
import useAssetUrl from '../../hooks/useAssetUrl';
import HelpCenter from '../../components/elements/HelpCenter';

export default function DropdownPlatform() {
    const assetUrl = useAssetUrl();

    const [activeItem, setActiveItem] = useState('basic-functions');
    const [activeSubItem, setActiveSubItem] = useState('');

    return (
        <div className="block block-page-list">
            <div className="block-page-list-main">
                <div className="block-page-list-main-section">
                    <div className="block-page-list-main-description">
                        <div className="block-page-list-main-description-title">Platform</div>
                        <div className="block-page-list-main-description-list">
                            <div
                                className={`block-page-list-main-description-list-item ${
                                    activeItem == 'basic-functions' ? 'active' : ''
                                }`}
                                onClick={() => setActiveItem('basic-functions')}>
                                <img
                                    className="list-item-image"
                                    src={assetUrl(
                                        `/assets/img/icon-basic-functions${
                                            activeItem == 'basic-functions' ? '-active' : ''
                                        }.svg`,
                                    )}
                                    alt=""
                                />
                                Basisfuncties
                                <em className={'mdi mdi-arrow-right'} />
                            </div>

                            <div
                                className={`block-page-list-main-description-list-item ${
                                    activeItem == 'roles' ? 'active' : ''
                                }`}
                                onClick={() => setActiveItem('roles')}>
                                <img
                                    className="list-item-image"
                                    src={assetUrl(
                                        `/assets/img/icon-roles${activeItem == 'roles' ? '-active' : ''}.svg`,
                                    )}
                                    alt=""
                                />
                                Rollen
                                <em className={'mdi mdi-arrow-right'} />
                            </div>
                        </div>
                    </div>

                    <div className="block-page-list-main-details">
                        <div className="block-page-list-main-details-title">
                            <img
                                className="details-list-image"
                                src={assetUrl(`/assets/img/icon-${activeItem}-active.svg`)}
                                alt=""
                            />
                            {activeItem == 'basic-functions' ? 'Basisfuncties' : 'Rollen'}
                        </div>

                        {activeItem == 'basic-functions' ? (
                            <div className="block-page-list-main-details-list">
                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('funds')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-platform/funds${
                                                activeSubItem == 'funds' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Fondsen
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('websites')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-platform/websites${
                                                activeSubItem == 'websites' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Websites
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('cms')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-platform/cms${
                                                activeSubItem == 'cms' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    CMS
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('me-app')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-platform/me-app${
                                                activeSubItem == 'cms' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Me-app
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('notifications')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-platform/notifications${
                                                activeSubItem == 'notifications' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Managementinformatie
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>
                            </div>
                        ) : (
                            <div className="block-page-list-main-details-list">
                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('requester')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-roles/requester${
                                                activeSubItem == 'requester' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Deelnemer / Aanvrager
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('provider')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-roles/provider${
                                                activeSubItem == 'provider' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Aanbieder
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('sponsor')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-roles/sponsor${
                                                activeSubItem == 'sponsor' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Sponsor
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div
                                    className="block-page-list-main-details-list-item"
                                    onMouseOver={() => setActiveSubItem('validator')}>
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(
                                            `/assets/img/icons-roles/validator${
                                                activeSubItem == 'validator' ? '-active' : ''
                                            }.svg`,
                                        )}
                                        alt=""
                                    />
                                    Beoordelaar
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>
                            </div>
                        )}

                        <HelpCenter />
                    </div>
                </div>

                <PreviewPageFooter />
            </div>
            <div className="block-page-list-preview" />
        </div>
    );
}