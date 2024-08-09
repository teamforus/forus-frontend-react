import React from 'react';
import PreviewPageFooter from '../../components/elements/PreviewPageFooter';
import useAssetUrl from '../../hooks/useAssetUrl';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';
import { useNavigateState } from '../../modules/state_router/Router';

export default function DropdownAbout() {
    const assetUrl = useAssetUrl();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();
    const navigateState = useNavigateState();

    return (
        <div className="block block-page-list">
            <div className="block-page-list-main">
                <div className="block-page-list-main-section">
                    <div className="block-page-list-main-description">
                        <div className="block-page-list-main-description-title">Over ons</div>
                        <div className="block-page-list-main-description-subtitle">
                            Transparantie, vertrouwen en een gebruikersgerichte aanpak vormen de kern van Fours &apos
                            waarden. Ontdek meer over onze organisatie.
                        </div>
                        <div className="block-page-list-main-description-details">
                            <div className="title">Nog meer vragen?</div>
                            <div className="subtitle">
                                Voor uitgebreide inzichten en antwoorden op technische vragen over ons platform, bezoek
                                ons Helpcentrum.
                            </div>
                            <div className="image-block">
                                <img src={assetUrl(`/assets/img/about-us/help-center.png`)} alt="" />
                            </div>
                        </div>
                    </div>

                    <div className="block-page-list-main-details">
                        <div className="block-page-list-main-details-list">
                            <div
                                className="block-page-list-main-details-list-item"
                                onClick={() => {
                                    setActiveMenuDropdown(null);
                                    navigateState('about-us');
                                }}>
                                <img
                                    className="details-list-image"
                                    src={assetUrl(`/assets/img/about-us/our-story.png`)}
                                    alt=""
                                />
                                <div>
                                    <div className="block-page-list-main-details-list-item-title">Ons verhaal</div>
                                    <div className="block-page-list-main-details-list-item-description">
                                        Ontdek meer over onze organisatie.
                                    </div>
                                </div>
                                <em className={'mdi mdi-arrow-right'} />
                            </div>

                            <div
                                className="block-page-list-main-details-list-item"
                                onClick={() => {
                                    setActiveMenuDropdown(null);
                                    navigateState('about-us-innovation');
                                }}>
                                <img
                                    className="details-list-image"
                                    src={assetUrl(`/assets/img/about-us/project.png`)}
                                    alt=""
                                />
                                <div>
                                    <div className="block-page-list-main-details-list-item-title">
                                        Project Innovatiebudget 2023
                                    </div>
                                    <div className="block-page-list-main-details-list-item-description">
                                        Naar een merkbaar en meetbaar verschil - In samenwerking met gemeenten Eemsdelta
                                        en Westerkwartier.
                                    </div>
                                </div>
                                <em className={'mdi mdi-arrow-right'} />
                            </div>
                        </div>
                    </div>
                </div>

                <PreviewPageFooter />
            </div>

            <div className="block-page-list-backdrop" />
            <div className="dropdown-close" onClick={() => setActiveMenuDropdown(null)}>
                <em className="mdi mdi-close" />
            </div>
        </div>
    );
}
