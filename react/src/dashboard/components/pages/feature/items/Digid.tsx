import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-4.svg';
import IconStep1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-step-1.svg';
import IconStep2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-step-2.svg';
import IconStep3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-step-3.svg';
import IconStep4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/digid/icon-step-4.svg';

export default function Digid({
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
                            Forus faciliteert de uitgifte van sociale regelingen en maakt gebruik van integratie met
                            DigiD. Gebruikers kunnen via DigiD inloggen om regelingen aan te vragen of te activeren.
                        </p>
                        <p>
                            DigiD, als een veilig en betrouwbaar middel voor digitale identificatie, verleent deelnemers
                            toegang tot de online dienstverlening. Het biedt deelnemers een handige en veilige manier om
                            in te loggen op het platform en dient tevens als digitale identificatiemethode voor reeds
                            toegewezen tegemoetkomingen.
                        </p>
                        <p>
                            De DigiD-integratie is gekoppeld aan het SAML-koppelvlak en wordt geleverd met een Third
                            Party Memorandum (TPM) verklaring.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/digid/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Makkelijk en veilig inloggen</h4>
                                <p>
                                    Deelnemers kunnen gemakkelijk en veilig inloggen, waardoor ze veilige toegang hebben
                                    tot de website en diensten met behulp van DigiD.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Digitale identificatie</h4>
                                <p>
                                    Met DigiD kunnen deelnemers aanvragen indienen, wat zorgt voor een naadloze
                                    identificatie bij het proces.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Efficiënte verwerking van aanvragen</h4>
                                <p>
                                    De integratie met DigiD zorgt voor een efficiënte verwerking van aanvragen door
                                    toegang te verlenen tot de BRP-gegevens van de aanvrager via BSN.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Gebruiksvriendelijkheid voor deelnemers</h4>
                                <p>
                                    Voor deelnemers wordt de gebruiksvriendelijkheid vergroot doordat ze na het inloggen
                                    direct toegang hebben tot hun reeds toegewezen tegoeden.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-steps">
                            <div className="block-feature-steps-title">
                                Het aansluitingsproces van DigiD op het Forus-platform
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
                                            <span>Aansluiting</span>
                                        </h4>
                                        <p>
                                            De noodzakelijke stappen worden uiteengezet in een handleiding. De initiële
                                            DigiD-test wordt in een &apos;oefenomgeving&apos; uitgevoerd, waarna de
                                            daadwerkelijke koppeling kan worden aangevraagd.
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
                                            Het testen wordt uitgevoerd in een speciale testomgeving met DigiD. Dit
                                            heeft als voordeel dat het kan worden gebruikt voor diverse toepassingen.
                                            Implementatie kan gebruik maken van een beperkt aantal test-DigiD-accounts.
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
                                            <span>Testen</span>
                                        </h4>
                                        <p>
                                            Voor testen kunnen DigiD-testaccounts worden aangevraagd via Forus. Regels
                                            gelden voor gebruik en e-mailadres moet nieuw zijn. Na testen blijft DigiD
                                            bruikbaar.
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
                                            Na succesvolle testfase kan een koppeling worden aangevraagd. Logius
                                            verwerkt deze aanvraag en zorgt voor correcte werking. Binnen 2 maanden na
                                            activering vindt veiligheidsonderzoek plaats.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="block block-feature-text-image-columns">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over DigiD</h4>
                                <p>
                                    DigiD is een digitale identificatiemethode die als standaard wordt gebruikt bij de
                                    Nederlandse overheidsorganisaties. Het stelt gebruikers in staat om zich online te
                                    identificeren bij verschillende overheidsinstanties en andere organisaties. DigiD
                                    verifieert de identiteit van gebruikers en biedt toegang tot persoonlijke online
                                    diensten, zoals het aanvragen van toeslagen, inloggen op overheidswebsites, en meer.
                                    Alleen instellingen die wettelijk gemachtigd zijn om burgerservicenummers te
                                    verifiëren, maken gebruik van DigiD. Dit betreft overheidsinstanties of entiteiten
                                    met een publieke rol, zoals: ministeries en gemeenten, pensioenfondsen.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/digid/image-text-block.jpg')}
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
                <AdditionalFeatureList additionalFeatures={additionalFeatures} organization={organization} />

                <div className="card-section">
                    <div
                        className="block block-features-demo-banner"
                        style={{
                            backgroundImage: `url(${assetUrl('/assets/img/features/img/digid/banner-action-bg.jpg')}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">De DigiD-integratie uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de DigiD-koppeling werkt? Neem dan contact met ons op voor een
                                    persoonlijke demonstratie. We laten u graag zien hoe het voor u kan werken.
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
