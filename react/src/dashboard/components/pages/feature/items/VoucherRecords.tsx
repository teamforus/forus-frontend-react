import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-4.svg';
import IconStep1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-step-1.svg';
import IconStep2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-step-2.svg';
import IconStep3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-step-3.svg';
import IconStep4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/voucher-records/icon-step-4.svg';

export default function VoucherRecords({
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
                            Met de Persoonsgegeves op een tegoed functionaliteit kunnen persoonsgegevens worden
                            toegevoegd en weergegeven bij een tegoed, zowel in de website als in de beheeromgeving. Dit
                            biedt de mogelijkheid om specifieke informatie, zoals naam en/of geboortedatum, weer te
                            geven in verband met een tegoed.
                        </p>
                        <img
                            src={assetUrl('assets/img/features/img/voucher-records/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Veiligheid</h4>
                                <p>
                                    Met Persoonsgegevens op een tegoed kunnen sponsors, aanbieders en deelnemers
                                    eenvoudig specifieke persoonsgegevens bekijken. Dit verhoogt de veiligheid omdat het
                                    tegoed alleen kan worden gebruikt door de persoon wiens gegevens erop staan.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Efficiënt beheer</h4>
                                <p>
                                    De toevoeging van persoonsgegevens aan toeged maakt het beheer efficiënter. Het is
                                    eenvoudiger om tegoeden te zoeken op basis van specifieke gegevens.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Persoonsgegevens toegoeven via uploadbestand</h4>
                                <p>
                                    Het is mogelijk om bijv. het aantal kinderen toe te voegen middels het
                                    uploadbestand. Sla het bestand op als csv en upload het in de beheeromgeving.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Bulkexport van tegoeden met gegevens</h4>
                                <p>
                                    Na het toevoegen van persoonsgegevens, zoals het aantal kinderen, aan tegoed, kunt u
                                    deze gegevens eenvoudig exporteren in bulk.
                                </p>
                            </div>
                        </div>

                        <hr />

                        <div className="block block-feature-list">
                            <h3>Soorten informatie die op een tegoed kunnen staan</h3>
                            <div className="block-feature-list-items-wrapper">
                                <div className="block-feature-list-items-title">
                                    Met de Persoonsgegeves op een tegoed kunt u de volgende gegevens op het tegoed
                                    vermelden:
                                </div>
                                <div className="block-feature-list-items">
                                    <div className="block-feature-list-item">Voornaam</div>
                                    <div className="block-feature-list-item">Achternaam</div>
                                    <div className="block-feature-list-item">Kinderen</div>
                                    <div className="block-feature-list-item">Aantal kinderen</div>
                                </div>
                                <div className="block-feature-list-separator" />
                                <div className="block-feature-list-items-footer">
                                    Er kunnen extra gegevens worden toegevoegd, afhankelijk van uw behoeften.
                                </div>
                            </div>
                        </div>

                        <div className="block block-feature-steps">
                            <div className="block-feature-steps-title">
                                Implementatiestappen voor Persoonsgegevens op een tegoed
                            </div>
                            <div className="block-feature-steps-items">
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep1 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #1</span>
                                            <span className="block-feature-steps-item-dot" />
                                            <span>Voorbereiden</span>
                                        </h4>
                                        <p>
                                            In deze fase wordt gekeken naar de huidige uitdagingen van de organisatie en
                                            hoe het toevoegen van persoonsgegevens aan het tegoed kan helpen. Ook wordt
                                            afgestemd welke persoonsgegevens de organisatie graag aan het tegoed wil
                                            toevoegen.
                                        </p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep2 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #2</span>
                                            <span className="block-feature-steps-item-dot" />
                                            <span>Testomgeving</span>
                                        </h4>
                                        <p>
                                            Forus biedt de organisatie toegang tot een testomgeving die gelijk staat aan
                                            de productieomgeving. Op de testomgeving wordt de gewenste functionaliteit
                                            aangezet, om zo de geschikte situatie te kunnen testen.
                                        </p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep3 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #3</span>
                                            <span className="block-feature-steps-item-dot" />
                                            <span>Training</span>
                                        </h4>
                                        <p>
                                            Forus legt tijdens een testsessie uit hoe de organisatie de functionaliteit
                                            kan toepassen. De werkwijze wordt uitgelegd aan de hand van een korte
                                            demonstratie. Ook wordt er een handleiding gedeeld voor gebruik in de
                                            productieomgeving.
                                        </p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep4 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #4</span>
                                            <span className="block-feature-steps-item-dot" />
                                            <span>Productie</span>
                                        </h4>
                                        <p>
                                            Na een succesvolle afronding van de testfase en wanneer de organisatie
                                            bevestigt dat de functionaliteit naar behoren werkt in de testomgeving, kan
                                            de functionaliteit geactiveerd worden in de productieomgeving.
                                        </p>
                                    </div>
                                </div>
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
                        <FaqItem title="Wat is de verwachte duur van het implementatietraject voor het toevoegen van persoonsgegevens aan een tegoed?">
                            <p>
                                Het implementatietraject is inbegrepen met een korte training op de testomgeving om de
                                organisatie uit te leggen hoe de functionaliteit werkt. We schatten dat het
                                implementatietraject het toevoegen van persoonsgegevens aan een tegoed ongeveer twee
                                weken in beslag neemt. Echter, de tijdsinvestering die van uw kant gevraagd wordt, zal
                                hoogstwaarschijnlijk niet meer dan een paar uur bedragen.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke gegevens heeft Forus nodig vanuit de organisatie?">
                            <p>
                                De organisatie heeft de vrijheid om zelf te bepalen welke persoonsgegevens zij graag
                                ziet toegevoegd worden aan de tegoeden. Echter staat standaard alles uit. Forus zal
                                daarom op voorhand willen weten welke persoonsgegevens de organisatie wenst te
                                gebruiken.
                            </p>
                        </FaqItem>

                        <FaqItem title="Voor welke organisaties is het toevoegen van persoonsgegevens aan tegoeden geschikt?">
                            <p>
                                In principe kan elke organisatie ervoor kiezen om persoonsgegevens toe te voegen aan het
                                tegoed. De functionaliteit is met name geschikt voor organisaties die gebruik maken van
                                de situatie waar er meerdere tegoeden zijn toegekend aan één account. Zo creëert de
                                organisatie zowel overzicht voor de eigen managementinformatie, als een overzicht voor
                                de deelnemer om bij te houden welk tegoed is toegekend aan welk individu binnen het
                                gezin.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wie is betrokken bij het implementatietraject van het toevoegen van persoonsgegevens aan tegoeden?">
                            <p>
                                Bij de implementatie van het toevoegen van persoonsgegevens aan een tegoed zijn de
                                volgende partijen betrokken:
                            </p>
                            <ul>
                                <li>De organisatie die de functionaliteit gaat gebruiken.</li>
                                <li>Forus, de ontwikkelaar en beheerder van de functionaliteit.</li>
                            </ul>
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
                                '/assets/img/features/img/voucher-records/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">
                                    Persoonsgegevens op een tegoed uitproberen
                                </div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Persoonsgegevens op een tegoed functionaliteit werkt? Neem dan
                                    contact met ons op voor een persoonlijke demonstratie. We laten u graag zien hoe het
                                    voor uw kan werken.
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
