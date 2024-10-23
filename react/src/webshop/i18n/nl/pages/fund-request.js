export default {
    // VALIDATION REQUEST FOR FUNDS = fund_request.pug
    approved_request_exists: 'Er bestaat al een goedgekeurde aanvraag. Neem contact op met de beheerder.',
    fund_not_active: 'Het fonds waar u voor zich probeert aan te melden is niet actief.',
    bsn_record_is_mandatory: 'Een BSN is verplicht voor het doen van een aanvraag.',
    invalid_endpoint: 'Geen toegang tot deze aanvraag',
    not_requester: 'U bent niet de eigenaar van deze aanvraag.',
    sign_up: {
        block_title: '{{ fund_name }} aanvragen',
        pane: {
            header_title: 'Overzicht',
            text: 'We hebben nog wat gegevens nodig. Doorloop de volgende stappen:',
            criterion_more: "'{{ name }}' moet meer dan {{ value }} zijn.",
            criterion_more_or_equal: "'{{ name }}' moet meer of gelijk zijn aan {{ value }}.",
            criterion_less: "'{{ name }}' moet minder dan {{ value }} zijn.",
            criterion_less_or_equal: "'{{ name }}' moet minder of gelijk zijn aan {{ value }}.",
            criterion_same: "'{{ name }}' moet {{ value }} zijn.",
            criterion_any: "'{{ name }}' kan elke waarde zijn.",
            footer: {
                prev: 'Vorige stap',
                next: 'Volgende stap',
            },
        },
        header: {
            main: '{{ fund_name }} aanvraag',
            title: 'Aanmelden',
            title_log_digid: 'Eenmalig inloggen met DigiD',
        },
        fund_already_applied: {
            title: {
                pending: 'De aanvraag is in behandeling',
                approved: 'De aanvraag is goedgekeurd',
                declined: 'De aanvraag is afgekeurd',
                disregarded: 'De aanvraag is afgekeurd',
                approved_partly: 'De aanvraag is deels goedgekeurd',
            },
            subtitle: {
                pending: 'De aanvraag is ingediend op {{ date }}',
                approved: 'De aanvraag is goedgekeurd op {{ date }}',
                declined: 'De aanvraag is afgewezen op {{ date }}',
                disregarded: 'De aanvraag is afgewezen op {{ date }}',
                approved_partly: 'De aanvraag is deels goedgekeurd op {{ date }}',
            },
            information: [
                'De aanvraag wordt zo snel mogelijk beoordeeld, dit kan enkele weken duren. ',
                'Als de aanvraag niet compleet is kan het zijn dat er meer informatie nodig is. ',
                'In dit geval wordt er een bericht verstuurd per e-mail. Druk op de knop hieronder om de status van de aanvraag te bekijken.',
            ].join(' '),
            buttons: {
                open_fund_request: 'Bekijk de aanvraag',
            },
        },
        subtitles: {
            step_1: 'Via dit online formulier kunt u zich aanmelden voor beschikbare fondsen. ',
            step_2: 'Er wordt gekeken of u al aan voorwaarden voldoet, en u kan tussentijds afbreken en op een ander moment verder gaan.',
        },
        labels: {
            has_app: 'Aanmelden met Me-app >',
            restore_with_digid_formal: 'Vergeten welk e-mailadres u heeft gebruikt? >',
            restore_with_digid_informal: 'Vergeten welk e-mailadres je hebt gebruikt? >',
            no_app: 'Ik wil inloggen met mijn e-mailadres >',
        },
        app: {
            title: 'Login met de Me-app',
            description_top: ['Scan de QR-code aan de rechterzijde met de QR-scanner in de Me-app.'].join('\n'),
            description_bottom: [
                'De Me-app wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen en tegoeden te beheren.',
            ].join('\n'),
        },
        digid: {
            title: 'Account herstel',
            description: 'Herstel account door opnieuw in te loggen met DigiD',
            button: 'Login',
        },
        record_checkbox: {
            default: 'Ik verklaar aan de bovenstaande voorwaarden te voldoen',
            children_nth: 'Ik verklaar dat ik {{value}} kinderen heb',
            social_assistance_standard:
                'Ik ga ermee akkoord dat mijn inkomsten worden gecontroleerd. Dit gebeurt door het vergelijken van mijn gegevens in de gemeentelijke bestanden of door het opvragen van specificaties.',
            kindpakket_eligible: 'Ja, ik verklaar dat ik recht heb op kindpakket.',
            kindpakket_2018_eligible: 'Ja, ik verklaar dat ik recht heb op kindpakket.',
        },
    },
};
