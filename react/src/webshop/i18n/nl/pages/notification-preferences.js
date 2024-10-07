export default {
    title_preferences: 'Notificatievoorkeuren',
    title_emails_turned_on: 'Inschrijven voor alle e-mails',
    title_emails_turned_of: 'Uitschrijven voor alle e-mails',
    title_email_preferences: 'E-mail notificaties',
    title_push_preferences: 'Push notificaties via app',
    subscribe_desc_formal:
        'Met dit e-mailadres "{{email}}" bent u momenteel voor alle notificaties uitgeschreven. Wanneer u notificaties wilt ontvangen, kunt u dit hieronder per notificatie instellen.',
    subscribe_desc_informal:
        'Met dit e-mailadres "{{email}}" ben je momenteel voor alle notificaties uitgeschreven. Wanneer je notificaties wilt ontvangen, kun je dit hieronder per notificatie instellen.',

    no_email_title: 'You currently have no email associated with your account',
    no_email_description: 'Please add en email address to receive email notifications.',
    no_email_button: 'Add email',

    unsubscribe: 'Uitschrijven voor alle e-mail notificaties',
    unsubscribe_desc: 'Ik wil me uitschrijven van alle e-mail notificaties.',
    unsubscribe_button: 'Uitschrijven',
    subscribe: 'Ja, ik wil notificaties ontvangen.',
    errors: {
        not_found: 'Deze token is ongeldig',
        expired: 'Deze token is verlopen',
        'not-pending': 'De notificatie instellingen zijn al aangepast via deze link',
    },
    types: {
        digest: {
            daily_requester: {
                title: 'Samenvatting van nieuw aanbod op de webshop',
                description:
                    'Ontvang een e-mail samenvatting met welke aanbiedingen en aanbieders zijn toegevoegd aan de webshop.',
            },
        },
        funds: {
            new_fund_started: {
                title: 'Fonds is van start gegaan',
                description:
                    'Ontvang een e-mail notificatie wanneer er een fonds waar u voor bent aangemeld is gestart en u klanten kunt verwachten.',
            },
            new_fund_applicable: {
                title: 'Nieuw fonds waar u zich voor kunt aanmelden',
                description:
                    'Ontvang een e-mail notificatie wanneer er een nieuw fonds is aangemaakt waarvoor u zich kunt aanmelden.',
            },
            balance_warning: {
                title: 'Actie vereist: saldo aanvullen',
                description:
                    'Ontvang een e-mail notificatie wanneer het saldo voor een fonds lager is dan de vooraf ingestelde grens.',
            },
            fund_expires: {
                title: 'Herinnering einddatum tegoed',
                description: 'Ontvang een e-mail notificatie 1 maand voor de einddatum.',
            },
            product_added: {
                title: 'Nieuwe aanbieding toegevoegd',
                description: 'Ontvang een e-mail notificatie wanneer er een nieuwe aanbieding is toegevoegd.',
            },
            new_fund_created: {
                title: 'Nieuw fonds aangemaakt',
                description: 'Ontvang een e-mail notificatie wanneer er een nieuw fonds is aangemaakt.',
            },
            product_reserved: {
                title: 'Aanbieding gereserveerd',
                description: 'Ontvang een e-mail notificatie wanneer een aanbieding is gereserveerd.',
            },
            product_sold_out: {
                title: 'Aanbieding uitverkocht',
                description: 'Ontvang een e-mail notificatie wanneer een aanbieding is uitverkocht.',
            },
            provider_applied: {
                title: 'Aanmelding aanbieder',
                description:
                    'Ontvang een e-mail notificatie wanneer een aanbieder zich heeft aangemeld voor een fonds.',
            },
            provider_approved: {
                title: 'Aanmelding aanbieder geaccepteerd',
                description: 'Ontvang een e-mail notificatie wanneer een aanbieder voor een fonds is geaccepteerd.',
            },
            provider_rejected: {
                title: 'Aanmelding aanbieder afgewezen',
                description: 'Ontvang een e-mail notificatie wanneer een aanbieder voor een fonds is afgewezen.',
            },
        },
        validations: {
            new_validation_request: {
                title: 'Nieuw validatieverzoek',
                description: 'Ontvang een e-mail notificatie wanneer er een nieuw validatieverzoek is gedaan.',
            },
            you_added_as_validator: {
                title: 'Toegevoegd als beoordelaar',
                description: 'Ontvang een e-mail notificatie wanneer u als beoordelaar aan een fonds bent toegevoegd.',
            },
        },
        vouchers: {
            payment_success: {
                title: 'Betaling gelukt',
                description: 'Ontvang een e-mail notificatie wanneer een betaling is gelukt.',
            },
            send_voucher: {
                title: 'Stuur een tegoed naar uzelf',
                description: 'Ontvang een e-mail notificatie wanneer u een tegoed naar uzelf verstuurt.',
            },
            share_product: {
                title: 'Reservering aanbieding gedeeld',
                description:
                    'Ontvang een e-mail notificatie wanneer er een reservering voor een aanbieding met u is gedeeld.',
            },
        },
        voucher: {
            assigned: {
                title: 'Nieuw tegoed geactiveerd of toegekend.',
                description: 'Ontvang een push notificatie bij een nieuw tegoed.',
            },
            transaction: {
                title: 'Betaling gelukt',
                description: 'Ontvang een push notificatie wanneer een betaling is gelukt.',
            },
        },
    },
    push_notifications_preferences: {
        title: 'Instellingen voor weergavetijd van meldingen',
    },
    push_notifications_dismiss_time: {
        webshop: {
            title: 'Algemene meldingen automatisch sluiten',
            description: 'Verberg systeemmeldingen automatisch nadat een actie is uitgevoerd.',
        },
        bookmarks: {
            title: 'Meldingen over favoriete producten automatisch sluiten',
            description:
                'Verberg de systeemmeldingen automatisch nadat favoriete producten worden toegevoegd of verwijderd.',
        },
    },
};
