module.exports = {
    title: "Deactiveren",
    description: "Klik op bevestig om het tegoed te deactiveren. Het tegoed is hierna direct niet meer geldig.",
    labels: {
        note: 'Notitie*',
        notify_by_email: 'Informeer de gebruiker via een e-mailbericht.',
    },
    placeholders: {
        note: 'Optionele notitie...',
    },
    hints: {
        note: 'Max. 140 tekens',
    },
    buttons: {
        cancel: 'Annuleer',
        submit: 'Bevestig',
    },
    danger_zone: {
        title: 'Let op! Weet u zeker dat u dit tegoed wilt deactiveren?',
        description_no_email: [
            'Tegoed: {{ fund_name }}\n\n',
            'Na deactivatie kan de gebruiker het tegoed niet meer gebruiken.',
        ].join(" "),
        description_notification: [
            'U staat op het punt om het tegoed {{ fund_name }} van {{ email }} te deactiveren.',
            'Klik op deactiveren als u dit tegoed wilt stoppen.',
        ].join(" "),
        description_notification_email: [
            '\n\nDe gebruiker ontvangt hiervan een bericht.',
        ].join(" "),
    },
};