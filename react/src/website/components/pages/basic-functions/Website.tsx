import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import PageSelector from './elements/PageSelector';
import Banner from './elements/Banner';
import SliderDetailed from '../../elements/SliderDetailed';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function Website() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const assetUrl = useAssetUrl();

    const [bannerTitle] = useState('Website');
    const [bannerLabel] = useState('Alle benodigde informatie op één plek');
    const [bannerDescription] = useState(
        [
            'De website biedt een helder overzicht voor mensen die ondersteuning of specifieke regelingen zoeken. ',
            'Daarnaast kunnen deelnemers hier inloggen op hun persoonlijke account. ',
            'De huisstijl en teksten van de website kunnen worden aangepast aan de branding van de organisatie, ',
            'waardoor de website herkenbaar is voor alle gebruikers.',
        ].join(''),
    );
    const [sliderDescription] = useState(
        [
            'Elke doelgroep is uniek. Er is geen one-size-fits-all oplossing. Daarom is het belangrijk ',
            'dat uw website goed aansluit bij uw doelgroep en hen de mogelijkheid biedt zich ermee te ',
            'identificeren. Ons systeem is daarom ontwikkeld als een "white-label platform", ',
            'waarmee gemakkelijk nieuwe oplossingen kunnen worden gecreëerd door de vormgeving ',
            '(look-and-feel) aan te passen aan verschillende doelgroepen. Dit betekent dat een website ',
            'kan worden afgestemd op een specifieke regeling, meerdere regelingen of een samenwerking ',
            'tussen verschillende sponsoren. Bij een samenwerking tussen sponsoren wordt een algemene ',
            'stijl gehanteerd waarin alle partijen zich kunnen vinden.',
        ].join(''),
    );
    const [sliderElements] = useState([
        {
            title: 'Eén specifieke regeling',
            description:
                'De website is ontworpen voor één specifieke regeling en toont deelnemers alle benodigde informatie, evenals een inlogmogelijkheid voor hun persoonlijke account.',
            background: '#FDEFD3',
            imgSrc: assetUrl('/assets/img/website-slider-1.jpg'),
            imgMobileSrc: assetUrl('/assets/img/website-slider-1-mobile.svg'),
            imgAlt: 'Kindpakket webshop van Goeree-Overflakee',
        },
        {
            title: 'Meerdere regelingen',
            description:
                'De website fungeert als centraal punt voor meerdere regelingen, zodat deelnemers eenvoudig kunnen navigeren tussen verschillende regelingen en toegang kunnen krijgen tot relevante informatie.',
            background: '#F4ECFC',
            imgSrc: assetUrl('/assets/img/website-slider-2.jpg'),
            imgMobileSrc: assetUrl('/assets/img/website-slider-2-mobile.svg'),
            imgAlt: 'Voorbeeld van een website met meerdere regelingen zoals een Keuzepakket voor volwassenen en Meedoenregeling',
        },
        {
            title: 'Samenwerking tussen sponsoren',
            description:
                'De website dient als een centraal platform voor diverse regelingen van verschillende organisaties, waardoor deelnemers eenvoudig alle informatie over diverse regelingen kunnen vinden en beheren.',
            background: '#EDF7ED',
            imgSrc: assetUrl('/assets/img/website-slider-3.jpg'),
            imgMobileSrc: assetUrl('/assets/img/website-slider-3-mobile.svg'),
            imgAlt: 'De website van de Gemeente Nijmegen dient als centraal platform voor diverse regelingen van verschillende organisaties, zoals de Gemeente Nijmegen en Stichting Leergeld.',
        },
    ]);
    const [backgroundImgAltText] = useState('Voorbeeld van een generieke website met alle benodigde informatie');

    useEffect(() => {
        setTitle('Een website in huisstijl van uw organisatie | Forus');
        setMetaDescription(
            [
                'Op het Forus-platform: creëer een website voor deelnemers van uw regeling. ',
                'Ontwerp in huisstijl van uw organisatie, zelfstandig beheerbaar.',
            ].join(''),
        );
    }, [setMetaDescription, setTitle]);

    return (
        <Fragment>
            <BackgroundCircles />
            <Banner
                type={'website'}
                title={bannerTitle}
                description={bannerDescription}
                labelText={bannerLabel}
                backgroundImgAltText={backgroundImgAltText}
            />

            <div className="main-content">
                <div className="wrapper">
                    <PageSelector activeType={'website'} />

                    <div className="block block-info">
                        <div className="block-info-title block-info-title-sm text-center">
                            Flexibele huisstijl en zelfstandig beheer
                        </div>
                    </div>
                </div>

                <div className="block-separator">
                    <div className="line line-center" />
                </div>

                <SliderDetailed description={sliderDescription} elements={sliderElements} />

                <div className="wrapper">
                    <div className="block block-with-image">
                        <div className="block-with-image-title block-with-image-title-sm text-center">
                            Een website die past bij uw organisatie
                        </div>

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description block-with-image-description-sm">
                                    De sponsor heeft zelf de mogelijkheid om de gewenste huisstijl toe te passen via{' '}
                                    <StateNavLink name={'cms'}>het CMS</StateNavLink> (Content Management Systeem) in de
                                    beheeromgeving. Hierdoor kan het systeem gemakkelijk zelfstandig door de sponsor
                                    worden onderhouden en blijft het herkenbaar en vertrouwd voor de deelnemers.
                                    Daarnaast kunt u de taal van de teksten aanpassen naar B1-niveau, zodat uw boodschap
                                    voor iedereen begrijpelijk is.
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/website-1.png')}
                                    alt="Organisatiehuisstijl zelf aanpassen met behulp van het Content Management Systeem"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/website-2.png')}
                                    alt="Bewerken van content met behulp van het CMS"
                                />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-description block-with-image-description-sm">
                                    Als sponsor heeft u de vrijheid om zelfstandig en in real-time de webshop naar eigen
                                    wens aan te passen. U kunt de content bewerken, informatieblokken en veelgestelde
                                    vragen toevoegen of verwijderen, en links maken naar externe pagina&apos;s. Hierdoor
                                    maakt u de website zo gebruiksvriendelijk en informatief mogelijk voor de
                                    deelnemers.
                                    <br />
                                    <br />
                                    Daarnaast voeren we regelmatig controles en updates uit om ervoor te zorgen dat de
                                    websites voldoen aan de WCAG-richtlijnen. Aangezien deze richtlijnen voortdurend
                                    evolueren en worden verbeterd, zorgen we ervoor dat we doorlopend compliant blijven.
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    src={assetUrl('/assets/img/website-experience.png')}
                                    alt="Voorbeeld van een generieke website gemaakt in het Forus-platform"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
