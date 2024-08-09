import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';

export default function AboutUsInnovation() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    useEffect(() => {
        setTitle('About us page.');
    }, [setTitle]);

    return (
        <Fragment>
            <div className="wrapper">
                <div className="section">
                    <h2 className="section-title section-title-sm">Naar een merkbaar en meetbaar verschil!</h2>

                    <div className="section-description">
                        Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente Eemsdelta en
                        Gemeente Westerkwartier.
                    </div>

                    <div className="section-banner">
                        <img
                            src={assetUrl('/assets/img/about-us-innovations-banner.jpg')}
                            alt="About us innovations banner"
                        />
                    </div>

                    <div className="section-details-block">
                        <div className="section-details-block-main">
                            Project gefinancierd door het Innovatiebudget 2023 in samenwerking met Gemeente Eemsdelta en
                            Gemeente Westerkwartier.
                        </div>
                        <div className="section-details-block-description">
                            Het bestrijden van armoede is een complexe uitdaging. In Nederland zijn er diverse nationale
                            en lokale regelingen en voorzieningen die worden aangeboden door fondsen en stichtingen.
                            Door de vele regelingen raken veel mensen het overzicht kwijt, wat leidt tot stress en
                            onnodig niet-gebruik van deze voorzieningen.
                            <br />
                            <br />
                            Bij Forus streven we ernaar om individuen in staat te stellen om actief deel te nemen aan
                            initiatieven, terwijl we de drempels verlagen voor het verkrijgen van financiële
                            ondersteuning en de sociale impact maximaliseren. In nauwe samenwerking met de gemeenten
                            Westerkwartier en Eemsdelta, streven we naar voortzetting van ons reeds bestaande
                            partnerschap, met als gemeenschappelijk doel de verbetering van het systeem. Door onze
                            gedeelde visie, dat er ruimte is voor optimalisatie, zetten we onze expertise in voor een
                            krachtige samenwerking.
                            <br />
                            <br />
                            We zijn begonnen met de ontwikkeling van een geavanceerd digitaal platform waarin alle
                            beschikbare voorzieningen overzichtelijk, gebruiksvriendelijk en toegankelijk zijn
                            ondergebracht. De toepassing is ontwikkeld om praktische uitdagingen op een innovatieve
                            manier op te lossen voor de Kansshop (gemeente Eemsdelta) en de Potjeswijzer (gemeente
                            Westerkwartier).
                            <br />
                            <br />
                        </div>
                    </div>
                </div>
            </div>

            <BlockDashedSeparator />

            <div className={'wrapper'}>
                <div className="block block-with-image">
                    <div className="block-with-image-title">Onze doelen: wat we willen bereiken</div>

                    <div className="block-with-image-wrapper">
                        <div className="block-with-image-info">
                            <div className="block-with-image-label">Fase 1:</div>
                            <div className="block-with-image-title">Regelingen check</div>
                            <div className="block-with-image-description">
                                Aanvragers hebben de mogelijkheid om via het platform diverse regelingen aan te vragen.
                                Echter, vaak blijkt rechtstreeks aanvragen een drempel te vormen. Aanvragers willen een
                                snelle en overzichtelijke weergave van mogelijke regelingen waarvoor ze in aanmerking
                                kunnen komen. Hoewel er al enkele systemen zijn die deze controle uitvoeren, verloopt
                                het daadwerkelijke aanvraagproces via afzonderlijke systemen en procedures, wat
                                resulteert in herhaalde invulling van formulieren.
                                <br />
                                <br />
                                Binnen dit onderdeel hebben we eraan gewerkt om alles onder te brengen binnen één
                                systeem. Aanvragers kunnen dankzij de Regelingen Check snel en eenvoudig zien waar ze
                                voor in aanmerking komen. Binnen dit geïntegreerde systeem worden de controle, aanvraag,
                                toekenning en afhandeling gecoördineerd, wat leidt tot een verbeterd overzicht en een
                                efficiënter proces.
                            </div>
                        </div>

                        <div className="block-with-image-image">
                            <img
                                src={assetUrl('/assets/img/check-eligibility.jpg')}
                                alt="Regelingen check functionaliteit stelt deelnemers in staat om te controleren of zij in aanmerking komen voor diverse regelingen"
                            />
                        </div>
                    </div>
                </div>

                <div className="block block-with-image">
                    <div className="block-with-image-label">Fase 2:</div>
                    <div className="block-with-image-title">
                        Smart Payout - Uitgifte van de IIT (Individuele Inkomenstoeslag)
                    </div>

                    <div className="block-with-image-wrapper">
                        <div className="block-with-image-image">
                            <img
                                src={assetUrl('/assets/img/individual-income.jpg')}
                                alt="Individuele Inkomenstoeslag uitgegeven via het Forus-platform"
                            />
                        </div>
                        <div className="block-with-image-info">
                            <div className="block-with-image-description">
                                In fase 2 richten we ons op het faciliteren van de uitgifte van regelingen waarbij
                                mensen recht hebben op een bepaald geldbedrag. Dit betekent dat het geld rechtstreeks
                                vanuit het platform wordt overgemaakt naar het bankrekeningnummer van de rechthebbende.
                                Hierdoor kunnen ook regelingen zoals de IIT (Individuele Inkomenstoeslag) via het
                                platform worden uitgegeven.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="block block-with-image">
                    <div className="block-with-image-wrapper">
                        <div className="block-with-image-info">
                            <div className="block-with-image-description">
                                Het voordeel is dat alle soorten regelingen op één plek kunnen worden aangevraagd en
                                afgehandeld. Dit varieert van regelingen waarbij een QR-code wordt verstrekt voor een
                                specifiek product of dienst (zoals de openbaar vervoer regeling) tot aan regelingen
                                waarbij een vrij te besteden geldbedrag (zoals IIT) wordt toegekend. Gebruikers kunnen
                                in hun persoonlijke omgeving zien welke regelingen ze hebben aangevraagd, de status van
                                deze aanvragen en wat ze wanneer hebben ontvangen. Voor gemeenten betekent dit dat ze
                                één overzicht hebben van alle aanvragen, toekenningen en afhandelingen.
                                <br />
                                <br />
                                Om dit realiseren, werken we in fase 2 aan de aanvraagprocedures (E-formulieren), de
                                uitbetalingsfunctionaliteit en de persoonlijke omgeving van de deelnemers.
                            </div>
                        </div>
                        <div className="block-with-image-image">
                            <img
                                src={assetUrl('/assets/img/central-place.jpg')}
                                alt="Eén centrale plek voor het aanvragen en afhandelen van alle soorten regelingen"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <BlockDashedSeparator />

            <div className="wrapper">
                <div className="block block-with-image block-with-image-background">
                    <div className="block-with-image-wrapper">
                        <div className="block-with-image-image">
                            <img
                                src={assetUrl('/assets/img/phases.jpg')}
                                alt="Regelingen check functionaliteit stelt deelnemers in staat om te controleren of zij in aanmerking komen voor diverse regelingen"
                            />
                        </div>
                        <div className="block-with-image-info">
                            <div className="block-with-image-title">Vervolg fasen</div>
                            <div className="block-with-image-description">
                                Wanneer deelnemers verschillende budgetten en tegoeden hebben kan het lastig zijn om het
                                overzicht te houden. In de laatste fase van het project richten we ons op het verder
                                verbeteren van de gebruiksvriendelijkheid van het platform.
                            </div>
                        </div>
                    </div>
                </div>

                <LearnMore
                    title={'Heeft u vragen of wilt u aanvullende informatie over het Innovatiebudget project?'}
                    description={'Neem gerust contact met ons op. We staan klaar om uw vragen te beantwoorden.'}
                    buttons={[
                        {
                            title: 'Contact opnemen',
                            type: 'primary',
                        },
                    ]}
                />
            </div>

            <BlockDashedSeparator image={false} />
            <br />
            <br />
            <br />
        </Fragment>
    );
}
