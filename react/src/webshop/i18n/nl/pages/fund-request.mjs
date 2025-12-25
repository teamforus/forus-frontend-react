export default {
    title: 'Aanvraag #{{ id }}',
    subtitle:
        'Op deze pagina staat informatie over de aanvraag. De status, de ingevulde gegevens en eventuele extra vragen zijn hier te bekijken.',
    breadcrumbs: {
        home: 'Home',
        fund_request: 'Aanvraag #{{ id }}',
    },

    details: {
        status: 'Status Aanvraag:',
        created_at: 'Ingediend op:',
        fund_name: 'Naam van het fonds:',
    },

    clarifications: {
        title: 'Openstaande vragen ({{ count }})',
        subtitle:
            'De aanvraag is nog niet compleet. Er is extra informatie nodig. Bekijk de vraag hieronder en klik op de knop om te antwoorden.',
        info_requested: 'Extra vraag gesteld',
        info_responded_count: '{{count}} bericht',
        provide_info: 'Beantwoord de vraag',
    },

    received: {
        title: 'Ontvangen',
    },

    records: {
        title: 'Mijn gegevens ({{ count }})',
        subtitle: 'Bekijk hieronder de persoonlijke gegevens die zijn ingevuld bij de aanvraag.',
    },

    record: {
        view: 'Bekijk',
        new: 'nieuw bericht',
        new_message: 'Nieuw verzoek',
        answer: 'Beantwoord',
        my_answer: 'Mijn antwoord',
        my_message: 'Mijn bericht',
        answer_btn: 'Beantwoord deze vraag',
        answer_btn_info:
            'Klik op de button ”<strong>Beantwoord deze vraag</strong>” om de extra informatie te versturen. De informatie wordt toegevoegd aan de aanvraag.',
        cancel_btn: 'Annuleer',
        send_btn: 'Verzend',
        answer_question_label: 'Beantwoord de vraag',
        add_document_label: 'Voeg een document toe',
        optional_label: '(optioneel)',
    },

    modal: {
        title: 'Extra vraag',
    },

    labels: {
        question: 'Gestelde vraag',
        question_from: 'Vraag van {{ name }}',
        date: 'Datum:',
    },

    declined: {
        title: 'Reden van weigeren',
        no_note: 'Geen notitie',
    },

    digid_expired: {
        title: 'DigiD sessie verlopen',
        description: 'Log opnieuw in met DigiD en begin opnieuw met de aanvraag.',
        sign_in: {
            title: 'DigiD',
            description: 'Log opnieuw in met DigiD om opnieuw te beginnen.',
        },
    },

    bsn_warning: {
        description:
            'Let op! U dient het aanvraagformulier afgerond te hebben voor <strong>{{value}}</strong>, anders dient opnieuw in te loggen met DigiD en opnieuw te beginnen met de aanvraag.',
    },

    steps: {
        step: 'Stap {{step}}',
        step_out_of: 'Stap {{step}}',
    },

    buttons: {
        back: 'Terug',
        send: 'Verzenden',
    },

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
                apply: 'Vraag aan',
            },
        },
        fund_request_overview: {
            application_summary: 'Aanvraag overzicht',
            check_information:
                'Controleer hieronder of de gegevens die u heeft ingevuld juist zijn. U kunt terug naar eerdere stappen met de knop ',
            previous_step: 'Vorige stap.',
            correct_information: 'Kloppen de gegevens? Klik dan op de knop ',
            submit_application: 'Vraag aan.',
            contact_info: 'Opgegeven contactgegevens:',
            none: 'Geen',
        },
        fund_request_email_setup: {
            email_sent_screen: 'Er is een e-mail te bevestiging verstuurd',
            email_sent: 'E-mail verstuurd',
            sign_up_with_email: 'Aanmelden met e-mailadres',
            email_required: 'Om verder te gaan met de aanvraag dient u uw e-mailadres op te geven',
            continue_without_email: 'Verder zonder e-mail',
            warning: 'Let op!',
            no_email_info:
                'Als u geen e-mailadres achterlaat ontvangt u geen essentiële berichten zoals de e-mail met de QR-code of wanneer er een transactie is geweest. Daarnaast kan u alleen inloggen met DigiD.',
            skip: 'Overslaan',
        },
        fund_request_step_done: {
            sign_up: 'Aanmelden',
            error_occurred: 'Er is een fout opgetreden tijdens het aanvragen.',
            reason: 'Reden:',
            leave_form: 'Verlaat formulier',
            application_received: 'Aanvraag ontvangen',
            sent: 'Verzonden!',
            application_processing:
                'Je aanvraag is ontvangen. De aanvraag wordt binnen 10 werkdagen verwerkt. Je ontvangt hierover een e-mail.',
            back: 'Terug',
        },
        fund_request_step_criteria: {
            make_a_choice: 'Maak een keuze',
        },
        fund_request_contact_info: {
            title: 'Contactgegevens',
        },
        fund_request_physical_card_request: {
            title: 'Adresgegevens',
            heading: 'Voer uw adres in',
            description: 'We sturen uw fysieke kaart naar het door u opgegeven adres zodra deze klaar is voor gebruik.',
            labels: {
                street: 'Straat',
                house_nr: 'Huisnummer',
                house_nr_addition: 'Huisnummertoevoeging',
                postal_code: 'Postcode',
                city: 'Plaats',
            },
        },
        fund_request_confirm_criteria: {
            confirm_income: 'Bevestig uw inkomen',
            declare_conditions:
                'U staat op het punt om een meedoenregeling aan te vragen. U dient te verklaren dat u aan de voorwaarden voldoet.',
            confirm_meet_conditions: 'Ik verklaar dat ik voldoe aan de bovenstaande voorwaarden.',
            provide_correct_info:
                'Ik weet dat het verstrekken van onjuiste informatie strafbaar is, dat ik een onterecht of een teveel ontvangen vergoeding terug moet betalen en dat ik een boete kan krijgen.',
            processing_request: 'Een moment geduld, het verzoek wordt verwerkt.',
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
            heading: {
                pending: 'De vragen die zijn beantwoord tijdens de aanvraag:',
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
    options: {
        no: 'Nee',
    },
    prefills: {
        title: 'Check that your information is correct.',
        subtitle: 'If your information is incorrect, please contact us using the button below.',
        children: 'Children',
        child: 'Child',
        partner: "Partner's details",
    },
    cards: {
        back: 'Terug',

        taken_by_partner: {
            title: 'Dit tegoed is al geactiveerd',
            heading: 'Aanvraag mislukt',
            description:
                'U krijgt deze melding omdat het tegoed is geactiveerd door een <br /> familielid of voogd. <br /><br /> De tegoeden zijn beschikbaar in het account van de persoon die <br /> deze als eerste heeft geactiveerd.',
            contacts: 'Neem voor vragen contact op met {{name}}.',
        },
        not_filled_required_criteria: {
            title: 'Dit tegoed is al geactiveerd',
            heading: 'Aanvraag mislukt',
            description:
                'U krijgt deze melding omdat het tegoed is geactiveerd door een <br /> familielid of voogd. <br /><br /> De tegoeden zijn beschikbaar in het account van de persoon die <br /> deze als eerste heeft geactiveerd.',
            contacts: 'Neem voor vragen contact op met {{name}}.',
        },
        connection_error: {
            title: 'Dit tegoed is al geactiveerd',
            heading: 'Aanvraag mislukt',
            description:
                'U krijgt deze melding omdat het tegoed is geactiveerd door een <br /> familielid of voogd. <br /><br /> De tegoeden zijn beschikbaar in het account van de persoon die <br /> deze als eerste heeft geactiveerd.',
            contacts: 'Neem voor vragen contact op met {{name}}.',
        },
        not_found: {
            title: 'Dit tegoed is al geactiveerd',
            heading: 'Aanvraag mislukt',
            description:
                'U krijgt deze melding omdat het tegoed is geactiveerd door een <br /> familielid of voogd. <br /><br /> De tegoeden zijn beschikbaar in het account van de persoon die <br /> deze als eerste heeft geactiveerd.',
            contacts: 'Neem voor vragen contact op met {{name}}.',
        },
    },
};
