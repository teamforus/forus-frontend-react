import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function Slider() {
    const $element = useRef<HTMLDivElement>(null);
    const [activeItem, setActiveItem] = useState(1);

    const switchSlide = useCallback((activeItem) => {
        if ($element.current) {
            const $items = $element.current.getElementsByClassName(
                'block-strategy-list-item',
            ) as HTMLCollectionOf<HTMLElement>;

            for (let i = 0; i < $items.length; i++) {
                $items[i].style.removeProperty('transform');
            }
            $items[activeItem - 1].style.transform = `translateX(-${(activeItem - 1) * 100}%) scaleX(1)`;
        }
    }, []);

    useEffect(() => {
        if ($element.current) {
            const $items = $element.current.querySelectorAll('.block-strategy-list-item');
            const $arrows = $element.current.querySelectorAll('.block-strategy-arrow');

            $arrows[0]?.addEventListener('click', () => {
                if (activeItem === 1) {
                    setActiveItem($items.length);
                } else {
                    switchSlide(activeItem - 1);
                    setActiveItem(activeItem - 1);
                }
            });

            $arrows[1]?.addEventListener('click', () => {
                if (activeItem === $items.length) {
                    setActiveItem(1);
                } else {
                    setActiveItem(activeItem + 1);
                }
            });
        }
    }, [activeItem, switchSlide]);

    useEffect(() => {
        switchSlide(activeItem);
    }, [activeItem, switchSlide]);

    return (
        <div className="block block-strategy" ref={$element}>
            <div className="block-strategy-main">
                <div className="block-strategy-title">De weg naar een succesvolle lancering</div>
                <div className="block-strategy-separator" />
                <div className="block-strategy-description">
                    Wilt u een regeling uitgeven? We gaan graag met u in gesprek en werken toe naar een plan voor de
                    implementatie. Ook na de lancering staan wij voor u klaar.
                </div>
                <div className="block-strategy-arrows">
                    <div className="block-strategy-arrow block-strategy-arrow-left" />
                    <div className="block-strategy-arrow block-strategy-arrow-right" />
                </div>
                <div className="block-strategy-actions">
                    <div className="button button-primary">Gratis demo aanvragen</div>
                </div>
            </div>

            <div className="block-strategy-list">
                <div className="block-strategy-numeration">{activeItem}</div>

                <div className={`block-strategy-list-item ${activeItem == 1 ? 'active' : ''}`}>
                    <div className="block-strategy-list-item-title">Een verkennend gesprek</div>
                    <div className="block-strategy-list-item-description">
                        Tijdens het verkennend gesprek brengen we eerst de behoeften, strategie en beleid van uw
                        organisatie in kaart. We bespreken welke regeling(en) onder welke voorwaarden en voor welke
                        doelgroep u wilt uitgeven, en wat uw gewenste werkwijze is. We bekijken ook welke partijen erbij
                        betrokken zijn en wat het huidige applicatielandschap is. Daarnaast tonen we een demo van het
                        Forus-systeem, zodat u een duidelijker beeld krijgt van hoe het platform werkt en hoe u het kunt
                        benutten om aan uw behoeften te voldoen. Samen kijken we naar de kansen en mogelijkheden voor uw
                        organisatie.
                    </div>
                </div>

                <div className={`block-strategy-list-item ${activeItem == 2 ? 'active' : ''}`}>
                    <div className="block-strategy-list-item-title">Implementatie</div>
                    <div className="block-strategy-list-item-description">
                        Na het verkennende gesprek stellen we een implementatieplan op. In dit plan zijn alle zaken
                        opgenomen om toe te werken naar een succesvolle lancering. Alle aspecten worden besproken, van
                        communicatie naar gebruikers tot aan technische benodigdheden en werkinstructies. Hierdoor wordt
                        de voortgang gewaarborgd en kunt u binnen enkele weken het systeem in gebruik nemen en uw
                        doelgroep bedienen.
                    </div>
                </div>

                <div className={`block-strategy-list-item ${activeItem == 3 ? 'active' : ''}`}>
                    <div className="block-strategy-list-item-title">Ondersteuning na implementatie</div>
                    <div className="block-strategy-list-item-description">
                        Ook na de implementatie blijven we ondersteunen. U staat er niet alleen voor. U bent altijd
                        welkom om (technische) vragen te stellen of ideeën aan te dragen. Ons supportteam staat klaar om
                        u te ondersteunen en verder te begeleiden. Daarnaast vindt u meer informatie over de werking van
                        het Forus-platform in het Helpcentrum.
                    </div>
                </div>
            </div>
        </div>
    );
}
