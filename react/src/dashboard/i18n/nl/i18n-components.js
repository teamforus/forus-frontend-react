export default {
    organization_funds: {
        title: 'Fondsen',
        buttons: {
            add: 'Fonds toevoegen',
            edit: 'Instellingen',
            view: 'Bekijken',
            delete: 'Verwijderen',
            top_up: 'Budget toevoegen',
            archive: 'Archiveren',
            restore: 'Herstellen',
            criteria: 'Voorwaarden',
            statistics: 'Statistieken',
            top_up_history: 'Bekijk aanvullingen',
            security: 'Beveiliging',
        },
        states: {
            active: 'Actief',
            paused: 'Gepauzeerd',
            closed: 'Gestopt',
            archived: 'Gearchiveerd',
            waiting: 'Wachtend',
        },
        labels: {
            name: 'Naam',
            remaining: 'Resterend bedrag',
            requester_count: 'Aanvragers',
            implementation: 'Implementatie',
            status: 'Status',
            actions: 'Actie',
            type: 'Soort',
        },
        tooltips: {
            name: 'Naam van het fonds.',
            remaining: 'Totaal resterend bedrag op het fonds.',
            requester_count: 'Aantal inwoners met een aanvraag.',
            implementation: 'Gekoppelde implementatie/webshop.',
            status: 'Status van het fonds.',
        },
        filters: {
            search: 'Zoeken',
            budget_left: 'Resterend',
            budget_left_min: '0',
            budget_left_max: 'Alles',
            implementation: 'Implementatie',
            state: 'Status',
        },
    },
    organization_funds_forms: {
        columns: {
            name: 'Naam',
            fund: 'Fonds',
            implementation: 'Implementatie',
            steps: 'Aantal stappen',
            status: 'Status',
            created_at: 'Aangemaakt op',
        },
        tooltips: {
            name: 'Naam van het E-formulier.',
            fund: 'Gekoppeld fonds.',
            implementation: 'Gekoppelde webshop.',
            steps: 'Aantal stappen/voorwaarden.',
            status: 'Status van het formulier.',
            created_at: 'Datum en tijdstip van creatie.',
        },
        filters: {
            search: 'Zoeken',
            implementation: 'Implementatie',
            state: 'Status',
        },
    },
    fund_criteria_editor: {
        buttons: {
            add_criteria: 'Voeg nieuwe voorwaarden toe',
            save: 'Bevestigen',
        },
    },
    implementation_block_editor: {
        fix_validation_errors: 'Mislukt! Er gaat iets mis.. U heeft een foutmelding op een invoerveld.',
        buttons: {
            save: 'Bevestigen',
            add_implementation_block: 'Blok toevoegen',
        },
        item: {
            buttons: {
                expand: 'Uitklappen',
                collapse: 'Inklappen',
                delete: 'Verwijderen',
            },
        },
    },
    fund_criteria_editor_item: {
        buttons: {
            edit: 'Aanpassen',
            apply: 'Bevestigen',
            cancel: 'Annuleren',
            delete: 'Verwijderen',
        },

        allow_attachments: 'Bijlage uploaden',
        validation: 'Validatie',
        optional: 'Optioneel',
    },
    dropdown: {
        export: 'Exporteren ({{total}})',
        yes: 'Ja',
        no: 'Nee',
        no_options: 'Geen opties',
    },
    feedback: {
        title: 'Feedback',
        labels: {
            email: 'Email',
            title: 'Onderwerp',
            content: 'Bericht',
            urgency: 'Urgentie',
            contact: 'Contact',
            use_customer_email: 'Ja, Forus mag per e-mail contact met mij opnemen over deze feedback',
        },
        buttons: {
            cancel: 'Annuleren',
            confirm: 'Bevestigen',
            back: 'Terug',
            send: 'Verzenden',
        },
        submit_success: {
            title: 'Uw feedback is verzonden',
            info: 'Bedankt, uw mening is belangrijk voor ons.',
        },
        submit_failure: {
            title: 'Uw feedback is niet verzonden',
            info: 'Probeer het later opnieuw',
        },
    },
    faq_editor: {
        fix_validation_errors: 'Mislukt! Er gaat iets mis.. U heeft een foutmelding op een invoerveld.',
        buttons: {
            save: 'Bevestigen',
            add_question: 'Vraag toevoegen',
            add_title: 'Voeg titel toe',
        },
        item: {
            buttons: {
                expand: 'Uitklappen',
                collapse: 'Inklappen',
                delete: 'Verwijderen',
            },
        },
    },
    fund_provider_products: {
        labels: {
            used: 'Gebruikt',
            reserved: 'Gereserveerd',
            price: 'Prijs',
            product_details: 'Aanbod details',
            acceptance: 'Soort goedkeuring',
            user_price: 'Prijs voor de aanvrager',
            limit_total: 'Totaal limiet',
            limit_per_user: 'Limiet per aanvrager',
            messages: 'Berichten',
            status: 'Status',
            expiry_date: 'Verloopdatum',
            created_on: 'Aangemaakt op',
            updated_on: 'Aangepast op',
        },
        tooltips: {
            used: 'Aantal keer dat aanbod is gebruikt.',
            reserved: 'Aantal keer dat aanbod is gereserveerd.',
            price: 'Prijs van het aanbod.',
            product_details: 'Details van het aanbod: naam, prijs, totaal aantal producten, aantal gebruikt.',
            acceptance: 'Type goedkeuring (bijv. subsidie met bedrag vanuit gemeente).',
            user_price: 'Bedrag dat vanuit tegoed wordt besteed.',
            limit_total: 'Totaal aantal keer dat het aanbod gebruikt kan worden.',
            limit_per_user: 'Totaal aantal keer dat het aanbod gebruikt kan worden.',
            messages: 'Berichten tussen aanbieder en gemeente.',
            status: 'Status van het aanbod (bijv. in afwachting, actief).',
            expiry_date: 'Vervaldatum van het aanbod.',
            created_on: 'Goedkeuringsdatum aanbod.',
            updated_on: 'Laatste wijzigingsdatum.',
        },
    },
    fund_provider_funds: {
        labels: {
            fund_name: 'Fonds',
            status: 'Status',
            budget: 'Budget scannen',
            products: 'Aanbod scannen',
            hide_on_webshops: 'Verborgen op webshop',
        },
        tooltips: {
            fund_name:
                'Het logo van de sponsor, de naam van de regeling en de naam van de aanbieder die zich heeft aangemeld voor het fonds.',
            status: 'De status van de aanmelding van de aanbieder voor het fonds.',
            budget: 'Geeft aan of de aanbieder is geaccepteerd voor het scannen van tegoeden (Ja/Nee).',
            products:
                'Geeft aan of de aanbieder is geaccepteerd voor al het aanbod of dat het aanbod individueel dient te worden goedgekeurd door de sponsor.',
            hide_on_webshops: 'De optie voor de sponsor om de aanbieder van de webshop te verbergen na goedkeuring.',
        },
    },
    fund_provider_offices: {
        labels: {
            address: 'Adres',
            phone: 'Telefoonnummer',
        },
        tooltips: {
            address: 'De adresgegevens van de vestiging die de aanbieder heeft aangemaakt.',
            phone: 'Het telefoonnummer dat is opgegeven door de aanbieder voor contact.',
        },
    },
    fund_provider_employees: {
        labels: {
            email: 'E-Mailadres',
        },
        tooltips: {
            email: 'De e-mailadressen van alle medewerkers die medewerker zijn van de aanbieder organisatie.',
        },
    },
};
