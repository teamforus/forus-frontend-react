import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/fund-requests/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/fund-requests/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/fund-requests/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/fund-requests/icon-4.svg';

export default function FundRequests({
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
                            Forus biedt geïntegreerde intake &amp; aanvraagprocedures voor (gemeentelijke) regelingen.
                            De aanvraagfunctionaliteit wordt geïntegreerd in de website, waardoor deelnemers regelingen
                            kunnen aanvragen volgens vooraf ingestelde voorwaarden, aan de hand van het beleid van de
                            gemeente. Binnen deze functionaliteit hebben aanvragers ook de mogelijkheid om
                            bewijsmaterialen te uploaden. De aanvragen en bijbehorende bewijsstukken worden direct
                            verwerkt in het systeem en komen terecht in de beoordelaarsomgeving.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/fund-requests/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <p>Het gebruik van Open aanvragen in het Forus-platform biedt verschillende voordelen:</p>
                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Efficiënte aanvraagprocedures</h4>
                                <p>
                                    Het is mogelijk om aanvragen en bewijsmaterialen direct in het systeem te verwerken,
                                    waardoor processen sneller en effectiever verlopen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Verbeterde gebruikerservaring</h4>
                                <p>
                                    Het geoptimaliseerde aanvraagproces bevordert de gebruikerservaring voor aanvragers
                                    en bespaart zowel de gemeente als de aanvragers tijd.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Regelingenkoppelen en gegevenshergebruik</h4>
                                <p>
                                    Het is mogelijk om regelingen te koppelen op basis van overeenkomende voorwaarden en
                                    om gegevens te hergebruiken.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Snelle toewijzing met één druk op de knop</h4>
                                <p>
                                    Dankzij de integratie van het aanvraagproces kan er met één druk op de knop snel
                                    toewijzing plaatsvinden.
                                </p>
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
                        <FaqItem title="Voor welke organisaties is de Open aanvragen functionaliteit geschikt?">
                            <p>
                                Op basis van een BSN worden gegevens opgehaald middels de DigiD koppeling. De Open
                                aanvragen functionaliteit is daarom uitsluitend in te zetten voor organisaties die de
                                aanvraagprocedure voor een regeling via het platform laten verlopen middels het inloggen
                                met DigiD.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke gegevens heeft Forus nodig vanuit de organisatie?">
                            <p>
                                Voor de uitgifte van een sociale regeling is het van belang om te weten aan welke
                                voorwaarden de aanvrager moet voldoen voor de aanvraag van een regeling. Ook is het
                                nodig vanuit Forus om te weten welk bedrag er per deelnemer wordt verstrekt.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wat is nog een ander voordeel van de Open aanvragen functionaliteit?">
                            <p>
                                Bij de organisatie is meestal een grote groep deelnemers bekend die in aanmerking komen
                                voor een sociale regeling. Echter blijft er altijd nog een groep die niet in beeld is.
                                De Open aanvragen functionaliteit maakt het mogelijk voor elke aanvrager een aanvraag te
                                doen voor een sociale regeling. Zo heeft ook de aanvrager, die op voorhand niet bekend
                                is bij de organisatie, de mogelijkheid om een aanvraag te doen voor een sociale
                                regeling.
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
                                '/assets/img/features/img/fund-requests/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Open aanvragen uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Open aanvragen werken? Neem dan contact met ons op voor een
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
