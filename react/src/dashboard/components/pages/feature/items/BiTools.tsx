import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bi-tools/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bi-tools/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bi-tools/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bi-tools/icon-4.svg';

export default function BiTools({
    feature,
    additionalFeatures,
    organization,
    openContactModal,
}: {
    feature: OrganizationFeature;
    additionalFeatures: Array<OrganizationFeature>;
    organization: Organization;
    openContactModal: () => void;
}) {
    const assetUrl = useAssetUrl();

    return (
        <Fragment>
            <div className="card">
                <div className="card-header">
                    <div className="card-title">Beschrijving</div>
                </div>
                <div className="card-section">
                    <div className="block block-content">
                        <p>
                            Platform Forus biedt een handige BI-API-koppeling, ook wel een BI-integratie genoemd. Deze
                            koppeling maakt het mogelijk om gegevens vanuit het Forus-platform te exporteren naar uw
                            eigen BI-tools, zoals PowerBI en Cognos.
                        </p>
                        <p>
                            U kunt hiermee krachtige managementrapportages creëren op basis van gegevens uit uw webshop,
                            waaronder informatie over tegoeden, aanvragers, aanbiedertransacties en financiële
                            overzichten. Deze koppeling stelt alle exporteerbare gegevens ter beschikking voor uw
                            rapportagedoeleinden.
                        </p>
                        <img
                            src={assetUrl('assets/img/features/img/bi-tools/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Automatische gegevensverzameling</h4>
                                <p>De gegevens worden automatisch geëxporteerd naar uw BI-tool.</p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Extra visualisatiemogelijkheden</h4>
                                <p>
                                    U krijgt de vrijheid om inzichten te creëren op basis van websitegegevens of deze te
                                    integreren met andere datasets in uw BI-tool.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Integratie met diverse BI-systemen</h4>
                                <p>
                                    De Forus API maakt probleemloze verbinding mogelijk met verschillende BI-systemen,
                                    waaronder PowerBI en Cognos.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Aanpasbaarheid van gegevens</h4>
                                <p>
                                    Filters en parameters kunnen worden gebruikt om relevante informatie te extraheren.
                                    Het optimaliseren van exportgegevens voor gerichte rapportages draagt bij aan
                                    efficiënte besluitvorming.
                                </p>
                            </div>
                        </div>

                        <hr />

                        <h3>Authenticatiemethoden</h3>
                        <p>
                            Om de koppeling tussen de BI-tool en Forus tot stand te brengen, zijn er twee beschikbare
                            authenticatiemethoden:
                        </p>
                        <ul>
                            <li>Door gebruik te maken van een URL-parameter.</li>
                            <li>Middels het instellen van een header en een sleutelcode.</li>
                        </ul>
                        <p>
                            Voor beide authenticatiemethoden is het essentieel om een specifieke URL-configuratie uit te
                            voeren in uw BI-tool. Deze configuratie verschaft u toegang tot de gegevens vanuit het
                            Forus-platform.
                        </p>

                        <div className="block block-feature-text-image-columns">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over BI-tool</h4>
                                <p>
                                    Een Business Intelligence-tool, vaak afgekort tot BI-tool, is een soort software die
                                    is ontworpen om ruwe bedrijfsgegevens om te zetten in bruikbare informatie. Deze
                                    tools kunnen helpen bij het consolideren, analyseren en presenteren van data in
                                    gemakkelijk te begrijpen rapporten en dashboards. BI-tools worden vaak gebruikt door
                                    organisaties om datagestuurde beslissingen te nemen. Ze bieden inzicht in trends,
                                    patronen en anomalieën in de bedrijfsactiviteiten, waardoor het management
                                    strategische beslissingen kan nemen op basis van betrouwbare gegevens. Populaire
                                    BI-tools zijn bijvoorbeeld PowerBI en Cognos.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/bi-tools/image-text-block.jpg')}
                                    alt={`${feature.name} image`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-info">
                    <div className="card-info-icon mdi mdi-headset" />
                    <div className="card-info-details">
                        <span>
                            Mocht u vragen hebben of aanvullende informatie willen ontvangen, dan kunt u ons bellen op:{' '}
                            <strong>+31 (0) 85 004 33 87</strong> of een e-mail sturen naar{' '}
                            <strong>info@forus.io</strong>
                        </span>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <div className="card-title">Veelgestelde vragen</div>
                </div>
                <div className="card-section card-section-padless">
                    <div className="block block-feature-faq">
                        <FaqItem title="Wat is BI intergratie?">
                            <p>
                                Een BI API koppeling, ook wel een BI integratie genoemd, zorgt ervoor dat data vanuit
                                ieder gewenst pakket ontsloten kan worden. Dit betekent dat de data vanuit het Forus
                                platform door de sponsor gebruikt kan worden voor rapportagedoeleinden.
                            </p>
                        </FaqItem>

                        <FaqItem title="Hoe breng ik een BI koppeling tot stand?">
                            <p>
                                Om de koppeling tussen de BI-tool en het Forus platform tot stand te brengen zijn er
                                twee authenticatiemethoden die gebruikt kunnen worden:
                            </p>
                            <ul>
                                <li>Middels een URL-parameter</li>
                                <li>Middels het gebruik van een header en sleutelcode</li>
                            </ul>
                            <p>
                                Voor beide authenticatiemethoden geldt dat er een URL geconfigureerd moet worden in uw
                                BI-tool. Hiermee krijgt u toegang tot de gegevens uit het Forus platform.
                            </p>
                        </FaqItem>
                    </div>
                </div>
            </div>

            <div className="card">
                <AdditionalFeatureList additionalFeatures={additionalFeatures} organization={organization} />

                <div className="card-section">
                    <div
                        className="block block-features-demo-banner"
                        style={{
                            backgroundImage: `url(${assetUrl(
                                '/assets/img/features/img/bi-tools/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">BI-tool API uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de BI-tool API werkt? Neem dan contact met ons op voor een
                                    persoonlijke demonstratie. We laten u graag zien hoe het voor uw kan werken.
                                </div>
                            </div>
                            <div className="features-demo-banner-action">
                                <div className="button button-primary" onClick={() => openContactModal()}>
                                    Demo aanvragen
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
