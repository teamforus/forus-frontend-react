export default {
    title: '{{ title }}',
    title_physical: 'Uw {{ title }}',

    breadcrumbs: {
        home: 'Home',
        vouchers: 'Mijn tegoeden',
        voucher: '{{ title }}',
        voucher_physical: 'Uw {{ title }}',
    },

    buttons: {
        send: 'E-mail naar mij',
        details: 'Bekijk details',
    },

    labels: {
        offices: 'Aanbieders',
        office: 'Locaties waar u deze reservering kan verzilveren.',
    },

    fund: {
        logo_alt: 'Fondslogo',
        logo_alt_named: 'Logo van {{ name }}',
    },

    qr_code: {
        label: 'QR-code voor tegoed {{ number }}',
    },

    card: {
        header: {
            title: 'Hoe werkt het?',
        },
        activate_my_pass: 'Activeer mijn pas',
        lost_my_pass: 'Ik ben mijn pas kwijt',
        cancel: 'Annuleren',
        stop_participation: 'Stop deelname',
    },

    physical_card: {
        title: 'Activeer mijn pas',
        alt: "Fysieke pas: '{{ title }}'",
        card_number: 'Pasnummer',
        buttons: {
            reactivate: 'Activeer',
            lost_pass: 'Ik ben mijn pas kwijt',
        },
    },

    history: {
        title: 'Uitgaven',
        status: { expired: 'Verlopen' },
    },

    transactions: {
        title: 'Transacties',
        expired_on: 'Verlopen op {{ date }}',
        no_spending: 'Geen uitgaven',
        reservation: 'Reservering',
        bank_transfer: 'Bankoverschrijving',
        top_up: 'Opgewaardeerd',
        add: 'Toevoegen',
        subtract: 'Aftrekken',
    },

    share_voucher: {
        popup_form: {
            title: 'Let op! Stuur een bericht naar de aanbieder voordat u de QR-code deelt.',
            description:
                'U kunt uw reservering met de aanbieder delen om koop op afstand mogelijk te maken. Als het aanbod een activiteit of dienst betreft: typ in het onderstaande veld extra informatie die de aanbieder vereist voor deelname, zoals: uw naam en telefoonnummer.',
        },
        reason_placeholder: 'Bericht voor aanbieder',
        close: 'Sluiten',
        buttons: {
            submit: 'Versturen',
            confirm: 'Sluit',
            cancel: 'Annuleer',
        },
        popup_sent: {
            title_modal: 'Delen',
            title: 'Uw reservering is verstuurd naar de aanbieder.',
            description:
                'De aanbieder heeft de reservering en uw bericht ontvangen. Neem contact op met de aanbieder of ga bij de aanbieder langs om het aanbod af te nemen.',
        },
        labels: {
            send_copy: 'Stuur e-mail als bewijs ook naar uzelf',
            share_note: 'Bericht voor aanbieder',
        },
    },

    delete_voucher: {
        title: 'Annuleer reservering',
        popup_form: {
            title: 'Wilt u uw reservering voor aankoop annuleren?',
            description:
                'U kunt uw reservering annuleren om af te zien van de aankoop. Wanneer u deze aankoop niet wenst te annuleren klikt u op "sluit".',
        },
        buttons: {
            submit: 'Bevestigen',
            close: 'Sluit',
        },
    },

    overview: {
        description:
            'Lees op deze pagina hoe het tegoed werkt en bekijk het saldo en de uitgaven. Veel plezier met het tegoed!',
    },

    details: {
        valid_until: 'Dit tegoed is geldig t/m {{ date }}',
        records: {
            title: 'Gegevens',
            number: 'Nummer:',
            email: 'E-mailadres:',
        },
    },

    physical_cards: {
        title: 'Mijn fysieke passen',
    },

    how_it_works: {
        title: 'Hoe het werkt',
    },

    fund_details: {
        title: 'Fondsdetails',
        view: 'Bekijk fondsdetails',
    },

    help: {
        title: 'Vragen of hulp nodig?',
        description: 'Vragen of hulp nodig? Neem contact met ons op.',
        email: 'E-mailadres:',
        phone: 'Telefoonnummer:',
    },

    actions: {
        view_all_products: 'Bekijk alle producten',
        save_qr: 'Sla QR-code op',
        declaration_request: 'Declaratieverzoek',
        share_with_provider: 'Deel QR-code met aanbieder',
        choose_action: {
            title: 'Kies een actie',
            description:
                'Selecteer een actie om verder te gaan. Massa risus dis nunc viverra quis imperdiet. Dictumst non est tortor facilisi egestas.',
        },
    },
};
