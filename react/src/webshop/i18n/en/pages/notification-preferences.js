export default {
    title_preferences: 'Email preferences',
    subscribe_desc:
        'You are currently unsubscribed from all notifications with this e-mail address "{{email}}". If you want to receive notifications, you can set this per notification below.',
    unsubscribe: 'Unsubscribe from all notifications',
    unsubscribe_desc: 'I would like to unsubscribe from all notifications',
    unsubscribe_button: 'Unsubscribe',
    subscribe: 'Yes, I would like to receive all notifications',
    errors: {
        not_found: 'This token is invalid',
        expired: 'This token is expired',
        'not-pending': 'The notfication preferences have already been adjusted with this link.',
    },
    types: {
        funds: {
            new_fund_started: {
                title: 'Fund has started',
                description:
                    'Receive a notification when a fund for which you are registered has started and you can expect customers.',
            },
            new_fund_applicable: {
                title: 'New fund that you can apply for',
                description: 'Receive a notification when a new fund has been created for which you can apply.',
            },
            balance_warning: {
                title: 'Action required: top up balance',
                description: 'Receive a notification when the balance for a fund is lower than the limit.',
            },
            fund_expires: {
                title: 'Reminder expiration date voucher',
                description: 'Receive a notification a month before the expiration date of your voucher.',
            },
            product_added: {
                title: 'New product has been added',
                description: 'Receive a notification when a new offer has been added.',
            },
            new_fund_created: {
                title: 'New fund created',
                description: 'Receive a notification when a new fund has been created.',
            },
            product_reserved: {
                title: 'Offer reserved',
                description: 'Receive a notification when an offer is reserved.',
            },
            product_sold_out: {
                title: 'Offer sold out',
                description: 'Receive a notification when an offer is sold out.',
            },
            provider_applied: {
                title: 'Provider applied',
                description: 'Receive a notification when a provider applied for a fund.',
            },
            provider_approved: {
                title: 'Provider application approved',
                description: 'Receive a notification when a provider is approved.',
            },
            provider_rejected: {
                title: 'Provider application rejected',
                description: 'Receive a notification when a provider is rejected.',
            },
        },
        validations: {
            new_validation_request: {
                title: 'New validation request',
                description: 'Receive a notification when you received a new validation request.',
            },
            you_added_as_validator: {
                title: 'You have been added as validator',
                description: 'Receive a notification when you have been added as a validator.',
            },
        },
        vouchers: {
            payment_success: {
                title: 'Payment successful',
                description: 'Receive a notification when a payment is succeeded',
            },
            send_voucher: {
                title: 'Send voucher by mail',
                description: 'Receive a notification when a voucher has been sent to your email.',
            },
            share_product: {
                title: 'Offer reservation shared',
                description: 'Receive a notification when a reservation has been shared.',
            },
        },
    },
    push_notifications_preferences: {
        title: 'Instellingen voor weergavetijd van meldingen',
    },
    push_notifications_dismiss_time: {
        webshop: {
            title: 'Algemene meldingen automatisch sluiten',
            description: 'Verberg systeemmeldingen automatisch nadat een actie is uitgevoerd.',
        },
        bookmarks: {
            title: 'Meldingen over favoriete producten automatisch sluiten',
            description:
                'Verberg de systeemmeldingen automatisch nadat favoriete producten worden toegevoegd of verwijderd.',
        },
    },
};
