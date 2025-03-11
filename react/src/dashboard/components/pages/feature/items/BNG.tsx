import React, { Fragment } from 'react';
import OrganizationFeature from '../../../../services/types/OrganizationFeature';
import Organization from '../../../../props/models/Organization';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import AdditionalFeatureList from '../elements/AdditionalFeatureList';
import FaqItem from '../elements/FaqItem';
import IconFeature1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-1.svg';
import IconFeature2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-2.svg';
import IconFeature3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-3.svg';
import IconFeature4 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-4.svg';
import IconStep1 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-step-1.svg';
import IconStep2 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-step-2.svg';
import IconStep3 from '../../../../../../assets/forus-platform/resources/_platform-common/assets/img/features/icons/bng/icon-step-3.svg';

export default function BNG({
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
                <div className="card-header card-header-next">
                    <div className="card-title">Beschrijving</div>
                </div>
                <div className="card-section">
                    <div className="block block-content">
                        <p>
                            Uw organisatie maakt gebruik van het Forus-platform voor de uitvoering van sociale
                            regelingen. Dankzij de integratie met de Bank Nederlandse Gemeenten (BNG) worden betalingen
                            aan betrokken aanbieders moeiteloos uitgevoerd. Deze geautomatiseerde koppeling
                            minimaliseert handmatige taken en vermindert de kans op fouten aanzienlijk.
                        </p>

                        <img src={assetUrl('assets/img/features/img/bng/banner.jpg')} alt={`${feature.name} banner`} />

                        <h3>Belangrijkste voordelen</h3>

                        <div className="block block-feature-icons">
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature1 />
                                </div>
                                <h4>Efficiënte financiële verwerking</h4>
                                <p>
                                    Dankzij de geautomatiseerde verbinding worden handmatige taken geminimaliseerd,
                                    waardoor processen aanzienlijk efficiënter verlopen.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature2 />
                                </div>
                                <h4>Snelle financiële transacties:</h4>
                                <p>
                                    De naadloze koppeling zorgt voor een vlotte overdracht van financiële transacties,
                                    wat bijdraagt aan een snelle verwerking van betalingen aan aanbieders.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature3 />
                                </div>
                                <h4>Foutreductie</h4>
                                <p>
                                    De kans op fouten wordt aanzienlijk verlaagd doordat transacties direct en
                                    nauwkeurig worden doorgezet vanuit Forus naar BNG.
                                </p>
                            </div>
                            <div className="block-feature-icons-item">
                                <div className="block-feature-icon">
                                    <IconFeature4 />
                                </div>
                                <h4>Tijdsbesparing en automatisering</h4>
                                <p>
                                    Dagelijks om 09:00 uur wordt automatisch een overzichtsbestand met alle huidige
                                    transacties gegenereerd. Hierbij bestaat de mogelijkheid tot handmatige verwerking
                                    indien gewenst.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-steps block-feature-steps-secondary">
                            <div className="block-feature-steps-title">
                                Het aansluitingsproces van DigiD op het Forus-platform
                            </div>
                            <div className="block-feature-steps-items">
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-content">
                                        <h4 className="step-name">Stap #1</h4>
                                    </div>
                                    <div className="block-feature-steps-icon">
                                        <IconStep1 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>Voorbereiding</h4>
                                        <p>
                                            Het implementatieproces begint met voorbereidende stappen, zoals het openen
                                            van een nieuwe BNG-bankrekening en het storten van een initiële geldsom.
                                        </p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-content">
                                        <h4 className="step-name">Stap #2</h4>
                                    </div>
                                    <div className="block-feature-steps-icon">
                                        <IconStep2 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>Procesafstemming en testen</h4>
                                        <p>
                                            Vervolgens wordt het werkproces zorgvuldig afgestemd en getest. Dit omvat
                                            het plannen van een demonstratie met Forus, het koppelen met de
                                            testomgeving, het toevoegen van benodigde medewerkers en het verkrijgen van
                                            toestemming van BNG.
                                        </p>
                                    </div>
                                </div>
                                <div className="block-feature-steps-item">
                                    <div className="block-feature-steps-content">
                                        <h4 className="step-name">Stap #3</h4>
                                    </div>
                                    <div className="block-feature-steps-icon">
                                        <IconStep3 />
                                    </div>
                                    <div className="block-feature-steps-content">
                                        <h4>Livegang</h4>
                                        <p>
                                            Bij livegang: koppeling met actieve omgeving, toevoegen relevante
                                            medewerkers, check rekeningnummer, seintje aan Forus na succesvolle
                                            koppeling, voortdurend monitoren transacties gemeente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="block-feature-steps-info">
                                <p>
                                    Deze gestructureerde aanpak zorgt voor een soepele integratie van BNG met Forus, met
                                    aandacht voor zowel de technische aspecten als de operationele uitvoering binnen de
                                    organisatie.
                                </p>
                            </div>
                        </div>

                        <div className="block block-feature-list block-feature-list-secondary">
                            <h3>De functionaliteiten van de declaratiemodule worden beschikbaar in:</h3>
                            <div className="block-feature-list-items-wrapper">
                                <div className="block-feature-list-items">
                                    <div className="block-feature-list-item">
                                        De webshop voor deelnemers om kassabonnen, facturen en andere bewijsmaterialen
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

                        <div className="block block-feature-text-image-columns">
                            <div className="block-feature-text-image-columns-description">
                                <h4>Over BNG</h4>
                                <p>
                                    BNG Bank, voluit Bank Nederlandse Gemeenten, is een Nederlandse bank die zich richt
                                    op de publieke sector. Het is een financiële instelling die diensten verleent aan
                                    overheden, zoals gemeenten, provincies, en andere publieke organisaties. BNG Bank
                                    speelt een cruciale rol in het financieren van maatschappelijke projecten en het
                                    verstrekken van leningen aan de publieke sector in Nederland. Als gespecialiseerde
                                    instelling draagt BNG bij aan de ondersteuning en ontwikkeling van de Nederlandse
                                    publieke sector.
                                </p>
                            </div>
                            <div className="block-feature-text-image-columns-img">
                                <img
                                    src={assetUrl('assets/img/features/img/bng/image-text-block.jpg')}
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
                <div className="card-header card-header-next">
                    <div className="card-title">Veelgestelde vragen</div>
                </div>
                <div className="card-section card-section-padless">
                    <div className="block block-feature-faq">
                        <FaqItem title="Hoe werkt het koppelen?">
                            <p>
                                De standaard werkwijze is dat hiervoor een nieuw bankrekeningnummer wordt gebruikt.
                                Bekijk het artikel
                                <a
                                    href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29408519783697-Bank-integraties"
                                    target="_blank"
                                    rel="noreferrer">
                                    Bankrekening koppelen
                                </a>
                                voor meer informatie.
                            </p>
                        </FaqItem>

                        <FaqItem title="Kan er een bestaand bankrekeningnummer worden gekoppeld?">
                            <p>
                                Het is mogelijk om een bestaand bankrekeningnummer aan het platform te koppelen. Echter
                                zullen de geldstromen voor verschillende doeleinden door elkaar gaan lopen.
                            </p>
                        </FaqItem>

                        <FaqItem title="Is er een nieuw bankrekeningnummer nodig?">
                            <p>
                                Om financieel alles overzichtelijk te houden adviseren wij om een aparte
                                bankrekeningnummer aan te vragen.
                            </p>
                        </FaqItem>

                        <FaqItem title="Wie beheert de bankrekening waarmee een koppeling wordt gemaakt?">
                            <p>De bankrekening is van de gemeente.</p>
                        </FaqItem>

                        <FaqItem title="Ik heb een e-mail ontvangen dat de bank connectie binnenkort verloopt, wat moet ik doen?">
                            <p>
                                Een bankkoppeling is 90 dagen geldig, daarna moet er opnieuw toestemming gegeven worden.
                                Je ontvangt 14 dagen voordat de bankkoppeling verloopt, een herinneringsmail en er wordt
                                een banner geplaatst in de beheeromgeving.
                            </p>
                        </FaqItem>

                        <FaqItem title="Met welke bank kan er gekoppeld worden?">
                            <p>
                                Dit kan alleen met een <u>BNG</u> of <u>Bunq</u> bankrekening. Bekijk het artikel{' '}
                                <a
                                    href="https://forusoperations.zendesk.com/hc/nl-nl/sections/29408519783697-Bank-integraties"
                                    target="_blank"
                                    rel="noreferrer">
                                    Bankrekening koppelen
                                </a>{' '}
                                voor meer informatie.
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
                            backgroundImage: `url(${assetUrl('/assets/img/features/img/bng/banner-action-bg.jpg')}`,
                        }}>
                        <div className="features-demo-banner-info-wrapper">
                            <div className="features-demo-banner-info">
                                <div className="features-demo-banner-title">De BNG-integratie uitproberen</div>
                                <div className="features-demo-banner-details">
                                    Wilt u zien hoe de BNG-integratie werkt? Neem dan contact met ons op voor een
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
