import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';

export default function RolesProvider() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Aanbieder');
    const [bannerDescription] = useState(
        [
            'Een organisatie die producten of diensten aanbiedt in het Forus-systeem kan zowel een lokale',
            'onderneming als een landelijke winkelketen zijn.',
            'Het Forus-systeem is ontworpen om aanbieders in staat te stellen zelfstandig te werken. Door',
            'toegang te bieden tot een beheeromgeving voor hun organisatie kunnen ze bijv. zelf aanbod',
            'opstellen, transacties uitvoeren en monitoren.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Provider role page.');
    }, [setTitle]);

    return (
        <Fragment>
            <div className="wrapper hide-sm">
                <RolesBanner type={'provider'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="main-content">
                <div className="show-sm">
                    <RolesBanner type={'provider'} title={bannerTitle} description={bannerDescription} />
                </div>

                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-provider.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'provider'} />

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
                                <img src={assetUrl('/assets/img/role-provider/provider-1.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                                <div className="block-with-image-title">Beschikbare regelingen bekijken</div>
                                <div className="block-with-image-description">
                                    Aanbieders bekijken op het platform de beschikbare regelingen om inzicht te krijgen
                                    in de subsidieopties en te bepalen of er regelingen zijn die aansluiten bij hun
                                    producten of diensten.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Overzichtspagina van regelingen en voorwaarden voor aanbieders:
                                        </div>
                                        De overzichtspagina biedt aanbieders gedetailleerde informatie over regelingen
                                        en criteria. Op de website kunnen aanbieders inzicht krijgen in de
                                        mogelijkheden, regels en uitleg met betrekking tot regelingen. Aanbieders hebben
                                        de mogelijkheid om zich aan te melden voor regelingen die aansluiten bij hun
                                        producten of diensten, zoals een fietsenwinkel die zich aanmeldt voor een
                                        fietsregeling.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-provider/provider-3.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                                <div className="block-with-image-title">
                                    Producten en diensten presenteren op de website
                                </div>
                                <div className="block-with-image-description">
                                    Aanbieders presenteren hun producten of diensten via het platform. Ze verstrekken
                                    gedetailleerde informatie, prijzen en specifieke voorwaarden, zodat deelnemers goed
                                    geïnformeerde keuzes kunnen maken bij het gebruik van hun toegewezen budgetten.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Plaatsen van aanbod:</div>
                                        Aanbieders kunnen gebruikmaken van de mogelijkheid om hun aanbod op een
                                        zichtbare manier te presenteren. Op het platform hebben zij de gelegenheid om
                                        hun producten of diensten te presenteren met een aantrekkelijke titel, heldere
                                        omschrijving en aansprekende afbeelding.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Beoordeling van het aanbod:
                                        </div>
                                        Het aanbod dient te worden goedgekeurd door de sponsor, wat plaatsvindt via het
                                        Forus-systeem. Na goedkeuring wordt het aanbod zichtbaar op de website.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-provider/provider-5.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                                <div className="block-with-image-title">Transacties controleren</div>
                                <div className="block-with-image-description">
                                    Aanbieders monitoren transacties, volgen financiële informatie en voeren
                                    boekhoudkundige taken uit met betrekking tot betalingen die via het platform zijn
                                    ontvangen. Het transactieoverzicht in de beheeromgeving van het Forus-platform toont
                                    aanbieders bijvoorbeeld welke vestiging verantwoordelijk is voor specifieke
                                    betalingen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Transactieoverzicht:</div>
                                        Het transactieoverzicht in de beheeromgeving stelt aanbieders in staat om alle
                                        transacties te bekijken, inclusief alle relevante informatie. Daarnaast bestaat
                                        er ook de mogelijkheid om de gegevens te exporteren.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-provider/provider-7.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 7</div>
                                <div className="block-with-image-title">Communicatie met sponsors en aanvragers</div>
                                <div className="block-with-image-description">
                                    Het platform biedt aanbieders de mogelijkheid om te communiceren met sponsors,
                                    waardoor ze vragen kunnen beantwoorden en product- en service-informatie kunnen
                                    verduidelijken.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Notificaties, meldingen en communicatie:
                                        </div>
                                        Aanbieders hebben toegang tot een overzicht van de communicatie en meldingen die
                                        zij hebben ontvangen. Dit omvat bijvoorbeeld berichten van de sponsor om
                                        aanpassingsverzoeken in hun aanbod te doen. Wanneer er een bericht ontvangen
                                        wordt, licht het meldingspictogram rood op.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-image-list-right">
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                                <div className="block-with-image-title">Een account voor de organisatie aanmaken</div>
                                <div className="block-with-image-description">
                                    Aanbieders maken een account aan voor hun organisatie en voegen medewerkers toe,
                                    samen met hun rollen en rechten.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Account aanmaken en organisatie aanmelden als aanbieder:
                                        </div>
                                        Aanbieders kunnen hun organisatie eenvoudig aanmelden met behulp van een paar
                                        stappen. Ze hebben de mogelijkheid om hun logo toe te voegen, het KvK-nummer en
                                        de bedrijfsgegevens in te vullen, het adres te verifiëren en meerdere
                                        vestigingen toe te voegen. Dit is vooral handig voor grote, landelijke
                                        winkelketens met meerdere vestigingen, omdat aanbieders gemakkelijk kunnen zien
                                        welke vestiging verantwoordelijk is voor specifieke betalingen. Hierdoor kunnen
                                        ze efficiënter opereren en hun financiële processen beter automatiseren.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Toevoegen van medewerkers en toewijzen van rollen en rechten:
                                        </div>
                                        Binnen de beheeromgeving voegen aanbieders meerdere medewerkers toe, wijzen zij
                                        rollen en rechten toe en beheren zij het team.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-provider/provider-2.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                                <div className="block-with-image-title">Aanmelden voor fondsen</div>
                                <div className="block-with-image-description">
                                    Aanbieders melden zich via het platform aan als aangewezen aanbieder voor specifieke
                                    fondsen. Zo kunnen zij hun producten of diensten aanbieden aan in aanmerking komende
                                    aanvragers en betaling ontvangen via het platform.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Aanmelden voor fondsen:</div>
                                        De aanbieders registreren zich voor een fonds via het platform en laten hun
                                        aanmelding controleren en goedkeuren door de sponsor.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-provider/provider-4.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                                <div className="block-with-image-title">
                                    Betaling ontvangen voor geleverde producten of diensten
                                </div>
                                <div className="block-with-image-description">
                                    Aanbieders ontvangen betalingen van de sponsor voor de producten of diensten die ze
                                    aan deelnemers leveren. Het betalingsproces wordt gefaciliteerd via het platform.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Downloaden en installeren van de Me-app:
                                        </div>
                                        Aanbieders downloaden de Me-app om QR-codes van de deelnemers te scannen.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Beheer van reserveringen:
                                        </div>
                                        Aanbieders kunnen deelnemers de mogelijkheid bieden om een reservering te maken.
                                        De aanbieders kunnen deze reserveringen vervolgens accepteren of weigeren in de
                                        beheeromgeving.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Beheren van transacties:</div>
                                        Aanbieders houden hun betalingen bij en controleren de status van transacties in
                                        de beheeromgeving.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-provider/provider-6.jpg')} alt="" />
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
                        backgroundColor={'#F9F3DD'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
