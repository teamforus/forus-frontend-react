export default {
    title: 'Kosten terugvragen',
    title_edit: `Declaratienummer: #{{code}}`,
    title_create: 'Nieuwe kosten terugvragen',
    subtitle: 'Een actief tegoed is nodig om een declaratie in te dienen.',
    breadcrumbs: {
        home: 'Home',
        reimbursements: 'Kosten terugvragen',
        reimbursement: 'Bon insturen',
    },
    no_email: {
        title: 'Er is geen e-mailadres bekend.',
        description:
            'Indien er vragen zijn over de declaratie, kan er geen contact worden opgenomen.<br /> Is er geen mogelijkheid om een e-mailadres op te geven? Geef dan andere contactgegevens op.<br /><br />',
        add_email: 'E-mailadres toevoegen',
        skip_email: 'Doorgaan zonder e-mailadres',
    },
    item: {
        number: 'Declaratienummer:',
        states: {
            accepted: 'Geaccepteerd',
            pending: 'In afwachting',
            declined: 'Geweigerd',
            declined_at: 'Geweigerd op:',
            expired: 'Verlopen',
            expired_at: 'Verlopen op:',
        },
        labels: {
            submitted_at: 'Ingediend op:',
            approved_at: 'Uitbetaald op:',
            accepted_at: 'Geaccepteerd op:',
            declined_at: 'Afgewezen op:',
        },
        buttons: {
            cancel: 'Annuleren',
        },
    },
    details: {
        title: 'Declaratie gegevens',
        code: 'Nummer: #{{code}}',
        labels: {
            title: 'Titel',
            amount: 'Bedrag',
            sponsor: 'Declareren bij',
            fund: 'Regeling',
            iban: 'IBAN',
            iban_name: 'Tenaamstelling van',
            description: 'Opmerking',
            decline_reason: 'Decline reason',
        },
        buttons: {
            edit: 'Wijzigen',
            cancel: 'Annuleren',
        },
    },
    form: {
        file_upload_title: 'Upload uw bon, rekening of factuur',
        voucher: 'Tegoed',
        voucher_tooltip: 'Kies het tegoed dat u wilt gebruiken voor het terugvragen van uw kosten.',
        title: 'Titel van de declaratie',
        amount: 'Bedrag €',
        description: 'Omschrijving',
        iban: 'IBAN nummer',
        iban_tooltip: 'IBAN-nummer moet het formaat NL89BANK0123456789 hebben.',
        iban_name: 'Naam rekeninghouder',
    },
    form_buttons: {
        cancel: 'Annuleren',
        save_for_later: 'Opslaan voor later',
        submit: 'Indienen',
    },
    empty: {
        title: 'Geen declaraties',
        description: 'Momenteel heeft u geen declaraties',
        button: 'Bon insturen',
    },
    states: {
        all: 'Alle',
        pending: 'In afwachting',
        approved: 'Uitbetaald',
        declined: 'Afgewezen',
        draft: 'Nog niet ingediend',
    },
    types: {
        active: 'Actief',
        archived: 'Archief',
    },
    create_card: {
        title: 'Kosten terugvragen',
        button: 'Bon insturen',
    },
};
