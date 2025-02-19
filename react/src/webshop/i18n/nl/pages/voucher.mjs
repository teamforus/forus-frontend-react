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
        transactions: 'Uitgaven',
        subtract: 'Af',
        add: 'Bij',
        fund: 'Fonds',
        expire: 'Geldig tot en met:',
        requirements: 'Voor voorwaarden van dit aanbod neem contact op met de aanbieder.',
        info: "<span style='font-style: italic;'>Zoek je een aanbieder die niet op de kaart staat? Je kunt een aanbieder vragen om deel te nemen. Een aanbieder kan zich het hele jaar door aanmelden.</span>",
        offices: 'Aanbieders',
        voucher:
            'Print uw tegoed uit of mail hem naar uzelf toe. Ga met de QR-code naar de aanbieder en laat hem scannen.',
        office: 'Locaties waar u deze reservering kan verzilveren.',
        shopdetail: 'Informatie over de aanbieder',
        productdetail: 'Informatie over het aanbod',
        offers: 'Wilt u graag informatie over het volledige aanbod? Neem dan contact op met de aanbieder.',
    },
    card: {
        header: {
            title: 'Hoe werkt het?',
        },
        labels: {
            description:
                '1. Klik op Aanbod en kies en reserveer een activiteit.<br/>OF<br/>' +
                '2. Neem de QR-code mee naar de aanbieder. Deze scant de QR-code en reserveert uw activiteit.',
            contact_sponsor: 'Vragen? Neem contact met ons op.',
            contact_provider: 'Heeft u vragen over dit aanbod? Neem dan contact met ons op.',
            email: 'E-mailadres:',
            phone: 'Telefoonnummer:',
        },
        footer: {
            actions: {
                mail: 'E-mail naar mij',
                print: 'Print',
                share: 'Deel met aanbieder',
                open_in_me: 'Open in app',
                physical_card_use: 'Plastic pas',
            },
            tooltips: {
                mail: 'E-mail het tegoed naar uzelf',
                print: 'Print het tegoed uit',
                share: 'Deel het tegoed met de aanbieder',
                open_in_me: 'Me',
            },
        },
        qrcode: {
            description: 'Dit is uw     {{fund_name}} tegoed met een QR-code.',
            productdescription: 'Dit is uw reservering met een QR-code.',
        },
        valid_until: 'Geldig t/m',
        used: 'Gebruikt',
        expire: 'Geldig tot en met:',
        delete: 'Annuleer reservering',
        expired: 'Verlopen',
        used_on: 'Gebruikt op',
        activate_my_pass: 'Activeer mijn pas',
        lost_my_pass: 'Ik ben mijn pas kwijt',
        share: 'Delen',
        cancel: 'Annuleren',
        stop_participation: 'Stop deelname',
    },
    card_combined: {
        header: {
            title: 'Hoe werkt het?',
        },
        labels: {
            how_it_works: 'Wij hebben uw aanvraag ontvangen. U ontvangt binnen 8 weken een beslissing op uw aanvraag.',
            contact_sponsor: 'Heeft u vragen?',
            contact_sponsor_details: 'Neem dan contact met ons op.',
            redirect_to: 'Wilt u nog een vergoeding aanvragen?',
            IIT: {
                how_it_works:
                    'Wij hebben uw aanvraag ontvangen. U ontvangt binnen 8 weken een beslissing op uw aanvraag.',
                redirect_to: 'Wilt u nog een vergoeding aanvragen?',
            },
            meedoenregeling_volwassenen_ww: {
                how_it_works:
                    'Heeft u kosten gemaakt die binnen deze regeling vallen? Vraag uw kosten terug door een bon in te sturen. Na goedkeuring ontvangt u het bedrag op uw persoonlijke bankrekening.',
                redirect_to: 'Kosten terugvragen?',
            },
        },
    },
    physical_card: {
        title: 'Activeer mijn pas',
        alt: "Fysieke pas: '{[ title ]}'",
        card_number: 'Pasnummer',
        personal_date: 'Persoonsgegevens',
        less_details: 'Verberg alle details',
        more_details: 'Toon alle details',
        buttons: {
            reactivate: 'Activeer',
            lost_pass: 'Ik ben mijn pas kwijt',
        },
    },

    reimbursement: {
        title: 'Kosten terugvragen',
        description:
            'Vraag uw gemaakte kosten terug door de gegevens van uw aankoop en de rekening of kassabon in te sturen.',
        button: 'Bon insturen',
    },

    history: {
        title: 'Uitgaven',
        status: { expired: 'Verlopen' },
    },

    transactions: {
        title: 'Transacties',
        expired_on: 'Verlopen op {[ date ]}',
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
};
