import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/backoffice-api/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/backoffice-api/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/backoffice-api/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/backoffice-api/icon-4.svg';
import IconStep from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/backoffice-api/icon-step-1.svg';

export default function BackofficeApi({
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
                            Met de Backoffice wordt een koppeling tot stand gebracht met de API van de gemeente. Deze
                            koppeling maakt het mogelijk om gegevens uit platform Forus te combineren met gegevens uit
                            de systemen, zoals de DataWarehouse, van de gemeente.
                        </p>
                        <p>
                            Een van de belangrijkste functies van deze koppeling is de automatische verificatie van
                            aanvragen voor regelingen door aanvragers. Het systeem voert automatisch controles uit op
                            basis van de gegevens die bij de gemeente bekend zijn. Dit verzekert dat alleen aanvragers
                            die daadwerkelijk recht hebben op een regeling, worden goedgekeurd.
                        </p>
                        <p>
                            Daarnaast stroomlijnt deze koppeling het proces van informatie-uitwisseling tussen de
                            gemeente en het Forus-platform. Zodra een regeling wordt toegekend en een deelnemer
                            gebruikmaakt van het ontvangen tegoed, wordt deze informatie teruggestuurd naar de gemeente.
                            Dit biedt een real-time overzicht van toekenningen en het gebruik van tegoeden.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/backoffice-api/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Procesoptimalisatie</h4>
                                <p>
                                    De backoffice-integratie met de Gemeente-API stroomlijnt organisatorische processen.
                                    Het automatiseren van verificatie voor regelingsaanvragen bespaart veel tijd en
                                    moeite.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Real-time informatie-uitwisseling</h4>
                                <p>
                                    De integratie zorgt voor een directe en continue uitwisseling van informatie over
                                    toekenningen en tegoedgebruik, waardoor er altijd actuele gegevens beschikbaar zijn.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Gegevenscombinatie</h4>
                                <p>
                                    De koppeling maakt het mogelijk om gegevens vanuit Forus te combineren met gegevens
                                    uit de systemen van uw organisatie, waardoor een compleet en geïntegreerd overzicht
                                    ontstaat.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Automatische controle</h4>
                                <p>
                                    Met de integratie kan automatisch worden gecontroleerd of een aanvrager recht heeft
                                    op een regeling, op basis van gemeentegegevens. Dit verhoogt de nauwkeurigheid en
                                    efficiëntie van het proces.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-steps block-feature-steps-lg">
                            <div className="block-feature-steps-title">Doel van de koppeling</div>
                            <div className="block-feature-steps-items">
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            Bij de aanvraag van een regeling door een aanvrager wordt automatisch
                                            gecontroleerd of deze aanvrager recht heeft op de regeling.
                                        </h4>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            De status van &quot;regeling toegekend of niet&quot; kan worden opgevraagd
                                            via het Forus-platform en zal zichtbaar zijn in bijv. het zaaksysteem van de
                                            gemeente.
                                        </h4>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            De status van &quot;tegoed gebruikt of niet&quot; (of er een transactie is
                                            gedaan) kan worden opgevraagd via het Forus-platform.
                                        </h4>
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
                        <FaqItem title="Voor welke organisaties is de Backoffice API geschikt?">
                            <p>
                                Op basis van een BSN worden gegevens opgehaald middels de API. De Backoffice API is
                                daarom uitsluitend in te zetten voor organisaties die de aanvraagprocedure voor een
                                regeling via het platform laten verlopen middels het inloggen met DigiD.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke gegevens heeft Fous nodig vanuit de organisatie?">
                            <p>
                                Om de Backoffice API in te zetten, is het van belang dat de organisatie beschikt over
                                een dataset van informatie over de aanvrager. Met de Backoffice API wordt namelijk
                                middels een koppeling deze data gecontroleerd wanneer de aanvrager inlogt met DigiD een
                                aanvraag voor een regeling doet. Op basis van het BSN wordt gecheckt of de aanvrager
                                recht heeft op de desbetreffende regeling.
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
                                '/assets/img/features/img/backoffice-api/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Backoffice API uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Backoffice API werkt? Neem dan contact met ons op voor een
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
