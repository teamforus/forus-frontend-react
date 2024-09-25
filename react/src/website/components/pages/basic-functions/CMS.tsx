import React, { Fragment, useEffect, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useAssetUrl from '../../../hooks/useAssetUrl';
import PageSelector from './elements/PageSelector';
import Banner from './elements/Banner';
import SliderCompact from '../../elements/SliderCompact';
import BlockLabelsGeneral from './elements/cms/BlockLabelsGeneral';
import BlockLabelsBlockManagement from './elements/cms/BlockLabelsBlockManagement';
import BlockLabelsFAQ from './elements/cms/BlockLabelsFAQ';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';
import ProgressLine from './elements/ProgressLine';
import BackgroundCircles from '../../elements/BackgroundCircles';

export default function CMS() {
    const setTitle = useSetTitle();
    const setMetaDescription = useSetMetaDescription();

    const assetUrl = useAssetUrl();

    const [labelText] = useState('Website personaliseren met ons CMS');
    const [bannerTitle] = useState('Content Management System');
    const [bannerDescription] = useState(
        [
            'Personaliseer uw website en breng zelfstandig real-time aanpassingen aan om ',
            'de gebruikerservaring te verbeteren met ons CMS (Content Management System).',
        ].join(''),
    );
    const [sliderDescription] = useState(
        'Pas gemakkelijk de content aan, voeg informatieblokken en veelgestelde vragen toe en link zelfs door naar externe websites. Zo presenteert u alle benodigde informatie op een duidelijke en toegankelijke manier.',
    );
    const [sliderElements] = useState([
        {
            label: 'Standaard webshop',
            title: 'Voorbeeld van een generieke website',
            button: true,
            buttonText: 'Lees meer',
            background: '#0A33C1',
            imgSrc: assetUrl('/assets/img/cms-slider-1.jpg'),
            imgAlt: 'Voorbeeld van een standaard website',
        },
        {
            label: 'Kansshop',
            title: 'Kansshop website van de Gemeente Eemsdelta',
            button: true,
            buttonText: 'Lees meer',
            background: '#004680',
            imgSrc: assetUrl('/assets/img/cms-slider-2.jpg'),
            imgAlt: 'Kansshop webshop van Gemeente Eemsdelta',
        },
        {
            label: 'Potjeswijzer',
            title: 'Potjeswijzer website voor de Gemeente Westerkwartier',
            button: true,
            buttonText: 'Lees meer',
            background: '#26318B',
            imgSrc: assetUrl('/assets/img/cms-slider-3.jpg'),
            imgAlt: 'Potjeswijzer website van Gemeente Westerkwartier',
        },
        {
            label: 'Goeree-Overflakkee',
            title: 'Website van Goeree-Overflakkee',
            button: true,
            buttonText: 'Lees meer',
            background:
                'linear-gradient(0deg, #00A3D1 0%, #00A3D1 100%), linear-gradient(225deg, #A6CE39 0%, #A6CE39 5%, #95CC4B 17%, #6AC77B 40%, #25C0C8 73%, #00BDF2 90%, #00BDF2 100%)',
            imgSrc: assetUrl('/assets/img/cms-slider-4.jpg'),
            imgAlt: 'Webshop van Gemeente Goeree-Overflakkee',
        },
    ]);
    const [backgroundImgAltText] = useState('Websites in real-time bewerken met Content Management Systeem');

    useEffect(() => {
        setTitle('Krachtig CMS: Personaliseer uw website | het Forus-platform');
        setMetaDescription(
            [
                'Personaliseer uw website voor sociale regelingen met ons flexibele CMS. ',
                'Pas content aan, beheer blokken en voeg FAQ&apos;s toe voor een betere gebruikerservaring.',
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
                type={'cms'}
                title={bannerTitle}
                description={bannerDescription}
                labelText={labelText}
                backgroundImgAltText={backgroundImgAltText}
            />

            <div className="main-content">
                <div className="wrapper">
                    <PageSelector activeType={'cms'} />

                    <SliderCompact description={sliderDescription} elements={sliderElements} />

                    <BlockDashedSeparator image={true} />

                    <div className="block block-info text-left">
                        <div className="block-info-title block-info-title-sm">Content aanpassen</div>
                        <div className="block-info-description block-info-description-sm">
                            Met ons CMS pas u eenvoudig de content van uw website pagina&apos;s aan. U kunt tekst,
                            hyperlinks, afbeeldingen en YouTube video&apos;s toevoegen, verwijderen of wijzigen om uw
                            website te personaliseren. Bovendien kunt u eenvoudig informatieblokken verplaatsen of de
                            opmaak van uw pagina wijzigen om de perfecte lay-out voor uw behoeften te creëren.
                        </div>
                        <div className="block-info-banner">
                            <img
                                src={assetUrl(`/assets/img/cms-content-banner.jpg`)}
                                alt="Content aanpassen met behulp van een CMS"
                            />
                        </div>
                    </div>
                </div>

                <div className="wrapper">
                    <BlockLabelsGeneral />

                    <div className="block block-with-image">
                        <div className="block-with-image-title">Informatieblokken beheren</div>
                        <ProgressLine currentStep={1} totalSteps={3} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Informatieblokken vormen handige elementen waarmee u de inhoud van uw webpage&apos;s
                                    kunt organiseren en structureren. U heeft de mogelijkheid om blokken toe te voegen,
                                    te verwijderen of aan te passen, en deze te gebruiken voor diverse doeleinden, zoals
                                    het verstrekken van informatie over een fonds. U kunt zelfs een knop toevoegen die
                                    leidt naar de aanvraagpagina of naar een externe URL. Elk informatieblok bestaat uit
                                    de volgende elementen die u kunt gebruiken:
                                </div>
                                <br />
                                <BlockLabelsBlockManagement />
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/cms-general.png')}
                                    alt="Informatieblokken beheren in het CMS"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-title">Veelgestelde vragen toevoegen</div>
                        <ProgressLine currentStep={2} totalSteps={3} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/cms-blocks.png')}
                                    alt="Veelgestelde vragen toevoegen aan de website met het CMS"
                                />
                            </div>
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Het kan gebeuren dat niet alles duidelijk is voor uw doelgroep en dat zij meer
                                    uitleg zoeken op verschillende gebieden. Als u regelmatig dezelfde vragen van
                                    deelnemers ontvangt, kunt u ze anticiperen door een veelgestelde vragen (FAQ) sectie
                                    aan uw website toe te voegen. Met de functionaliteit van ons CMS kunt u eenvoudig
                                    nieuwe vragen en antwoorden toevoegen, bestaande items bewerken of verwijderen. Zo
                                    houdt u uw deelnemers goed geïnformeerd en kunt u hun vertrouwen winnen.
                                </div>
                                <br />
                                <BlockLabelsFAQ />
                            </div>
                        </div>
                    </div>

                    <div className="block block-with-image">
                        <div className="block-with-image-title">Externe websites linken</div>
                        <ProgressLine currentStep={3} totalSteps={3} />

                        <div className="block-with-image-wrapper">
                            <div className="block-with-image-info">
                                <div className="block-with-image-description">
                                    Heeft u al een toegankelijkheidsverklaring op een andere website die u wilt
                                    doorlinken? Sommige pagina&apos;s in de footer kunnen direct doorlinken naar externe
                                    websites. Denk hierbij bijvoorbeeld aan de Privacyverklaring,
                                    Toegankelijkheidsverklaring en Algemene voorwaarden. U hoeft de doorlinkoptie niet
                                    te gebruiken; de genoemde pagina&apos;s kunnen natuurlijk ook een onderdeel van uw
                                    eigen website zijn.
                                    <br />
                                    <br />
                                    Soms worden regelingen via verschillende systemen uitgegeven, maar u wilt één
                                    vindplek voor alle regelingen zodat ze gemakkelijk te vinden zijn voor de deelnemer.
                                    U kunt dus een informatieve fonds gebruiken om door te linken naar een externe
                                    website waar meer informatie te vinden is.
                                </div>
                            </div>
                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/cms-external-links.png')}
                                    alt="Externe websites linken op de website met het CMS"
                                />
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
                                    Ervaar de Forus-oplossing in actie
                                </div>
                                <div className="block-with-image-description block-with-image-description-sm">
                                    Vraag een gratis demo aan
                                </div>
                                <div className="block-with-image-actions">
                                    <StateNavLink name={'book-demo'} className="button button-primary">
                                        Gratis demo aanvragen
                                    </StateNavLink>
                                </div>
                            </div>

                            <div className="block-with-image-image">
                                <img
                                    src={assetUrl('/assets/img/cms-experience.jpg')}
                                    alt="Zelfstandig websites aanpassen met het CMS"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
