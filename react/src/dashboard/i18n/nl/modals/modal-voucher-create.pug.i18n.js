module.exports = {
    title: "Tegoed aanmaken",
    labels: {
        fund: 'Fonds',
        amount: 'Bedrag',
        assign_by_type: 'Methode',
        limit_multiplier: 'Aantal personen',
        assign_by_type_or_activate: 'Toewijzen of activeren',
        note: 'Notitie',
        expire_at: 'Geldig tot en met',
        client_uid: 'Uniek nummer',
    },
    modal_section: {
        choose_title: "Selecteer op welke manier u een tegoed wilt aanmaken.",
        choose_subtitle: "Als u een activatiecode bij de hand hebt, gebruik dan de tweede optie.",
        activation_code_title: "Vul een activatiecode in.",
        activation_code_subtitle: "Het systeem zal controleren of de activatiecode nog niet gebruikt is, \n wanneer hij niet gebruikt is zal hij worden gebruikt om een tegoed te genereren.",
        voucher_type_item: {
            giftcard: "Normaal",
            activation_code: "via activatie-code"
        }
    },
    errors: {
        title: {
            activation_code_invalid: "Mislukt! Deze activatiecode is niet juist.",
            no_products: "Mislukt! Er is geen aanbod om uit te selecteren.",
        },
        activation_code_invalid: "U voerde een activatiecode in die gebruikt is of niet bestaat. \n Met deze code kunt u geen tegoed genereren. ",
        need_providers: "Mislukt, dit fonds heeft geen goedgekeurde aanbieders met aanbiedingen.",
        no_products: "U moet eerst aanbieders goedkeuren die aanbiedingen hebben geplaatst.",
    },
    info: "Een tegoed eenmaal aangemaakt kan niet verwijderd worden.",
    buttons: {
        cancel: "Annuleren",
        submit: "Bevestig",
        activate: "Activeren",
    }
};
