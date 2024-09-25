import React, { Fragment, useState } from 'react';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function SocialDomain() {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="block block-social-domain">
            <div className="block-social-domain-banner">
                <div className="block-social-domain-banner-overlay" />
                <div className="block-social-domain-banner-main">
                    <div className="block-social-domain-banner-info">
                        <div className="block-social-domain-banner-subtitle">Samenwerken binnen het</div>
                        <div className="block-social-domain-banner-title">Sociaal Domein</div>
                    </div>

                    <div className="block-social-domain-banner-actions">
                        <StateNavLink name={'book-demo'} className="button button-light">
                            Laten we kennismaken
                        </StateNavLink>
                    </div>
                </div>
            </div>

            <div className="block-social-domain-info">
                {showMore ? (
                    <Fragment>
                        In onze ideale wereld krijgen mensen direct de hulp waar ze recht op hebben. Deze ondersteuning
                        is laagdrempelig, dichtbij, op maat en te vinden op één centrale plek.
                        <br />
                        <br />
                        Ons doel is om sociale initiatieven effectiever en toegankelijker te maken. Forus ondersteunt,
                        verbindt en faciliteert organisaties binnen het sociaal domein om dit te realiseren.
                        <br />
                        <br />
                        In Nederland zijn tal van nationale en lokale regelingen en voorzieningen beschikbaar,
                        aangeboden door verschillende organisaties. Elke organisatie zet zich in om mensen te helpen
                        door gebruik te maken van haar eigen kracht en unieke expertise. Op zichzelf staande
                        initiatieven, zonder samenhangende aanpak, zorgen in de praktijk voor een toename van
                        fragmentatie en verkokering. Door de overvloed aan regelingen, loketten en hulppunten verliezen
                        veel mensen het overzicht, wat leidt tot stress en onnodig niet-gebruik van deze voorzieningen.
                        Dit moet en kan anders.
                        <br />
                        <br />
                        Hierbij is er meer nodig dan alleen een overzicht van regelingen. Regelingen zijn namelijk
                        complex en het proces van vinden tot afhandeling kent veel stappen. Forus bekijkt het proces in
                        zijn geheel en verbindt en faciliteert alle onderdelen: van het vinden van de regelingen tot tot
                        financiële afhandeling. Want als iemand vastloopt wil je precies weten waar en waarom dit
                        gebeurt, zodat je niemand kwijt raakt.
                        <br />
                        <br />
                        De overheid heeft een leidende rol in het verbinden alle onderdelen, wat vraagt om een samenspel
                        tussen beleid, organisaties en techniek. De basis wordt gevormd door een integrale aanpak,
                        waarbij samenhang en samenwerking centraal staan.
                        <br />
                        <br />
                        Onze oplossing biedt gemeenten en andere organisaties de tools die nodig zijn om deze
                        verandering in gang te zetten. We werken toe naar een werkwijze die alle onderdelen van het
                        uitgifteproces van sociale regelingen faciliteert. Gebaseerd op bewezen methoden, biedt het
                        platform slimme flexibiliteit en ruimte voor maatwerk. Dankzij de verscheidenheid aan opties
                        sluit het aan op de behoeften van diverse gebruikers.
                        <br />
                        <br />
                        Door voorbij de eigen organisatiegrenzen te kijken en de mens centraal te stellen, creëren we
                        samen een systeem waarin hulp sneller, eenvoudiger en toegankelijker is voor iedereen. Zo dragen
                        we bij aan een samenleving waarin elk persoon, snel en zonder belemmeringen, de ondersteuning
                        krijgt waar diegene recht op heeft.
                    </Fragment>
                ) : (
                    <Fragment>
                        In onze ideale wereld krijgen mensen direct de hulp waar ze recht op hebben. Deze ondersteuning
                        is laagdrempelig, dichtbij, op maat en te vinden op één centrale plek.
                        <br />
                        <br />
                        Ons doel is om sociale initiatieven effectiever en toegankelijker te maken. Forus ondersteunt,
                        verbindt en faciliteert organisaties binnen het sociaal domein om dit te realiseren.
                    </Fragment>
                )}
                <div className="block-social-domain-info-actions">
                    {showMore ? (
                        <div
                            className="button button-light"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMore(false);
                            }}>
                            Lees minder
                            <em className={'mdi mdi-chevron-up icon-right'} />
                        </div>
                    ) : (
                        <div
                            className="button button-light"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowMore(true);
                            }}>
                            Lees meer
                            <em className={'mdi mdi-chevron-down icon-right'} onClick={() => setShowMore(true)} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
