export default {
    title: 'Reserveringen',
    subtitle:
        'Een reservering moet geaccepteerd worden door de aanbieder. Volg op deze pagina de status van uw reserveringen.',

    breadcrumbs: {
        home: 'Home',
        reservations: 'Reserveringen',
        reservation: 'Reservering',
    },

    types: {
        active: 'Actief',
        archived: 'Archief',
    },
    empty: {
        title: 'Geen reserveringen',
        subtitle: 'Momenteel heeft u geen reserveringen',
    },
    filters: {
        search: 'Zoeken',
        search_aria_label: 'Zoeken',
        fund: 'Tegoeden',
        provider: 'Aanbieders',
        state: 'Status',
        all_funds: 'Alle tegoeden...',
        all_providers: 'Selecteer aanbieder...',
    },

    states: {
        all: 'Selecteer status...',
        pending: 'In afwachting',
        accepted: 'Geaccepteerd',
        rejected: 'Geweigerd',
        canceled: 'Geannuleerd',
    },

    card: {
        remaining_minutes: 'Nog {{ minutes }} minuten',
        value: {
            product_price: 'Productprijs',
            paid_by_self: 'Zelf betaald',
        },
        actions: {
            hide_all_details: 'Verberg alle details',
            show_all_details: 'Toon alle details',
            proceed_to_payment: 'Ga door naar betalen',
        },
        details: {
            paid_via_bank_transfer: 'Bijbetaald via bank overschrijving',
            paid_from_credit: 'Betaald vanaf tegoed',
            total_product_price: 'Volledige productprijs',
            view_all_details: 'Bekijk all details',
        },
    },
};
