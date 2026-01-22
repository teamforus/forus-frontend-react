export default {
    title: 'Uitbetaling aanmaken',
    labels: {
        fund: 'Fonds',
        allocate_by: 'Toewijzingsmethode',
        assign_by_type: 'Methode',
        amount: 'Bedrag',
        bank_account_source: 'Bron bankrekening',
        bank_account: 'Bankrekening',
        iban: 'Naar IBAN',
        iban_name: 'Tenaamstelling IBAN',
        description: 'Omschrijving',
    },
    info: {
        fund: 'Selecteer het fonds waaruit de uitbetaling wordt gedaan. De regels die op dit fonds van toepassing zijn, worden automatisch overgenomen voor de uitbetaling.',
        allocate_by: 'Kies of het bedrag vrij is (handmatig invoeren) of een vooraf ingesteld bedrag uit het fonds.',
        amount: 'Het bedrag dat wordt uitbetaald. Bij vrij bedrag kunt u een bedrag tussen het minimum en maximum invoeren. Bij vaste bedragen selecteert u een vooraf ingesteld bedrag.',
        assign_by_type: 'Koppel de uitbetaling optioneel aan een e-mailadres of BSN van de ontvanger.',
        email: 'Voer het e-mailadres van de ontvanger in.',
        bsn: 'Voer het BSN van de ontvanger in.',
        bank_account_source:
            'Kies de bron voor de bankrekening. U kunt handmatig invoeren, zoeken via een aanvraag, of een bankrekening gebruiken uit eerdere transacties.',
        bank_account:
            'Selecteer een bankrekening uit de beschikbare opties. De bankrekening wordt automatisch ingevuld met IBAN en tenaamstelling.',
        iban: 'IBAN van de ontvanger. Dit is het internationale bankrekeningnummer waar het bedrag naartoe wordt overgemaakt.',
        iban_name: 'Naam zoals geregistreerd bij de bank. Dit moet overeenkomen met de naam op de bankrekening.',
        description: 'Optionele omschrijving voor de betaling. Deze wordt meegestuurd met de uitbetaling.',
    },
    tooltips: {
        assign_type: [
            'Selecteer het fonds waarvoor het tegoed wordt aangemaakt. ',
            'De regels die op dit fonds van toepassing zijn, ',
            'worden automatisch overgenomen voor het tegoed. ',
            'Hierdoor kan bijvoorbeeld worden bepaald bij welke aanbieders het tegoed kan worden besteed.',
        ].join(''),
    },
    buttons: {
        cancel: 'Annuleren',
        submit: 'Bevestigen',
    },
    options: {
        bank_account_source_manual: 'Handmatige invoer',
        bank_account_source_fund_request: 'Zoeken via aanvraag',
        bank_account_source_profile_bank_account: 'Handmatige bankrekening',
        bank_account_source_reimbursement: 'Declaratie',
        bank_account_source_payout: 'Uitbetaling',
        bank_account_select_placeholder: 'Selecteer aanvraag',
    },
};
