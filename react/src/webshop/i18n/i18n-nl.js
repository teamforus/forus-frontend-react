import buttons from './nl/components/buttons';
import topnavbar from './nl/layout/navbar';

import signup_options from './nl/pages/signup-options';
import fund from './nl/pages/fund';
import fund_activate from './nl/pages/fund-activate';
import fund_request from './nl/pages/fund-request';
import fund_requests from './nl/pages/fund-requests';
import fund_request_clarification from './nl/pages/fund-request-clarification';
import funds from './nl/pages/funds';
import home from './nl/pages/home';
import signup from './nl/pages/signup';
import meapp_index from './nl/pages/me-index';
import product from './nl/pages/product';
import records_validations from './nl/pages/record-validations';
import records_create from './nl/pages/records-create';
import records_validate from './nl/pages/records-validate';
import records from './nl/pages/records';
import voucher from './nl/pages/voucher';
import vouchers from './nl/pages/vouchers';
import reservations from './nl/pages/reservations';
import reimbursements from './nl/pages/reimbursements';
import notification_preferences from './nl/pages/notification-preferences';
import email_preferences from './nl/pages/email-preferences';
import voucher_printable from './nl/pages/voucher-printable';
import accessibility from './nl/pages/accessibility';
import error_page from './nl/pages/error-page';
import privacy from './nl/pages/privacy';
import error from './nl/pages/error';

import popup_auth from './nl/modals/modal-auth';
import logout from './nl/modals/modal-logout';
import popup_offices from './nl/modals/modal-offices';
import open_in_me from './nl/modals/modal-open-in-me';
import physical_card from './nl/modals/modal-physical_card';
import expired_identity from './nl/modals/modal-expired-identity-proxy';
import pdf_preview from './nl/modals/modal-pdf-preview';
import image_preview from './nl/modals/modal-image-preview';
import modal from './nl/modals/modal';
import modal_product_reserve from './nl/modals/modal-product-reserve';
import modal_product_reserve_notes from './nl/modals/modal-product-reserve-notes';
import modal_product_reserve_extra_payment from './nl/modals/modal-product-reserve-extra-payment';
import modal_product_reserve_cancel from './nl/modals/modal-product-reserve-cancel';
import modal_2fa_setup from './nl/modals/modal-2fa-setup';

import app_footer from './nl/directives/app-footer';
import block_products from './nl/directives/block-products';
import block_funds from './nl/directives/block-funds';
import block_notifications from './nl/directives/block-notifications';
import block_providers from './nl/directives/block-providers';
import empty_block from './nl/directives/empty-block';
import fund_criterion from './nl/directives/fund-criterion';
import maps from './nl/directives/google-map';
import profile_menu from './nl/directives/profile-menu';
import top_navbar_search from './nl/directives/top-navbar-search';
import reservation from './nl/directives/reservation-card';
import paginator from './nl/directives/paginator';

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
        en: 'English',
        nl: 'Dutch',
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
    topnavbar: topnavbar,

    // PAGES
    signup_options: signup_options,
    fund: fund,
    fund_activate: fund_activate,
    fund_request: fund_request,
    fund_requests: fund_requests,
    fund_request_clarification: fund_request_clarification,
    funds: funds,
    home: home,
    signup: signup,
    meapp_index: meapp_index,
    product: product,
    records_validations: records_validations,
    records_create: records_create,
    records_validate: records_validate,
    records: records,
    voucher: voucher,
    vouchers: vouchers,
    reservations: reservations,
    reimbursements: reimbursements,
    notification_preferences: notification_preferences,
    email_preferences: email_preferences,
    voucher_printable: voucher_printable,
    accessibility: accessibility,
    error_page: error_page,
    privacy: privacy,
    error: error,

    // MODALS
    popup_auth: popup_auth,
    logout: logout,
    popup_offices: popup_offices,
    open_in_me: open_in_me,
    physical_card: physical_card,
    expired_identity: expired_identity,
    pdf_preview: pdf_preview,
    image_preview: image_preview,
    modal: modal,
    modal_product_reserve: modal_product_reserve,
    modal_product_reserve_notes: modal_product_reserve_notes,
    modal_product_reserve_extra_payment: modal_product_reserve_extra_payment,
    modal_product_reserve_cancel: modal_product_reserve_cancel,
    modal_2fa_setup: modal_2fa_setup,

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
    reservation: reservation,
    paginator: paginator,
};
