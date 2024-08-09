import React from 'react';
import Slider from '../../../elements/Slider';

export default function Strategy() {
    const elements = [
        {
            title: 'Een verkennend gesprek',
            description: [
                'Tijdens het verkennend gesprek brengen we eerst de behoeften, strategie en beleid van uw',
                'organisatie in kaart. We bespreken welke regeling(en) onder welke voorwaarden en voor welke',
                'doelgroep u wilt uitgeven, en wat uw gewenste werkwijze is. We bekijken ook welke partijen erbij',
                'betrokken zijn en wat het huidige applicatielandschap is. Daarnaast tonen we een demo van het',
                'Forus-systeem, zodat u een duidelijker beeld krijgt van hoe het platform werkt en hoe u het kunt',
                'benutten om aan uw behoeften te voldoen. Samen kijken we naar de kansen en mogelijkheden voor uw',
                'organisatie.',
            ].join('\n'),
        },
        {
            title: 'Implementatie',
            description: [
                'Na het verkennende gesprek stellen we een implementatieplan op. In dit plan zijn alle zaken',
                'opgenomen om toe te werken naar een succesvolle lancering. Alle aspecten worden besproken, van',
                'communicatie naar gebruikers tot aan technische benodigdheden en werkinstructies. Hierdoor wordt',
                'de voortgang gewaarborgd en kunt u binnen enkele weken het systeem in gebruik nemen en uw',
                'doelgroep bedienen.',
            ].join('\n'),
        },
        {
            title: 'Ondersteuning na implementatie',
            description: [
                'Ook na de implementatie blijven we ondersteunen. U staat er niet alleen voor. U bent altijd',
                'welkom om (technische) vragen te stellen of ideeën aan te dragen. Ons supportteam staat klaar om',
                'u te ondersteunen en verder te begeleiden. Daarnaast vindt u meer informatie over de werking van',
                'het Forus-platform in het Helpcentrum.',
            ].join('\n'),
        },
    ];

    return (
        <Slider
            title={'De weg naar een succesvolle lancering'}
            description={[
                'Wilt u een regeling uitgeven? We gaan graag met u in gesprek en werken toe naar een plan voor de implementatie.',
                'Ook na de lancering staan wij voor u klaar.',
            ].join(' ')}
            elements={elements}
            showBackgroundImage={true}
            showActionButton={true}
        />
    );
}
