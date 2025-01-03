export default {
    modal_section: {
        type_selection: {
            title: 'Gebruik mijn QR-code',
            subtitle: 'Dit zijn de opties om uw QR-code mee te nemen naar de aanbieder:',
            card_old: {
                title: 'Oude pas opnieuw activeren',
                description: 'Heb je al een pas?<br/>Activeer je pas opnieuw.',
                success: 'Pas gekoppeld!',
            },
            card_new: {
                title: 'Bestel een pas',
                description: 'Heb je nog geen pas?<br/>Bestel een nieuwe pas.',
            },
        },
        link_card: {
            title: 'Activeer je oude pas',
            subtitle: 'Voer je persoonlijke klantcode in',
            description: [
                'Op je pasje staat een QR-code, hieronder staat je persoonlijke code.',
                'Als je de oude pas opnieuw activeert kun je deze blijven gebruiken.',
                'Hulp nodig?  Bel 14 050 maandag t/m vrijdag 9.00 tot 12.00.',
            ].join('<br/>'),
        },
        request_new_card: {
            title: 'Bestel een pas',
            subtitle: 'Je digitale pas:',
            description: 'Vul je adresgegevens in. De pas wordt via de post naar je verstuurd.',
            order: 'Bestellen',
            postcode: 'Postcode',
            postcode_placeholder: 'Postcode',
            address: 'Straatnaam',
            address_placeholder: 'Straatnaam',
            city: 'Plaats',
            city_placeholder: 'Plaats',
            house: 'Huisnummer',
            house_placeholder: 'Huisnummer',
            house_addition: 'Huisnummer toevoeging',
            house_addition_placeholder: 'Huisnummer toevoeging',
            email_to_me: 'E-mail naar mij',
            print_pass: 'QR-code printen',
            open_in_app: 'Open in app',
        },
        link_card_success: {
            title: 'Pas gekoppeld!',
            description: 'Je pas is gekoppeld aan je {{fundName}}!',
        },
        confirm_card: {
            header: 'Controleer de gegevens',
            title: 'Controleer de gegevens:',
            description: 'Klik na controle op bevestigen of pas de gegevens aan.',
        },
        link_card_unlink: {
            title: 'Blokkeer je pas',
            buttons: {
                submit: 'Blokkeer',
                cancel: 'Annuleer',
            },
        },
        request_card_success: {
            title: 'Je pas is besteld!',
            heading: 'De pas wordt verstuurd naar het adres:',
            description: 'Je hebt een e-mail ontvangen met de bevestiging van je bestelling.',
        },
    },
    buttons: {
        confirm_card: {
            adjust: 'Aanpassen',
            submit: 'Bevestigen',
        },
        close: 'Sluiten',
        link_card: {
            submit_code: 'Bevestigen',
        },
        request_new_card: {
            order_by_email: 'Per post bestellen',
            confirm: 'Bevestigen',
        },
    },
};
