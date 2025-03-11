import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/physical-cards/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/physical-cards/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/physical-cards/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/physical-cards/icon-4.svg';
import FaqItem from '../elements/FaqItem';

export default function PhysicalCards({
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
                            De Fysieke Pas functionaliteit biedt deelnemers die minder digitaal vaardig zijn een
                            alternatieve toegangsmogelijkheid tot verschillende diensten en voorzieningen. Hierbij wordt
                            de QR-code op een fysieke pas gedrukt. De pas kan ook als stadspas dienen voor verschillende
                            doeleinden.
                        </p>
                        <img
                            src={assetUrl('assets/img/features/img/physical-cards/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Toegankelijkheid</h4>
                                <p>
                                    Deze functionaliteit biedt mensen met beperkte digitale vaardigheden toegang tot
                                    specifieke diensten en voorzieningen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Inclusiviteit</h4>
                                <p>
                                    De stadspas heeft een antistigmatiserend effect, omdat anderen aan de kaart niet
                                    kunnen zien of iemand een laag of hoog inkomen heeft.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Gebruiksgemak</h4>
                                <p>
                                    De Fysieke Pas functionaliteit maakt het proces van aanvragen en ontvangen van de
                                    pas eenvoudig en efficiënt, waardoor deelnemers snel kunnen profiteren van de
                                    voordelen die de pas biedt.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Maatwerk</h4>
                                <p>
                                    Organisaties hebben de vrijheid om zelf te bepalen op welke manier ze de pas willen
                                    inzetten. Dit varieert van kortingen op lokale musea voor alle deelnemers tot extra
                                    tegoeden voor mensen met een lager inkomen.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-text-image-columns">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over de Fysieke Pas</h4>
                                <p>
                                    De Fysieke Pas is een persoonlijke pas met een unieke QR-code die kan worden
                                    gebruikt voor verschillende doeleinden, zoals toegang tot culturele voorzieningen en
                                    kortingen bij lokale winkels. De pas is bedoeld voor deelnemers die moeite hebben
                                    met digitale toegang en bevordert inclusiviteit binnen de gemeente.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/physical-cards/image-text-block.jpg')}
                                    alt={`${feature.name} banner`}
                                />
                            </div>
                        </div>

                        <hr />

                        <div className="block block-feature-text-image-columns block-feature-text-image-columns-secondary">
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl(
                                        'assets/img/features/img/physical-cards/image-text-block-secondary.jpg',
                                    )}
                                    alt={`${feature.name} banner`}
                                />
                            </div>
                            <div className="block-feature-text-image-columns-description">
                                <h4>Duurzaamheid</h4>
                                <p>
                                    Duurzaamheid speelt een belangrijke rol in de ontwikkeling en implementatie van
                                    fysieke passen. De gemeente heeft de vrijheid om te kiezen welk type pas zij willen
                                    gebruiken. Er is een optie om te kiezen voor een <strong>Ecopas</strong>, waarmee
                                    deelnemers een milieuvriendelijk alternatief hebben voor plastic pasjes. Deze
                                    ecologisch verantwoorde passen zijn composteerbaar, worden gerecycled of gemaakt van
                                    gerecycled materiaal. Bij de productie worden alternatieve materialen gebruikt in
                                    plaats van plastic, zoals biologisch afbreekbare kalk of hout.
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
                        <FaqItem title="Wat gebeurt er in het geval dat een deelnemer zijn pas verliest of als de pas defect is?">
                            <p>
                                Als er een plastic pas aan een tegoed is gekoppeld, maar de deelnemer is deze kwijt of
                                is hij defect, dan moet de pas worden losgekoppeld. Indien gewenst kan er een nieuwe
                                plastic pas worden aangevraagd voor de deelnemer.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke gegevens van een deelnemer heeft de medewerker nodig om namens hen een plastic pas te bestellen?">
                            <p>
                                Wanneer uw organisatie werkt met een fysieke pas, maar de deelnemer heeft deze nog niet
                                ontvangen, dan kunt u namens de deelnemer een plastic pas bestellen. De volgende
                                gegevens van de deelnemer zijn hiervoor vereist:
                            </p>
                            <ul>
                                <li>Een actief tegoed in de beheeromgeving</li>
                                <li>Straatnaam</li>
                                <li>Huisnummer en eventuele toevoeging</li>
                                <li>Postcode</li>
                                <li>Plaats</li>
                            </ul>
                        </FaqItem>

                        <FaqItem title="Hoelang duurt het voordat een aangevraagde fysieke pas thuis wordt bezorgd?">
                            <p>
                                Na het indienen van een aanvraag, wordt de fysieke pas doorgaans binnen 14 dagen
                                geleverd.
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
                                '/assets/img/features/img/physical-cards/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Fysieke Pas uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de Fysieke Pas werkt? Neem dan contact met ons op voor een
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
