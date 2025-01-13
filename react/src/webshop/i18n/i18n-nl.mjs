import buttons from './nl/components/buttons.mjs';
import top_navbar from './nl/layout/top_navbar.mjs';

import signup_options from './nl/pages/signup-options.mjs';
import fund from './nl/pages/fund.mjs';
import fund_activate from './nl/pages/fund-activate.mjs';
import fund_request from './nl/pages/fund-request.mjs';
import fund_requests from './nl/pages/fund-requests.mjs';
import fund_request_clarification from './nl/pages/fund-request-clarification.mjs';
import funds from './nl/pages/funds.mjs';
import provider from './nl/pages/provider.mjs';
import providers from './nl/pages/providers.mjs';
import home from './nl/pages/home.mjs';
import signup from './nl/pages/signup.mjs';
import meapp_index from './nl/pages/me-index.mjs';
import product from './nl/pages/product.mjs';
import records_validations from './nl/pages/record-validations.mjs';
import records_create from './nl/pages/records-create.mjs';
import records_validate from './nl/pages/records-validate.mjs';
import records from './nl/pages/records.mjs';
import products from './nl/pages/products.mjs';
import voucher from './nl/pages/voucher.mjs';
import vouchers from './nl/pages/vouchers.mjs';
import reservations from './nl/pages/reservations.mjs';
import reservation from './nl/pages/reservation.mjs';
import payouts from './nl/pages/payouts.mjs';
import reimbursements from './nl/pages/reimbursements.mjs';
import profile from './nl/pages/profile.mjs';
import preferences_notifications from './nl/pages/preferences-notifications.mjs';
import preferences_emails from './nl/pages/preferences-emails.mjs';
import voucher_printable from './nl/pages/voucher-printable.mjs';
import error_page from './nl/pages/error-page.mjs';
import error from './nl/pages/error.mjs';
import auth from './nl/pages/auth.mjs';
import auth_start from './nl/pages/auth-start.mjs';
import bookmarked_products from './nl/pages/bookmarked-products.mjs';
import provider_sign_up from './nl/pages/provider-sign-up.mjs';
import privacy from './nl/pages/privacy.mjs';
import terms_and_conditions from './nl/pages/terms-and-conditions.mjs';
import explanation from './nl/pages/explanation.mjs';
import accessibility from './nl/pages/accessibility.mjs';
import security_sessions from './nl/pages/security-sessions.mjs';
import security_2fa from './nl/pages/security-2fa.mjs';
import notifications from './nl/pages/notifications.mjs';
import providers_office from './nl/pages/providers-office.mjs';
import search from './nl/pages/search.mjs';
import sitemap from './nl/pages/sitemap.mjs';
import not_found from './nl/pages/not_found.mjs';
import wip from './nl/pages/wip.mjs';
import me from './nl/pages/me.mjs';

import popup_auth from './nl/modals/modal-auth.mjs';
import open_in_me from './nl/modals/modal-open-in-me.mjs';
import modal_physical_card from './nl/modals/modal_physical_card.mjs';
import expired_identity from './nl/modals/modal-expired-identity-proxy.mjs';
import pdf_preview from './nl/modals/modal-pdf-preview.mjs';
import modal from './nl/modals/modal.mjs';
import modal_product_reserve_extra_payment from './nl/modals/modal-product-reserve-extra-payment.mjs';
import modal_product_reserve_cancel from './nl/modals/modal-product-reserve-cancel.mjs';
import modal_reserve_product from './nl/modals/modal_reserve_product.mjs';
import modal_2fa_setup from './nl/modals/modal_2fa_setup.mjs';
import modal_2fa_deactivate from './nl/modals/modal_2fa_deactivate.mjs';
import modal_photo_cropper from './nl/modals/modal_photo_cropper.mjs';
import reimbursement_confirmation from './nl/modals/modal-reimbursement-confirmation.mjs';
import modal_physical_card_unlink from './nl/modals/modal-physical_card_unlink.mjs';
import modal_fund_help from './nl/modals/modal_fund_help.mjs';
import modal_pin_code from './nl/modals/modal_pin_code.mjs';
import modal_logout from './nl/modals/modal_logout.mjs';

import app_footer from './nl/directives/app-footer.mjs';
import block_products from './nl/directives/block-products.mjs';
import block_funds from './nl/directives/block-funds.mjs';
import block_notifications from './nl/directives/block-notifications.mjs';
import block_providers from './nl/directives/block-providers.mjs';
import empty_block from './nl/directives/empty-block.mjs';
import fund_criterion from './nl/directives/fund-criterion.mjs';
import maps from './nl/directives/google-map.mjs';
import profile_menu from './nl/directives/profile-menu.mjs';
import top_navbar_search from './nl/directives/top-navbar-search.mjs';
import paginator from './nl/directives/paginator.mjs';

// blocks
import block_exception from './nl/blocks/block-exception.mjs';

export default {
    test: '{{name}} {{foo}}',
    page_title: 'Forus platform',
    page_state_loading_titles: {
        home: 'Webshop{{pageTitleSuffix}}',
        fund: 'Fund{{pageTitleSuffix}}',
        reimbursement: 'Declaratie{{pageTitleSuffix}}',
        'reimbursement-edit': 'Kosten terugvragen bewerk{{pageTitleSuffix}}',
        product: 'Aanbod{{pageTitleSuffix}}',
        products: 'Aanbod{{pageTitleSuffix}}',
        actions: 'Aanbod{{pageTitleSuffix}}',
        voucher: 'Uw tegoed{{pageTitleSuffix}}',
        provider: 'Aanbieder{{pageTitleSuffix}}',
        'fund-requests': 'Aanvragen{{pageTitleSuffix}}',
        'fund-request-show': 'Aanvraag{{pageTitleSuffix}}',
    },
    page_state_titles: {
        home: '{{implementation}}{{pageTitleSuffix}}',
        fund: '{{fund_name}}{{pageTitleSuffix}}',
        funds: 'Aanvragen{{pageTitleSuffix}}',
        reimbursements: 'Declaraties{{pageTitleSuffix}}',
        reimbursement: 'Declaratie - {{code}}{{pageTitleSuffix}}',
        'reimbursements-create': 'Nieuwe kosten terugvragen{{pageTitleSuffix}}',
        'reimbursement-edit': 'Kosten terugvragen bewerk - {{code}}{{pageTitleSuffix}}',
        platform: 'Forus Platform{{pageTitleSuffix}}',
        me: 'Me{{pageTitleSuffix}}',
        'me-app': 'Me-app{{pageTitleSuffix}}',
        portfolio: 'Portfolio{{pageTitleSuffix}}',
        kindpakket: 'Portfolio - Kindpakket{{pageTitleSuffix}}',
        product: 'Aanbod - {{product_name}} van {{organization_name}}{{pageTitleSuffix}}',
        products: 'Aanbod{{fund_name}}{{pageTitleSuffix}}',
        actions: 'Aanbod{{fund_name}}{{pageTitleSuffix}}',
        providers: 'Aanbieders{{pageTitleSuffix}}',
        'products-show': 'Aanbieding{{pageTitleSuffix}}',
        'products-apply': 'Aanbieding kopen{{pageTitleSuffix}}',
        vouchers: 'Mijn tegoed{{pageTitleSuffix}}',
        voucher: 'Uw tegoed - {{fund_name}}{{pageTitleSuffix}}',
        reservations: 'Reserveringen{{pageTitleSuffix}}',
        provider: 'Aanbieder - {{provider_name}}{{pageTitleSuffix}}',
        records: 'Persoonsgegevens{{pageTitleSuffix}}',
        explanation: 'Uitleg aanvragen vergoedingen{{pageTitleSuffix}}',
        start: 'Start aanmelden{{pageTitleSuffix}}',
        privacy: 'Privacyverklaring{{pageTitleSuffix}}',
        accessibility: 'Toegankelijkheidsverklaring{{pageTitleSuffix}}',
        'record-validate': 'Persoonsgegeven goedkeuren{{pageTitleSuffix}}',
        'record-validations': 'Goedkeuringen{{pageTitleSuffix}}',
        'record-create': 'Persoonsgegevens toevoegen{{pageTitleSuffix}}',
        'funds-apply': 'Aanvragen{{pageTitleSuffix}}',
        'fund-apply': 'Aanvragen{{pageTitleSuffix}}',
        'fund-activate': 'Activeren {{fund_name}}{{pageTitleSuffix}}',
        'restore-email': 'Inloggen via e-mail{{pageTitleSuffix}}',
        notifications: 'Notificaties{{pageTitleSuffix}}',
        'security-2fa': 'Beveiliging{{pageTitleSuffix}}',
        'security-sessions': 'Security sessies{{pageTitleSuffix}}',
        'bookmarked-products': 'Mijn verlanglijstje{{pageTitleSuffix}}',
        'search-result': 'Zoekresultaten{{pageTitleSuffix}}',
        'preferences-notifications': 'Notificatievoorkeuren{{pageTitleSuffix}}',
        'identity-emails': 'E-mail instellingen{{pageTitleSuffix}}',
        'fund-request-clarification': 'Aanvulverzoek{{pageTitleSuffix}}',
        terms_and_conditions: 'Algemene voorwaarden{{pageTitleSuffix}}',
        'confirmation-email': 'E-mail bevestigen{{pageTitleSuffix}}',
        'provider-office': 'Aanbieder vestiging{{pageTitleSuffix}}',
        'auth-link': 'Inloggen{{pageTitleSuffix}}',
        sitemap: 'Sitemap{{pageTitleSuffix}}',
        'sign-up': 'Aanmelden{{pageTitleSuffix}}',
        'fund-requests': 'Aanvragen{{pageTitleSuffix}}',
        'fund-request-show': 'Aanvraag {{fund_name}}{{pageTitleSuffix}}',
        'reservation-show': 'Reservering{{pageTitleSuffix}}',
    },
    custom_page_state_titles: {
        vergoedingen: {
            funds: 'Alle vergoedingen{{pageTitleSuffix}}',
        },
        goereeoverflakkee: {
            funds: 'Regelingen{{pageTitleSuffix}}',
        },
    },
    implementation_name: {
        general: 'General',
        potjeswijzer: 'Potjeswijzer',
        westerkwartier: 'Westerkwartier',
        forus: 'Forus platform & ',
        kerstpakket: 'Kerstpakket',
        berkelland: 'Berkelland',
        oostgelre: 'Oostgelre',
        winterswijk: 'Winterswijk',
        noordoostpolder: 'Meedoenpakket',
        groningen: 'Stadjerspas',
        geertruidenberg: 'Geertruidenberg',
        waalwijk: 'Paswijzer',
        heumen: 'Heumen',
        vergoedingen: 'Vergoedingen',
        ede: 'Ede',
        schagen: 'Schagen',
        hartvanwestbrabant: 'HvWB',
        eemsdelta: 'Eemsdelta',
        doetegoed: 'Doe-tegoed',
        goereeoverflakkee: 'Goeree-Overflakkee',
    },

    languages: {
        en: 'Engels',
        nl: 'Nederlands',
    },
    email_service_switch: {
        confirm: 'Breng me naar mijn e-mail',
    },
    logo_alt_text: {
        general: 'Forus',
        berkelland: 'Gemeente Berkelland',
        doetegoed: 'Doe-tegoed',
        ede: 'Ede',
        eemsdelta: 'Gemeente Eemsdelta',
        geertruidenberg: 'Gemeente Geertruidenberg',
        groningen: 'Stadjerspas',
        kerstpakket: 'Kerstpakket',
        heumen: 'Gemeente Heumen',
        hartvanwestbrabant: 'Werkplein',
        noordoostpolder: 'Gemeente Noordoostpolder',
        potjeswijzer: 'Potjeswijzer',
        oostgelre: 'Gemeente Oost Gelre',
        winterswijk: 'Gemeente Winterswijk',
        westerkwartier: 'Gemeente Westerkwartier',
        waalwijk: 'Pas Wijzer',
        vergoedingen: 'logo Gemeente Nijmegen',
        schagen: 'Gemeente Schagen',
        goereeoverflakkee: 'Gemeente Goeree-Overflakkee',
    },

    // COMPONENTS
    buttons: buttons,

    // LAYOUT
    top_navbar: top_navbar,

    week_days: {
        0: 'Maandag',
        1: 'Dinsdag',
        2: 'Woensdag',
        3: 'Donderdag',
        4: 'Vrijdag',
        5: 'Zaterdag',
        6: 'Zondag',
    },

    blocks: {
        block_exception,
    },

    global: {
        app_links: { google_play: 'Ontdek het op Google Play', app_store: 'Download in de App Store' },
        '2fa_restriction': {
            emails: {
                title: 'Tweefactorauthenticatie is vereist voor het beheren van e-mailadressen.',
                description:
                    'Om de veiligheid en bescherming van persoonlijke gegevens in de webshop te waarborgen, is het verplicht om accounts te authenticeren. Gebruikers moeten een identificatiemethode verstrekken voordat ze toegang krijgen tot functies waarin persoonlijke gegevens worden ingevoerd of accountaanpassingen kunnen worden gemaakt.',
                button: 'Tweefactorauthenticatie instellen',
            },
            sessions: {
                title: 'Tweefactorauthenticatie is vereist voor het beheren van inlog sessies.',
                description:
                    'Om de veiligheid en bescherming van persoonlijke gegevens in de webshop te waarborgen, is het verplicht om accounts te authenticeren. Gebruikers moeten een identificatiemethode verstrekken voordat ze toegang krijgen tot functies waarin persoonlijke gegevens worden ingevoerd of accountaanpassingen kunnen worden gemaakt.',
                button: 'Tweefactorauthenticatie instellen',
            },
            reimbursements: {
                title: 'Tweefactorauthenticatie is vereist voor het indienden van declaraties.',
                description:
                    'Om de veiligheid en bescherming van persoonlijke gegevens in de webshop te waarborgen, is het verplicht om accounts te authenticeren. Gebruikers moeten een identificatiemethode verstrekken voordat ze toegang krijgen tot functies waarin persoonlijke gegevens worden ingevoerd of accountaanpassingen kunnen worden gemaakt.',
                button: 'Tweefactorauthenticatie instellen',
            },
            reasons: {
                title: 'Voor de volgende tegoeden is tweefactorauthenticatie vereist.',
                description:
                    'Om bepaalde opties en functionaliteit te gebruiken, dienen gebruikers een tweede verificatiemethode te gebruiken. Dit versterkt de beveiliging en zorgt ervoor dat alleen geautoriseerde gebruikers toegang hebben tot de functies, waardoor de accounts beter beschermd zijn.',
            },
        },
        info_box: {
            '2fa_description': 'Kijk voor meer informatie over 2FA op ons:',
            help_center_article: 'Helpcenter artikel',
        },
        card_2fa_warning: {
            '2fa_policy': {
                required: {
                    title: 'Deze regeling verplicht het gebruik van tweefactorauthenticatie',
                    description:
                        'Om gebruik te kunnen maken van deze regeling dient de gebruiker na aanvraag een tweede verificatiemethode te gebruiken.',
                },
                restrict_features: {
                    title: 'Deze regeling verplicht het gebruik van tweefactorauthenticatie voor bepaalde functionaliteiten',
                    description:
                        'Om bepaalde opties en functionaliteit te gebruiken die gekoppeld zijn aan deze regeling, dient de gebruiker een tweede verificatiemethode te gebruiken.',
                },
                show_more: 'Toon meer',
                show_less: 'Toon minder',
            },
            email_restrictions: {
                title: 'E-mail restricties',
                description: 'Tweefactorauthenticatie is vereist voor het beheren van e-mailadressen.',
            },
            session_restrictions: {
                title: 'Sessies restricties',
                description: 'Tweefactorauthenticatie is vereist voor het beheren van inlog sessies.',
            },
            reimbursement_restrictions: {
                title: 'Declaraties restricties',
                description: 'Tweefactorauthenticatie is vereist voor het indienden van declaraties.',
            },
        },
        showcase: { filters: 'Filteren' },
        voucher_records: { hide_details: 'Verberg alle details', show_details: 'Toon alle details' },
        file_uploader: {
            title: 'Upload een document',
            or: 'of',
            upload_button: 'Upload een document',
            max_size: 'max. grootte 8Mb',
            max_files: 'Max. {[ count ]} files',
            attachments: 'Attachments',
        },
        file_item: {
            view_file: 'Bestand bekijken',
            download_file: 'Bestand downloaden',
            remove_file: 'Bestand verwijderen',
        },
        map_marker: {
            address: 'Adres',
            organization_type: 'Organisatie Type',
            phone: 'Telefoon',
            email: 'E-mail',
            view_details: 'Bekijk details',
        },
    },

    list_blocks: {
        fund_item_list: {
            status: {
                is_applicable: 'Aanvraagbaar',
                activateable: 'Activeerbaar',
                active: 'Actief',
                is_pending: 'In afwachting',
            },
            show_less: 'Toon minder',
            show_more: 'Toon meer',
            buttons: { is_applicable: 'Aanvragen', check_status: 'Controleer status' },
        },
        fund_item_search: {
            buttons: { is_pending: 'In afwachting', is_applicable: 'Aanvragen' },
            status: { active: 'Actief' },
        },
        product_item_grid: { bookmark: 'Toevoegen aan verlanglijstje' },
        product_item_list: { bookmark: 'Toevoegen aan verlanglijstje' },
        product_item_search: { free: 'Gratis' },
        provider_item_list: { open_provider: 'Open aanbieder', show_locations: 'Toon locaties', no_data: 'Geen data' },
        funds_list_pre_check: {
            show_more: 'Toon meer',
            show_less: 'Toon minder',
            external_website: 'Externe website bekijken',
            apply_related_funds:
                'Als u deze regeling aanvraagt, kunt u ook direct andere regelingen aanvragen. Dit geldt voor de volgende lijst met regelingen:',
            apply_parent_fund: 'Deze regeling kunt u aanvragen door een aanvraag te doen voor de volgende regeling:',
            not_available: 'Niet beschikbaar',
            total: 'Totaal',
            hide_explanation: 'Verberg de uitleg',
            view_explanation: 'Bekijk de uitleg',
            explanation: 'Uitleg',
            conditions: 'Voorwaarden',
            why: 'Waarom?',
            product_voucher: 'Product voucher',
            no_indication: 'Geen indicatie',
            low_chance: 'Lage kans',
            medium_chance: 'Gemiddelde kans',
            good_chance: 'Goede kans',
        },
    },

    product_bookmark_push: {
        list_message: 'Er staan {{ total }} aanbiedingen in het verlanglijstje',
        go_to_bookmarks: 'Ga naar mijn verlanglijstje',
        removed: '{{ name }} is verwijderd uit het verlanglijstje!',
    },

    push_notification_group: {
        auto_close_after: 'Automatisch sluiten na {{ dismissTime }} seconden',
        auto_close_disabled: 'Automatisch sluiten is uitgeschakeld',
        adjust: 'Aanpassen',
        hide_notifications: 'Hide +{{ count }} notifications',
        show_notifications: 'Show +{{ count }} notifications',
    },

    confirm_reimbursement_destroy: {
        title: 'Declaratie annuleren?',
        description: 'Weet je zeker dat je het declaratie verzoek wilt annuleren?',
        confirm_btn: 'Bevestigen',
    },

    confirm_taken_by_partner: {
        title: 'Tegoed activeren',
        header: 'Dit tegoed is al geactiveerd',
        close_btn: 'Bevestigen',
        description:
            'U krijgt deze melding omdat het tegoed is geactiveerd door een famielid of voogd. De tegoeden zijn beschikbaar in het account van de persoon die deze als eerste heeft geactiveerd.',
    },

    // PAGES
    auth: auth,
    auth_start: auth_start,
    bookmarked_products: bookmarked_products,
    provider_sign_up: provider_sign_up,
    terms_and_conditions: terms_and_conditions,
    explanation: explanation,
    security_sessions: security_sessions,
    security_2fa: security_2fa,
    notifications: notifications,
    products: products,
    providers_office: providers_office,

    me: me,
    signup_options: signup_options,
    fund: fund,
    fund_activate: fund_activate,
    fund_request: fund_request,
    fund_requests: fund_requests,
    fund_request_clarification: fund_request_clarification,
    funds: funds,
    provider: provider,
    providers: providers,
    home: home,
    signup: signup,
    search: search,
    sitemap: sitemap,
    wip: wip,
    not_found: not_found,

    meapp_index: meapp_index,
    product: product,
    records_validations: records_validations,
    records_create: records_create,
    records_validate: records_validate,
    records: records,
    voucher: voucher,
    vouchers: vouchers,

    payouts: payouts,
    reservation: reservation,
    reservations: reservations,
    reimbursements: reimbursements,
    preferences_notifications: preferences_notifications,
    profile: profile,
    preferences_emails: preferences_emails,
    voucher_printable: voucher_printable,
    accessibility: accessibility,
    error_page: error_page,
    privacy: privacy,
    error: error,

    // MODALS
    popup_auth: popup_auth,
    open_in_me: open_in_me,
    modal_physical_card: modal_physical_card,
    expired_identity: expired_identity,
    pdf_preview: pdf_preview,
    modal: modal,
    modal_product_reserve_extra_payment: modal_product_reserve_extra_payment,
    modal_product_reserve_cancel: modal_product_reserve_cancel,
    modal_reserve_product: modal_reserve_product,
    modal_2fa_setup: modal_2fa_setup,
    modal_2fa_deactivate: modal_2fa_deactivate,
    modal_photo_cropper: modal_photo_cropper,
    reimbursement_confirmation: reimbursement_confirmation,
    modal_physical_card_unlink: modal_physical_card_unlink,
    modal_fund_help: modal_fund_help,
    modal_pin_code: modal_pin_code,
    modal_logout: modal_logout,

    // DIRECTIVES
    app_footer: app_footer,
    block_products: block_products,
    block_funds: block_funds,
    block_notifications: block_notifications,
    block_providers: block_providers,
    empty_block: empty_block,
    fund_criterion: fund_criterion,
    maps: maps,
    profile_menu: profile_menu,
    top_navbar_search: top_navbar_search,
    paginator: paginator,
};
