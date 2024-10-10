import React from 'react';
import RouterBuilder from '../../dashboard/modules/state_router/RouterBuilder';
import NotFound from '../components/pages_system/NotFound';
import Home from '../components/pages/home/Home';
import Funds from '../components/pages/funds/Funds';
import SignOut from '../components/pages/auth/SignOut';
import FundsShow from '../components/pages/funds-show/FundsShow';
import Start from '../components/pages/auth/Start';
import IdentityRestore from '../components/pages/auth/IdentityRestore';
import Products from '../components/pages/products/Products';
import Subsidies from '../components/pages/subsidies/Subsidies';
import Providers from '../components/pages/providers/Providers';
import ProvidersShow from '../components/pages/providers-show/ProvidersShow';
import ProductsShow from '../components/pages/products-show/ProductsShow';
import Explanation from '../components/pages/cms-pages/Explanation';
import PreferencesEmails from '../components/pages/identity-emails/PreferencesEmails';
import Redirect from '../components/pages/redirect/Redirect';
import SecuritySessions from '../components/pages/identity-security/SecuritySessions';
import Security2FA from '../components/pages/identity-security/Security2FA';
import Notifications from '../components/pages/notifications/Notifications';
import PreferencesNotifications from '../components/pages/preferences-notifications/PreferencesNotifications';
import FundRequests from '../components/pages/fund-requests/FundRequests';
import FundRequestsShow from '../components/pages/fund-requests-show/FundRequestsShow';
import Reimbursements from '../components/pages/reimbursements/Reimbursements';
import ReimbursementsCreate from '../components/pages/reimbursements-edit/ReimbursementsCreate';
import ReimbursementsShow from '../components/pages/reimbursements-show/ReimbursementsShow';
import ReimbursementsEdit from '../components/pages/reimbursements-edit/ReimbursementsEdit';
import Reservations from '../components/pages/reservations/Reservations';
import ReservationsShow from '../components/pages/reservations-show/ReservationsShow';
import BookmarkedProducts from '../components/pages/bookmarked-products/BookmarkedProducts';
import Vouchers from '../components/pages/vouchers/Vouchers';
import VouchersShow from '../components/pages/vouchers-show/VouchersShow';
import Sitemap from '../components/pages/sitemap/Sitemap';
import MeApp from '../components/pages/me-app/MeApp';
import Accessibility from '../components/pages/cms-pages/Accessibility';
import Privacy from '../components/pages/cms-pages/Privacy';
import TermsAndConditions from '../components/pages/cms-pages/TermsAndConditions';
import Error from '../components/pages/error/Error';
import FundRequestsClarification from '../components/pages/fund-requests-show/FundRequestsClarification';
import ProvidersSignUp from '../components/pages/providers-sign-up/ProvidersSignUp';
import Auth2FA from '../components/pages/auth/Auth2FA';
import ProvidersOffice from '../components/pages/providers-office/ProvidersOffice';
import Search from '../components/pages/search/Search';
import AuthLink from '../components/pages/auth/AuthLink';
import FundRequest from '../components/pages/funds-request/FundRequest';
import FundActivate from '../components/pages/funds-activate/FundActivate';
import FundsPreCheck from '../components/pages/funds-pre-check/FundsPreCheck';
import ThrowError from '../components/pages_system/ThrowError';
import Payouts from '../components/pages/payouts/Payouts';

const router = new RouterBuilder();

router.state('home', <Home />, {
    path: `/`,
    protected: false,
});

router.state('sign-up', <ProvidersSignUp />, {
    path: `/aanbieders/aanmelden`,
    protected: false,
});

router.state('start', <Start />, {
    path: `/start`,
    protected: false,
});

router.state('auth-2fa', <Auth2FA />, {
    path: `/auth-2fa`,
    protected: true,
});

router.state('identity-restore', <IdentityRestore confirmation={false} />, {
    path: `/identity-restore`,
    protected: false,
});

router.state('identity-confirmation', <IdentityRestore confirmation={true} />, {
    path: `/confirmation/email/:token`,
    protected: false,
});

router.state('funds', <Funds />, {
    path: `/fondsen`,
    altPath: `/funds`,
    protected: false,
});

router.state('fund', <FundsShow />, {
    path: `/fondsen/:id`,
    altPath: [`/fund/:id`, `/funds/:id`],
    protected: false,
});

router.state('fund-request', <FundRequest />, {
    path: '/fondsen/:id/aanvraag',
    altPath: ['/fund/:id/request', '/funds/:id/request'],
    protected: true,
});

router.state('fund-activate', <FundActivate />, {
    path: `/fondsen/:id/activeer`,
    altPath: `/fund/:id/activate`,
    protected: true,
});

router.state('fund-requests', <FundRequests />, {
    path: `/fondsen-aanvraag`,
    altPath: `/fund-requests`,
    protected: true,
});

router.state('payouts', <Payouts />, {
    path: `/uitbetalingen`,
    altPath: `/payouts`,
    protected: true,
});

router.state('fund-request-show', <FundRequestsShow />, {
    path: `/fondsen-aanvraag/:id`,
    altPath: [`/fund-requests/:id`, `/fund-request/:id`],
    protected: true,
});

router.state('fund-request-clarification', <FundRequestsClarification />, {
    path: `/funds/:fund_id/requests/:request_id/clarifications/:clarification_id`,
    protected: false,
});

router.state('products', <Products fundType={'budget'} />, {
    path: `/aanbod`,
    altPath: `/products`,
    protected: false,
});

router.state('product', <ProductsShow />, {
    path: `/aanbod/:id`,
    altPath: `/products/:id`,
    protected: false,
});

router.state('actions', <Subsidies />, {
    path: `/acties`,
    altPath: `/actions`,
    protected: false,
});

router.state('providers', <Providers />, {
    path: `/aanbieders`,
    altPath: `/providers`,
    protected: false,
});

router.state('provider', <ProvidersShow />, {
    path: `/aanbieders/:id`,
    altPath: `/providers/:id`,
    protected: false,
});

router.state('provider-office', <ProvidersOffice />, {
    path: `/providers/:organization_id/offices/:id`,
    protected: false,
});

router.state('vouchers', <Vouchers />, {
    path: `/tegoeden`,
    altPath: `/vouchers`,
    protected: true,
});

router.state('voucher', <VouchersShow />, {
    path: `/tegoeden/:address`,
    altPath: `/vouchers/:address`,
    protected: true,
});

router.state('explanation', <Explanation />, {
    path: `/uitleg`,
    altPath: `/explanation`,
    protected: false,
});

router.state('privacy', <Privacy />, {
    path: `/privacy`,
    protected: false,
});

router.state('accessibility', <Accessibility />, {
    path: `/accessibility`,
    protected: false,
});

router.state('terms_and_conditions', <TermsAndConditions />, {
    path: `/algemene-voorwaarden`,
    altPath: `/terms-and-conditions`,
    protected: false,
});

router.state('me-app', <MeApp />, {
    path: `/me`,
    protected: false,
});

router.state('search-result', <Search />, {
    path: `/search`,
    protected: false,
});

router.state('reservations', <Reservations />, {
    path: `/reserveringen`,
    altPath: `/reservations`,
    protected: true,
});

router.state('reservation-show', <ReservationsShow />, {
    path: `/reserveringen/:id`,
    altPath: `/reservations/:id`,
    protected: true,
});

router.state('reimbursements', <Reimbursements />, {
    path: `/declaraties`,
    altPath: `/reimbursements`,
    protected: true,
});

router.state('reimbursements-create', <ReimbursementsCreate />, {
    path: `/declaraties/maken`,
    altPath: `/reimbursements/create`,
    protected: true,
});

router.state('reimbursements-edit', <ReimbursementsEdit />, {
    path: `/declaraties/:id/bewerk`,
    altPath: `/reimbursements/:id/edit`,
    protected: true,
});

router.state('reimbursement', <ReimbursementsShow />, {
    path: `/declaraties/:id`,
    altPath: `/reimbursements/:id`,
    protected: true,
});

router.state('notifications', <Notifications />, {
    path: `/notifications`,
    protected: true,
});

router.state('identity-emails', <PreferencesEmails />, {
    path: `/identity-emails`,
    protected: true,
});

router.state('preferences-notifications', <PreferencesNotifications />, {
    path: `/preferences/notifications/:section?`,
    protected: false,
});

router.state('bookmarked-products', <BookmarkedProducts />, {
    path: `/verlanglijst`,
    altPath: `/bookmarks`,
    protected: true,
});

router.state('fund-pre-check', <FundsPreCheck />, {
    path: `/regelcheck`,
    altPath: `/fund-pre-check`,
    protected: false,
});

router.state('sitemap', <Sitemap />, {
    path: `/sitemap`,
    protected: false,
});

router.state('security-2fa', <Security2FA />, {
    path: `/beveiliging/2fa`,
    altPath: `/security/2fa`,
    protected: true,
});

router.state('security-sessions', <SecuritySessions />, {
    path: `/beveiliging/sessies`,
    altPath: `/security/sessions`,
    protected: true,
});

router.state('sign-out', <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state('redirect', <Redirect />, {
    path: `/redirect`,
});

router.state('auth-link', <AuthLink />, {
    path: `/auth-link`,
    protected: false,
});

router.state('error', <Error />, {
    path: `/error/:errorCode`,
    protected: false,
});

router.state('not-found', <NotFound />, {
    path: `/not-found`,
    protected: false,
});

router.state('throw', <ThrowError />, {
    path: `/throw`,
    protected: false,
});

router.state('*', <NotFound />, {
    path: `*`,
    protected: false,
});

export default router;
