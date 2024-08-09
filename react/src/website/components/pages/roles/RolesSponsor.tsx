import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';

export default function RolesSponsor() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Sponsor');
    const [bannerDescription] = useState(
        [
            'Een organisatie die financiële middelen beschikbaar stelt voor deelnemers in het',
            'Forus-systeem, zoals gemeenten of sociale ketenpartners.',
            'Het Forus-platform is ontwikkeld om het volledige proces van regelingenuitgifte te',
            'faciliteren, van de opzet van de regelingen en aanvraagprocedure tot het monitoren en',
            'evalueren van de impact.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Sponsor role page.');
    }, [setTitle]);

    return (
        <Fragment>
            <div className="wrapper hide-sm">
                <RolesBanner type={'sponsor'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="show-sm">
                <RolesBanner type={'sponsor'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-sponsor.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'sponsor'} />

                    <div className="section section-overview">
                        <div className="section-title section-title-sm text-left">Functionaliteiten en overzicht</div>
                        <div className="section-separator">
                            <div className="line" />
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <div className="block block-image-list">
                        <div className="block-image-list-left">
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-1.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                                <div className="block-with-image-title">Een account voor de organisatie aanmaken</div>
                                <div className="block-with-image-description">
                                    De sponsor maakt een account aan voor hun organisatie binnen het platform en voegt
                                    medewerkers toe, inclusief hun rollen en rechten.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Account aanmaken en organisatie inschrijven als sponsor:
                                        </div>
                                        De sponsor schrijft hun organisatie eenvoudig in met behulp van een paar
                                        stappen. Ze hebben de mogelijkheid om hun logo en bedrijfsgegevens toe te
                                        voegen.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Toevoegen van medewerkers en toewijzen van rollen en rechten:
                                        </div>
                                        In de beheeromgeving kunnen sponsors meerdere medewerkers toevoegen, rollen en
                                        rechten toewijzen en het team beheren.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-3.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                                <div className="block-with-image-title">De aanvraagprocedure instellen</div>
                                <div className="block-with-image-description">
                                    Sponsors zetten het aanvraagproces op via het Forus-platform, zodat aanvragers
                                    gemakkelijk hun gegevens kunnen indienen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Verificatiemethode bepalen:
                                        </div>
                                        Sponsors hebben de keuze uit verschillende verificatiemethoden: DigiD, e-mail of
                                        een brief met een activatiecode.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Directe activering voor de bekende doelgroep:
                                        </div>
                                        In gevallen waarin de doelgroep bekend is, kan hun applicatie direct worden
                                        geactiveerd. Onbekende personen kunnen de aanvraagprocedure doorlopen door
                                        middel van een geïntegreerd e-formulier.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-5.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                                <div className="block-with-image-title">Het communicatiekanaal instellen</div>
                                <div className="block-with-image-description">
                                    Dankzij het flexibele CMS kunnen sponsors een website in de huisstijl van hun
                                    organisatie maken, waarop ze alle informatie over de regelingen en de
                                    aanvraagprocedure presenteren. Sponsors kunnen aanpassingen maken binnen generieke
                                    kaders, waardoor de website voldoet aan de WCAG-richtlijnen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Content Management System (CMS):
                                        </div>
                                        Sponsors hebben de mogelijkheid om de website volledig aan te passen en fondsen
                                        toe te voegen met behulp van het CMS. Ze kunnen de communicatie op de website
                                        volledig personaliseren en in hun eigen huisstijl vormgeven.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Website:</div>
                                        De voorkant van het systeem geeft deelnemers een overzicht van alle benodigde
                                        informatie en biedt de mogelijkheid om in te loggen op hun persoonlijke account.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-7.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 8</div>
                                <div className="block-with-image-title">Transacties verwerken</div>
                                <div className="block-with-image-description">
                                    Sponsors verwerken transacties in de beheeromgeving. Dankzij de bankintegratie
                                    worden automatische betalingen naar de sponsor gestuurd. Daarnaast krijgen ze een
                                    overzicht van alle transacties en beheren ze het budget.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Bank integratie:</div>
                                        Door het bankrekeningnummer te koppelen, worden de transacties automatisch naar
                                        de bank van de aanbieder gestuurd. Op dit moment zijn er twee banken waarmee
                                        sponsors kunnen koppelen: BNG en Bunq.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            (Bulk) transacties inzien als sponsor:
                                        </div>
                                        Elke ochtend om 09:00 uur wordt er een bulkbestand aangemaakt met alle
                                        transacties die in afwachting staan.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Budgetbeheer:</div>
                                        De sponsor kan het budget voor het fonds gemakkelijk beheren en de uitgaven
                                        bijhouden.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-9.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 10</div>
                                <div className="block-with-image-title">Toegang tot support en nieuws</div>
                                <div className="block-with-image-description">
                                    De sponsor monitort en evalueert de impact van de fondsen door gebruik te maken van
                                    de statistiekenpagina in de beheeromgeving. Ook gebruikt de sponsor de website
                                    analytics koppeling voor het monitoren en optimaliseren van de website.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Forus Support:</div>
                                        Forus biedt ondersteuning in het systeem. Sponsor kunt de chatfunctie openen
                                        door op het chatpictogram te klikken. Daarnaast hebben de sponsors ook een
                                        helpcentrum beschikbaar voor meer informatie en ondersteuning.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Nieuwsbrief:</div>
                                        Met onze nieuwsbrief blijft de sponsor op de hoogte van nieuwe ontwikkelingen en
                                        veranderingen in het systeem.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-image-list-left">
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                                <div className="block-with-image-title">Oriëntatie en onderzoek</div>
                                <div className="block-with-image-description">
                                    De sponsor oriënteert zich en laat een onderzoek uitvoeren naar best practices op
                                    het gebied van sociale regelingen. Op deze manier neemt de sponsor weloverwogen
                                    beslissingen over de toewijzing van fondsen en het ontwerp ervan.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Onderzoek & advies (dienst):
                                        </div>
                                        Het onderzoek en advies van Forus leiden tot innovatieve doorontwikkeling en
                                        nieuwe functionaliteiten die op de markt gebracht kunnen worden bijvoorbeeld
                                        integraties in het systeem.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-2.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                                <div className="block-with-image-title">Fonds opzetten</div>
                                <div className="block-with-image-description">
                                    Met behulp van het Forus-platform zet de sponsor eenvoudig een fonds op door
                                    voorwaarden vast te stellen waaraan aanvragers moeten voldoen om in aanmerking te
                                    komen. Daarnaast selecteert de sponsor beoordelaars om de aanvragen te beoordelen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Fonds opzetten:</div>
                                        Een sponsor kan in enkele eenvoudige stappen een nieuw fonds opzetten. Hier
                                        kiest de sponsor onder andere het type fonds en de aanvraagmethode, en stelt hij
                                        de voorwaarden voor deelname in. Voor meer informatie over de fondsen, ga naar
                                        de Fondsenpagina.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-4.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                                <div className="block-with-image-title">Selectie van aanbieders</div>
                                <div className="block-with-image-description">
                                    De sponsor kan ook aanbieders selecteren. Deze aanbieders kunnen producten of
                                    diensten leveren die met het budget van het fonds worden betaald. Dit zorgt ervoor
                                    dat er relevante keuzes beschikbaar zijn voor aanvragers. Zo kunnen de fondsen op
                                    passende wijze worden gebruikt.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Selectie van aanbieders:</div>
                                        De sponsor beoordeelt de geschiktheid van specifieke aanbieders, zowel op het
                                        niveau van een fonds als op het niveau van een product.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Sponsor goedkeuring vereist voor zichtbaarheid:
                                        </div>
                                        Het aanbod en de aanbieder worden alleen zichtbaar op de website wanneer de
                                        sponsor ze heeft goedgekeurd.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-6.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 7</div>
                                <div className="block-with-image-title">De website en fondsen lanceren</div>
                                <div className="block-with-image-description">
                                    De sponsor ontvangt ondersteuning van Forus bij het organiseren van een evenement
                                    ter gelegenheid van de lancering, waarin de officiële start van de website en
                                    financiering wordt aangekondigd.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Lancering (dienst) -</div>
                                        Forus ondersteunt de sponsor bij het organiseren van een lanceringsevenement
                                        waarin de officiële lancering van de website en fondsen wordt aangekondigd.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-8.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 9</div>
                                <div className="block-with-image-title">De impact monitoren en evalueren</div>
                                <div className="block-with-image-description">
                                    De sponsor monitort en evalueert de impact van de fondsen door gebruik te maken van
                                    de statistiekenpagina in de beheeromgeving. Ook gebruikt de sponsor de website
                                    analytics koppeling voor het monitoren en optimaliseren van de website.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Statistieken:</div>
                                        In de beheeromgeving beheren sponsors hun fondsen en bekijken ze financiële
                                        statistieken. Er zijn verschillende filteropties beschikbaar, bijvoorbeeld het
                                        filteren op fondsen of aanbieders. Voor meer informatie naar de
                                        Managementinformatiepagina.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Website analytics koppeling:
                                        </div>
                                        Een uitgebreide tool stelt een sponsor in staat om website-analyse te bekijken
                                        en optimalisatie toe te passen.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-sponsor/sponsor-10.jpg')} alt="" />
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
                        backgroundColor={'#EBE9FE'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
