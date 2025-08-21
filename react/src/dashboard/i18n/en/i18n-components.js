export default {
    organization_funds: {
        title: 'Funds',
        buttons: {
            add: 'Add fund',
            edit: 'Edit',
            delete: 'Delete',
            top_up: 'Top-up fund',
            criteria: 'Criteria',
            statistics: 'Statistics',
            top_up_history: 'View transactions',
        },
        states: {
            active: 'Active',
            paused: 'Paused',
            closed: 'Closed',
        },
        labels: {
            name: 'Name:',
            remaining: 'Remaining:',
            requester_count: 'Requesters count:',
            status: 'Status:',
            actions: 'Actions:',
        },
    },
    fund_criteria_editor: {
        buttons: {
            add_criteria: 'Add criteria',
            save: 'Save',
        },
    },
    fund_criteria_editor_item: {
        buttons: {
            edit: 'Edit',
            apply: 'Apply',
            cancel: 'Cancel',
            allow_attachments: 'Allow attachments',
        },
    },
    feedback: {
        title: 'Feedback',
        labels: {
            email: 'Email',
            title: 'Title',
            content: 'Content',
            urgency: 'Urgency',
            use_customer_email: 'I would like to be notified by email about this feedback',
        },
        buttons: {
            cancel: 'Cancel',
            confirm: 'Confirm',
            back: 'Back',
            send: 'Submit',
        },
        submit_success: {
            title: 'Your feedback has been sent',
            info: 'Thank you, your opinion is important to us.',
        },
        submit_failure: {
            title: 'Your feedback has not been sent',
            info: 'Try again later',
        },
    },
};
