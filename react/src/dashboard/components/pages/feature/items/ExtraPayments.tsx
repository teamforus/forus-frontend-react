import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/extra-payments/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/extra-payments/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/extra-payments/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/extra-payments/icon-4.svg';

export default function ExtraPayments({
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
                            In sommige gevallen heeft een deelnemer het grootste gedeelte van een toegekend tegoed al
                            besteed. Er blijft een klein restant bedrag over. Om het budget toch volledig te kunnen
                            uitnutten komt er een bijbetaal met iDEAL optie beschikbaar. Door middel van de
                            bijbetaaloptie kunnen deelnemers die nog een (klein) bedrag resterend hebben, toch
                            gebruikmaken van het aanbod op de website. In dit geval betalen ze een gedeelte van de
                            kosten met het toegekende tegoed en een gedeelte zelfstandig met iDEAL. Deze mogelijkheid
                            wordt geboden door de integratie met Mollie, een payment service provider.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/extra-payments/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Maximale benutting van het budget</h4>
                                <p>
                                    De bijbetaaloptie met iDEAL stelt deelnemers in staat om het toegekende tegoed
                                    volledig te benutten, zelfs als er slechts een klein bedrag over is. Hierdoor kunnen
                                    ze optimaal profiteren van alle beschikbare aanbiedingen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Betrouwbare beveiliging</h4>
                                <p>
                                    Mollie staat bekend om strenge beveiligingsprotocollen die de financiële gegevens
                                    van deelnemers veilig bewaren en verwerken. Dit zorgt voor vertrouwen en gemoedsrust
                                    bij zowel de deelnemers als de gemeente.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Gebruiksgemak</h4>
                                <p>
                                    Met de bijbetaaloptie met iDEAL kunnen deelnemers gemakkelijk en snel bijbetalen.
                                    iDEAL is een bekende en gebruiksvriendelijke betaaloptie. Deze toevoeging verbetert
                                    de gebruikerservaring en draagt bij aan een hogere tevredenheid onder de deelnemers.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Beheersbaarheid</h4>
                                <p>
                                    De sponsor heeft volledige controle over betalingen via iDEAL. Dit stelt de sponsor
                                    in staat om de optie om bij te betalen per aanbieder in- of uit te schakelen,
                                    waardoor flexibiliteit en gemak worden geboden.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-text-image-columns block-feature-text-image-columns-light">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over Mollie</h4>
                                <p>
                                    Mollie is een payment service provider (PSP) die online transacties afhandelt voor
                                    webwinkels en andere organisaties. Ze bieden een breed scala aan betaalmethoden,
                                    zoals iDEAL. In Nederland is Mollie een van de meest populaire payment service
                                    providers, vooral voor webwinkels en andere organisaties die online betalingen
                                    willen accepteren. Mollie biedt een eenvoudige, veilige en betrouwbare manier om
                                    betalingen te ontvangen. Door de integratie met Mollie wordt het mogelijk om
                                    bijbetalingen met iDEAL te verwerken, wat zorgt voor een gebruiksvriendelijke en
                                    veilige betalingservaring. Hierdoor wordt het Forus-platform nog toegankelijker en
                                    efficiënter voor zowel aanbieders als deelnemers.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/extra-payments/image-text-block.jpg')}
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
                        <FaqItem title="Wat zijn de kosten per transactie via iDEAL?">
                            <p>
                                De iDEAL-kosten per transactie kunt u terugvinden op:
                                <a href="https://www.mollie.com/nl/pricing" target="_blank" rel="noreferrer">
                                    https://www.mollie.com/nl/pricing
                                </a>
                                .
                            </p>
                        </FaqItem>

                        <FaqItem title="Wie betaalt de transactiekosten?">
                            <p>
                                De transactiekosten worden in rekening gebracht bij de aanbieder. De sponsor kan deze
                                kosten eventueel vergoeden.
                            </p>
                        </FaqItem>

                        <FaqItem title="Is het ook mogelijk om te kiezen voor een ander betaalmiddel zoals Mastercard, Visa of Klarna i.p.v. iDEAL?">
                            <p>Nee, op dit moment ondersteunen we alleen iDEAL via Mollie.</p>
                        </FaqItem>

                        <FaqItem title="Kan ik als sponsor zelf bepalen welke aanbieder gebruik mag maken van iDEAL?">
                            <p>Ja, het is mogelijk om per aanbieder iDEAL in- of uit te schakelen.</p>
                        </FaqItem>

                        <FaqItem title="Biedt Forus ook ondersteuning bij problemen met het Mollie-account?">
                            <p>
                                Nee, mocht de aanbieder problemen ervaren wat betrekking heeft op het Mollie-account,
                                dan kunnen ze contact opnemen met de Supportafdeling van Mollie. U kunt bij Forus
                                terecht met vragen over het tot stand brengen van de koppeling met uw Mollie-account.
                            </p>
                        </FaqItem>

                        <FaqItem title="Ondersteunt Forus ook andere Payment Service Providers (PSP) dan Mollie?">
                            <p>Nee, op dit moment kan de aanbieder alleen koppelen met Mollie.</p>
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
                                '/assets/img/features/img/extra-payments/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Bijbetalen met iDEAL uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe bijbetalen met iDEAL werkt? Neem dan contact met ons op voor een
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
