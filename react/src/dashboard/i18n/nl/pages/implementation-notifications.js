export default {
    labels: {
        description: 'Omschrijving',
        required: 'Staat vast',
        channels: 'Kanalen',
        status: 'Status',
    },
    tooltips: {
        description: 'Beschrijving van het systeembericht.',
        required:
            'Geeft aan of de mail individueel per regeling uit te zetten is. Ja betekent dat het systeembericht vaststaat en niet individueel per regeling uit te zetten is. Staat er Nee, dan kan het systeembericht per regeling worden uitgezet.',
        channels: 'Beschikbare verzendkanalen (e-mail, push, web).',
        status: 'Actieve of inactieve status van het bericht.',
    },
};
