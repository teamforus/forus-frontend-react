import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import PageSelector from './elements/PageSelector';
import Banner from './elements/Banner';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useEnvData from '../../../hooks/useEnvData';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function MeApp() {
    const setTitle = useSetTitle();
    const envData = useEnvData();
    const setMetaDescription = useSetMetaDescription();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Me-app');
    const [bannerDescription] = useState(
        [
            'De Me-app dient voor deelnemers als een middel om tegoeden te beheren en stelt aanbieders in staat om betalingen uit te voeren. ',
            'De mobiele app is beschikbaar voor iOS en Android.',
        ].join(''),
    );
    const [labelText] = useState('Een digitale portemonnee en kassa in één');
    const [activeTab, setActiveTab] = useState('attendees');
    const [backgroundImgAltText] = useState('Tegoeden zichtbaar in de Me-app');

    useEffect(() => {
        setTitle('Me-app | Digitale portemonnee en kassa in één\n');
        setMetaDescription(
            [
                'De Me-app fungeert voor deelnemers als een tool om hun tegoeden te beheren, ',
                'terwijl het aanbieders mogelijk maakt betalingen te verrichten.',
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
            <Banner
                type={'me-app'}
                title={bannerTitle}
                description={bannerDescription}
                labelText={labelText}
                backgroundImgAltText={backgroundImgAltText}
            />

            <div className="main-content">
                <div className="wrapper">
                    <PageSelector activeType={'me-app'} />

                    <div className="block block-info block-info-overview">
                        <div className="block-info-title block-info-title-sm text-left">Feature overzicht</div>
                        <div className="block-info-separator">
                            <div className="line" />
                        </div>
                    </div>
                    <br />
                    <br />
                </div>

                <div className="wrapper">
                    <div className="block block-with-image">
                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block block-label-tabs">
                                    <div
                                        className={`label-tab ${activeTab == 'attendees' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('attendees')}>
                                        Deelnemers
                                    </div>
                                    <div
                                        className={`label-tab ${activeTab == 'providers' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('providers')}>
                                        Aanbieders
                                    </div>
                                </div>
                                <div className="block-with-image-title">
                                    {activeTab == 'attendees' ? 'Tegoeden beheer' : 'Betalingen accepteren'}
                                </div>
                                {activeTab == 'attendees' ? (
                                    <Fragment>
                                        <div className="block-with-image-description">
                                            Wanneer een deelnemer een tegoed ontvangt via Forus, kunnen zij inloggen op
                                            het Me-app om hun tegoeden veilig te beheren. Het geeft hen de mogelijkheid
                                            hun real-time saldo te zien, transactiegeschiedenis te controleren en hun
                                            tegoed moeiteloos te gebruiken bij aangesloten aanbieders.
                                        </div>
                                        <div className="block-with-image-actions">
                                            <StateNavLink
                                                name={'book-demo'}
                                                className="button button-light button-fill flex">
                                                Gratis demo
                                                <em className="mdi mdi-arrow-right icon-right" />
                                            </StateNavLink>
                                        </div>
                                    </Fragment>
                                ) : (
                                    <Fragment>
                                        <div className="block-with-image-description">
                                            Wanneer aanbieders hun producten of diensten aanbieden via het
                                            Forus-platform, is de Me-app een essentieel hulpmiddel om QR-codes van en
                                            betalingen veilig te ontvangen. Aanbieders kunnen met gemak meerdere
                                            (kassa)medewerkers aan hun organisatie koppelen om zo het betalingsproces te
                                            optimaliseren.
                                        </div>
                                        <div className="block-with-image-actions">
                                            <StateNavLink
                                                name={'book-demo'}
                                                className="button button-light button-fill flex">
                                                Gratis demo
                                                <em className="mdi mdi-arrow-right icon-right" />
                                            </StateNavLink>
                                        </div>
                                    </Fragment>
                                )}
                            </div>
                            <div className="block-with-image-image">
                                {activeTab == 'attendees' ? (
                                    <img
                                        src={assetUrl(`/assets/img/me-app-1.png`)}
                                        alt="Deelnemer die tegoeden beheert in de Me-app"
                                    />
                                ) : (
                                    <img
                                        src={assetUrl(`/assets/img/me-app-2.png`)}
                                        alt="QR-codes scannen in de Me-app en betalingen ontvangen"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <BlockDashedSeparator image={true} />

                <div className="wrapper">
                    <div className="block block-with-columns">
                        <div className="block-with-columns-title">
                            Belangrijkste voordelen van de Me-app voor gebruikers en aanbieders:
                        </div>

                        <div className="block-with-columns-items">
                            <div className="block-with-columns-item">
                                <div className="block-with-columns-item-icon">
                                    <img src={assetUrl(`/assets/img/icons-me-app/me-app-1.svg`)} alt="" />
                                </div>
                                <div className="block-with-columns-item-title">Gebruiksgemak</div>
                                <div className="block-with-columns-item-description">
                                    De Me-app kenmerkt zich door een ontwerp waarbij gebruiksvriendelijkheid centraal
                                    staat. Een overzichtelijke interface garandeert een eenvoudige navigatie door de
                                    diverse functies van de app.
                                </div>
                            </div>
                            <div className="block-with-columns-item">
                                <div className="block-with-columns-item-icon">
                                    <img src={assetUrl(`/assets/img/icons-me-app/me-app-1.svg`)} alt="" />
                                </div>
                                <div className="block-with-columns-item-title">Inloggen zonder wachtwoord</div>
                                <div className="block-with-columns-item-description">
                                    Het innovatieve, wachtwoordvrije inlogsysteem van de Me-app maakt het onthouden van
                                    talloze wachtwoorden overbodig. Hierdoor wordt de veiligheid verhoogd door het
                                    risico op wachtwoorddiefstal te minimaliseren, terwijl gebruikers eenvoudig kunnen
                                    inloggen via e-mail.
                                </div>
                            </div>
                            <div className="block-with-columns-item">
                                <div className="block-with-columns-item-icon">
                                    <img src={assetUrl(`/assets/img/icons-me-app/me-app-1.svg`)} alt="" />
                                </div>
                                <div className="block-with-columns-item-title">Twee taalopties</div>
                                <div className="block-with-columns-item-description">
                                    De Me-app biedt volledige ondersteuning voor zowel het Nederlands als het Engels, om
                                    te voldoen aan taalvoorkeuren van de gebruikers.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block block-app-instructions">
                        <div className="block-app-instructions-label">Het gebruik van de Me-app</div>
                        <div className="block-app-instructions-title">Me-app verbinden met het Forus-account</div>
                        <div className="block-app-instructions-details">
                            <div className="block-app-instructions-details-start">
                                <div className="block-app-instructions-step">
                                    <div className="block-app-instruction-step-image">
                                        <img src={assetUrl(`/assets/img/icons-me-app/step-1.svg`)} alt="" />
                                    </div>
                                    <div className="block-app-instruction-step-info">
                                        <div className="block-app-instructions-step-title">Stap 1</div>
                                        <div className="block-app-instructions-step-description">
                                            Download de Me-app vanuit Google Play of de App Store en open deze.
                                        </div>
                                    </div>
                                </div>

                                <div className="block-app-instruction-step-separator">
                                    <img src={assetUrl(`/assets/img/icons-me-app/separator.png`)} alt="" />
                                </div>

                                <div className="block-app-instructions-step">
                                    <div className="block-app-instruction-step-image">
                                        <img src={assetUrl(`/assets/img/icons-me-app/step-2.svg`)} alt="" />
                                    </div>
                                    <div className="block-app-instruction-step-info">
                                        <div className="block-app-instructions-step-title">Stap 2</div>
                                        <div className="block-app-instructions-step-description">
                                            Kies “Koppelen”.Na het klikken worden de zes cijfers door de app
                                            weergegeven.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="block-app-instruction-divider">
                                <div className="block-app-instruction-arrow" />
                            </div>
                            <div className="block-app-instructions-details-finish">
                                <div className="block-app-instructions-image">
                                    <img src={assetUrl(`/assets/img/icons-me-app/input.svg`)} alt="" />
                                </div>
                                <div className="block-app-instructions-info">
                                    <div className="block-app-instructions-title">Stap 3 – Vul de code in</div>
                                    <div className="block-app-instructions-description">
                                        Ga naar het apparaat waarop u al bent ingelogd en klik op Log in op de app. Voer
                                        daar de code in en selecteer Koppel de app.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <StateNavLink name={'book-demo'}>
                        <div className="hide-sm button button-primary">Gratis demo</div>
                        <div className="show-sm button button-fill button-primary">Gratis demo</div>
                    </StateNavLink>

                    <div className="block block-me-app-download">
                        <div className="block-me-app-download-info">
                            <div className="block-me-app-download-label">Download nu de</div>
                            <div className="block-me-app-download-title">Me-app</div>
                            <div className="block-me-app-download-description">
                                Veilig beheer van tegoeden van deelnemers en het gemakkelijk uitvoeren van betalingen
                                voor aanbieders.
                            </div>
                            <div className="block-me-app-download-actions">
                                <a
                                    className="block-me-app-download-action"
                                    href={envData?.config?.android_link}
                                    target={'_blank'}
                                    rel="noreferrer">
                                    <img
                                        src={assetUrl('/assets/img/icons-me-app/app-store-android-dark.svg')}
                                        alt={''}
                                    />
                                </a>
                                <a
                                    className="block-me-app-download-action"
                                    href={envData?.config?.ios_iphone_link}
                                    target={'_blank'}
                                    rel="noreferrer">
                                    <img src={assetUrl('/assets/img/icons-me-app/app-store-ios-dark.svg')} alt={''} />
                                </a>
                            </div>
                        </div>
                        <div className="block-me-app-download-image">
                            <img src={assetUrl(`/assets/img/icons-me-app/me-app-download.svg`)} alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
