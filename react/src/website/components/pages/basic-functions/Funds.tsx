import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import PageSelector from './elements/PageSelector';
import Banner from './elements/Banner';
import BlockLabelsFundGeneral from './elements/funds/BlockLabelsFundGeneral';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockLabelsFAQ from './elements/funds/BlockLabelsFaq';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';
import ProgressLine from './elements/ProgressLine';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function Funds() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Fondsen opzetten en beheren ');
    const [bannerLabel] = useState('Bied meerdere regelingen aan via één platform');
    const [bannerDescription] = useState(
        [
            'Financiële rust en zekerheid zijn voor iedereen belangrijk. ',
            'Er zijn veel sociale initiatieven, zoals het kindpakket, de meedoenregeling of de individuele inkomstentoeslag, ',
            'die mensen in verschillende situaties kunnen ondersteunen. ',
            'Met het Forus-platform kunt uw organisatie meerdere regelingen uitgeven om specifieke doelgroepen te bereiken. ',
            'Het uitgifteproces verloopt met minimale administratieve lasten voor zowel de organisatie als de deelnemers, ',
            'waardoor er meer tijd overblijft voor uw organisatie om persoonlijke ondersteuning te bieden aan degenen die het nodig hebben.',
        ].join(''),
    );
    const [backgroundImgAltText] = useState('Regelingen opzetten en beheren via het Forus-platform');

    useEffect(() => {
        setTitle('Fondsen opzetten en beheren: eenvoudig en effectief | Forus');
        setMetaDescription(
            [
                'Ontdek een platform voor het opzetten en beheren van sociale regelingen. ',
                'Creëer fondsen die bestaan uit tegoeden specifiek voor geselecteerde doelgroepen.',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles
                mainStyles={{ height: '700px' }}
                overlayStyles={{
                    background: 'linear-gradient(0deg, #FFF 0%, #FFF 32.5%, rgba(255, 255, 255, 0.00) 100%)',
                }}
            />
            <Banner
                type={'funds'}
                title={bannerTitle}
                description={bannerDescription}
                labelText={bannerLabel}
                backgroundImgAltText={backgroundImgAltText}
            />

            <div className="main-content">
                <div className="wrapper">
                    <PageSelector activeType={'funds'} />

                    <div className="block block-info text-left">
                        <div className="block-info-title block-info-title-sm">Wat zijn Fondsen?</div>
                        <div className="block-info-description block-info-description-sm">
                            Om sociale regelingen uit te geven via het Forus-platform zet u een fonds op. Fondsen
                            bestaan uit tegoeden die specifiek beschikbaar worden gesteld aan geselecteerde doelgroepen.
                            We streven ernaar om het proces zo gebruiksvriendelijk mogelijk te maken, zodat zowel
                            sponsors als deelnemers maximaal kunnen profiteren van de beschikbare middelen.
                            <br />
                            <br />
                            Het is mogelijk om een aanvraagproces toe te voegen, waarmee mensen het fonds kunnen
                            aanvragen. Daarnaast is het ook mogelijk om het tegoed voor een doelgroep die al bekend is,
                            alvast klaar te zetten. Zo maakt u het proces eenvoudig en helder voor de deelnemer,
                            waardoor ze minder stress ervaren en meer vertrouwen in uw organisatie hebben.
                        </div>
                        <ProgressLine currentStep={1} totalSteps={7} />
                        <div className="block-info-banner">
                            <img
                                src={assetUrl(`/assets/img/funds-general-banner.jpg`)}
                                alt="Voorbeelden van regelingen die via het Forus-platform kunnen worden opgesteld"
                            />
                        </div>
                        <BlockLabelsFundGeneral />
                    </div>
                </div>

                <BlockDashedSeparator image={true} />

                <div className="wrapper">
                    <div className="block block-with-image">
                        <div className="block-with-image-title">Uw rol als Sponsor</div>
                        <ProgressLine currentStep={2} totalSteps={7} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Om ervoor te zorgen dat de geselecteerde groep een regeling eenvoudig kan benutten,
                                    zonder ingewikkelde procedures, kunt u zelf een fonds en het uitgifteproces daarvan
                                    op te zetten. U begeleidt de oprichting van het fonds en bepaalt hoe en aan wie de
                                    middelen worden toegewezen. Het Forus-platform is ontworpen om het hele proces van
                                    regelinguitgifte te ondersteunen, van het opzetten van regelingen en de
                                    aanvraagprocedure tot het monitoren en beoordelen van de impact. Zo kunnen mensen
                                    alle stappen op één plek doorlopen.
                                </div>
                                <div className="block-with-image-actions">
                                    <StateNavLink className="button button-primary" name={'roles-sponsor'}>
                                        Lees meer over de Sponsorrol
                                        <em className="mdi mdi-chevron-right icon-end" />
                                    </StateNavLink>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/funds-sponsor-role.png')}
                                    alt="Sponsorrol in het Forus-platform"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block block-info text-left">
                        <div className="block-info-title block-info-title-sm">Soorten fondsen en hun toepassingen</div>
                        <ProgressLine currentStep={3} totalSteps={7} />
                        <div className="block-info-banner">
                            <img
                                src={assetUrl(`/assets/img/fund-types-banner.jpg`)}
                                alt="Content aanpassen met behulp van een CMS"
                            />
                        </div>
                        <div className="block-info-description block-info-description-sm">
                            Er zijn veel sociale regelingen en manieren waarop ze worden verstrekt. Het selecteren van
                            het juiste fondstype opent diverse mogelijkheden in onze systeemconfiguratie waardoor u
                            toegang krijgt tot een reeks functies die zijn afgestemd op uw behoeften. Wij helpen u graag
                            bij het verkennen van de verschillende opties om de optimale oplossing te vinden die
                            aansluit bij uw doelen.
                        </div>

                        <div className="block block-overview-list">
                            <div className="block-overview-list-row">
                                <div className="block block-overview-list-item block-overview-list-item-center">
                                    <div className="block block-overview-list-item-image">
                                        <img
                                            src={assetUrl(`/assets/img/icons-basic-functions/funds/budget.svg`)}
                                            alt="Icoon van de deelnemersrol in het Forus-systeem"
                                        />
                                    </div>
                                    <div className="block block-overview-list-item-info">
                                        <div className="block block-overview-list-item-title">Budget</div>
                                        <div className="block block-overview-list-item-description">
                                            Een fonds waarbij deelnemers een digitaal tegoed met een vast budget
                                            ontvangen, dat besteed kan worden bij geselecteerde aanbieders.
                                        </div>
                                    </div>
                                </div>

                                <div className="block block-overview-list-item block-overview-list-item-center">
                                    <div className="block block-overview-list-item-image">
                                        <img
                                            src={assetUrl(`/assets/img/icons-basic-functions/funds/product.svg`)}
                                            alt="Icoon van de aanbiedersrol in het Forus-systeem"
                                        />
                                    </div>
                                    <div className="block block-overview-list-item-info">
                                        <div className="block block-overview-list-item-title">Product</div>
                                        <div className="block block-overview-list-item-description">
                                            Een fonds dat deelnemers de mogelijkheid biedt om een digitaal tegoed te
                                            besteden aan een specifiek product of dienst.
                                        </div>
                                    </div>
                                </div>

                                <div className="block block-overview-list-item block-overview-list-item-center">
                                    <div className="block block-overview-list-item-image">
                                        <img
                                            src={assetUrl(`/assets/img/icons-basic-functions/funds/information.svg`)}
                                            alt="Icoon van de sponsorrol in het Forus-systeem"
                                        />
                                    </div>
                                    <div className="block block-overview-list-item-info">
                                        <div className="block block-overview-list-item-title">Informatief</div>
                                        <div className="block block-overview-list-item-description">
                                            Een fonds met een informatief doel die organisaties in staat stelt om alle
                                            beschikbare regelingen overzichtelijk samen te brengen.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-title">De aanvraagmethode</div>
                        <ProgressLine currentStep={4} totalSteps={7} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Tijdens het opzetten van een fonds bepaalt u hoe deelnemers een aanvraag kunnen
                                    indienen en hun tegoed kunnen activeren. Afhankelijk van de complexiteit van de
                                    benodigde informatie van de deelnemers, het ontwerp van de regeling en de werkwijze
                                    van uw organisatie (bijv. met of zonder DigiD) kunt u de meest geschikte optie voor
                                    uw doelgroep kiezen.
                                </div>
                                <div className="block-with-image-list block-with-image-list-compact">
                                    <div className="block-with-image-list-compact-row">
                                        <div className="block-with-image-list-item">
                                            <img
                                                className={'item-icon'}
                                                src={assetUrl('/assets/img/icons-basic-functions/funds/form.svg')}
                                                alt=""
                                            />
                                            <div className="block-with-image-list-item-name">Via een formulier</div>
                                        </div>
                                        <div className="block-with-image-list-item">
                                            <img
                                                className={'item-icon'}
                                                src={assetUrl(
                                                    '/assets/img/icons-basic-functions/funds/activation_codes.svg',
                                                )}
                                                alt=""
                                            />
                                            <div className="block-with-image-list-item-name">Activatiecodes</div>
                                        </div>
                                    </div>
                                    <div className="block-with-image-list-compact-row">
                                        <div className="block-with-image-list-item">
                                            <img
                                                className={'item-icon'}
                                                src={assetUrl(
                                                    '/assets/img/icons-basic-functions/funds/form_and_activation_codes.svg',
                                                )}
                                                alt=""
                                            />
                                            <div className="block-with-image-list-item-name">
                                                Een combinatie van formulier en activatiecodes
                                            </div>
                                        </div>
                                        <div className="block-with-image-list-item">
                                            <img
                                                className={'item-icon'}
                                                src={assetUrl(
                                                    '/assets/img/icons-basic-functions/funds/without_form_codes.svg',
                                                )}
                                                alt=""
                                            />
                                            <div className="block-with-image-list-item-name">
                                                Activeren zonder formulier of activatiecodes
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/request-method.png')}
                                    alt="Bepalen van de aanvraagmethode voor de regeling"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-title">Voorwaarden voor deelname vaststellen</div>
                        <ProgressLine currentStep={5} totalSteps={7} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/funds-apply-conditions.png')}
                                    alt="Voorwaarden voor deelname aan een fonds vaststellen"
                                />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Om in aanmerking te komen voor een van de sociale regelingen, moeten deelnemers aan
                                    bepaalde eisen voldoen. Wanneer u een fonds opzet, kunt u specifieke voorwaarden
                                    definiëren die deze eisen weerspiegelen. U kunt meerdere voorwaarden toevoegen aan
                                    het aanvraagformulier, zoals een maximaal vermogen, of het aantal kinderen.
                                    <br />
                                    <br />
                                    Elke voorwaarde bestaat uit een eigenschap (bijv. aantal kinderen), een verhouding
                                    (bijv. is groter dan) en een waarde (bijv. 2). In dit geval zouden dus ouders met
                                    ten minste 2 kinderen in aanmerking komen voor deze regeling.
                                    <br />
                                    <br />
                                    Tijdens het aanvraagproces worden deelnemers geïnformeerd over uw gestelde
                                    voorwaarden en krijgen ze vragen die hierop zijn gebaseerd.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-title">Beoordelen van aanvragen</div>
                        <ProgressLine currentStep={6} totalSteps={7} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Na het indienen van een aanvraag moet deze worden beoordeeld, zodat personen die
                                    recht hebben op een regeling een toekenning kunnen ontvangen. Dit proces kunt u ook
                                    via ons systeem effectief uitvoeren, zodat alles op één plek gebeurt. Of uw
                                    organisatie zelf de beoordeling van aanvragen uitvoert of dit door een andere
                                    organisatie laat doen, u kunt de sponsor fondsen toewijzen aan specifieke
                                    beoordelaars. In gevallen waarin de doelgroep al bekend is, kunt u ook kiezen voor
                                    ambtshalve toekenning, waardoor de aanvraag voor deze groep direct wordt
                                    geactiveerd.
                                </div>
                                <div className="block-with-image-actions">
                                    <StateNavLink className="button button-primary" name={'roles-validator'}>
                                        Lees meer over de Beoordelaarsrol
                                        <em className="mdi mdi-chevron-right icon-end" />
                                    </StateNavLink>
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/funds-validator-role.png')}
                                    alt="Voorwaarden voor deelname aan een fonds vaststellen"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-title">FAQ voor duidelijke aanvragen en uitgifte</div>
                        <ProgressLine currentStep={7} totalSteps={7} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/funds-validator-role.png')}
                                    alt="Voorwaarden voor deelname aan een fonds vaststellen"
                                />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Voeg veelgestelde vragen toe om deelnemers duidelijkheid te bieden tijdens het
                                    aanvraagproces, de uitgifte en de besteding van de regeling. Het is mogelijk dat
                                    bepaalde zaken niet volledig duidelijk zijn voor uw doelgroep, waardoor zij behoefte
                                    hebben aan extra uitleg op diverse gebieden. Wanneer u vaak dezelfde vragen van
                                    deelnemers ontvangt, kunt u hierop inspelen door een veelgestelde vragen (FAQ)
                                    sectie toe te voegen. Dit kan helpen om bijvoorbeeld het maximale inkomen te
                                    verduidelijken dat vereist is om deel te nemen aan het fonds.
                                </div>
                                <br />
                                <BlockLabelsFAQ />
                            </div>
                        </div>
                    </div>
                </div>

                <BlockDashedSeparator image={true} />

                <div className="wrapper">
                    <div className="block block-with-image">
                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-title block-with-image-title-lg">
                                    Het Forus-systeem in actie
                                </div>
                                <div className="block-with-image-description block-with-image-description-sm">
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
                                <img
                                    src={assetUrl('/assets/img/funds-action.png')}
                                    alt="Voorbeelden van fondsen in het Forus-platform zoals het Kindpakken, de Meedoenregeling of het Busvoordeelabonnement"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
