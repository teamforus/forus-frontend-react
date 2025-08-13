export default {
    header: {
        title_add: 'Aanbod toevoegen',
        title_edit: 'Aanbod aanpassen',
    },
    labels: {
        name: 'Titel van aanbod',
        description: 'Omschrijving',
        new: 'Aanbiedingsprijs €',
        old: 'Originele prijs €',
        total: 'Aantal',
        reserved: 'Gereserveerd',
        sold: 'Verkocht',
        stock: 'Nog te koop / Totaal',
        stock_amount: 'Nog te koop',
        stock_unlimited: 'Onbeperkt aanbod',
        category: 'Categorie',
        expire: 'Vervaldatum van aanbod (t/m)',
        available_offers: 'Resterend aanbod',
        unlimited: 'Onbeperkt',
        alternative_text: 'Alt-tekst',
        alternative_text_placeholder: 'Omschrijving van de afbeelding',
        extra_payments: 'Bijbetaling accepteren',
        ean: 'EAN (European Article Number)',
        ean_placeholder: 'Voeg een Europees artikelnummer toe',
        sku: 'SKU (Stock-Keeping unit)',
        sku_placeholder: 'Voeg een voorraadbeheereenheidnummer toe',
    },
    tooltips: {
        product_type: [
            'Kies het soort aanbod. Voorbeelden:',
            '1. Normaal: een fiets voor € 200,-.',
            '2. Korting €: € 20,- korting op een fiets.',
            '3. Korting %: 20% korting op een fiets.',
            '4. Gratis: gratis toegang voor een film.',
            '5. Informatief: Schoolartikelen (bekijk het aanbod in de winkel).',
        ].join('\n'),
        reservation_fields: [
            'Vraag de klant om aanvullende informatie op te geven bij het maken van een reservering.',
            'Let op: Er zijn ook algemene instellingen voor alle reserveringen.',
            'Kijk hiervoor bij: Reserveringen > Instellingen.',
        ].join(' '),
        reservation_enabled: [
            'Deze instelling zorgt ervoor dat de klant het aanbod via de webshop kan reserveren.',
            'In dit geval hoeft u geen QR-code te scannen.',
            'De betaling verloopt automatische na acceptatie van de reservering.',
        ].join(' '),
        ean: [
            'De EAN (Europees Artikelnummer) is een unieke code die wordt gebruikt om artikelen',
            'te identificeren. Hier kan de EAN voor elk aanbod worden ingevoerd om het juiste',
            'artikelnummer aan het aanbod te koppelen.',
        ].join(' '),
        sku: [
            'De SKU (Stock Keeping Unit) is een code die helpt bij het identificeren en beheren',
            'van aanbod binnen het voorraadbeheer. Hier kan de SKU worden ingevoerd om een uniek',
            'kenmerk aan elk aanbod toe te wijzen',
        ].join(' '),
    },
    buttons: {
        cancel: 'Annuleren',
        confirm: 'Bevestigen',
        close: 'Sluit',
    },
    errors: {
        already_added: 'U heeft het limiet bereikt. U kunt niet meer aanbod toevoegen.',
    },
    confirm_create: {
        title: 'Een aanbod toevoegen.',
        description:
            'U staat op het punt een aanbod op de webshop toe te voegen. Uw aanbod wordt van de webshop verwijderd als de vervaldatum bereikt is.',
    },
};
