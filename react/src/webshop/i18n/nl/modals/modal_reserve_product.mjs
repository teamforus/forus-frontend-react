export default {
    close: 'Sluiten',
    email_setup_title: 'E-mailadres toevoegen',
    email_setup_description: 'Voeg uw e-mailadres toe om berichten te kunnen ontvangen.',
    add_email: 'Toevoegen',
    cancel: 'Annuleren',
    skip: 'Overslaan',
    voucher_image_alt: 'Tegoeden',
    header: {
        title: 'Maak een reservering',
    },

    description_formal: [
        'U gebruikt uw <strong>{{fund}}</strong> tegoed voor deze reservering.',
        'Plaatst u een reservering? Dan gaat u ermee akkoord dat wij uw persoonlijke gegevens delen met de aanbieder.',
    ].join('<br/>'),
    description_informal: [
        'Je gebruikt jouw <strong>{{fund}}</strong> tegoed voor deze reservering.',
        'Plaats je een reservering? Dan ga je ermee akkoord dat wij je persoonlijke gegevens delen met de aanbieder.',
    ].join('<br/>'),

    description_formal_time: 'De reservering kunt u na bevestiging nog binnen {{ days_to_cancel }} dagen annuleren. ',
    description_informal_time: 'De reservering kun je na bevestiging nog binnen {{ days_to_cancel }} dagen annuleren.',

    choose_credit: 'Kies het tegoed om mee te betalen',
    extra_payment_description: 'Bijbetalen',
    multiple_vouchers_warning:
        'Sommige van uw tegoeden hebben niet voldoende saldo. Door een van deze vouchers te gebruiken, moet u het ontbrekende bedrag aan het einde van de reservering bijbetalen.',
    single_voucher_warning:
        'Er is onvoldoende saldo op uw tegoed, u moet het ontbrekende bedrag aan het einde van de reservering bijbetalen via een van de beschikbare betaalmethoden.',
    fill_notes: {
        header: {
            title: 'Vul uw gegevens in',
            subtitle: '{{provider_name}} vul uw gegevens in voor het maken van een reservering.',
        },
        labels: {
            first_name: 'Voornaam',
            last_name: 'Achternaam',
            notes: 'Opmerking',
            notes_optional: 'Opmerking (optioneel)',
            phone: 'Telefoonnummer',
            address: 'Adres',
            street: 'Straat',
            house_nr: 'Huisnummer',
            house_nr_addition: 'Huisnummertoevoeging',
            postal_code: 'Postcode',
            city: 'Plaats',
            birth_date: 'Geboortedatum',
            phone_optional: 'Telefoonnummer (optioneel)',
            address_optional: 'Adres (optioneel)',
            birth_date_optional: 'Geboortedatum (optioneel)',
        },
        max_characters: 'Max. 400 tekens',
        placeholders: {
            first_name: 'Voornaam',
            last_name: 'Achternaam',
            notes: 'Opmerking',
            phone: 'Telefoonnummer',
            address: 'Adres',
            street: 'Straat',
            postal_code: 'Postcode',
            city: 'Plaats',
            birth_date: 'Geboortedatum',
        },
    },
    confirm_notes: {
        header: {
            title: 'Bevestig uw reservering',
        },
        labels: {
            first_name: 'Voornaam: ',
            last_name: 'Achternaam: ',
            notes: 'Opmerking: ',
            phone: 'Telefoonnummer: ',
            street: 'Straat:',
            house_nr: 'Huisnummer:',
            house_nr_addition: 'Huisnummertoevoeging:',
            postal_code: 'Postcode:',
            city: 'Plaats:',
            birth_date: 'Geboortedatum: ',
            empty: 'Leeg',
        },
        buttons: {
            adjust: 'Terug',
            submit: 'Bevestig',
        },

        modal_section: {
            title: 'Controleer uw gegevens:',
        },
    },
    success: {
        title: 'Het is gelukt!',
        description: 'Uw reservering is gemaakt.',
        close: 'Sluiten',
    },
    error: {
        title: 'Fout!',
        description: 'Kon de reservering niet voltooien. Probeer het later opnieuw.',
        close: 'Sluiten',
    },
    extra_payment: {
        header: {
            title: 'Bijbetalen',
            subtitle: 'U moet bijbetalen om uw reservering te voltooien.',
        },
        offer_cost: 'De kosten voor het aanbod',
        remaining_credit: 'Resterend op het tegoed',
        extra_payment: 'Zelf bijbetalen',
        external_link: 'De link leidt naar een externe website.',
    },
    buttons: {
        cancel: 'Annuleren',
        back: 'Terug',
        next: 'Volgende',
        confirm: 'Bevestigen',
        submit: 'Indienen',
        skip: 'Overslaan',
        adjust: 'Terug',
        processing: 'Verwerken',
        go_to_reservation: 'Ga naar reservering',
    },
};
