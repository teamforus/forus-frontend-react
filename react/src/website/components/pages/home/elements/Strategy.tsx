import React from 'react';
import Slider from '../../../elements/Slider';

export default function Strategy() {
    const elements = [
        {
            title: 'Een verkennend gesprek',
            description: [
                'In het verkennend gesprek brengen we de behoeften, ',
                'strategie en werkwijze en het beleid van uw organisatie in kaart. ',
                'We bespreken de regelingen, voorwaarden en doelgroep, ',
                'en brengen de betrokken partijen en het applicatielandschap ',
                'in kaart voor een goede afstemming van het implementatieproces. ',
                'Daarna tonen we een demo van het Forus-systeem. ',
                'Samen kijken we naar de kansen en mogelijkheden voor uw organisatie.',
            ].join('\n'),
        },
        {
            title: 'Implementatie',
            description: [
                'Na het verkennende gesprek stellen we een implementatieplan op. ',
                'In dit plan zijn alle zaken opgenomen om toe te werken naar een succesvolle lancering. ',
                'Alle aspecten komen terug in het plan, ',
                'van communicatie naar gebruikers tot aan technische benodigdheden en werkinstructies. ',
                'Hierdoor wordt de voortgang gewaarborgd en kunt u binnen enkele weken het systeem in ',
                'gebruik nemen en uw doelgroep bedienen.',
            ].join('\n'),
        },
        {
            title: 'Ondersteuning na implementatie',
            description: [
                'Ook na de implementatie blijven we u ondersteunen. ',
                'We beantwoorden graag uw vragen en blijven het systeem verbeteren. ',
                'U kunt ook altijd uw ideeën met ons delen. ',
                'Als u dat wenst, kunnen wij functionele beheertaken overnemen om u volledig te ontzorgen. ',
                'Ons supportteam staat klaar om u te helpen en verder te begeleiden. ',
                'Daarnaast vindt u uitgebreide informatie over het Forus-platform in het Helpcentrum',
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
