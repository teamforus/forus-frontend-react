import React, { Fragment, useState } from 'react';

export default function SocialDomain() {
    const [showMore, setShowMore] = useState(false);

    return (
        <div className="block block-social-domain">
            <div className="block-social-domain-banner">
                <div className="block-social-domain-banner-main">
                    <div className="block-social-domain-banner-info">
                        <div className="block-social-domain-banner-subtitle">Samenwerken binnen het</div>
                        <div className="block-social-domain-banner-title">Sociaal Domein</div>
                    </div>

                    <div className="block-social-domain-banner-actions">
                        <div className="button button-light">Laten we kennismaken</div>
                    </div>
                </div>
            </div>

            <div className="block-social-domain-info">
                {showMore ? (
                    <Fragment>
                        Forus richt zich op het ondersteunen van organisaties die zich inzetten binnen het sociaal
                        domein. Ons streven is om organisaties effectiever en efficiënter te laten werken. Dit vergt een
                        samenspel van beleid, organisatie en techniek. Forus ondersteunt en faciliteert.
                        <br />
                        <br />
                        Het huidige ondersteuningssysteem schiet tekort: ondanks dat er al veel armoedebestrijding is
                        ervaren veel mensen met financiële problemen stress en stigmatisering wanneer het overzicht
                        ontbreekt en gefragmenteerd wordt aangeboden.
                        <br />
                        <br />
                        Bij Forus begrijpen we de complexe uitdagingen die organisaties binnen het sociaal domein
                        dagelijks ervaren. Ons SaaS-platform is ontworpen om gemeenten en andere maatschappelijke
                        organisaties te helpen hun taken effectiever en efficiënter uit te voeren. Dit doen we door
                        beleid, organisaties, en technologie op elkaar aan te sluiten, zodat alle betrokken partijen
                        beter kunnen samenwerken en meer impact kunnen maken.
                        <br />
                        <br />
                        We blijven voortdurend op de hoogte van de nieuwste ontwikkelingen om onze dienstverlening
                        optimaal af te stemmen op de behoeften van gemeenten. Toenemende ongelijkheid en samenhangende
                        problemen zoals schulden, werkloosheid en psychische gezondheidskwesties, onderstrepen de
                        noodzaak van een geïntegreerde en effectieve benadering. Het huidige ondersteuningssysteem
                        schiet vaak tekort, wat leidt tot fragmentatie en een gebrek aan overzicht. Mensen die te maken
                        hebben met financiële problemen ervaren vaak niet alleen stress, maar ook een gevoel van
                        stigmatisering en uitsluiting. Bij Forus zetten we ons in om deze problemen aan te pakken door
                        de bestaande barrières te doorbreken en een holistische aanpak mogelijk te maken.
                        <br />
                        <br />
                        Onze oplossing voorziet gemeenten van de benodigde tools om deze complexe uitdagingen aan te
                        pakken. We bieden maatwerkoplossingen die specifiek zijn afgestemd op de behoeften van kwetsbare
                        groepen, met als doel een positieve impact te creëren in de samenleving.
                        <br />
                        <br />
                        Bij Forus werken we samen met gemeenten, goede doelen, stichtingen en lokale initiatieven, om
                        een geïntegreerd systeem te ontwikkelen dat inwoners een duidelijk overzicht biedt van
                        beschikbare ondersteuning. Door ketenpartners te verbinden, zorgen we voor efficiëntere
                        hulpverlening, snellere toegang tot voorzieningen, en maatwerk dat aansluit bij de specifieke
                        behoeften van elke inwoner. Ons platform helpt barrières te doorbreken en maakt effectieve
                        samenwerking mogelijk, zodat niemand buiten de boot valt.
                    </Fragment>
                ) : (
                    <Fragment>
                        Forus richt zich op het ondersteunen van organisaties die zich inzetten binnen het sociaal
                        domein. Ons streven is om organisaties effectiever en efficiënter te laten werken. Dit vergt een
                        samenspel van beleid, organisatie en techniek. Forus ondersteunt en faciliteert.
                        <br />
                        <br />
                        Het huidige ondersteuningssysteem schiet tekort: ondanks dat er al veel armoedebestrijding is
                        ervaren veel mensen met financiële problemen stress en stigmatisering wanneer het overzicht
                        ontbreekt en gefragmenteerd wordt aangeboden. ...
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
