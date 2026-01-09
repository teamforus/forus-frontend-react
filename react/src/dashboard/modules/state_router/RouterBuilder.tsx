import React from 'react';
import { LayoutType, RouteState, RouteStateConfig } from './RouterProps';

export enum DashboardRoutes {
    SIGN_IN = 'sign-in',
    SIGN_UP = 'sign-up',
    SIGN_OUT = 'sign-out',
    AUTH_2FA = 'auth-2fa',
    IDENTITY_RESTORE = 'identity-restore',
    IDENTITY_CONFIRMATION = 'identity-confirmation',
    ORGANIZATIONS = 'organizations',
    ORGANIZATION = 'organizations-view',
    ORGANIZATION_EDIT = 'organizations-edit',
    ORGANIZATION_CREATE = 'organizations-create',
    ORGANIZATION_FUNDS = 'organization-funds',
    FUND_BACKOFFICE_EDIT = 'fund-backoffice-edit',
    FUND = 'funds-show',
    FUND_CREATE = 'funds-create',
    FUND_EDIT = 'funds-edit',
    FUND_SECURITY = 'funds-security',
    SPONSOR_PROVIDER_ORGANIZATIONS = 'sponsor-provider-organizations',
    SPONSOR_PROVIDER_ORGANIZATION = 'sponsor-provider-organization',
    PAYOUTS = 'payouts',
    PAYOUT = 'payout',
    IDENTITIES = 'identities',
    IDENTITY = 'identities-show',
    HOUSEHOLDS = 'households',
    HOUSEHOLD = 'households-show',
    FUND_PROVIDER = 'fund-provider',
    FUND_PROVIDER_PRODUCT_CREATE = 'fund-provider-product-create',
    FUND_PROVIDER_PRODUCT = 'fund-provider-product',
    FUND_PROVIDER_PRODUCT_EDIT = 'fund-provider-product-edit',
    SPONSOR_PRODUCTS = 'sponsor-products',
    SPONSOR_PRODUCT = 'sponsor-product',
    BANK_CONNECTIONS = 'bank-connections',
    FINANCIAL_DASHBOARD = 'financial-dashboard',
    FINANCIAL_DASHBOARD_OVERVIEW = 'financial-dashboard-overview',
    VOUCHERS = 'vouchers',
    VOUCHER = 'vouchers-show',
    PHYSICAL_CARDS = 'physical-cards',
    PHYSICAL_CARD_TYPE = 'physical-card-types-show',
    REIMBURSEMENTS = 'reimbursements',
    REIMBURSEMENT = 'reimbursements-view',
    REIMBURSEMENT_CATEGORIES = 'reimbursement-categories',
    EXTRA_PAYMENTS = 'extra-payments',
    EXTRA_PAYMENT = 'extra-payments-show',
    IMPLEMENTATIONS = 'implementations',
    IMPLEMENTATION = 'implementations-view',
    IMPLEMENTATION_PRE_CHECK = 'implementation-pre-check',
    IMPLEMENTATION_FUNDS = 'implementation-funds',
    IMPLEMENTATION_VIEW_PAGES = 'implementation-view-pages',
    IMPLEMENTATION_TERMS_PRIVACY = 'implementation-terms-privacy',
    IMPLEMENTATION_ANNOUNCEMENTS = 'implementation-announcements',
    IMPLEMENTATION_VIEW_BANNER = 'implementation-view-banner',
    IMPLEMENTATION_VIEW_PAGE_EDIT = 'implementation-view-page-edit',
    IMPLEMENTATION_VIEW_PAGE_CREATE = 'implementation-view-page-create',
    IMPLEMENTATION_CONFIG = 'implementations-config',
    IMPLEMENTATION_EMAIL = 'implementations-email',
    IMPLEMENTATION_COOKIES = 'implementations-cookies',
    IMPLEMENTATION_TRANSLATIONS = 'implementations-translations',
    IMPLEMENTATION_DIGID = 'implementations-digid',
    IMPLEMENTATION_SOCIAL_MEDIA = 'implementations-social-media',
    IMPLEMENTATION_NOTIFICATIONS = 'implementation-notifications',
    IMPLEMENTATION_NOTIFICATION_EDIT = 'implementation-notifications-edit',
    IMPLEMENTATION_NOTIFICATIONS_SEND = 'implementation-notifications-send-send',
    IMPLEMENTATION_NOTIFICATIONS_BRANDING = 'implementation-notifications-branding',
    ORGANIZATION_LOGS = 'organization-logs',
    BI_CONNECTION = 'bi-connection',
    ORGANIZATION_CONTACTS = 'organizations-contacts',
    ORGANIZATION_TRANSLATIONS = 'organizations-translations',
    OFFICES = 'offices',
    OFFICE_CREATE = 'offices-create',
    OFFICE_EDIT = 'offices-edit',
    ORGANIZATION_SECURITY = 'organization-security',
    ORGANIZATION_NO_PERMISSIONS = 'organization-no-permissions',
    PROVIDER_OVERVIEW = 'provider-overview',
    PROVIDER_FUNDS = 'provider-funds',
    TRANSACTIONS = 'transactions',
    TRANSACTION_SETTINGS = 'transaction-settings',
    TRANSACTION_BULK = 'transaction-bulk',
    TRANSACTION = 'transaction',
    RESERVATIONS = 'reservations',
    RESERVATION = 'reservations-show',
    RESERVATIONS_SETTINGS = 'reservations-settings',
    PAYMENT_METHODS = 'payment-methods',
    MOLLIE_PRIVACY = 'mollie-privacy',
    PRODUCTS = 'products',
    PRODUCT = 'products-show',
    PRODUCT_CREATE = 'products-create',
    PRODUCT_EDIT = 'products-edit',
    FUND_REQUESTS = 'fund-requests',
    FUND_REQUEST = 'fund-request',
    FUND_FORMS = 'fund-forms',
    FUND_FORM = 'fund-form',
    EMPLOYEES = 'employees',
    FEATURES = 'features',
    FEATURE = 'feature',
    ORGANIZATION_NOTIFICATIONS = 'organization-notifications',
    FEEDBACK = 'feedback',
    CSV_VALIDATION = 'csv-validation',
    PREVALIDATION_REQUESTS = 'prevalidation-requests',
    PREFERENCE_EMAILS = 'preferences-emails',
    PREFERENCE_NOTIFICATIONS = 'preferences-notifications',
    SECURITY_2FA = 'security-2fa',
    SECURITY_SESSIONS = 'security-sessions',
    REDIRECT = 'redirect',
    HOME = 'home',
    NOT_FOUND = 'not-found',
    THROW = 'throw',
    ANY = '*',
}

export default class RouterBuilder {
    constructor(protected states: Array<RouteState> = []) {}

    state(
        name: DashboardRoutes,
        element: React.ReactElement,
        state: RouteStateConfig & { altPath?: string | Array<string> },
    ) {
        const altPaths: Array<string> = state.altPath
            ? Array.isArray(state.altPath)
                ? state.altPath
                : [state.altPath]
            : [];

        this.states.push({
            state: { name, layout: LayoutType.dashboard, protected: true, ...state },
            element: element,
        });

        altPaths.forEach((path) => {
            this.states.push({
                state: { name, layout: LayoutType.dashboard, protected: true, ...{ ...state, path } },
                element: element,
            });
        });
    }

    getRoutes() {
        return this.states;
    }
}
