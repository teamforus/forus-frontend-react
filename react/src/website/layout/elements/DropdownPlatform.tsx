import React, { useState } from 'react';
import PreviewPageFooter from '../../components/elements/PreviewPageFooter';
import useAssetUrl from '../../hooks/useAssetUrl';

export default function DropdownPlatform() {
    const assetUrl = useAssetUrl();

    const [activeItem, setActiveItem] = useState('basic-functions');

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
                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-platform/funds.svg`)}
                                        alt=""
                                    />
                                    Fondsen
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-platform/websites.svg`)}
                                        alt=""
                                    />
                                    Websites
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-platform/cms.svg`)}
                                        alt=""
                                    />
                                    CMS
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-platform/me-app.svg`)}
                                        alt=""
                                    />
                                    Me-app
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-platform/notifications.svg`)}
                                        alt=""
                                    />
                                    Managementinformatie
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>
                            </div>
                        ) : (
                            <div className="block-page-list-main-details-list">
                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-roles/requester-active.svg`)}
                                        alt=""
                                    />
                                    Deelnemer / Aanvrager
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-roles/provider.svg`)}
                                        alt=""
                                    />
                                    Aanbieder
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-roles/sponsor.svg`)}
                                        alt=""
                                    />
                                    Sponsor
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>

                                <div className="block-page-list-main-details-list-item">
                                    <img
                                        className="details-list-image"
                                        src={assetUrl(`/assets/img/icons-roles/validator.svg`)}
                                        alt=""
                                    />
                                    Beoordelaar
                                    <em className={'mdi mdi-arrow-right'} />
                                </div>
                            </div>
                        )}

                        <div className="block-help-center">
                            <div className="block-help-center-img">
                                <img src={assetUrl(`/assets/img/icon-help-center.svg`)} alt="" />
                            </div>
                            <div className="block-help-center-info">
                                <div className="block-help-center-title">Nog meer vragen?</div>
                                <div className="block-help-center-description">
                                    Bezoek ons Helpcentrum voor uitgebreide inzichten en antwoorden op technische vragen
                                    over ons platform.
                                </div>
                                <div className="button button-text button-text-padless button-read-more">
                                    Lees meer
                                    <em className="mdi mdi-arrow-right icon-end" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <PreviewPageFooter />
            </div>
            <div className="block-page-list-preview" />
        </div>
    );
}
