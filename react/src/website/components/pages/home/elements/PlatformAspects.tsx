import React, { useState } from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

type ImageDataProps = {
    src: string;
    alt?: string;
    imgStyles?: object;
    mainStyles?: object;
    mobileStyles?: { mainStyles?: object; imgStyles?: object };
};

export default function PlatformAspects() {
    const assetUrl = useAssetUrl();

    const [activeItem, setActiveItem] = useState(0);
    const [hoveredItem, setHoveredItem] = useState(null);

    const [items] = useState([
        {
            title: 'Snelle afhandeling van aanvragen',
            icon: 'request-processing.svg',
            iconActive: 'request-processing-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-2.svg'),
            isActive: false,
            description: [
                'Ons platform zorgt voor een efficiënte verwerking van aanvragen. Aanvragers voeren hun gegevens in, ',
                'waarna vervolgens een controle volgt. Bij goedkeuring ontvangen zij direct hun tegoed.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-2-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '170px',
                        right: '-30px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '20%',
                            right: '0',
                            maxWidth: '210px',
                        },
                        imgStyles: {
                            background: 'rgba(255, 255, 255, 0.75)',
                            boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        },
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-2-2.svg'),
                    alt: '',
                    mainStyles: {
                        top: '405px',
                        right: '-40px',
                        zIndex: 100,
                    },
                    imgStyles: {
                        background: 'rgba(255, 255, 255, 0.75)',
                        boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        backdropFilter: 'blur(7.837835311889648px)',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '55%',
                            right: '-20px',
                            maxWidth: '210px',
                            zIndex: 100,
                        },
                        imgStyles: {
                            background: 'rgba(255, 255, 255, 0.75)',
                            boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        },
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-2-3.svg'),
                    alt: '',
                    mainStyles: {
                        top: '430px',
                        right: '-10px',
                        zIndex: 99,
                    },
                    imgStyles: {
                        border: '0.566px solid #E5E5E5',
                        background: 'rgba(246, 247, 248, 0.65',
                        boxShadow:
                            '0px 13.829px 38.03px 0px rgba(115, 120, 145, 0.18), 0px 20.744px 55.317px 0px rgba(167, 174, 201, 0.10)',
                        backdropFilter: 'blur(8.090664863586426px)',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '60%',
                            right: '0',
                            maxWidth: '210px',
                        },
                        imgStyles: {
                            background: 'rgba(255, 255, 255, 0.75)',
                            boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        },
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '0',
                },
                imgStyles: {
                    marginBottom: '-140px',
                },
                mobile: {
                    imgWrapperStyles: {},
                    imgStyles: {
                        marginBottom: '-20px',
                    },
                },
            },
        },
        {
            title: 'Toegankelijk voor iedereen',
            icon: 'thumbs-up.svg',
            iconActive: 'thumbs-up-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-3.svg'),
            isActive: false,
            description: [
                'Het systeem biedt diverse uitgifteopties: digitaal, op papier of via een pas. ',
                'Hierdoor speelt het flexibel in op verschillende voorkeuren en is het toegankelijk voor alle gebruikers.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-3-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '520px',
                        right: '-100px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '70%',
                            right: '-20px',
                            width: '80%',
                        },
                        imgStyles: {},
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-3-2.svg'),
                    alt: '',
                    mainStyles: {
                        top: '20px',
                        right: '0',
                    },
                    imgStyles: {
                        borderRadius: '15.467px',
                        border: '0.644px solid #E5E5E5',
                        background: 'rgba(255, 255, 255, 0.75)',
                        boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        backdropFilter: 'blur(7.837835311889648px)',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '-30px',
                            right: '0',
                            width: '100%',
                        },
                        imgStyles: {
                            background: 'rgba(255, 255, 255, 0.75)',
                            boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        },
                    },
                },
            ],
            styles: {
                imgStyles: {
                    marginTop: '70px',
                    marginBottom: '-100px',
                },
                mobile: {
                    imgWrapperStyles: {},
                    imgStyles: {
                        marginBottom: '-60px',
                    },
                },
            },
        },
        {
            title: 'Herkenbaar en vertrouwd',
            icon: 'webshop.svg',
            iconActive: 'webshop-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-6.svg'),
            isActive: false,
            description: [
                'De website wordt ontworpen in de huisstijl van de organisatie, zodat deze herkenbaar is voor gebruikers.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-6-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '550px',
                        left: '140px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '65%',
                            left: '20px',
                            maxWidth: '100px',
                        },
                        imgStyles: {
                            boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                        },
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-6-2.svg'),
                    alt: '',
                    mainStyles: {
                        top: '520px',
                        left: '250px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '60%',
                            left: '100px',
                            maxWidth: '100px',
                        },
                        imgStyles: {
                            boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                        },
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-6-3.svg'),
                    alt: '',
                    mainStyles: {
                        top: '575px',
                        left: '360px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '68%',
                            left: '180px',
                            maxWidth: '100px',
                        },
                        imgStyles: {
                            boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                        },
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-6-4.svg'),
                    alt: '',
                    mainStyles: {
                        top: '255px',
                        left: '345px',
                        width: '350px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '25%',
                            right: '-30px',
                            maxWidth: '150px',
                        },
                        imgStyles: {
                            boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                        },
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '70px 0 0',
                },
                imgStyles: {
                    marginBottom: '-60px',
                },
                mobile: {
                    imgWrapperStyles: {},
                    imgStyles: {
                        marginBottom: '-30px',
                    },
                },
            },
        },
        {
            title: 'Efficiënte uitbetalingen',
            icon: 'payouts.svg',
            iconActive: 'payouts-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-1.svg'),
            isActive: false,
            description: [
                'Financiële transacties voor regelingen worden snel en efficiënt verwerkt door onze bankintegratie. ',
                'Dit bespaart tijd en verkleint het risico op fouten, doordat handmatige handelingen worden geautomatiseerd.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-1-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '550px',
                        right: '10px',
                    },
                    imgStyles: {
                        background: 'rgba(255, 255, 255, 0.75)',
                        boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        backdropFilter: 'blur(7.837835311889648px)',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '70%',
                            right: '0',
                            maxWidth: '210px',
                        },
                        imgStyles: {
                            background: 'rgba(255, 255, 255, 0.75)',
                            boxShadow: '0px 25.348px 58.496px 1.181px rgba(80, 86, 106, 0.10)',
                        },
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '0',
                },
                imgStyles: {
                    marginTop: '40px',
                    marginBottom: '40px',
                    maxWidth: '100%',
                },
            },
        },
        {
            title: 'Doelmatige besteding',
            icon: 'efficiency.svg',
            iconActive: 'efficiency-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-4.svg'),
            isActive: false,
            description: [
                'Ons platform stelt sponsors in staat om effectief in te zetten. ',
                "Variërend van een vrij te investeren bedrag in euro's tot de toekenning van een tegoed dat kan worden besteed aan een specifiek product of dienst.",
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-4-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '470px',
                        left: '-20px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '70%',
                            left: '-20px',
                            maxWidth: '60%',
                        },
                        imgStyles: {},
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-4-2.svg'),
                    alt: '',
                    mainStyles: {
                        top: '720px',
                        right: '-20px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '85%',
                            right: '-30px',
                            maxWidth: '60%',
                        },
                        imgStyles: {},
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-4-3.svg'),
                    alt: '',
                    mainStyles: {
                        top: '360px',
                        right: '-20px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '20%',
                            right: '-30px',
                            maxWidth: '60%',
                        },
                        imgStyles: {},
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '30px 0 0',
                },
            },
        },
        {
            title: 'Hulp en ondersteuning',
            icon: 'support.svg',
            iconActive: 'support-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-5.svg'),
            isActive: false,
            description: [
                'Onze klantenservice staat open voor alle gebruikersvragen. ',
                'Ons team van experts is beschikbaar om assistentie te verlenen waar nodig. ',
                'U kunt hulp aanvragen via chat, telefoon of e-mail. Als we een oproep missen, dan bellen we altijd terug.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-5-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '320px',
                        right: '-50px',
                    },
                    imgStyles: {
                        borderRadius: '11.399px',
                        background: 'rgba(255, 255, 255, 0.65)',
                        boxShadow:
                            '0px 12.473px 40.939px 0px rgba(115, 120, 145, 0.18), 0px 18.709px 52.698px 0px rgba(167, 174, 201, 0.10)',
                        backdropFilter: 'blur(7.297201633453369px)',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '50%',
                            right: '-20px',
                            maxWidth: '50%',
                        },
                        imgStyles: {
                            borderRadius: '11.399px',
                            background: 'rgba(255, 255, 255, 0.65)',
                            boxShadow:
                                '0px 12.473px 40.939px 0px rgba(115, 120, 145, 0.18), 0px 18.709px 52.698px 0px rgba(167, 174, 201, 0.10)',
                            backdropFilter: 'blur(7.297201633453369px)',
                        },
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '0',
                },
                imgStyles: {
                    marginBottom: '-140px',
                },
                mobile: {
                    imgWrapperStyles: {},
                    imgStyles: {
                        marginBottom: '-30px',
                        marginTop: '-5px',
                    },
                },
            },
        },
        {
            title: 'Real-time managementinformatie',
            icon: 'real-time.svg',
            iconActive: 'real-time-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-7.svg'),
            isActive: false,
            description: [
                'Via onze beheeromgeving krijgt uw organisatie direct inzicht in real-time data over de uitgifte van regelingen. ',
                'Zo maakt u gemakkelijk managementrapportages en kan u op basis van deze data verbeteringen doorvoeren.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-7-1.svg'),
                    alt: '',
                    mainStyles: {
                        top: '500px',
                        right: '-105px',
                    },
                },
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-7-2.svg'),
                    alt: '',
                    mainStyles: {
                        top: '300px',
                        right: '25px',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '25%',
                            right: '-20px',
                            maxWidth: '100px',
                        },
                        imgStyles: {
                            boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                        },
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '70px 0 0',
                },
                imgStyles: {
                    marginBottom: '-60px',
                },
                mobile: {
                    imgWrapperStyles: {},
                    imgStyles: {
                        marginBottom: '-10px',
                    },
                },
            },
        },
        {
            title: 'Samenwerking en best-pratices',
            icon: 'user-association.svg',
            iconActive: 'user-association-active.svg',
            mainImageSrc: assetUrl('/assets/img/unique-aspects/aspects-8.svg'),
            isActive: false,
            description: [
                'Het platform faciliteert brede samenwerking tussen organisaties. ',
                'We werken samen aan nieuwe producten en diensten op basis van best-practices en standaarden.',
            ].join(''),
            otherImages: [
                {
                    src: assetUrl('/assets/img/unique-aspects/aspects-8-1.svg'),
                    alt: '',
                    imgStyles: {
                        boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                    },
                    mobileStyles: {
                        mainStyles: {
                            top: '40%',
                            right: '30px',
                            maxWidth: '70%',
                        },
                        imgStyles: {
                            boxShadow: '0px 31.197px 51.994px 0px #E1E2E8',
                        },
                    },
                },
            ],
            styles: {
                imgWrapperStyles: {
                    padding: '0',
                },
                mobile: {
                    imgWrapperStyles: {},
                    imgStyles: {},
                },
            },
        },
    ]);

    return (
        <div className="block block-platform-aspects">
            <div className="block-platform-aspects-title">Unieke aspecten van ons platform</div>
            <div className="block-platform-aspects-main">
                <div className="block-platform-aspects-list">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className={`block-platform-aspects-list-item ${hoveredItem == index ? 'hover' : ''} ${
                                activeItem == index ? 'active' : ''
                            }`}
                            onMouseOver={() => setHoveredItem(index)}
                            onClick={() => setActiveItem(index)}>
                            <div className="block-platform-aspects-list-item-info">
                                <div className="block-platform-aspects-list-item-main">
                                    <div className="block-platform-aspects-list-item-image">
                                        <img
                                            src={assetUrl(
                                                `/assets/img/icons-aspects/${
                                                    activeItem != index ? item.icon : item.iconActive
                                                }`,
                                            )}
                                            alt=""
                                        />
                                    </div>
                                    <div className="block-platform-aspects-list-item-title">{item.title}</div>
                                </div>
                                <div
                                    className={`hide-sm block-platform-aspects-list-item-icon mdi mdi-arrow-right ${
                                        hoveredItem == index ? 'hover' : ''
                                    }`}
                                />
                                <div className="show-sm block-platform-aspects-list-item-details">
                                    {item.description}
                                </div>
                            </div>

                            <div
                                className="show-sm block-platform-aspects-image"
                                style={item.styles.mobile?.imgWrapperStyles}>
                                <img src={item?.mainImageSrc} alt="" style={item.styles.mobile?.imgStyles} />

                                {item?.otherImages?.map((img: ImageDataProps, index: number) => (
                                    <div
                                        className="block-platform-aspects-feedback"
                                        key={index}
                                        style={img.mobileStyles?.mainStyles}>
                                        <img src={img.src} alt={img.alt} style={img.mobileStyles?.imgStyles} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    className={`hide-sm block-platform-aspects-image`}
                    style={items[activeItem]?.styles?.imgWrapperStyles}>
                    <img src={items[activeItem]?.mainImageSrc} style={items[activeItem]?.styles?.imgStyles} alt="" />
                    <div className="block-platform-image-details">
                        {items[activeItem]?.description || items[0]?.description}
                    </div>

                    {items[activeItem]?.otherImages?.map((img: ImageDataProps, index: number) => (
                        <div className="hide-sm block-platform-aspects-feedback" key={index} style={img.mainStyles}>
                            <img src={img.src} alt={img.alt} style={img.imgStyles} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="block-platform-aspects-actions">
                <StateNavLink name={'basic-functions'} className="button button-primary">
                    Bekijk basisfuncties van ons systeem
                    <em className={'mdi mdi-arrow-right icon-end'} />
                </StateNavLink>
            </div>
        </div>
    );
}
