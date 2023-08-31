module.exports = {
    title: "Aanbiedingsvoucher aanmaken",
    labels: {
        product: 'Aanbod',
        fund: 'Fonds',
        amount: 'Bedrag',
        note: 'Notitie',
        expire_at: 'Geldig tot en met',
        client_uid: 'Uniek nummer',
    },
    info: "Een QR-code eenmaal aangemaakt kan niet verwijderd worden.",
    buttons: {
        cancel: "Annuleren",
        submit: "Aanmaken",
        close: "Sluit",
    },
    modal_section: {
        choose_title: "Selecteer op welke manier u een QR-code voor een aanbod wilt aanmaken.",
        choose_subtitle: "Als u een activatiecode bij de hand hebt, gebruik dan de tweede optie.",
        activation_code_title: "Vul een activatiecode in.",
        activation_code_subtitle: "Het systeem zal controleren of de activatie code nog niet gebruikt is, \n wanneer hij niet gebruikt is zal hij worden gebruikt om een QR-code te genereren.",
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
    activation_code_invalid: "U voerde een activatiecode in die gebruikt is of niet bestaat. \n Met deze code kunt u geen QR-code genereren. ",
        need_providers: "Mislukt, dit fonds heeft geen goedgekeurde aanbieders met aanbod.",
        no_products: "U moet eerst aanbieders goedkeuren die aanbod hebben geplaatst.",
    }
};
