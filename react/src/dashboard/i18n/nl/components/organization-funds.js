module.exports = {
    organization_funds: {
        title: "Fondsen",
        buttons: {
            add: 'Fonds toevoegen',
            edit: "Instellingen",
            view: "Bekijken",
            delete: "Verwijderen",
            top_up: "Budget toevoegen",
            archive: "Archiveren",
            restore: "Herstellen",
            criteria: "Voorwaarden",
            statistics: "Statistieken",
            top_up_history: "Bekijk aanvullingen"
        },
        states: {
            active: "Actief",
            paused: "Gepauzeerd",
            closed: "Gestopt",
            archived: "Gearchiveerd",
        },
        labels: {
            remaining: "Resterend:"
        },
        top_up_table: {
            filters: {
                search: "Zoeken",
                code: "Gebruikte code",
                iban: "IBAN",
                amount: "Bedrag",
                amount_min: "0",
                amount_max: "Alles",
                from: "Aangemaakt vanaf",
                to: "Aangemaakt tot en met"
            },
            columns: {
                fund: "Fonds",
                code: "Gebruikte code",
                iban: "IBAN",
                top_up_id: "Aanvulling ID",
                amount: "Bedrag",
                date: "Tijd & Datum",
            }
        }
    }
};