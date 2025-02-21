export default {
    labels: {
        created_at: 'Datum van toestemming',
        bank: 'Bank',
        expire_at: 'Verloopdatum',
        iban: 'Rekening',
        status: 'Status',
    },
    tooltips: {
        created_at: 'De datum waarop de koppeling met de bank is geactiveerd en toestemming is verleend.',
        bank: 'De naam van de bank waarmee de koppeling is gemaakt.',
        expire_at: [
            'De datum waarop de koppeling automatisch wordt stopgezet.',
            'Bij een koppeling met Bunq is er geen verloopdatum.',
            'De koppeling kan ook altijd tussentijds worden vernieuwd of stopgezet.',
        ].join(' '),
        iban: 'Het gekoppelde bankrekeningnummer (IBAN).',
        status: [
            'De huidige status van de koppeling, bijvoorbeeld: actief als de koppeling is ingeschakeld,',
            'vervangen als er opnieuw toestemming is gegeven voor de koppeling (vernieuwd),',
            'of uitgeschakeld als deze is stopgezet.',
        ].join(' '),
    },
};
