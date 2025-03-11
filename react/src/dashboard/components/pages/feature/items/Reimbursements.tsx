import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/reimbursements/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/reimbursements/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/reimbursements/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/reimbursements/icon-4.svg';

export default function Reimbursements({
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
                            Met de declaratiefunctionaliteit hebben deelnemers de mogelijkheid om bonnen en facturen in
                            te dienen. Dit stelt hen in staat om kosten terug te vragen voor uitgaven bij
                            niet-aangesloten aanbieders of om facturen in te dienen voor specifieke regelingen, zoals de
                            Regeling Reductie Energiegebruik of Internetkosten.
                        </p>
                        <p>
                            Binnen de persoonlijke deelnemersomgeving in de website kunnen deelnemers eenvoudig
                            bonnetjes en bewijsstukken indienen. Deze documenten worden direct verwerkt in het systeem
                            en komen binnen in de beheeromgeving van de gemeente. Hier worden ze gecontroleerd,
                            beoordeeld en uiteindelijk vergoed.
                        </p>
                        <p>
                            Na goedkeuring ontvangen deelnemers de kosten terug op hun persoonlijke bankrekening. Deze
                            betalingen worden gecrediteerd van het budget of er kan een transactie klaargezet worden
                            naar bijvoorbeeld een internetleverancier. De betalingen verlopen via de gekoppelde
                            BNG-bankrekening.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/reimbursements/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Efficiënte kostenvergoeding</h4>
                                <p>
                                    Het stelt deelnemers in staat om bonnen en facturen in te dienen voor
                                    kostenvergoeding op een efficiënte manier.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Gebruiksvriendelijke beheeromgeving</h4>
                                <p>
                                    Medewerkers kunnen gebruik maken van een beheeromgeving om de aanvragen te
                                    beoordelen en te verwerken.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Volledig overzicht van transacties</h4>
                                <p>
                                    Het platform biedt een duidelijk overzicht van alle transacties binnen de
                                    beheeromgeving, waardoor een transparante administratie mogelijk is.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Tijdsbesparing</h4>
                                <p>
                                    Het gebruik van Declaraties in het Forus-platform bespaart tijd doordat het proces
                                    van kostenvergoeding gestroomlijnd wordt en administratieve taken worden
                                    geautomatiseerd.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-list block-feature-list-secondary">
                            <h3>De functionaliteiten van de declaratiefunctionaliteit worden beschikbaar in:</h3>
                            <div className="block-feature-list-items-wrapper">
                                <div className="block-feature-list-items">
                                    <div className="block-feature-list-item">
                                        De website voor deelnemers om kassabonnen, facturen en andere bewijsmaterialen
                                        te uploaden, zodat zij kosten kunnen terugvragen.
                                    </div>
                                    <div className="block-feature-list-item">
                                        De beheeromgeving voor medewerkers waar zij de ingediende aanvragen voor
                                        kostenvergoeding kunnen beoordelen en goedkeuren.
                                    </div>
                                    <div className="block-feature-list-item">
                                        De beheeromgeving voor medewerkers met een functionaliteit voor open betalingen.
                                    </div>
                                    <div className="block-feature-list-item">
                                        De beheeromgeving voor medewerkers met een overzicht van alle transacties.
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
                        <FaqItem title="Is het mogelijk om categorie en aanbieder toe te voegen aan een declaratie?">
                            <p>
                                Het is mogelijk om categorieën en aanbieders te koppelen aan declaraties die worden
                                ingediend door de deelnemers. Op deze manier kunt u een export genereren en een
                                duidelijk overzicht krijgen van de uitgaven per categorie en aanbieder. U kunt zelf
                                categorieën aanmaken in de beheeromgeving.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wat is het voordeel van de Declaratiefunctionaliteit voor de deelnemer?">
                            <p>
                                De deelnemer heeft met de Declaratiefonctionaliteit de mogelijkheid om transacties ‘voor
                                te schieten’. Dit maakt het heel makkelijk voor regelingen als bijvoorbeeld een Energie
                                regeling, waar de deelnemer een abonnement kan afsluiten en achteraf kan declareren bij
                                de gemeente. Zo hoeft er geen energieleverancier te worden aangesloten als aanbieder,
                                maar kan er rechtstreeks vanuit de bankrekening van de gemeente een betaling worden
                                gedaan naar de deelnemer.
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
                                '/assets/img/features/img/reimbursements/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Declaratiefunctionaliteit uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Declaratiefunctionaliteit werkt? Neem dan contact met ons op voor
                                    een persoonlijke demonstratie. We laten u graag zien hoe het voor uw kan werken.
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
