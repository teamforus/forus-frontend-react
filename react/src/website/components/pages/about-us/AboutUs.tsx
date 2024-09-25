import React, { Fragment, useEffect } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import Slider from '../../elements/Slider';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function AboutUs() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const assetUrl = useAssetUrl();

    const elements = [
        {
            title: 'Het Kindpakket',
            description: [
                'In 2017 is de eerste regeling, het Kindpakket, geïmplementeerd in de gemeente Zuidhorn via het Forus-platform. ',
                'Sindsdien is de gemeente Zuidhorn opgegaan in de gemeente Westerkwartier.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/zuidhorn.png'),
            imgAlt: 'Logo van Gemeente Zuidhorn',
            timeInterval: '2017',
            timeIntervalLabel: 'Eerste regeling',
        },
        {
            title: 'Meedoenregeling',
            description: [
                'In 2018 heeft Forus de aanbesteding gewonnen voor de Meedoenregeling van de gemeente Nijmegen. ',
                'Dit initiatief,  gericht op volwassenen, heeft de veelzijdige toepasbaarheid van het systeem voor andere soorten regelingen aangetoond.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/nijmegen.png'),
            imgAlt: 'Logo van Gemeente Nijmegen',
            timeInterval: '2018',
            timeIntervalLabel: 'Tweede regeling',
        },
        {
            title: 'Innovatie stimuleren',
            description: [
                'De provincie Groningen heeft Forus een SBIR-budget toegekend om innovatie te stimuleren. ',
                'Als gevolg van deze subsidie heeft Forus actief gewerkt aan de doorontwikkeling van het systeem om schaalbaarheid mogelijk te maken. ',
                'Hierdoor is het systeem volledig functioneel en klaar om als platform te worden gebruikt.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/groningen.png'),
            imgAlt: 'Logo van Provincie Groningen',
            timeInterval: '2018/2019',
            timeIntervalLabel: 'Ontwikkeling platform',
        },
        {
            title: 'Sociale Dienst Oost Achterhoek',
            description: [
                'De Sociale Dienst Oost Achterhoek, nu bekend als Fijnder, is het werkleerbedrijf voor de gemeenten Berkelland, Oost Gelre en Winterswijk. ',
                'Deze organisatie is de eerste die meerdere regelingen parallel uitgeeft met behulp van het Forus platform. ',
                'De toepassing van het Forus platform voor de organisatie met 3 webshops toont aan dat onze oplossing breed toepasbaar is.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/fijnder.png'),
            imgAlt: 'Logo van Fijnder',
            timeInterval: '2019',
            timeIntervalLabel: 'Meerdere regelingen',
        },
        {
            title: 'Heumenstegoed',
            description: [
                'De gemeente Heumen werkt samen met buurtgemeente Nijmegen. Dit is de eerste keer dat de gemeenten samenwerken op het gebied van aanbieders. ',
                'Mensen kunnen hun tegoeden ook uitgeven in de andere gemeente. ',
                'Deze samenwerking vormt de basis voor het delen van aanbieders, waarbij elke aanbieder zijn eigen account heeft.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/heumen.png'),
            imgAlt: 'Logo van Gemeente Heumen',
            timeInterval: '2021',
            timeIntervalLabel: 'Gedeelde aanbieders',
        },
        {
            title: 'PasWijzer',
            description: [
                'In opdracht van de gemeente Waalwijk is Forus bezig met de ontwikkeling van een Aanvraagfunctionaliteit. ',
                'Deze functionaliteit omvat geïntegreerde intake- en aanvraagprocedures voor diverse (gemeentelijke) regelingen. ',
                'De functionaliteit is conform de VNG-standaarden ontwikkeld en in samenwerking met PinkRoccade, een andere leverancier. ',
                'Bovendien wordt er een integratie gerealiseerd om gegevens op te halen uit de back-office systemen van de gemeente.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/waalwijk.png'),
            imgAlt: 'Logo van Gemeente Waalwijk',
            timeInterval: '2021',
            timeIntervalLabel: 'Aanvragen en Haal Centraal',
        },
        {
            title: 'Werkplein Hart van West-Brabant',
            description: [
                'Forus ontwikkelt een Declaratie module voor Werkplein Hart van West-Brabant. ',
                'Deze module maakt het mogelijk om naast het uitgeven van budgetten ook bonnen en facturen in te dienen voor vergoeding van kosten via het Forus-platform.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/werkplein.png'),
            imgAlt: 'Logo van Werkplein',
            timeInterval: '2022',
            timeIntervalLabel: 'Declaratie functionaliteit',
        },
        {
            title: 'Individuele Inkomenstoeslag',
            description: [
                'De VNG (Vereniging van Nederlandse Gemeenten) streeft naar verbetering van inkomensdienstverlening voor de inwoners. ',
                'De gemeente Nijmegen wil een efficiënter proces voor de uitgifte van de Individuele Inkomenstoeslag (IIT) en heeft Forus benaderd om hieraan mee te werken. ',
                'Dankzij het innovatiebudget maakt Forus de uitgifte van de IIT mogelijk via het Forus-platform.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/nijmegen2.png'),
            imgAlt: 'Logo van Gemeente Nijmegen',
            timeInterval: '2023',
            timeIntervalLabel: 'IIT',
        },
        {
            title: 'Project Innovatiebudget 2023',
            description: [
                'Samen met de Gemeenten Eemsdelta en Westerkwartier werken we aan betere toegang tot financiële ondersteuning voor mensen in armoede. ',
                'In de eerste fase hebben we de Regelingen check ontwikkeld, waarmee aanvragers snel en eenvoudig kunnen zien voor welke regelingen ze in aanmerking komen, zonder een volledige aanvraagprocedure te doorlopen. ',
                'In fase twee richten we ons op het faciliteren van de uitgifte van regelingen waarbij mensen recht hebben op een geldbedrag, zoals IIT.',
            ].join('\n'),
            imgSrc: assetUrl('/assets/img/slider-logos/eemsdelta.png'),
            imgAlt: "Logo's van Gemeente Eemsdelta en Westerkwartier",
            hasLink: true,
            linkState: 'about-us-innovation',
            linkText: 'Lees meer over ons project',
            timeInterval: '2023',
            timeIntervalLabel: 'Regelingen check & Smart Payout',
        },
    ];

    useEffect(() => {
        setTitle('Ons verhaal | Verbinden en bijdragen aan sociale initiatieven');
        setMetaDescription(
            [
                'Forus is het platform voor sociale initiatieven. ',
                'Samen met overheidsorganisaties en goede doelen vergroten we sociale impact - for us all, by us all.',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <div className="wrapper">
                <BackgroundCircles />
                <div className="block block-info">
                    <h2 className="block-info-title">Ons verhaal</h2>

                    <div className="block-info-description">
                        De reis naar het vinden van best-practices om te verbinden en sociale impact te vergroten
                    </div>

                    <div className="block-info-subtitle">Do Good Better</div>

                    <div className="block-info-description-sm">
                        Forus ziet dat er tal van initiatieven zijn waarbij men zich inzet om goed te doen. Er is veel
                        maatschappelijke bereidheid om sociale problemen aan te pakken. In de loop van de tijd is een
                        landschap van ondersteuning ontstaan dat nog ver van ideaal is. Er is sprake van fragmentatie in
                        de hulp die wordt geboden. Elk initiatief heeft veelal een eigen loket, voorwaarden en
                        aanvraagprocedure. Mensen die op zoek zijn naar ondersteuning missen overzicht en komen vaak
                        terecht in onduidelijke en tijdrovende procedures. <br />
                        <br />
                        Door de inzet van innovatieve oplossingen ontstaat de mogelijkheid om nieuwe structuren aan te
                        brengen en processen te verbeteren. Ons streven is om de toegang tot hulp toegankelijker te
                        maken en zelfredzaamheid te bevorderen.
                        <br />
                        Forus brengt initiatieven samen middels haar digitale platform voor waarde-uitwisseling. De
                        focus ligt hierbij op schaalbaarheid en efficiëntie. Het platform faciliteert samenwerking
                        tussen organisaties en eindgebruikers waardoor de sociale impact wordt vergroot.
                        <br />
                        <br />
                    </div>
                </div>
            </div>

            <BlockDashedSeparator image={false} />

            <div className="wrapper">
                <div className="block block-social-initiatives">
                    <div className="hide-sm label label-gray">Vier-rollenmodel</div>

                    <div className="block-social-initiatives-wrapper">
                        <div className="block-social-initiatives-main">
                            <div className="show-sm label label-gray">Vier-rollenmodel</div>

                            <h3 className="block-social-initiatives-title">
                                Verbinden en bijdragen aan sociale initiatieven
                            </h3>

                            <div className="block-social-initiatives-description">
                                Forus biedt een transparant en gebruiksvriendelijk digitaal platform en vergemakkelijkt
                                samenwerking tussen inwoners, gemeenten, goede doelen, ondernemers en andere partijen.
                                Door alle partijen samen te brengen op één platform kunnen samenwerkingsafspraken
                                eenvoudig worden vastgelegd en processen optimaal verlopen. Dit werkt volgens een
                                vier-rollenmodel: gemeenten en goede doelen verstrekken middelen en vervullen de rol van
                                sponsor, aanvragers vragen middelen aan, beoordelaars controleren gegevens, en
                                aanbieders leveren producten en diensten.
                            </div>

                            <div className="block-social-initiatives-actions">
                                <StateNavLink name={'roles-main'} className="button button-light">
                                    Lees meer over de vier rollen
                                    <em className="mdi mdi-arrow-right icon-end" />
                                </StateNavLink>
                            </div>

                            <div className="block-social-initiatives-extra">
                                Forus werkt samen vanuit het gedachtegoed van “One Solution, Two Entities”, waar Forus
                                Operations B.V. als ‘werkmaatschappij’ functioneert en Stichting Forus zich richt op het
                                waarborgen van de publiek inzichtelijke code.
                                <a
                                    href={'https://github.com/teamforus'}
                                    className={'button'}
                                    target={'_blank'}
                                    rel="noreferrer">
                                    <em className={'mdi mdi-github'} />
                                    Bekijk onze GitHub pagina
                                    <em className="mdi mdi-arrow-right icon-end" />
                                </a>
                            </div>
                        </div>

                        <div className="block-social-initiatives-img">
                            <img
                                src={assetUrl('/assets/img/social-initiatives.svg')}
                                alt="De verbindingen van sociale initiatieven via het Forus-platform"
                            />
                        </div>
                    </div>
                </div>

                <Slider
                    label={'Tijdlijn'}
                    title={'Hoe het platform op basis van samenwerking tot stand is gekomen'}
                    showActionButton={false}
                    elements={elements}
                    hasSquareArrows={true}
                />

                <div className="block block-our-values">
                    <div className="block-our-values-header">
                        Onze waarden
                        <StateNavLink name={'book-demo'} className="button button-light block-our-values-header-button">
                            Gratis demo
                        </StateNavLink>
                    </div>

                    <div className="block-our-values-items">
                        <div className="block block-our-values-item">
                            <div className="block-our-values-item-image">
                                <img src={assetUrl('/assets/img/icons-about-us/transparency.svg')} alt="Transparency" />
                            </div>
                            <div className="block-our-values-item-main">
                                <div className="block-our-values-item-title">Transparantie</div>
                                <div className="block-our-values-item-description">
                                    De ontwikkel filosofie van Forus is gebaseerd op het centraal stellen van de
                                    eindgebruikers en het waarborgen van de transparantie van het systeem.{' '}
                                    <a
                                        className="block-our-values-item-description-link"
                                        href="https://github.com/teamforus/"
                                        target="_blank"
                                        rel="noreferrer">
                                        De code van het systeem
                                    </a>{' '}
                                    is daarom voor iedereen publiek inzichtelijk (open source). Daarnaast vinden we
                                    transparante communicatie met onze gebruikers ook erg belangrijk, waarbij we
                                    processen, keuzes en mogelijke problemen openlijk bespreken.
                                </div>
                            </div>
                        </div>

                        <div className="block block-our-values-item">
                            <div className="block-our-values-item-image">
                                <img src={assetUrl('/assets/img/icons-about-us/trust.svg')} alt="Trust" />
                            </div>
                            <div className="block-our-values-item-main">
                                <div className="block-our-values-item-title">Vertrouwen</div>
                                <div className="block-our-values-item-description">
                                    Vertrouwen vormt de basis van onze relatie met onze gebruikers. We zijn toegewijd om
                                    hun vertrouwen te verdienen en te behouden door heldere communicatie, waarbij we
                                    proactief communiceren over onze processen, beslissingen en eventuele uitdagingen.
                                    We streven naar een eerlijke balans tussen de belangen van alle gebruikers en laten
                                    ons platform onafhankelijk controleren door derden om de integriteit en veiligheid
                                    te waarborgen.
                                </div>
                            </div>
                        </div>

                        <div className="block block-our-values-item">
                            <div className="block-our-values-item-image">
                                <img src={assetUrl('/assets/img/icons-about-us/efficiency.svg')} alt="Efficiency" />
                            </div>
                            <div className="block-our-values-item-main">
                                <div className="block-our-values-item-title">Efficiëntie</div>
                                <div className="block-our-values-item-description">
                                    We hechten waarde aan efficiëntie en streven ernaar om ons platform
                                    gebruiksvriendelijk te maken, waardoor we tijd en middelen besparen voor individuen
                                    en organisaties die gebruik maken van onze diensten. Bovendien geven we prioriteit
                                    aan meetbare inspanningen voor eenvoudige evaluatie en het bijhouden van resultaten.
                                    Dit wordt versterkt door samenwerking met andere gebruikers. Als voorbeeld, wanneer
                                    een aanpak succesvol blijkt, kunnen we deze als best-pratice toepassen bij andere
                                    organisaties.
                                </div>
                            </div>
                        </div>

                        <div className="block block-our-values-item">
                            <div className="block-our-values-item-image">
                                <img
                                    src={assetUrl('/assets/img/icons-about-us/user-oriented.svg')}
                                    alt="User oriented"
                                />
                            </div>
                            <div className="block-our-values-item-main">
                                <div className="block-our-values-item-title">Gebruikersgericht</div>
                                <div className="block-our-values-item-description">
                                    Onze focus ligt altijd op onze gebruikers en we zijn toegewijd aan het voortdurend
                                    verbeteren van hun ervaring op ons platform. We zetten stappen richting proactieve
                                    dienstverlening waarbij de deelnemer centraal staat. We streven ernaar de
                                    complexiteit voor deelnemers te verminderen en het niet-gebruik van regelingen terug
                                    te dringen. Dit realiseren we door slimme technologieën te gebruiken die deelnemers
                                    proactief informeren en begeleiden naar relevante diensten en ondersteuning.
                                </div>
                            </div>
                        </div>

                        <div className="block block-our-values-item">
                            <div className="block-our-values-item-image">
                                <img src={assetUrl('/assets/img/icons-about-us/cooperation.svg')} alt="Cooperation" />
                            </div>
                            <div className="block-our-values-item-main">
                                <div className="block-our-values-item-title">Samenwerking</div>
                                <div className="block-our-values-item-description">
                                    Binnen onze organisatie en in samenwerking met externe partners hechten we veel
                                    waarde aan teamwork en gezamenlijke inspanningen om doelstellingen te realiseren.
                                    Door samen te werken streven we ernaar om verbindingen te leggen tussen gebruikers,
                                    wat bijdraagt aan het bereiken van onze gemeenschappelijke doelen.
                                </div>
                            </div>
                        </div>

                        <div className="block block-our-values-item">
                            <div className="block-our-values-item-image">
                                <img src={assetUrl('/assets/img/icons-about-us/innovation.svg')} alt="Innovation" />
                            </div>
                            <div className="block-our-values-item-main">
                                <div className="block-our-values-item-title">Innovatie</div>
                                <div className="block-our-values-item-description">
                                    We verkennen voortdurend nieuwe ideeën en technologieën om ons platform te
                                    verbeteren en de best mogelijke ervaring voor onze gebruikers te bieden. Als
                                    onderdeel van een project gefinancierd door het BZK, het Innovatiebudget, in
                                    samenwerking met gemeenten, onderzoeken en ontwikkelen we verschillende nieuwe
                                    functionaliteiten om ons platform te verbeteren. Zo willen we ervoor zorgen dat alle
                                    beschikbare voorzieningen overzichtelijk, gebruiksvriendelijk en toegankelijk zijn.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="block block-statistics">
                    <div className="block-statistics-main-info">
                        <div className="block-statistics-main-info-title">Cijfers waar we trots op zijn</div>
                        <div className="block-statistics-main-info-image">
                            <img src={assetUrl('/assets/img/statistics.png')} alt="Statistics" />
                        </div>
                    </div>

                    <div className="block-statistics-figures-list">
                        <div className="block-statistics-figures-list-item block-statistics-figures-list-item-blue">
                            <div className="block-statistics-figures-list-item-main">
                                <div className="block-statistics-figures-list-item-title">56</div>
                                <div className="block-statistics-figures-list-item-subtitle">
                                    Soorten regelingen ondersteund
                                </div>
                            </div>
                            <div className="block-statistics-figures-list-item-details">
                                Het Forus-platform is flexibel ontworpen, waardoor het mogelijk is om een breed scala
                                aan regelingen te beheren en uit te voeren, alles via één systeem. Denk hierbij aan de
                                Meedoenregeling, het Kindpakket, de Openbaar vervoer regeling of de Individuele
                                Inkomstentoeslag.
                            </div>
                        </div>

                        <div className="block-statistics-figures-list-item block-statistics-figures-list-item-purple">
                            <div className="block-statistics-figures-list-item-details">
                                Via het Forus-platform kunnen lokale ondernemingen en landelijke winkelketens hun
                                producten of diensten aanbieden, wat deelnemers een veelzijdig en gevarieerd aanbod
                                biedt.
                            </div>
                            <div className="block-statistics-figures-list-item-main">
                                <div className="block-statistics-figures-list-item-title">1892</div>
                                <div className="block-statistics-figures-list-item-subtitle">
                                    Aangesloten aanbieders
                                </div>
                            </div>
                        </div>

                        <div className="block-statistics-figures-list-item block-statistics-figures-list-item-blue-light">
                            <div className="block-statistics-figures-list-item-main">
                                <div className="block-statistics-figures-list-item-title">8,4/10</div>
                                <div className="block-statistics-figures-list-item-subtitle">
                                    Deelnemers tevredenheidsscore
                                </div>
                            </div>
                            <div className="block-statistics-figures-list-item-details">
                                Gebruikerstevredenheid is onze kernprioriteit, omdat het onze leidraad is voor het
                                doorlopend verbeteren van onze diensten en de gebruikerservaring van ons platform. Dit
                                doen we middels jaarlijkse enquêtes bij de organisaties en deelnemers die gebruik maken
                                van ons systeem.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="block block-map">
                    <img src={assetUrl('/assets/img/map.svg')} alt="" />
                    <div className="block-map-info">
                        <div className="block-map-info-title">Het Forus-systeem in actie</div>
                        <div className="block-map-info-subtitle">Bekijk live toepassingen van het Forus platform</div>
                    </div>
                </div>
            </div>

            <BlockDashedSeparator image={false} demoButton={true} />
            <br />
            <br />
            <br />
        </Fragment>
    );
}
