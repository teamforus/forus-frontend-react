import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import Banner from './elements/Banner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function BasicFunctions() {
    const setTitle = useSetTitle();
    const assetUrl = useAssetUrl();
    const setMetaDescription = useSetMetaDescription();

    const [bannerTitle] = useState('Leer meer over ons platform');
    const [bannerDescription] = useState(
        'Ontdek de kernfuncties van ons open-source platform en hoe ze van waarde kunnen zijn voor uw organisatie.',
    );

    useEffect(() => {
        setTitle('Leer meer over het Forus-plaform | Basisfuncties');
        setMetaDescription(
            [
                'Ontdek de basisfuncties van het Forus-platform en hoe ',
                'ze waardevol voor uw organisatie kunnen zijn bij het beheren van sociale regelingen.',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles
                mainStyles={{ height: '800px' }}
                overlayStyles={{
                    background: 'linear-gradient(0deg, #FFF 0%, #FFF 32.5%, rgba(255, 255, 255, 0.00) 100%)',
                }}
            />
            <Banner type={'main'} title={bannerTitle} description={bannerDescription} showIcon={false} />

            <div className="main-content">
                <div className="wrapper">
                    <div className="block block-overview-list">
                        <div className="block-overview-list-row">
                            <div className="block block-overview-list-item">
                                <div className="block block-overview-list-item-image">
                                    <img src={assetUrl(`/assets/img/icons-basic-functions/funds.svg`)} alt="" />
                                </div>
                                <div className="block block-overview-list-item-info">
                                    <div className="block block-overview-list-item-title">Fondsen</div>
                                    <div className="block block-overview-list-item-description">
                                        Zet makkelijk fondsen op en beheer ze om regelingen uit te geven voor een
                                        geselecteerde doelgroep.
                                    </div>
                                    <div className="block block-overview-list-item-read-more">
                                        <button className="button button-light button-hover-gray button-sm">
                                            <StateNavLink name={'funds'}>Lees meer</StateNavLink>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="block block-overview-list-item">
                                <div className="block block-overview-list-item-image">
                                    <img src={assetUrl(`/assets/img/icons-basic-functions/website.svg`)} alt="" />
                                </div>
                                <div className="block block-overview-list-item-info">
                                    <div className="block block-overview-list-item-title">Website</div>
                                    <div className="block block-overview-list-item-description">
                                        Toon deelnemers alle benodigde informatie, zoals regelingen en lokaal aanbod, en
                                        bied hen de mogelijkheid om in te loggen op hun persoonlijke account.
                                    </div>
                                    <div className="block block-overview-list-item-read-more">
                                        <button className="button button-light button-hover-gray button-sm">
                                            <StateNavLink name={'website'}>Lees meer</StateNavLink>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="block-overview-list-row">
                            <div className="block block-overview-list-item">
                                <div className="block block-overview-list-item-image">
                                    <img src={assetUrl(`/assets/img/icons-basic-functions/cms.svg`)} alt="" />
                                </div>
                                <div className="block block-overview-list-item-info">
                                    <div className="block block-overview-list-item-title">CMS</div>
                                    <div className="block block-overview-list-item-description">
                                        Breng zelfstandig real-time wijzigingen aan op uw website met behulp van ons
                                        Content Management Systeem.
                                    </div>
                                    <div className="block block-overview-list-item-read-more">
                                        <button className="button button-light button-hover-gray button-sm">
                                            <StateNavLink name={'cms'}>Lees meer</StateNavLink>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="block block-overview-list-item">
                                <div className="block block-overview-list-item-image">
                                    <img src={assetUrl(`/assets/img/icons-basic-functions/me-app.svg`)} alt="" />
                                </div>
                                <div className="block block-overview-list-item-info">
                                    <div className="block block-overview-list-item-title">Me-app</div>
                                    <div className="block block-overview-list-item-description">
                                        Zorg ervoor dat deelnemers alle benodigde regelingen bij de hand hebben om
                                        eenvoudig en zonder stigma te kunnen afrekenen, en geef aanbieders de
                                        mogelijkheid om betalingen uit te voeren.
                                    </div>
                                    <div className="block block-overview-list-item-read-more">
                                        <button className="button button-light button-hover-gray button-sm">
                                            <StateNavLink name={'me-app'}>Lees meer</StateNavLink>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="block block-overview-list-item">
                                <div className="block block-overview-list-item-image">
                                    <img
                                        src={assetUrl(`/assets/img/icons-basic-functions/information.svg`)}
                                        alt="Icoon van de beoordelaardsrol in het Forus-systeem"
                                    />
                                </div>
                                <div className="block block-overview-list-item-info">
                                    <div className="block block-overview-list-item-title">Managementinformatie</div>
                                    <div className="block block-overview-list-item-description">
                                        Monitor en evalueer de impact van regelingen via de statistiekenpagina in de
                                        beheeromgeving.
                                    </div>
                                    <div className="block block-overview-list-item-read-more">
                                        <button className="button button-light button-hover-gray button-sm">
                                            <StateNavLink name={'information'}>Lees meer</StateNavLink>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <div className="block block-with-image block-with-image-image-sm">
                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-title block-with-image-title-lg">
                                    Het Forus-systeem in actie
                                </div>
                                <div className="block-with-image-description">
                                    Bekijk live toepassingen van het Forus platform. We laten u graag zien hoe het
                                    systeem werkt. Heeft u een mogelijke use case in gedachte? Neem contact met ons op
                                    en we bespreken de mogelijkheden.
                                </div>
                                <div className="block-with-image-actions">
                                    <StateNavLink name={'book-demo'} className="button button-primary">
                                        Gratis demo aanvragen
                                    </StateNavLink>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img src={assetUrl('/assets/img/action.svg')} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
