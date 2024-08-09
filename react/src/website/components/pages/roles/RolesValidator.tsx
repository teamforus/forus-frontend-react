import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import LearnMore from '../../elements/LearnMore';
import RolesSelector from './elements/RolesSelector';
import RolesBanner from './elements/RolesBanner';

export default function RolesValidator() {
    const setTitle = useSetTitle();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Beoordelaar');
    const [bannerDescription] = useState(
        [
            'Een organisatie die de gegevens van de aanvrager doorneemt om te beslissen of een aanvraag',
            'toegekend of afgewezen wordt. Dit is een belangrijke taak waarbij gekeken wordt naar alle',
            'details om te bepalen of iemand recht heeft op wat hij of zij aanvraagt. Deze rol kan door',
            'de gemeente zelf vervuld worden, maar soms komt het ook voor dat andere partijen zoals',
            'sociale ketenpartners of andere overheidsorganisaties deze taak op zich nemen.',
        ].join(''),
    );

    useEffect(() => {
        setTitle('Validator role page.');
    }, [setTitle]);

    return (
        <Fragment>
            <div className="wrapper hide-sm">
                <RolesBanner type={'validator'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="show-sm">
                <RolesBanner type={'validator'} title={bannerTitle} description={bannerDescription} />
            </div>

            <div className="main-content">
                <div
                    className="background-overlay hide-sm"
                    style={{ backgroundImage: 'url("./assets/img/background-validator.svg")' }}
                />

                <div className="wrapper">
                    <RolesSelector activeType={'validator'} />

                    <div className="section section-overview">
                        <div className="section-title section-title-sm">Functionaliteiten en overzicht</div>
                        <div className="section-separator">
                            <div className="line" />
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <div className="block block-image-list">
                        <div className="block-image-list-left">
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-1.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 2</div>
                                <div className="block-with-image-title">Fonds toewijzing</div>
                                <div className="block-with-image-description">
                                    Op het Forus-platform is het zichtbaar welke fondsen aan een bepaalde beoordelaar
                                    zijn toegewezen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <span className="block-with-image-list-item-title">
                                            Overzicht van alle fondsen:
                                        </span>
                                        <span className="block-with-image-list-item-description">
                                            Beoordelaars zien in het fondsenoverzicht welke fondsen aan hen zijn
                                            toegewezen door de sponsor.
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-3.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 4</div>
                                <div className="block-with-image-title">Gegevens van de aanvrager controleren</div>
                                <div className="block-with-image-description">
                                    Beoordelaars controleren eenvoudig de basisgegevens van aanvragers.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Haal Centraal-API:</div>
                                        Met behulp van de Haal Centraal API kunnen beoordelaars op een eenvoudige manier
                                        BRP-gegevens binnen hun beheeromgeving ophalen. Deze gegevens zijn van
                                        essentieel belang bij het beoordelen van aanvragen (naam, adres, postcode,
                                        geboortedatum, partnerstatus en aantal kinderen).
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="block-image-list-right">
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 1</div>
                                <div className="block-with-image-title">Een organisatieaccount aanmaken</div>
                                <div className="block-with-image-description">
                                    Beoordelaars hebben de mogelijkheid om een account aan te maken voor hun organisatie
                                    en om medewerkers toe te voegen, inclusief hun rollen en rechten.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Account aanmaken en organisatie inschrijven als beoordelaar:
                                        </div>
                                        Beoordelaars schrijven hun organisatie gemakkelijk in door een paar eenvoudige
                                        stappen te volgen. Ze voegen hun logo en bedrijfsgegevens toe.
                                    </div>

                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Toevoegen van medewerkers en toewijzen van rollen en rechten:
                                        </div>
                                        Binnen de beheeromgeving voegen beoordelaars meerdere medewerkers toe, wijzen
                                        zij rollen en rechten toe en beheren zij het team.
                                    </div>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-2.jpg')} alt="" />
                            </div>

                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 3</div>
                                <div className="block-with-image-title">Aanvragen ontvangen</div>
                                <div className="block-with-image-description">
                                    Het overzicht van alle aanvragen geeft de beoordelaar inzicht in de ontvangen
                                    aanvragen en hun status. Tevens is het mogelijk om nieuwe aanvragen toe te wijzen
                                    aan andere personen.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Inzicht in aanvragen:</div>
                                        De beoordelaar heeft in het overzicht van alle aanvragen een duidelijk zicht op
                                        welke aanvragen hij heeft ontvangen en wat de status ervan is.
                                    </div>
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Toewijzing van beoordelingen:
                                        </div>
                                        De beoordelaar kan nieuwe aanvragen toewijzen aan andere personen.
                                    </div>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-4.jpg')} alt="" />
                            </div>
                        </div>
                    </div>

                    <div className="separator-image full-width">
                        <img
                            className="full-width"
                            src={assetUrl('/assets/img/role-validator/validator-separator.jpg')}
                            alt=""
                        />
                    </div>

                    <div className="block block-image-list">
                        <div className="block-image-list-left">
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-5.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 6</div>
                                <div className="block-with-image-title">Aanvragen beoordelen</div>
                                <div className="block-with-image-description">
                                    Beoordelaars beoordelen aanvragen in slechts een paar eenvoudige stappen en zien
                                    direct de status ervan.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Aanvragen beoordelen:</div>
                                        Beoordelaars nemen beslissingen over de aanvragen en verwerken deze direct in
                                        het systeem. Na de beoordeling wordt de status van de aanvraag gewijzigd naar
                                        toegewezen of afgewezen.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-7.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 8</div>
                                <div className="block-with-image-title">Toegang tot support</div>
                                <div className="block-with-image-description">
                                    Beoordelaars hebben toegang tot support en het helpcenter van Forus.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Forus Support:</div>
                                        Forus verleent assistentie binnen het systeem. Beoordelaars kunnen de
                                        chatfunctie activeren door op het chatpictogram te klikken. Bovendien hebben ze
                                        een helpcentrum tot hun beschikking voor extra informatie en ondersteuning.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="block-image-list-right">
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 5</div>
                                <div className="block-with-image-title">Directe communicatie met aanvragers</div>
                                <div className="block-with-image-description">
                                    Beoordelaars sturen een aanvullingsverzoek naar de aanvrager om aanvullende
                                    informatie of bewijs te verkrijgen die nodig is voor het beoordelen van de aanvraag.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">Aanvullingsverzoek:</div>
                                        Beoordelaars kunnen via het Forus-platform extra informatie of bewijsmateriaal
                                        opvragen van de aanvrager.&nbspDit is nodig om de aanvraag compleet te
                                        beoordelen.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-6.jpg')} alt="" />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-label block-with-image-label-sm">Stap 7</div>
                                <div className="block-with-image-title">Beslissing communiceren naar aanvragers</div>
                                <div className="block-with-image-description">
                                    Beoordelaars informeren aanvragers over de status van de beoordeling.
                                </div>

                                <div className="block-with-image-list">
                                    <div className="block-with-image-list-item">
                                        <div className="block-with-image-list-item-title">
                                            Communicatie met aanvragers:
                                        </div>
                                        Wanneer de beoordelaar een beslissing heeft genomen over de aanvraag, wordt deze
                                        beslissing gecommuniceerd aan de aanvrager.
                                    </div>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/role-validator/validator-8.jpg')} alt="" />
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
                        backgroundColor={'#DEF5DF'}
                    />
                </div>
            </div>
        </Fragment>
    );
}
