export default {
    // VALIDATION REQUEST FOR FUNDS = fund_request.pug
    sign_up: {
        block_title: '{{ fund_name }} request',
        pane: {
            header_title: 'Overview',
            text: 'We still need some data. Complete the following steps:',
            criterion_more: "'{{ name }}' must be more than {{ value }}.",
            criterion_more_or_equal: "'{{ name }}' more or equal to {{ value }}.",
            criterion_less: "'{{ name }}' must be less than {{ value }}.",
            criterion_less_or_equal: "'{{ name }}' less or equal to {{ value }}.",
            criterion_same: "'{{ name }}' moet {{ value }}.",
            criterion_any: "'{{ name }}' any value.",
            fund_already_applied: 'You can not submit a new application until this one is not finished.',
            footer: {
                prev: 'Previous step',
                next: 'Next step',
            },
        },
        header: {
            main: 'Application',
            title_step_1: 'Welcome',
            title_step_2: 'Apply',
        },
        fund_already_applied: {
            title: {
                pending: 'Application in progress',
                approved: 'Application is approved',
                declined: 'Application is declined',
                disregarded: 'Application is disregarded',
                approved_partly: 'Application is approved partly',
            },
            subtitle: {
                pending: 'Application in progress',
                approved: 'Application is approved',
                declined: 'Application is declined',
                disregarded: 'Application is disregarded',
                approved_partly: 'Application is approved partly',
            },
            information: 'Description',
            buttons: {
                open_fund_request: 'Bekijk de aanvraag',
            },
        },
        subtitles: {
            step_1: 'You can register for available funds via this online form. ',
            step_2: 'We will check whether you already meet the conditions, and you can cancel at any time and continue at another time.',
            fund_already_applied:
                'You already applied and have an active application process. Please find below the status of your request.',
        },
        labels: {
            has_app: 'I want to log in with the me app >',
            no_app: '<  want to log in with e-mail address',
        },
        app: {
            title: 'Use the Me-app',
            description_top: ['Scan the QR code on the right with the QR scanner in the Me app.'].join('\n'),
            description_bottom: [
                'The Me App is used to easily and securely log in, make payments and manage credits.',
            ].join('\n'),
        },
    },
};
