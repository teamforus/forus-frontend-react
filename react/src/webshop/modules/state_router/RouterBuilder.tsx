import React from 'react';
import { LayoutType, RouteState, RouteStateConfig } from './RouterProps';

export enum WebshopRoutes {
    HOME = 'home',
    SIGN_UP = 'sign-up',
    START = 'start',
    AUTH_2FA = 'auth-2fa',
    IDENTITY_RESTORE = 'identity-restore',
    IDENTITY_CONFIRMATION = 'identity-confirmation',
    FUNDS = 'funds',
    FUND = 'fund',
    FUND_REQUEST = 'fund-request',
    FUND_ACTIVATE = 'fund-activate',
    FUND_REQUESTS = 'fund-requests',
    PAYOUTS = 'payouts',
    FUND_REQUEST_SHOW = 'fund-request-show',
    FUND_REQUEST_CLARIFICATION = 'fund-request-clarification',
    PRODUCTS = 'products',
    PRODUCT = 'product',
    PROVIDERS = 'providers',
    PROVIDER = 'provider',
    PROVIDER_OFFICE = 'provider-office',
    VOUCHERS = 'vouchers',
    VOUCHER = 'voucher',
    EXPLANATION = 'explanation',
    PRIVACY = 'privacy',
    ACCESSIBILITY = 'accessibility',
    TERMS_AND_CONDITIONS = 'terms_and_conditions',
    ME_APP = 'me-app',
    SEARCH = 'search-result',
    RESERVATIONS = 'reservations',
    RESERVATION = 'reservation-show',
    PHYSICAL_CARDS = 'physical-cards',
    REIMBURSEMENTS = 'reimbursements',
    REIMBURSEMENT_CREATE = 'reimbursements-create',
    REIMBURSEMENT_EDIT = 'reimbursements-edit',
    REIMBURSEMENT = 'reimbursement',
    NOTIFICATIONS = 'notifications',
    IDENTITY_EMAILS = 'identity-emails',
    PREFERENCE_NOTIFICATIONS = 'preferences-notifications',
    PROFILE = 'profile',
    BOOKMARKED_PRODUCTS = 'bookmarked-products',
    FUND_PRE_CHECK = 'fund-pre-check',
    SITEMAP = 'sitemap',
    SECURITY_2FA = 'security-2fa',
    SECURITY_SESSIONS = 'security-sessions',
    SIGN_OUT = 'sign-out',
    REDIRECT = 'redirect',
    AUTH_LINK = 'auth-link',
    ERROR = 'error',
    NOT_FOUND = 'not-found',
    THROW = 'throw',
    ANY = '*',
}

export default class RouterBuilder {
    constructor(protected states: Array<RouteState> = []) {}

    state(
        name: WebshopRoutes,
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
