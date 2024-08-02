import React, { Fragment, useMemo } from 'react';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import CmsBlocks from '../../elements/cms-blocks/CmsBlocks';
import useEnvData from '../../../hooks/useEnvData';
import useCmsPage from './hooks/useCmsPage';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';

export default function Accessibility() {
    const envData = useEnvData();
    const page = useCmsPage('accessibility');

    const vars = useMemo(
        () =>
            ({
                westerkwartier: {
                    implementation_name: 'Kindpakket',
                    organization_name: 'Westerkwartier',
                    website: 'https://westerkwartier.forus.io/',
                    contact_email: 'webmaster@westerkwartier.nl',
                    accessibility_link: 'www.westerkwartier.nl/toegankelijkheid',
                    telephone_numer: '14 0594',
                },
                noordoostpolder: {
                    implementation_name: 'Meedoenpakket',
                    organization_name: 'Noordoostpolder',
                    website: 'https://noordoostpolder.forus.io/',
                    contact_email: 'info@noordoostpolder.nl',
                    accessibility_link: 'https://www.noordoostpolder.nl/toegankelijkheid',
                    telephone_numer: '0527 63 39 11',
                },
                groningen: {
                    implementation_name: 'Stadjerspas',
                    organization_name: 'Groningen',
                    website: 'https://stadjerspas.gemeente.groningen.nl',
                    contact_email: 'stadjerspas@groningen.nl',
                    accessibility_link: 'https://gemeente.groningen.nl/toegankelijkheid',
                    telephone_numer: '14 050',
                },
                geertruidenberg: {
                    implementation_name: 'Kindregelingen',
                    organization_name: 'Geertruidenberg',
                    website: 'https://kindregeling.geertruidenberg.nl',
                    contact_email: 'communicatie@geertruidenberg.nl',
                    accessibility_link: 'https://www.geertruidenberg.nl/en/node/781',
                    telephone_numer: '14 0162',
                },
            })[envData.client_key],
        [envData.client_key],
    );

    return (
        <BlockShowcase
            wrapper={false}
            breadcrumbs={
                <div className={'wrapper'}>
                    <div className="block block-breadcrumbs">
                        <StateNavLink name="home" className="breadcrumb-item">
                            Home
                        </StateNavLink>
                        <div className="breadcrumb-item active" aria-current="location">
                            Toegankelijkheidsverklaring
                        </div>
                    </div>
                </div>
            }>
            {page && (
                <div className={'section'}>
                    <div
                        className={`flex flex-vertical ${
                            page.description_position == 'after' ? 'flex-vertical-reverse' : ''
                        }`}>
                        {page && <CmsBlocks page={page} />}

                        {(!page.description_html || page.description_position !== 'replace') && (
                            <Fragment>
                                <div className="section-title text-left">Toegankelijkheidsverklaring</div>
                                <div className="block block-accessibility">
                                    <div className="block-text">
                                        <p className="description">
                                            Gemeente {vars?.organization_name} streeft naar het toegankelijk maken van
                                            de eigen online informatie en dienstverlening, in overeenstemming met
                                            Tijdelijk besluit digitale toegankelijkheid overheid.
                                        </p>
                                        <p className="description">
                                            Deze toegankelijkheidsverklaring is van toepassing op de inhoud van de
                                            website {vars?.implementation_name} {vars?.organization_name} die valt
                                            binnen de werkingssfeer van Tijdelijk besluit digitale toegankelijkheid
                                            overheid.
                                        </p>
                                        <p className="description">
                                            De links waarop de inhoud van de website {vars?.implementation_name}{' '}
                                            {vars?.organization_name} te vinden is:
                                        </p>
                                        <ul>
                                            <li>het hoofddomein:</li>
                                            <ul>
                                                <li>
                                                    <a href={vars?.website} target="_blank" rel="noreferrer">
                                                        {vars?.website}
                                                    </a>
                                                </li>
                                            </ul>
                                        </ul>
                                        <p />
                                        <p className="description">
                                            Een actueel en volledig overzicht van de toegankelijkheidsverklaringen die
                                            vallen onder de verantwoordelijkheid van Gemeente {vars?.organization_name}{' '}
                                            is beschikbaar via de volgende link:{' '}
                                            <a href={vars?.accessibility_link} target="_blank" rel="noreferrer">
                                                {vars?.accessibility_link}
                                            </a>
                                        </p>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Nalevingsstatus</div>
                                        <div className="description">
                                            Gemeente {vars?.organization_name} verklaart dat deze website gedeeltelijk
                                            voldoet aan Tijdelijk besluit digitale toegankelijkheid overheid.
                                        </div>
                                        <div className="description">
                                            Uit toegankelijkheidsonderzoek is gebleken dat nog niet aan alle eisen wordt
                                            voldaan. Voor elke afzonderlijke afwijking van de eisen is de oorzaak bekend
                                            en is het gevolg beschreven, zijn maatregelen genomen om de afwijking te
                                            kunnen opheffen en is een concrete planning gemaakt waarop de maatregelen
                                            zullen zijn uitgevoerd.
                                        </div>
                                        <div className="description">
                                            Zie onder het kopje{' '}
                                            <a
                                                href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#toelichting-op-de-nalevingsstatus"
                                                target="_blank"
                                                rel="noreferrer">
                                                Toelichting op de nalevingsstatus
                                            </a>{' '}
                                            voor meer gedetailleerde informatie.
                                        </div>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Opstelling van deze verklaring</div>
                                        <div className="description">
                                            Deze verklaring is opgesteld op 07-02-2020 met instemming van de
                                            verantwoordelijke bestuurder van Gemeente {vars?.organization_name}
                                        </div>
                                        <div className="description">
                                            De actualiteit, volledigheid en juistheid van deze verklaring zijn voor het
                                            laatst herzien op 01-01-2020.
                                        </div>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Feedback en contactgegevens</div>
                                        <div className="description">
                                            Loopt u tegen een toegankelijkheidsprobleem aan? Of heeft u een vraag of
                                            opmerking over toegankelijkheid?
                                        </div>
                                        <div className="description">
                                            Neem dan contact op via{' '}
                                            <a href="mailto:{{ vars?.contact_email }}">{vars?.organization_name}</a>
                                            of {vars?.telephone_numer}
                                        </div>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Wat kunt u van ons verwachten?</div>
                                        <ul>
                                            <li>Binnen 5 werkdagen krijgt u een ontvangstbevestiging.</li>
                                            <li>We informeren u over de voortgang en de uitkomst.</li>
                                            <li>Binnen 3 weken is uw verzoek afgehandeld.</li>
                                        </ul>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Handhavingsprocedure</div>
                                        <div className="description">
                                            Bent u niet tevreden met de manier waarop uw klacht is behandeld? Of hebben
                                            we niet op tijd gereageerd?
                                        </div>
                                        <div className="description">
                                            Dan kunt u{' '}
                                            <a href="https://www.nationaleombudsman.nl/klacht-indienen/uw-klacht">
                                                [contact opnemen met de Nationale Ombudsman].
                                            </a>
                                        </div>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Toelichting op de naleving status</div>
                                        <div className="description">
                                            In deze paragraaf wordt de claim dat gedeeltelijk aan de in Tijdelijk
                                            besluit digitale toegankelijkheid overheid gestelde eisen is voldaan nader
                                            onderbouwd.
                                        </div>
                                        <div className="description">
                                            De website {vars?.implementation_name} {vars?.organization_name} is
                                            onderzocht op toegankelijkheid en uit de rapportage blijkt volgens Gemeente{' '}
                                            {vars?.organization_name} dat aan alle onderstaande kenmerken is voldaan:
                                        </div>
                                        <ol>
                                            <li>
                                                het onderzoek omvat alle inhoud die volgens Tijdelijk besluit digitale
                                                toegankelijkheid overheid toegankelijk moet worden gemaakt;
                                            </li>
                                            <li>
                                                het onderzoek is gebaseerd op meet- en onderzoeksgegevens die niet ouder
                                                zijn dan 12 maanden;
                                            </li>
                                            <li>
                                                de handmatige evaluatie is uitgevoerd overeenkomstig een adequaat
                                                gedocumenteerde evaluatiemethode;{' '}
                                                <a href="https://w3.org/TR/WCAG-EM/">WCAG-EM </a>of gelijkwaardig;
                                            </li>
                                            <li>
                                                voor de (semi-)automatische tests is een toetsinstrument ingezet dat is
                                                gebaseerd op de algoritmen die zijn gedocumenteerd door de{' '}
                                                <a href="https://act-rules.github.io/pages/about/">Auto-WCAG </a>
                                                Community Group;
                                            </li>
                                            <li>
                                                alle onderzoeksresultaten zijn nauwkeurig, eenduidig en op
                                                reproduceerbare wijze vastgelegd in een voor mensen leesbaar formaat OF
                                                in het machineleesbare formaat{' '}
                                                <a href="https://www.w3.org/WAI/standards-guidelines/earl/">EARL;</a>
                                            </li>
                                            <li>
                                                voor elke afzonderlijke afwijking op de eisen die tijdens het onderzoek
                                                werd gevonden en die niet kon worden hersteld wordt aangegeven:
                                            </li>
                                            <div className="description">[referentienummer]</div>
                                            <ul>
                                                <li>Beschrijving:[beknopte beschrijving van de afwijking]</li>
                                                <li>
                                                    Oorzaak: [reden waarom (nog) niet aan de eis kon worden voldaan]
                                                </li>
                                                <li>
                                                    Gevolg: [impact van de afwijking voor personen met een
                                                    functiebeperking]
                                                </li>
                                                <li>
                                                    Alternatief: [of een toegankelijk alternatief beschikbaar is. En zo
                                                    ja, welk]
                                                </li>
                                                <li>
                                                    Maatregel: [te nemen maatregel(en) om de afwijking op te heffen]
                                                </li>
                                                <ul>
                                                    <li>
                                                        mogelijkheid om aan te geven of de uitvoering van de maatregel
                                                        een{' '}
                                                        <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#onevenredige-last">
                                                            onevenredige last{' '}
                                                        </a>
                                                        met zich meebrengt: [ja/nee] [toelichting als het antwoord op de
                                                        vraag {"'ja'"} is]
                                                    </li>
                                                </ul>
                                                <li>
                                                    planning: [uiterste datum waarop de afwijking zal zijn hersteld]
                                                </li>
                                            </ul>
                                            <li>
                                                (zie onder het kopje{' '}
                                                <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#afwijkingen-voldoet-gedeeltelijk">
                                                    Afwijkingen)
                                                </a>
                                            </li>
                                            <li>
                                                alle evaluatie- en onderzoeksresultaten waarop de claim is gebaseerd
                                                zijn online beschikbaar(zie onder het kopje{' '}
                                                <a href="https://www.toegankelijkheidsverklaring.nl/verklaringen/367/preview#evaluatie-en-onderzoekresultaten-voldoet-gedeeltelijk">
                                                    Evaluatie- en onderzoekresultaten
                                                </a>
                                            </li>
                                        </ol>
                                    </div>
                                    <div className="block-text">
                                        <p className="description">Afwijkingen</p>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">Technische afwijkingen</div>
                                        <ol>
                                            <li>
                                                SC 1.1.1 - Niet-tekstuele content [niveau A]
                                                <ul>
                                                    <li>
                                                        Beschrijving: Een img-element mist een alt-attribuut.
                                                        (alternatieve tekst voor de afbeelding)
                                                    </li>
                                                    <li>
                                                        Oorzaak: Geen alternatieve tekst toegevoegd bij de referentie
                                                        van de afbeelding.
                                                    </li>
                                                    <li>
                                                        Gevolg: Het missen van een alternatieve tekst kan invloed hebben
                                                        op de functionaliteit van spraak naar tekst hulpmiddelen.
                                                    </li>
                                                    <li>
                                                        Alternatief: Er is geen alternatieve oplossing voor dit
                                                        probleem.
                                                    </li>
                                                    <li>
                                                        Maatregel: De webmasters zullen een alternatieve tekst plaatsen
                                                        bij de afbeelding.
                                                    </li>
                                                    <li>
                                                        brengt de uitvoering van de maatregel een onevenredige last met
                                                        zich mee? Nee
                                                    </li>
                                                    <li>planning: 01-06-2020</li>
                                                    <li>SC 4.1.2 - Naam, rol, waarde [niveau A]</li>
                                                    <li>
                                                        Beschrijving: Anker Element gevonden met een geldig
                                                        href-attribuut, maar er is geen link inhoud is opgegeven.
                                                    </li>
                                                    <li>Oorzaak: Geen consequent gebruik van anker elementen</li>
                                                    <li>Gevolg: Er is geen direct nadelig gevolg voor de gebruiker.</li>
                                                    <li>
                                                        Alternatief: Er is geen alternatieve oplossing voor dit
                                                        probleem.
                                                    </li>
                                                    <li>
                                                        Maatregel: De webmaster zullen het anker element opnieuw
                                                        beoordelen en deze verwijderen of de benodigde informatie
                                                        opgeven
                                                    </li>
                                                    <li>
                                                        brengt de uitvoering van de maatregel een onevenredige last met
                                                        zich mee? Nee
                                                    </li>
                                                    <li>planning: 01-06-2020</li>
                                                </ul>
                                            </li>
                                            <li>
                                                SC 4.1.2 - Naam, rol, waarde [niveau A]
                                                <ul>
                                                    <li>
                                                        Beschrijving: Anker Element gevonden met een geldig
                                                        href-attribuut, maar er is geen link inhoud is opgegeven.
                                                    </li>
                                                    <li>Oorzaak: Geen consequent gebruik van anker elementen</li>
                                                    <li>Gevolg: Er is geen direct nadelig gevolg voor de gebruiker.</li>
                                                    <li>
                                                        Alternatief: Er is geen alternatieve oplossing voor dit
                                                        probleem.
                                                    </li>
                                                    <li>
                                                        Maatregel: De webmaster zullen het anker element opnieuw
                                                        beoordelen en deze verwijderen of de benodigde informatie
                                                        opgevenbrengt de uitvoering van de maatregel een onevenredige
                                                        last met zich mee? Nee
                                                    </li>
                                                    <li>planning: 01-06-2020</li>
                                                </ul>
                                            </li>
                                        </ol>
                                    </div>
                                    <div className="block-text">
                                        <div className="title">
                                            Inhoud die buiten de werkingssfeer valt van Tijdelijk besluit digitale
                                            toegankelijkheid overheid
                                        </div>
                                        <div className="description">
                                            <a href="https://zoek.officielebekendmakingen.nl/stb-2018-141.html#d17e165">
                                                Zie Artikel 2, tweede lid van het Tijdelijk besluit digitale
                                                toegankelijkheid overheid.
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}
