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
            name: 'Naam',
            fund: 'Fonds',
            implementation: 'Implementatie',
            steps: 'Aantal stappen',
            status: 'Status',
            created_at: 'Aangemaakt op',
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
    },
    fund_provider_funds: {
        labels: {
            fund_name: 'Fonds',
            status: 'Status',
            budget: 'Budget scannen',
            products: 'Aanbod scannen',
            hide_on_webshops: 'Verborgen op webshop',
        },
    },
};
