import React, { useState } from 'react';

import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function PlatformAspects() {
    const assetUrl = useAssetUrl();

    const [activeItem, setActiveItem] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);

    const [items] = useState([
        {
            title: 'Efficiënte uitbetalingen',
            icon: 'payouts.svg',
            iconActive: 'payouts-active.svg',
            isActive: false,
            description: [
                'Financiële transacties voor regelingen worden snel en efficiënt verwerkt door onze bankintegratie. ',
                'Dit bespaart tijd en het verkleint het risico op fouten doordat handmatige handelingen worden geautomatiseerd.',
            ].join(''),
        },
        {
            title: 'Snelle afhandeling van aanvragen',
            icon: 'request-processing.svg',
            iconActive: 'request-processing-active.svg',
            isActive: false,
            description: [
                'Ons platform verzorgt voor een efficiënte verwerking van aanvragen. ',
                'Aanvragers voeren hun gegevens in, waarna vervolgens een controle volgt. Bij goedkeuring ontvangen zij snel hun tegoed.',
            ].join(''),
        },
        {
            title: 'Toegankelijk voor iedereen',
            icon: 'thumbs-up.svg',
            iconActive: 'thumbs-up-active.svg',
            isActive: false,
            description: [
                'Het systeem biedt diverse uitgifteopties: digitaal, op papier of via een pas. ',
                'Hierdoor speelt het flexibel in op verschillende voorkeuren en is het toegankelijk voor alle gebruikers.',
            ].join(''),
        },
        {
            title: 'Doelmatige besteding',
            icon: 'efficiency.svg',
            iconActive: 'efficiency-active.svg',
            isActive: false,
            description: [
                'Ons platform stelt sponsors in staat om effectief in te zetten. ',
                "Variërend van een vrij te investeren bedrag in euro's tot de toekenning van een tegoed dat kan worden besteed aan een specifiek product of dienst.",
            ].join(''),
        },
        {
            title: 'Hulp en ondersteuning',
            icon: 'support.svg',
            iconActive: 'support-active.svg',
            isActive: false,
            description: [
                'Ons helpcentrum staat open voor alle gebruikersvragen. ',
                'Ons team van experts is altijd beschikbaar om assistentie te verlenen waar nodig. U kunt hulp aanvragen via chat, telefoon of e-mail.',
            ].join(''),
        },
        {
            title: 'Herkenbaar en vertrouwd',
            icon: 'webshop.svg',
            iconActive: 'webshop-active.svg',
            isActive: false,
            description: [
                'De website wordt ontworpen in de huisstijl van de organisatie, ',
                'zodat deze perfect aansluit bij de doelgroep en hen de mogelijkheid biedt zich ermee te identificeren.',
            ].join(''),
        },
        {
            title: 'Real-time managementinformatie',
            icon: 'real-time.svg',
            iconActive: 'real-time-active.svg',
            isActive: false,
            description: [
                'Via onze beheeromgeving krijgen organisaties direct inzicht in real-time data over de uitgifte van regelingen. ',
                'Zo maakt u gemakkelijk managementrapportages en faciliteert u datagedreven besluitvorming.',
            ].join(''),
        },
        {
            title: 'Samenwerking en best-pratices',
            icon: 'user-association.svg',
            iconActive: 'user-association-active.svg',
            isActive: false,
            description: [
                'Het platform faciliteert brede samenwerking tussen organisaties. ',
                'We werken samen aan nieuwe producten en diensten op basis van best-practices en standaarden.',
            ].join(''),
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
                                    {items[activeItem]?.description || items[0]?.description}
                                </div>
                            </div>

                            <div className="show-sm block-platform-aspects-image">
                                <img src={assetUrl(`/assets/img/unique-aspects/aspects-${index + 1}.png`)} alt="" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hide-sm block-platform-aspects-image">
                    <img src={assetUrl(`/assets/img/unique-aspects/aspects-${activeItem + 1}.png`)} alt="" />
                    <div className="block-platform-image-details">
                        {items[activeItem]?.description || items[0]?.description}
                    </div>
                </div>
            </div>

            <div className="block-platform-aspects-actions">
                <div className="button button-primary">
                    Bekijk basisfuncties van ons systeem
                    <em className={'mdi mdi-arrow-right icon-end'} />
                </div>
            </div>
        </div>
    );
}
