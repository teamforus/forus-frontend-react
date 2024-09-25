import React from 'react';
import PreviewPageFooter from '../../components/elements/PreviewPageFooter';
import useAssetUrl from '../../hooks/useAssetUrl';
import useSetActiveMenuDropdown from '../../hooks/useSetActiveMenuDropdown';
import StateNavLink from '../../modules/state_router/StateNavLink';

export default function DropdownAbout() {
    const assetUrl = useAssetUrl();
    const setActiveMenuDropdown = useSetActiveMenuDropdown();

    return (
        <div className="block block-page-list">
            <div className="block-page-list-main">
                <div className="block-page-list-main-section">
                    <div className="block-page-list-main-description">
                        <div className="block-page-list-main-description-title">Over ons</div>
                        <div className="block-page-list-main-description-subtitle">
                            Transparantie, vertrouwen en een gebruikersgerichte aanpak vormen de kern van Forus&apos;
                            waarden. Ontdek meer over onze organisatie.
                        </div>
                        <div className="block-page-list-main-description-details">
                            <div className="title">Nog meer vragen?</div>
                            <div className="subtitle">
                                Voor uitgebreide inzichten en antwoorden op technische vragen over ons platform, bezoek
                                ons
                                <a href="https://helpcentrum.forus.io/kb/nl/" target="_blank" rel="noreferrer">
                                    &nbsp;Helpcentrum.
                                    <em className="mdi mdi-arrow-right" />
                                </a>
                            </div>
                            <div className="image-block">
                                <img src={assetUrl(`/assets/img/about-us/help-center.png`)} alt="" />
                            </div>
                        </div>
                    </div>

                    <div className="block-page-list-main-details">
                        <div className="block-page-list-main-details-list">
                            <StateNavLink
                                name={'about-us'}
                                className="block-page-list-main-details-list-item"
                                onClick={() => setActiveMenuDropdown(null)}>
                                <img
                                    className="details-list-image"
                                    src={assetUrl(`/assets/img/about-us/our-story.png`)}
                                    alt=""
                                />
                                <div className="block-page-list-main-details-list-item-wrapper">
                                    <div className="block-page-list-main-details-list-item-title">Ons verhaal</div>
                                    <div className="block-page-list-main-details-list-item-description">
                                        Ontdek meer over onze organisatie.
                                    </div>
                                </div>
                                <em className={'mdi mdi-arrow-right'} />
                            </StateNavLink>

                            <StateNavLink
                                name={'about-us-innovation'}
                                className="block-page-list-main-details-list-item"
                                onClick={() => setActiveMenuDropdown(null)}>
                                <img
                                    className="details-list-image"
                                    src={assetUrl(`/assets/img/about-us/project.png`)}
                                    alt=""
                                />
                                <div className="block-page-list-main-details-list-item-wrapper">
                                    <div className="block-page-list-main-details-list-item-title">
                                        Project Innovatiebudget 2023
                                    </div>
                                    <div className="block-page-list-main-details-list-item-description">
                                        Naar een merkbaar en meetbaar verschil - In samenwerking met gemeenten Eemsdelta
                                        en Westerkwartier.
                                    </div>
                                </div>
                                <em className={'mdi mdi-arrow-right'} />
                            </StateNavLink>
                        </div>
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
