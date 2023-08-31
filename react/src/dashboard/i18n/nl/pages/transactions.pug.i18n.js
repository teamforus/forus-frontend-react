module.exports = {
    header: {
        title: "Individuele transacties",
        titleBulks: "Bulktransacties",
    },
    labels: {
        id: "ID",
        uid: "UID",
        price: "Bedrag",
        description: "Beschrijving",
        customer: "Klant",
        date: "Datum",
        action: "Actie",
        refund: "Terugbetalen",
        chargeid: "Kopieer het transactienummer",
        connections: "Connectie",
        details: "Bekijk transactiedetails",
        results: "x resultaten",
        payment: "Betaling -",
        fund: "Fonds",
        status: "Status",
        provider: "Aanbieder",
        product_id: "Aanbod ID",
        product_name: "Aanbod naam",
        search: "Zoeken",
        from: "Vanaf",
        bulk: "Bulk",
        to: "Tot en met",
        state: "Status",
        fund_state: "Status fonds",
        amount: "Bedrag",
        quantity: "Aantal",
        quantity_min: "0",
        quantity_max: "Alles",
        amount_min: "0",
        amount_max: "Alles",
        total_amount: "Som van transacties <strong>{{ total_amount }}</strong>",
        bulk_total_amount: [
            "Bundel <strong>{{ total }}</strong> individuele transacties tot één bulktransactie ter waarde van <strong>{{ total_amount }}</strong>.",
            "Gebeurt automatisch dagelijks om 09:00. Tenzij anders is ingesteld of bulks alleen handmatig aangemaakt kunnen worden."
        ].join("</br>"),
        target: "Target",
        transfer_in: 'Transactie in (dagen)',
        transfer_in_min: '0',
        transfer_in_max: '14',
    },
    buttons: {
        previous: "Vorige",
        next: "Volgende",
        view: "Bekijk",
        export_csv: "Exporteer als .CSV",
        export_xls: "Exporteer als .XLS",
    },
    paginator: {
        one: "1",
        two: "2",
        three: "3",
    },
    export: {
        labels: {
            date: 'Datum',
            amount: 'Bedrag',
            fund: 'Fonds',
            provider: 'Aanbieder',
            payment_id: 'Betalingskenmerk',
            state: 'Status'
        }
    },
    csv: {
        default_note: ''
    },
};
