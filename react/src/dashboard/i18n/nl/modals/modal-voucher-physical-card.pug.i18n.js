module.exports = {
    header: {
        card_title: "Pas koppelen",
    },
    content: {
        title: 'Voer het pasnummer in',
        subtitle: 'Op het pasje staat een QR-code, hieronder staat de persoonlijke code.',
    },
    buttons: {
        submit: 'Bevestigen',
        cancel: 'Annuleren',
    },
    success_card: {
        title: 'Pas gekoppeld',
        description: 'De pas met pasnummer: <strong>{{ code }}</strong> is gekoppeld.',
        button: 'Sluit venster'
    },
    delete_card: {
        header: 'Pas ontkoppelen',
        title: 'De pas met pasnummer {{ code }} wordt ontkoppeld',
        description: 'De pas kan direct niet meer gebruikt worden. Om de pas opnieuw te activeren is het pasnummer vereist.',
        cancelButton: 'Annuleer',
        confirmButton: 'Bevestig',
    }
};