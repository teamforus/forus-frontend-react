export default {
    header: {
        title: 'Reserveringen',
    },
    filters: {
        fund: 'Fonds',
        product: 'Aanbod',
        status: 'Status',
        search: 'Zoeken',
        from: 'Vanaf',
        to: 'Tot en met',
        state: 'Status',
    },
    labels: {
        code: 'Nummer',
        product: 'Aanbod',
        price: 'Bedrag',
        customer: 'Gegevens',
        created_at: 'Aangemaakt op',
        state: 'Status',
        actions: 'Opties',
        amount_extra: 'Bijbetaald',
        provider: 'Naam aanbieder',
        transaction_id: 'Transactie ID',
        transaction_state: 'Transactie status',
    },
    tooltips: {
        number: 'Het unieke nummer van de reservering binnen het Forus platform. Dit nummer wordt automatisch gegenereerd.',
        product: 'Het aanbod waar een reservering voor is gemaakt met de bijbehorende prijs van dit aanbod.',
        price: 'Het bedrag vanuit het tegoed waar een reservering mee is gemaakt.',
        customer:
            'De gegevens van de deelnemer die een reservering heeft gemaakt. Dit zijn o.a. het e-mailadres, de voornaam en de achternaam.',
        reserved_at: 'De datum waarop de reservering is gemaakt.',
        status: 'De huidige status van de reservering.',
        amount_extra: 'Het bedrag dat door de deelnemer is bijbetaald.',
    },
};
