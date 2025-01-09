export default {
    // PAGE = fund-activate.pug
    header: {
        title: 'Bevestig uw inkomen',
        vergoedingen: {
            title: 'U gaat akkoord met de voorwaarden',
        },
    },

    options: {
        code: {
            title: 'Ik heb een activatiecode',
            description: 'Ga verder met het activeren van je tegoed door gebruik te maken van een activatiecode',
        },
        digid: {
            title: 'DigiD',
            description: 'Open het DigiD inlogscherm',
        },
        request: {
            title: 'Ik wil een tegoed aanvragen',
            description: 'Doorloop het aanvraagformulier om een tegoed aan te vragen',
        },
    },

    cards: {
        back: 'Terug',

        code: {
            title: 'Vul uw activatiecode in',
            aria_label: 'Voer de activatiecode van het fonds in',
        },
        digid: {
            confirm: 'Ik verklaar dat ik voldoe aan de bovenstaande voorwaarden',
            loading: 'Een moment geduld, het verzoek wordt verwerkt',
        },
        not_available: {
            title: 'Aanvraag mislukt',
            description: 'U kunt zich niet aanmelden voor {{name}}.',
            contacts: 'Neem contact op met {{name}}.',
        },
        taken_by_partner: {
            title: 'Dit tegoed is al geactiveerd',
            heading: 'Aanvraag mislukt',
            description:
                'U krijgt deze melding omdat het tegoed is geactiveerd door een <br /> familielid of voogd. <br /><br /> De tegoeden zijn beschikbaar in het account van de persoon die <br /> deze als eerste heeft geactiveerd.',
            contacts: 'Neem voor vragen contact op met {{name}}.',
        },
        backoffice_error_not_resident: {
            title: 'Aanvraag mislukt',
            description:
                'Volgens onze gegevens bent u geen inwoner van de gemeente Nijmegen. De {{fund_name}} geldt alleen voor inwoners van de gemeente Nijmegen. <br /> <br /> Mogelijk heeft uw eigen gemeente wel regelingen waarvoor u in aanmerking komt. Neem hiervoor contact op met de gemeente waar u woonachtig bent.',

            contacts: `Voor meer informatie of vragen kunt u contact opnemen met gemeente Nijmegen.<br /> E-mailadres: <a class="txt_link var" href="mailto:{{email_value}}">{{email_label}}</a> <br /> Telefoonnumer: {{phone}}`,
        },
        backoffice_error_not_eligible: {
            title: 'Aanvraag mislukt. U voldoet niet aan de voorwaarden.',
            heading: 'Het is niet gelukt',
            description: 'Sorry, uw aanvraag voor {{fund_name}} is helaas niet gelukt.',
            contacts: 'Neem voor meer informatie contact op met gemeente Nijmegen.',
        },
        backoffice_error_taken_by_partner: {
            title: 'Aanvraag mislukt',
            description:
                'Volgens onze informatie hebben wij al een aanvraag van uw partner ontvangen. Het is daarom niet mogelijk om een aanvraag te doen.',

            contacts: `Wilt u hiervoor een bezwaar indienen of heeft u vragen, neem dan contact met ons op. <br /> E-mailadres: <a class="txt_link var" href="mailto:{{email_value}}">{{email_label}}</a> <br /> Telefoonnumer: {{phone}}`,
        },
        backoffice_error_no_response: {
            title: 'Er is een technische fout opgetreden, probeer het later opnieuw.',
            heading: 'Het is niet gelukt',
            description: 'Sorry, uw aanvraag voor {{fund_name}} is helaas niet gelukt.',
            contacts: 'Neem voor meer informatie contact op met gemeente Nijmegen.',
        },
    },
};
