import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/budget-funds/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/budget-funds/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/budget-funds/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/budget-funds/icon-4.svg';

export default function BudgetFunds({
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
                            Budget fonds binnen het Forus-systeem staat voor budgetten die aan personen of gezinnen
                            worden toegekend. Dit budget kunnen zij besteden bij een selectie van gevalideerde
                            aanbieders die aangesloten zijn bij het Forus-platform. Dit systeem maakt het mogelijk voor
                            deelnemers om hun toegewezen middelen op een flexibele en transparante manier te gebruiken,
                            waarbij ze de vrijheid hebben om te kiezen uit een breed scala aan producten en diensten die
                            aansluiten bij hun persoonlijke behoeften en voorkeuren.
                        </p>

                        <img
                            src={assetUrl('assets/img/features/img/budget-funds/banner.jpg')}
                            alt={`${feature.name} banner`}
                        />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Efficiëntie</h4>
                                <p>
                                    Budget fonds maakt het beheer van gemeentelijke regelingen eenvoudiger, waardoor
                                    administratieve lasten verminderen en middelen sneller bij de deelnemer
                                    terechtkomen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Toegankelijkheid en flexibiliteit</h4>
                                <p>
                                    Budget fonds biedt een eenvoudige en gebruiksvriendelijke manier voor deelnemers om
                                    tegoeden te ontvangen en uit te geven bij een breed netwerk van gevalideerde
                                    aanbieders. Dit geeft hen de vrijheid om te kiezen wat het beste bij hun behoeften
                                    past.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Investeren in lokale gemeenschappen</h4>
                                <p>
                                    Door toegankelijkheid te bevorderen, stimuleert Budget fonds de
                                    deelnemersparticipatie in lokale economieën en gemeenschapsinitiatieven.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Transparantie</h4>
                                <p>
                                    Het Forus-systeem biedt volledige transparantie over waar en hoe tegoeden worden
                                    besteed, waardoor organisaties inzicht krijgen in de effectiviteit van hun beleid.
                                </p>
                            </div>
                        </div>

                        <h3>Tegoed aanmaken: twee handige opties</h3>

                        <div className="block block-feature-list-row">
                            <div className="block-feature-list-col">
                                <div className="block block-feature-list block-feature-list-quaternary">
                                    <div className="block-feature-list-items-wrapper">
                                        <div className="block-feature-list-items-title">
                                            <h4>Tegoeden aanmaken in bulk</h4>
                                            <p>
                                                De bulkfunctie biedt een snelle en efficiënte manier om veel tegoeden
                                                aan te maken.
                                            </p>
                                        </div>
                                        <div className="block-feature-list-items">
                                            <div className="block-feature-list-item">
                                                Handig voor grote aantallen tegoeden.
                                            </div>
                                            <div className="block-feature-list-item">
                                                Het is mogelijk om een CSV-bestand te uploaden met de benodigde
                                                informatie.
                                            </div>
                                            <div className="block-feature-list-item">
                                                U kunt kiezen voor het toekennen van een tegoed, directe betaling aan de
                                                aanbieder of op een specifiek bankrekeningnummer.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="block-feature-list-col">
                                <div className="block block-feature-list block-feature-list-quaternary">
                                    <div className="block-feature-list-items-wrapper">
                                        <div className="block-feature-list-items-title">
                                            <h4>Handmatig tegoed aanmaken</h4>
                                            <p>
                                                Voor meer flexibiliteit bij het aanmaken van tegoeden, kunt u de
                                                handmatige optie selecteren.
                                            </p>
                                        </div>
                                        <div className="block-feature-list-items">
                                            <div className="block-feature-list-item">
                                                Handig voor incidentele gevallen, bijvoorbeeld wanneer iemand die niet
                                                op de bulklijst stond, moet worden toegevoegd.
                                            </div>
                                            <div className="block-feature-list-item">
                                                Er zijn drie opties om tegoeden te creëren: op basis van BSN,
                                                activatiecode of e-mailadres.
                                            </div>
                                            <div className="block-feature-list-item">
                                                Het is mogelijk om een papieren versie te printen voor minder digitaal
                                                vaardige personen.
                                            </div>
                                        </div>
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
                            Mocht u nog vragen hebben of wilt u aanvullende informatie dan kunt u ons bellen op:{' '}
                            <strong>+31 (0) 85 004 33 87</strong> of contact opnemen via e-mail{' '}
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
                        <FaqItem title="Kan ik als organisatie zelf een budget fonds opzetten?">
                            <p>
                                Het fonds wordt in samenwerking met Forus opgezet. Er wordt gekeken welke voorwaarden
                                voor het fonds van toepassing zijn en welke bedragen dienen te worden uitgekeerd aan de
                                rechthebbenden.
                            </p>
                        </FaqItem>

                        <FaqItem title="Welke voorwaarden dienen te worden ingesteld voor een budget fonds?">
                            <p>
                                Een deelnemer moet aan bepaalde voorwaarden voldoen om in aanmerking te komen voor een
                                fonds. Deze voorwaarden kunt u aangeven tijdens het opzetten van een fonds in de
                                beheeromgeving en/of kunnen worden afgestemd met Forus.
                            </p>
                            <p>
                                Een voorbeeld van een voorwaarde zou kunnen zijn dat een deelnemer kinderen heeft binnen
                                een bepaalde leeftijdscategorie of dat er aan een bepaalde inkomensgrens moet worden
                                voldaan.
                            </p>
                        </FaqItem>

                        <FaqItem title="Hoe kan een budget fonds door de deelnemer worden aangevraagd?">
                            <p>
                                Tijdens het opzetten van een fonds kunt u kiezen uit verschillende aanvraag methoden.
                                Dit bepaalt hoe de deelnemer een aanvraag kan doen en zijn of haar tegoed kan activeren.
                                Dit kan via een aanvraagformulier, het invullen van een activatiecode of een combinatie
                                hiervan.
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
                                '/assets/img/features/img/budget-funds/banner-action-bg.jpg',
                            )}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">Budget fonds uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe Budget fonds werkt? Neem dan contact met ons op voor een
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
