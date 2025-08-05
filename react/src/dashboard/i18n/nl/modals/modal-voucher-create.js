export default {
    title: 'Tegoed aanmaken',
    labels: {
        fund: 'Fonds',
        amount: 'Bedrag',
        assign_by_type: 'Toewijzingsmethode',
        limit_multiplier: 'Aantal personen',
        assign_by_type_or_activate: 'Toewijzen of activeren',
        note: 'Interne notitie alleen inzichtelijk voor de sponsor',
        expire_at: 'Geldig tot en met',
        client_uid: 'Uniek nummer',
        credit_type: 'Soort',
        report_type: 'Voucher melden bij backoffice',
        notify_provider: 'Wilt u de aanbieder informeren over het aangemaakte product tegoed?',
    },
    tooltips: {
        funds: [
            '<p>Selecteer de manier waarop het tegoed aan een ontvanger wordt gekoppeld.</p>',
            '<ul>',
            '<li><strong>Activatiecode</strong>: De ontvanger activeert het tegoed door de activatiecode op de website in te voeren.</li>',
            '<li><strong>BSN</strong>: Wanneer de ontvanger met DigiD is ingelogd, wordt het tegoed automatisch gekoppeld aan het BSN.</li>',
            '<li><strong>E-mailadres</strong>: Het tegoed wordt gekoppeld aan het e-mailadres van de ontvanger.</li>',
            '</ul>',
            '<p>De bovenstaande methoden betreffen de eerste koppeling van het tegoed. Op een later moment kunnen aanvullende gegevens worden gekoppeld aan het tegoed.</p>',
        ].join(''),
        type: [
            '<p>Selecteer het type tegoed. Er zijn drie opties:</p>',
            '<ul>',
            '<li><strong>Budget</strong>: Een bedrag dat onder specifieke voorwaarden kan worden besteed.</li>',
            '<li><strong>Product</strong>: Een tegoed voor een specifiek product of dienst.</li>',
            '<li><strong>Korting</strong>: Het recht op een korting op een bepaald product of dienst.</li>',
            '</ul>',
        ].join(''),
        assign_type: [
            'Selecteer het fonds waarvoor het tegoed wordt aangemaakt. ',
            'De regels die op dit fonds van toepassing zijn, ',
            'worden automatisch overgenomen voor het tegoed. ',
            'Hierdoor kan bijvoorbeeld worden bepaald bij welke aanbieders het tegoed kan worden besteed.',
        ].join(''),
        report_type:
            'Kies of je de “ontvangen”-melding nu wilt versturen met de opgegeven BSN, of uitstellen totdat de voucher wordt geclaimd of toegewezen aan een gebruiker.',
    },
    modal_section: {
        choose_title: 'Selecteer op welke manier u een tegoed wilt aanmaken.',
        choose_subtitle: 'Als u een activatiecode bij de hand hebt, gebruik dan de tweede optie.',
        activation_code_title: 'Vul een activatiecode in.',
        activation_code_subtitle:
            'Het systeem zal controleren of de activatiecode nog niet gebruikt is, \n wanneer hij niet gebruikt is zal hij worden gebruikt om een tegoed te genereren.',
        voucher_type_item: {
            giftcard: 'Normaal',
            activation_code: 'via activatie-code',
        },
    },
    errors: {
        title: {
            activation_code_invalid: 'Mislukt! Deze activatiecode is niet juist.',
            no_products: 'Mislukt! Er is geen aanbod om uit te selecteren.',
        },
        activation_code_invalid:
            'U voerde een activatiecode in die gebruikt is of niet bestaat. \n Met deze code kunt u geen tegoed genereren. ',
        need_providers: 'Mislukt, dit fonds heeft geen goedgekeurde aanbieders met aanbiedingen.',
        no_products: 'U moet eerst aanbieders goedkeuren die aanbiedingen hebben geplaatst.',
    },
    info: 'Controleer de gegevens. Na het aanmaken van het tegoed kan het niet worden verwijderd.',
    buttons: {
        cancel: 'Annuleren',
        submit: 'Bevestigen',
        activate: 'Activeren',
    },
    options: {
        report_type_relation: 'Onmiddellijk (met opgegeven BSN)',
        report_type_user_bsn: 'Wanneer voucher wordt geclaimd of toegewezen aan een gebruiker',
    },
};
