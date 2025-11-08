import React from 'react';
import NotFound from '../components/pages_system/NotFound';
import Home from '../components/pages/home/Home';
import Funds from '../components/pages/funds/Funds';
import SignOut from '../components/pages/auth/SignOut';
import FundsShow from '../components/pages/funds-show/FundsShow';
import Start from '../components/pages/auth/Start';
import IdentityRestore from '../components/pages/auth/IdentityRestore';
import Products from '../components/pages/products/Products';
import Providers from '../components/pages/providers/Providers';
import ProvidersShow from '../components/pages/providers-show/ProvidersShow';
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
import PhysicalCards from '../components/pages/physical_cards/PhysicalCards';
import BookmarkedProducts from '../components/pages/bookmarked-products/BookmarkedProducts';
import Vouchers from '../components/pages/vouchers/Vouchers';
import Sitemap from '../components/pages/sitemap/Sitemap';
import MeApp from '../components/pages/me-app/MeApp';
import Accessibility from '../components/pages/cms-pages/Accessibility';
import Privacy from '../components/pages/cms-pages/Privacy';
import TermsAndConditions from '../components/pages/cms-pages/TermsAndConditions';
import Error from '../components/pages/error/Error';
import FundRequestsClarification from '../components/pages/fund-requests-show/FundRequestsClarification';
import ProvidersSignUp from '../components/pages/cms-pages/ProvidersSignUp';
import Auth2FA from '../components/pages/auth/Auth2FA';
import ProvidersOffice from '../components/pages/providers-office/ProvidersOffice';
import Search from '../components/pages/search/Search';
import AuthLink from '../components/pages/auth/AuthLink';
import FundRequest from '../components/pages/funds-request/FundRequest';
import FundActivate from '../components/pages/funds-activate/FundActivate';
import FundsPreCheck from '../components/pages/funds-pre-check/FundsPreCheck';
import ThrowError from '../components/pages_system/ThrowError';
import Payouts from '../components/pages/payouts/Payouts';
import Profile from '../components/pages/profile/Profile';
import VouchersShow from '../components/pages/vouchers-show/VouchersShow';
import ProductsShow from '../components/pages/products-show/ProductsShow';
import RouterBuilder, { WebshopRoutes } from '../modules/state_router/RouterBuilder';

const router = new RouterBuilder();

router.state(WebshopRoutes.HOME, <Home />, {
    path: `/`,
    protected: false,
});

router.state(WebshopRoutes.SIGN_UP, <ProvidersSignUp />, {
    path: `/aanbieders/aanmelden`,
    protected: false,
});

router.state(WebshopRoutes.START, <Start />, {
    path: `/start`,
    protected: false,
});

router.state(WebshopRoutes.AUTH_2FA, <Auth2FA />, {
    path: `/auth-2fa`,
    protected: true,
});

router.state(WebshopRoutes.IDENTITY_RESTORE, <IdentityRestore confirmation={false} />, {
    path: `/identity-restore`,
    protected: false,
});

router.state(WebshopRoutes.IDENTITY_CONFIRMATION, <IdentityRestore confirmation={true} />, {
    path: `/confirmation/email/:token`,
    protected: false,
});

router.state(WebshopRoutes.FUNDS, <Funds />, {
    path: `/fondsen`,
    altPath: `/funds`,
    protected: false,
});

router.state(WebshopRoutes.FUND, <FundsShow />, {
    path: `/fondsen/:id`,
    altPath: [`/fund/:id`, `/funds/:id`],
    protected: false,
});

router.state(WebshopRoutes.FUND_REQUEST, <FundRequest />, {
    path: '/fondsen/:id/aanvraag',
    altPath: ['/fund/:id/request', '/funds/:id/request'],
    protected: true,
});

router.state(WebshopRoutes.FUND_ACTIVATE, <FundActivate />, {
    path: `/fondsen/:id/activeer`,
    altPath: `/fund/:id/activate`,
    protected: true,
});

router.state(WebshopRoutes.FUND_REQUESTS, <FundRequests />, {
    path: `/fondsen-aanvraag`,
    altPath: `/fund-requests`,
    protected: true,
});

router.state(WebshopRoutes.PAYOUTS, <Payouts />, {
    path: `/uitbetalingen`,
    altPath: `/payouts`,
    protected: true,
});

router.state(WebshopRoutes.FUND_REQUEST_SHOW, <FundRequestsShow />, {
    path: `/fondsen-aanvraag/:id`,
    altPath: [`/fund-requests/:id`, `/fund-request/:id`],
    protected: false,
});

router.state(WebshopRoutes.FUND_REQUEST_CLARIFICATION, <FundRequestsClarification />, {
    path: `/funds/:fund_id/requests/:request_id/clarifications/:clarification_id`,
    protected: false,
});

router.state(WebshopRoutes.PRODUCTS, <Products />, {
    path: `/aanbod`,
    altPath: `/products`,
    protected: false,
});

router.state(WebshopRoutes.PRODUCT, <ProductsShow />, {
    path: `/aanbod/:id`,
    altPath: `/products/:id`,
    protected: false,
});

router.state(WebshopRoutes.PROVIDERS, <Providers />, {
    path: `/aanbieders`,
    altPath: `/providers`,
    protected: false,
});

router.state(WebshopRoutes.PROVIDER, <ProvidersShow />, {
    path: `/aanbieders/:id`,
    altPath: `/providers/:id`,
    protected: false,
});

router.state(WebshopRoutes.PROVIDER_OFFICE, <ProvidersOffice />, {
    path: `/providers/:organization_id/offices/:id`,
    protected: false,
});

router.state(WebshopRoutes.VOUCHERS, <Vouchers />, {
    path: `/tegoeden`,
    altPath: `/vouchers`,
    protected: true,
});

router.state(WebshopRoutes.VOUCHER, <VouchersShow />, {
    path: `/tegoeden/:number`,
    altPath: `/vouchers/:number`,
    protected: true,
});

router.state(WebshopRoutes.EXPLANATION, <Explanation />, {
    path: `/uitleg`,
    altPath: `/explanation`,
    protected: false,
});

router.state(WebshopRoutes.PRIVACY, <Privacy />, {
    path: `/privacy`,
    protected: false,
});

router.state(WebshopRoutes.ACCESSIBILITY, <Accessibility />, {
    path: `/accessibility`,
    protected: false,
});

router.state(WebshopRoutes.TERMS_AND_CONDITIONS, <TermsAndConditions />, {
    path: `/algemene-voorwaarden`,
    altPath: `/terms-and-conditions`,
    protected: false,
});

router.state(WebshopRoutes.ME_APP, <MeApp />, {
    path: `/me`,
    protected: false,
});

router.state(WebshopRoutes.SEARCH, <Search />, {
    path: `/search`,
    protected: false,
});

router.state(WebshopRoutes.RESERVATIONS, <Reservations />, {
    path: `/reserveringen`,
    altPath: `/reservations`,
    protected: true,
});

router.state(WebshopRoutes.RESERVATION, <ReservationsShow />, {
    path: `/reserveringen/:id`,
    altPath: `/reservations/:id`,
    protected: true,
});

router.state(WebshopRoutes.PHYSICAL_CARDS, <PhysicalCards />, {
    path: `/fysieke-pas`,
    altPath: `/physical-cards`,
    protected: true,
});

router.state(WebshopRoutes.REIMBURSEMENTS, <Reimbursements />, {
    path: `/declaraties`,
    altPath: `/reimbursements`,
    protected: true,
});

router.state(WebshopRoutes.REIMBURSEMENT_CREATE, <ReimbursementsCreate />, {
    path: `/declaraties/maken`,
    altPath: `/reimbursements/create`,
    protected: true,
});

router.state(WebshopRoutes.REIMBURSEMENT_EDIT, <ReimbursementsEdit />, {
    path: `/declaraties/:id/bewerk`,
    altPath: `/reimbursements/:id/edit`,
    protected: true,
});

router.state(WebshopRoutes.REIMBURSEMENT, <ReimbursementsShow />, {
    path: `/declaraties/:id`,
    altPath: `/reimbursements/:id`,
    protected: true,
});

router.state(WebshopRoutes.NOTIFICATIONS, <Notifications />, {
    path: `/notifications`,
    protected: true,
});

router.state(WebshopRoutes.IDENTITY_EMAILS, <PreferencesEmails />, {
    path: `/identity-emails`,
    protected: true,
});

router.state(WebshopRoutes.PREFERENCE_NOTIFICATIONS, <PreferencesNotifications />, {
    path: `/preferences/notifications/:section?`,
    protected: false,
});

router.state(WebshopRoutes.PROFILE, <Profile />, {
    path: `/gegevens`,
    altPath: `/profile`,
    protected: false,
});

router.state(WebshopRoutes.BOOKMARKED_PRODUCTS, <BookmarkedProducts />, {
    path: `/verlanglijst`,
    altPath: `/bookmarks`,
    protected: true,
});

router.state(WebshopRoutes.FUND_PRE_CHECK, <FundsPreCheck />, {
    path: `/regelingencheck`,
    altPath: `/fund-pre-check`,
    protected: false,
});

router.state(WebshopRoutes.SITEMAP, <Sitemap />, {
    path: `/sitemap`,
    protected: false,
});

router.state(WebshopRoutes.SECURITY_2FA, <Security2FA />, {
    path: `/beveiliging/2fa`,
    altPath: `/security/2fa`,
    protected: true,
});

router.state(WebshopRoutes.SECURITY_SESSIONS, <SecuritySessions />, {
    path: `/beveiliging/sessies`,
    altPath: `/security/sessions`,
    protected: true,
});

router.state(WebshopRoutes.SIGN_OUT, <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state(WebshopRoutes.REDIRECT, <Redirect />, {
    path: `/redirect`,
    protected: false,
});

router.state(WebshopRoutes.AUTH_LINK, <AuthLink />, {
    path: `/auth-link`,
    protected: false,
});

router.state(WebshopRoutes.ERROR, <Error />, {
    path: `/error/:errorCode`,
    protected: false,
});

router.state(WebshopRoutes.NOT_FOUND, <NotFound />, {
    path: `/not-found`,
    protected: false,
});

router.state(WebshopRoutes.THROW, <ThrowError />, {
    path: `/throw`,
    protected: false,
});

router.state(WebshopRoutes.ANY, <NotFound />, {
    path: `*`,
    protected: false,
});

export default router;
