import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';

export default function RolesRequester() {
    const setTitle = useSetTitle();
    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Aanvrager /Deelnemer');
    const [bannerDescription] = useState(
        [
            'Binnen het Forus-systeem wordt iemand die een aanvraag voor een regeling indient, gezien als',
            'een & aanvrager &amp. Zodra deze aanvraag is goedgekeurd, verandert de status van deze',
            'persoon in het systeem naar &amp deelnemer &amp.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Requester role page.');
    }, [setTitle]);

    return (
        <Fragment>
            <div className="wrapper hide-sm">
                <RolesBanner type={'requester'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="show-sm">
                <RolesBanner type={'requester'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-requester.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'requester'} />

                    <div className="section section-overview">
                        <div className="section-title section-title-sm text-left">Functionaliteiten en overzicht</div>
                        <div className="section-separator">
                            <div className="line" />
                        </div>
                        <div className="section-description text-left">
                            Mensen raken door de vele initiatieven, zoals tegemoetkomingen en regelingen, het overzicht
                            kwijt. Ingewikkelde aanvraagprocedures leiden vaak tot stress en onnodig niet-gebruik van
                            deze voorzieningen.
                            <br />
                            <br />
                            Vaak moet men voor elke regeling opnieuw aantonen dat ze in aanmerking komen, wat een
                            pijnlijk proces is. Forus wil dit voorkomen door hergebruik van gegevens mogelijk te maken.
                            Ons streven is dat mensen één keer bewijzen dat ze recht hebben, waarna ze alles ontvangen
                            waarvoor ze in aanmerking komen.
                            <br />
                            <br />
                            Ons systeem is ontwikkeld met de focus op de gebruiker. We hebben specifieke
                            functionaliteiten ontworpen om mensen effectief te ondersteunen gedurende dit proces.
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <div className="block block-image-list">
                        <div className="block-image-list-left">
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                                <div className="block-with-image-title">Het systeem vinden en aanmelden</div>
                                <div className="block-with-image-description">
                                    Mensen krijgen toegang tot een website waar zij kunnen controleren of er hulp en
                                    regelingen beschikbaar zijn. Zo weten ze welke opties hen kunnen ondersteunen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Inloggen als aanvrager:</div>
                                        Aanvragers loggen eenvoudig in met de opties die door de gemeente zijn
                                        afgestemd: met DigiD, e-mailadres of de Me-app.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Notificaties:</div>
                                        Aanvragers kunnen eenvoudig op de hoogte blijven middels e-mail- en
                                        pushnotificaties en hebben de vrijheid om hun voorkeuren naar wens aan te
                                        passen.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-requester/requester-2.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                                <div className="block-with-image-title">Geschiktheid zelfstandig checken</div>
                                <div className="block-with-image-description">
                                    Aanvragers voeren zelf een snelle voorlopige check uit om regelingen te controleren
                                    en te filteren, zonder het volledige aanvraagformulier in te vullen. Zo ziet men
                                    snel waar men mogelijk recht op heeft.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Regelcheck:</div>
                                        Potentiële aanvragers vullen basisgegevens in om te controleren of zij in
                                        aanmerking komen voor een specifiek fonds. Nadat zij een paar vragen hebben
                                        beantwoord, ontvangen zij een op maat gemaakt advies.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-requester/requester-4.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                                <div className="block-with-image-title">Tegoeden ontvangen</div>
                                <div className="block-with-image-description">
                                    Het Forus-platform faciliteert de uitgifte van verschillende soorten regelingen. Dit
                                    kan bijvoorbeeld een regeling zijn waarbij deelnemers hun tegoed besteden bij
                                    gevalideerde aanbieders voor specifieke producten of diensten (zoals de
                                    Meedoenregeling of het Kindpakket), of waarbij deelnemers uitbetalingen rechtstreeks
                                    op hun rekening ontvangen (zoals de Individuele Inkomenstoeslag). Deelnemers kunnen
                                    hun budgetten effectief beheren en besteden dankzij diverse opties.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Betalen met tegoed:</div>
                                        Zodra het tegoed geactiveerd is, gebruikt de deelnemer het direct. De deelnemer
                                        laat eenvoudig de QR-code scannen met de Me-app (of een geprinte QR-code) en
                                        profiteert van de aankopen bij deelnemende aanbieders.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Reserveren:</div>
                                        Deelnemers hebben de mogelijkheid om vooraf plannen te maken en op afstand
                                        reserveringen te plaatsen voor specifieke diensten. Indien nodig is annulering
                                        mogelijk tot 14 dagen na de reservering.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">De fysieke pas:</div>
                                        Deelnemers hebben tevens de optie om een fysieke pas te gebruiken. Met de
                                        fysieke pas krijgen deelnemers die minder digitaal vaardig zijn een alternatieve
                                        manier om toegang te krijgen tot diverse diensten en voorzieningen. De fysieke
                                        pas kan eenvoudig worden aangevraagd en geactiveerd via de website.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Kosten terugvragen:</div>
                                        In bepaalde gevallen is het mogelijk voor de deelnemer om de kosten terug te
                                        vragen via een declaratiefunctionaliteit op de website.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Uitbetalingen:</div>
                                        Deelnemers ontvangen een geldbedrag dat rechtstreeks op hun rekening wordt
                                        uitbetaald (Individuele Inkomenstoeslag).
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Kwijtscheldingen:</div>
                                        Het Forus-systeem faciliteert ook de kwijtschelding van gemeentelijke
                                        belastingen, zoals afvalstoffenheffing. Dit betekent dat deelnemers het
                                        volledige bedrag niet hoeven te betalen. We zoeken naar gemeenten om dit samen
                                        te implementeren.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-requester/requester-6.jpg')} alt="" />
                            </div>
                        </div>
                        <div className="block-image-list-left">
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-requester/requester-1.jpg')} alt="" />
                            </div>

                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                                <div className="block-with-image-title">Regelingen begrijpen</div>
                                <div className="block-with-image-description">
                                    Aanvragers hebben de mogelijkheid om een overzicht te bekijken van diverse
                                    regelingen en aanbieders, waarbij ze inzicht krijgen in de verschillende vormen van
                                    hulp die zij kunnen ontvangen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Overzichtspagina van regelingen en voorwaarden:
                                        </div>
                                        Overzichtspagina van regelingen en voorwaarden: Op deze pagina zien aanvragers
                                        welke regelingen beschikbaar zijn en welke voorwaarden van toepassing zijn om
                                        hiervoor in aanmerking te komen.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Zoekfunctionaliteit:</div>
                                        Aanvragers kunnen gebruikmaken van de zoekfunctionaliteit om zelf informatie op
                                        te zoeken.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Aanbieders en aanbod:</div>
                                        Aanvragers krijgen op de website een overzicht van alle aanbieders en de
                                        producten die zij aanbieden. Ze kunnen hun favorieten opslaan in een
                                        verlanglijstje voor later gebruik.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Uitlegpagina:</div>
                                        Op de uitlegpagina vinden aanvragers aanvullende informatie over werkwijze van
                                        de website en de regeling(en).
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Veelgestelde vragen:</div>
                                        Voor elke regeling is er een FAQ beschikbaar waar aanvragers aanvullende
                                        informatie kunnen vinden.
                                    </div>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-requester/requester-3.jpg')} alt="" />
                            </div>

                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                                <div className="block-with-image-title">
                                    Regelingen aanvragen en meldingen ontvangen
                                </div>
                                <div className="block-with-image-description">
                                    Aanvragers vragen eenvoudig en efficiënt regelingen aan en ontvangen waardevolle
                                    feedback met betrekking tot hun aanvraag.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Regelingen aanvragen:</div>
                                        De aanvrager kan de regeling eenvoudig aanvragen in een paar stappen. Duidelijke
                                        instructies begeleiden de aanvrager stap voor stap door het proces.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Status van de aanvraag zien:
                                        </div>
                                        Aanvragers kunnen de status van hun aanvraag bekijken, of deze is toegekend,
                                        afgewezen, of wanneer er aanvullende informatie nodig is.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Aanvullende informatie indienen:
                                        </div>
                                        Aanvragers krijgen een verzoek om extra gegevens van de beoordelaar wanneer deze
                                        nodig zijn voor de beoordeling van de aanvraag. Op deze manier weten aanvragers
                                        precies welke informatie zij moeten verstrekken.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Beschikking ontvangen:</div>
                                        De aanvragers krijgen een officieel besluit over hun aanvraag bijvoorbeeld een
                                        besluit over toekenning of afwijzing van een regeling.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-requester/requester-5.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                                <div className="block-with-image-title">Persoonlijk account beheren</div>
                                <div className="block-with-image-description">
                                    De deelnemer bekijkt een overzicht van zaken zoals aangevraagde regelingen,
                                    verstrekte informatie, afwijzingen, toekenningen, communicatie en hun
                                    transactiegeschiedenis. Hierdoor beheren en volgen deelnemers eenvoudig hun
                                    interacties met het platform.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Persoonsgegevens zien:</div>
                                        Op het platform zien deelnemers de persoonlijke informatie terug die ze hebben
                                        ingevuld voor een aanvraag.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Transactieoverzicht:</div>
                                        Deelnemers kunnen hun transactiegeschiedenis bekijken.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'dark' }]}
                        backgroundColor={'#E0F4FF'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
