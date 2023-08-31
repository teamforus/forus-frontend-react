module.exports = {
    accepted: {
        title: "Weet je zeker dat je deze aanbieder wilt accepteren?",
        description: [
            `Weet je zeker dat je deze aanbieder wilt accepteren?`,
            `Na acceptatie kun je de aanbieder nog weigeren.`,
        ].join("\n"),
        options: "Selecteer opties",
        buttons: {
            cancel: 'Annuleren',
            confirm: 'Bevestigen',
        },
    },
    rejected: {
        title: "Weet je zeker dat je deze aanbieder wilt weigeren?",
        description: [
            `Weet je zeker dat je deze aanbieder wilt weigeren?`,
            `Na weigering kun je de aanbieder nog accepteren.`,
        ].join("\n"),
        buttons: {
            cancel: 'Annuleren',
            confirm: 'Bevestigen',
        },
    },
};
