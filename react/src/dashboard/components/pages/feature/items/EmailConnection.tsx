import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-4.svg';
import IconStep1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-step-1.svg';
import IconStep2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-step-2.svg';
import IconStep3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-step-3.svg';
import IconStep4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-step-4.svg';
import IconStep5 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-step-5.svg';
import IconStep6 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/email-connection/icon-step-6.svg';

export default function EmailConnection({
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
                            Standaard worden e-mails verstuurd vanaf <strong>noreply@forus.io</strong> met de afzender
                            Forus.
                        </p>
                        <p>
                            Met deze oplossing heeft u de mogelijkheid om systeemgerelateerde e-mails te versturen
                            vanuit een gepersonaliseerd adres van uw organisatie, zoals{' '}
                            <strong>webshop@naamorganisatie.nl</strong>.
                        </p>
                        <p>
                            Op deze manier zullen de e-mails door de deelnemers herkend worden als afkomstig van uw
                            organisatie zelf.
                        </p>
                        <img
                            src={assetUrl('assets/img/features/img/email-connection/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Betrouwbare afzenderherkenning</h4>
                                <p>
                                    E-mails worden herkend als afkomstig van uw organisatie, waardoor de betrouwbaarheid
                                    wordt vergroot.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Standaard conformiteit</h4>
                                <p>
                                    De koppeling ondersteunt DKIM, DMARC en SPF volgens de open standaardenlijst van het
                                    Forum Standaardisatie. Deze beveiligingsprotocollen vallen onder het &apos;Pas toe
                                    of leg uit&apos;-beleid, wat betekent dat ze verplicht zijn.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Direct contactpunt voor de deelnemers</h4>
                                <p>
                                    Als deelnemers direct een e-mail terugsturen, komen eventuele vragen meteen op de
                                    juiste plek terecht, met het juiste e-mailadres.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Verbeterde efficiëntie en effectiviteit</h4>
                                <p>
                                    Door e-mailintegratie wordt de communicatie gestroomlijnd en kunnen processen
                                    efficiënter worden uitgevoerd.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-steps">
                            <div className="block-feature-steps-title">De implementatie van e-mailkoppeling</div>
                            <div className="block-feature-steps-items">
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep1 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #1</span>
                                            <span className="block-feature-steps-item-dot"></span>
                                            <span>Voorbereiding</span>
                                        </h4>
                                        <p>
                                            Delen van het plan van aanpak en afstemmen gewenste domeinnaam, e-mailadres
                                            en afzendernaam.
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
                                            <span>Configuratie</span>
                                        </h4>
                                        <p>Gegevens configureren en verificatie.</p>
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
                                            <span>Testen preproductieomgeving</span>
                                        </h4>
                                        <p>Een test e-mail sturen vanaf de testomgeving.</p>
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
                                            <span>Configuratie productieomgeving</span>
                                        </h4>
                                        <p>
                                            Na een succesvolle test kan de e-mailkoppeling worden geconfigureerd op de
                                            productie omgeving.
                                        </p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep5 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #5</span>
                                            <span className="block-feature-steps-item-dot" />
                                            <span>Testen aansluiting op productieomgeving</span>
                                        </h4>
                                        <p>Controleren of de koppeling is geactiveerd.</p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-icon">
                                        <IconStep6 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>
                                            <span>Stap #6</span>
                                            <span className="block-feature-steps-item-dot" />
                                            <span>Livegang</span>
                                        </h4>
                                        <p>E-mailkoppeling live zetten op de productieomgeving.</p>
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
                        <FaqItem title="Wat is de verwachte duur van het implementatietraject voor de e-mailintegratie?">
                            <p>
                                We schatten dat de implementatie van een e-mailintegratie ongeveer 4 weken in beslag
                                neemt.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wat is de verwachte inzet vanuit de organisatie?">
                            <p>
                                De werkzaamheden hebben voornamelijk een organisatorische en technische aard. Een
                                applicatiebeheerder kan deze taken uitvoeren.
                            </p>
                            <ul>
                                <li>Organisatorisch: Communicatie met Forus over de voortgang.</li>
                                <li>Technisch: Configuratie van domeinnamen voor uw organisatie.</li>
                            </ul>
                        </FaqItem>

                        <FaqItem title="Wie is betrokken bij het implementatietraject van de e-mail integratie?">
                            <p>Bij de implementatie van de e-mailintegratie zijn de volgende partijen betrokken:</p>
                            <ul>
                                <li>De organisatie die de koppeling gaat gebruiken.</li>
                                <li>Stichting Forus, de ontwikkelaar van het systeem en de koppeling.</li>
                            </ul>
                        </FaqItem>

                        <FaqItem title="Welke gegevens heeft Fous nodig vanuit de organisatie?">
                            <p>
                                Voor het mogelijk maken van een e-mailintegratie, heeft Forus de volgende gegevens
                                nodig:
                            </p>
                            <ul>
                                <li>Het e-mailadres waaruit de organisatie wenst de systeemmails te versturen.</li>
                                <li>
                                    Het domein waar de technische instellingen moeten worden doorgevoerd door de
                                    organisatie, bijvoorbeeld organisatie.nl.
                                </li>
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
                                '/assets/img/features/img/email-connection/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">E-mailkoppeling uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de e-mailkoppeling werkt? Neem dan contact met ons op voor een
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
