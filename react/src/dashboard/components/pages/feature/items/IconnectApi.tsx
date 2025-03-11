import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/iconnect-api/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/iconnect-api/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/iconnect-api/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/iconnect-api/icon-4.svg';

export default function IconnectApi({
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
                            Met de Haal Centraal API kunnen gemeentemedewerkers eenvoudig BRP-gegevens ophalen binnen
                            hun beheeromgeving. Deze gegevens zijn essentieel voor het evalueren van aanvragen. De
                            BRP-toegang verloopt via de MakelaarSuite van PinkRocade, waarbij gebruik wordt gemaakt van
                            StUF3.x-BG of API (Common Ground).
                        </p>
                        <img
                            src={assetUrl('assets/img/features/img/iconnect-api/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Eenvoudige toegang tot BRP-gegevens</h4>
                                <p>
                                    Met de Haal Centraal API krijgt u eenvoudig toegang tot de basisregistratie personen
                                    (BRP) gegevens. Dit maakt het evalueren van aanvragen efficiënter en vermindert
                                    administratieve lasten voor gemeenten.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Overzicht binnen één applicatie</h4>
                                <p>
                                    Alle benodigde informatie is direct beschikbaar binnen Forus. Hierdoor hoeft er niet
                                    binnen twee of meer applicaties worden gezocht.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Kostenbesparing voor gemeenten</h4>
                                <p>
                                    De Haal Centraal API integratie op het Forus platform verlaagt uitvoeringskosten.
                                    Direct beschikbare gegevens verminderen handmatige invoer en bewerkingen, wat
                                    resulteert in lagere operationele kosten.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Verhoogde flexibiliteit en nauwkeurigheid</h4>
                                <p>
                                    Met de Haal Centraal API kun je snel en nauwkeurig basisgegevens verkrijgen uit
                                    landelijke registraties. Dit vergroot de flexibiliteit van het Forus platform en
                                    vermindert fouten door handmatige invoer of verouderde gegevens.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-list">
                            <h3>Gegevens beschikbaar via Haal Centraal API</h3>
                            <div className="block-feature-list-items-wrapper">
                                <div className="block-feature-list-items-title">
                                    Met deze API kunnen de volgende gegevens, op basis van BSN, worden verkregen:
                                </div>
                                <div className="block-feature-list-items">
                                    <div className="block-feature-list-item">Naam</div>
                                    <div className="block-feature-list-item">Adres en postcode</div>
                                    <div className="block-feature-list-item">Geboortedatum</div>
                                    <div className="block-feature-list-item">Partnerstatus</div>
                                    <div className="block-feature-list-item">Aantal kinderen</div>
                                </div>
                            </div>
                        </div>

                        <div className="block block-feature-text-image-columns">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over Haal Centraal</h4>
                                <p>
                                    De Haal Centraal API is een initiatief van de Nederlandse overheid om het delen van
                                    basisgegevens tussen overheidsorganisaties te faciliteren. Met deze API wordt het
                                    eenvoudiger om gegevens uit diverse landelijke registraties te raadplegen, zoals de
                                    BRP, Kadaster en RDW. Dit zorgt voor een efficiëntere en meer gestroomlijnde
                                    uitwisseling van gegevens, wat uiteindelijk resulteert in snellere en nauwkeurigere
                                    besluitvorming binnen de overheid.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/iconnect-api/image-text-block.jpg')}
                                    alt={`${feature.name} banner`}
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
                        <FaqItem title="Welke gegevens zijn beschikbaar via de Haal Centraal API?">
                            <p>
                                Op basis van BSN kunnen de volgende gegevens worden verkregen: naam, adres en postcode,
                                geboortedatum, partnerstatus en aantal kinderen. Er kan door de organisatie worden
                                gekozen om bepaalde gegevens niet te tonen, om zo alleen te werken met gegevens die
                                daadwerkelijk bedoeld zijn om bijvoorbeeld een aanvraag te beoordelen.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wat zijn enkele van de meest gebruikte toepassingen van de Haal Centraal API?">
                            <p>
                                De Haal Centraal API wordt onder andere gebruikt voor het verifiëren van identiteit en
                                adresgegevens, het ophalen van gegevens uit de Basisregistratie Personen (BRP) en het
                                delen van informatie tussen verschillende overheidsorganisaties voor vergunningaanvragen
                                of belastingaangiften. Daarnaast wordt de API ook gebruikt door bedrijven en
                                maatschappelijke organisaties om sneller toegang te krijgen tot betrouwbare gegevens van
                                burgers.
                            </p>
                        </FaqItem>

                        <FaqItem title="Voor welke organisaties is de Haal Centraal API geschikt?">
                            <p>
                                Op basis van een BSN worden gegevens opgehaald middels de API. De Haal Centraal API is
                                daarom uitsluitend in te zetten voor organisaties die de aanvraagprocedure voor een
                                regeling via het platform laten verlopen middels het inloggen met DigiD.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke gegevens slaat Forus op in het systeem?">
                            <p>
                                Forus slaat de gegevens die worden getoond met de Haal Centraal API niet op. De gegevens
                                worden enkel getoond aan de beoordelaar die de gegevens wenst te tonen voor het
                                beoordelen van een aanvraag. Zo hoeft Forus geen onnodige gegevens op te slaan.
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
                                '/assets/img/features/img/iconnect-api/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Haal Centraal API uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Haal Centraal API werkt? Neem dan contact met ons op voor een
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
