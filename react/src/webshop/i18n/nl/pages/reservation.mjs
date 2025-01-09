export default {
    details: {
        title: 'Details van de reservering',
        loading: 'Loading',
        labels: {
            id: 'ID',
            title: 'Titel',
            fund_name: 'Fonds naam',
            amount: 'Betaald van tegoed',
            amount_extra: 'Zelf bijbetaald',
            price: 'Bedrag',
        },
    },
    labels: {
        code: 'Reserveringsnummer:',
        cancel: 'Annuleren',
        pay_extra: 'Ga door naar betalen',
        status: {
            canceled: 'Geannuleerd door aanbieder',
            canceled_by_client: 'Geannuleerd door aanvrager',
            accepted: 'Geaccepteerd',
            pending: 'In afwachting',
            rejected: 'Geweigerd',
            expired: 'Verlopen',
            waiting: 'Wachten op betaling',
            canceled_payment_expired: 'Bijbetaling verlopen',
            canceled_payment_failed: 'Bijbetaling mislukt',
            canceled_payment_canceled: 'Bijbetaling geannuleerd',
        },
        rejected_at: 'Geweigerd op:',
        canceled_at: 'Geannuleerd op:',
        expired_at: 'Verlopen op:',
        created_at: 'Aangemaakt op:',
    },
    extra_amount: {
        status: 'Status',
        refunded: 'Terugbetaald',
        date: 'Datum',
        mount: 'Zelf bijbetaal',
        method: 'Methode',
    },
    extra_amount_refund: {
        title: 'Details van terugbetaling',
        date: 'Datum',
        amount: 'Bedrag',
        state: 'Status',
    },
    expiring:
        'Houd er rekening mee dat er nog <strong>{expiresIn} minuten</strong> over zijn om de bijbetaling uit te voeren. Anders zal de reservering automatisch worden geannuleerd.',
    expired:
        'Sorry, uw reservering is tijdens het afrekenproces geannuleerd omdat het geselecteerde product uitverkocht is.',
};
