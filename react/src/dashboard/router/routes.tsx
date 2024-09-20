import React from 'react';
import RouterBuilder from '../modules/state_router/RouterBuilder';
import SignIn from '../components/pages/auth/SignIn';
import SignUp from '../components/pages/auth/SignUp';
import SignOut from '../components/pages/auth/SignOut';
import FundRequests from '../components/pages/fund-requests/FundRequests';
import FundRequestsView from '../components/pages/fund-requests-view/FundRequestsView';
import Home from '../components/pages/home/Home';
import Employees from '../components/pages/employees/Employees';
import CsvValidations from '../components/pages/csv_validations/CsvValidations';
import Organizations from '../components/pages/organizations/Organizations';
import IdentityRestore from '../components/pages/auth/IdentityRestore';
import Redirect from '../components/pages/redirect/Redirect';
import { LayoutType } from '../modules/state_router/RouterProps';
import OfficesEdit from '../components/pages/offices-edit/OfficesEdit';
import OfficesCreate from '../components/pages/offices-edit/OfficesCreate';
import OrganizationEdit from '../components/pages/organizations-edit/OrganizationEdit';
import OrganizationCreate from '../components/pages/organizations-edit/OrganizationCreate';
import Auth2FA from '../components/pages/auth/Auth2FA';
import ProviderOverview from '../components/pages/provider-overview/ProviderOverview';
import Offices from '../components/pages/offices/Offices';
import Products from '../components/pages/products/Products';
import ProductsCreate from '../components/pages/products-edit/ProductsCreate';
import ProductsEdit from '../components/pages/products-edit/ProductsEdit';
import ProductsView from '../components/pages/products-view/ProductsView';
import Transactions from '../components/pages/transactions/Transactions';
import TransactionSettings from '../components/pages/transaction-settings/TransactionSettings';
import TransactionsView from '../components/pages/transactions-view/TransactionsView';
import Reservations from '../components/pages/reservations/Reservations';
import ReservationsSettings from '../components/pages/reservations-settings/ReservationsSettings';
import ReservationsView from '../components/pages/reservations-view/ReservationsView';
import ProviderFunds from '../components/pages/provider-funds/ProviderFunds';
import Feedback from '../components/pages/feedback/Feedback';
import NotFound from '../components/pages_system/NotFound';
import OrganizationsSecurity from '../components/pages/organizations-security/OrganizationsSecurity';
import OrganizationsView from '../components/pages/organizations-view/OrganizationsView';
import OrganizationsNotifications from '../components/pages/organizations-notifications/OrganizationsNotifications';
import PreferencesEmails from '../components/pages/identity-preferences/PreferencesEmails';
import PreferencesNotifications from '../components/pages/identity-preferences/PreferencesNotifications';
import Security2FA from '../components/pages/identity-security/Security2FA';
import SecuritySessions from '../components/pages/identity-security/SecuritySessions';
import OrganizationsNoPermissions from '../components/pages/organizations-no-permissions/OrganizationsNoPermissions';
import PaymentMethods from '../components/pages/payment-methods/PaymentMethods';
import MolliePrivacy from '../components/pages/mollie-privacy/MolliePrivacy';
import Reimbursements from '../components/pages/reimbursements/Reimbursements';
import ReimbursementsView from '../components/pages/reimbursements-view/ReimbursementsView';
import BankConnections from '../components/pages/bank-connections/BankConnections';
import ExtraPayments from '../components/pages/extra-payments/ExtraPayments';
import ExtraPaymentsView from '../components/pages/extra-payments-view/ExtraPaymentsView';
import Features from '../components/pages/features/Features';
import Feature from '../components/pages/feature/Feature';
import EventLogs from '../components/pages/eventLogs/EventLogs';
import ImplementationsView from '../components/pages/implementations-view/ImplementationsView';
import ImplementationsEmail from '../components/pages/implementations-email/ImplementationsEmail';
import ImplementationsDigid from '../components/pages/implementations-digid/ImplementationsDigid';
import FundBackofficeEdit from '../components/pages/fund-backoffice-edit/FundBackofficeEdit';
import ImplementationsCms from '../components/pages/implementations-cms/ImplementationsCms';
import ImplementationsConfig from '../components/pages/implementations-config/ImplementationsConfig';
import ImplementationsSocialMedia from '../components/pages/implementations-social-media/ImplementationsSocialMedia';
import ImplementationsCmsPageEdit from '../components/pages/implementations-cms-page/ImplementationsCmsPageEdit';
import ImplementationsCmsPageCreate from '../components/pages/implementations-cms-page/ImplementationsCmsPageCreate';
import FinancialDashboard from '../components/pages/financial-dashboard/FinancialDashboard';
import FinancialDashboardOverview from '../components/pages/financial-dashboard-overview/FinancialDashboardOverview';
import TransactionBulksView from '../components/pages/transaction-bulks-view/TransactionBulksView';
import ReimbursementCategories from '../components/pages/reimbursement-categories/ReimbursementCategories';
import Vouchers from '../components/pages/vouchers/Vouchers';
import VouchersViewComponent from '../components/pages/vouchers-view/VouchersViewComponent';
import SponsorProviderOrganizations from '../components/pages/sponsor-provider-organizations/SponsorProviderOrganizations';
import SponsorProviderOrganization from '../components/pages/sponsor-provider-organization/SponsorProviderOrganization';
import FundProvider from '../components/pages/fund-provider/FundProvider';
import SponsorProductsCreate from '../components/pages/sponsor-product-edit/SponsorProductsCreate';
import SponsorProductsEdit from '../components/pages/sponsor-product-edit/SponsorProductsEdit';
import FundProviderProductView from '../components/pages/fund-provider-product-view/FundProviderProductView';
import FundProviderProductSubsidyEdit from '../components/pages/fund-provider-product-subsidy-edit/FundProviderProductSubsidyEdit';
import ImplementationsNotifications from '../components/pages/implementations-notifications/ImplementationsNotifications';
import ImplementationsNotificationsSend from '../components/pages/implementations-notifications-send/ImplementationsNotificationsSend';
import ImplementationsNotificationsEdit from '../components/pages/implementations-notifications-edit/ImplementationsNotificationsEdit';
import ImplementationsNotificationsBranding from '../components/pages/implementations-notifications-branding/ImplementationsNotificationsBranding';
import OrganizationFunds from '../components/pages/organizations-funds/OrganizationFunds';
import OrganizationsFundsShow from '../components/pages/organizations-funds-show/OrganizationsFundsShow';
import OrganizationsFundsEdit from '../components/pages/organizations-funds-edit/OrganizationsFundsEdit';
import OrganizationsFundsSecurity from '../components/pages/organizations-funds-security/OrganizationsFundsSecurity';
import IdentitiesShow from '../components/pages/identitities-show/IdentitiesShow';
import PreCheck from '../components/pages/pre-check/PreCheck';
import BiConnection from '../components/pages/bi-connection/BiConnection';
import ThrowError from '../components/pages_system/ThrowError';
import Implementations from '../components/pages/implementations/Implementations';
import SponsorFundUnsubscriptions from '../components/pages/sponsor-fund-unsubscriptions/SponsorFundUnsubscriptions';
import OrganizationsContacts from '../components/pages/organizations-contacts/OrganizationsContacts';
import Payouts from '../components/pages/payouts/Payouts';
import PayoutsView from '../components/pages/payouts-view/PayoutsView';

const router = new RouterBuilder();

router.state('sign-in', <SignIn />, {
    path: `/inloggen`,
    altPath: `/sign-in`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state('sign-up', <SignUp />, {
    path: `/aanmelden`,
    altPath: `/sign-up`,
    layout: LayoutType.landingClearNew,
    protected: false,
});

router.state('sign-out', <SignOut />, {
    path: `/uitloggen`,
    altPath: `/sign-out`,
    protected: false,
});

router.state('auth-2fa', <Auth2FA />, {
    path: `/tweefactorauthenticatie`,
    altPath: `/auth-2fa`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state('identity-restore', <IdentityRestore confirmation={false} />, {
    path: `/identiteit-herstellen`,
    altPath: `/identity-restore`,
    protected: false,
});

router.state('identity-confirmation', <IdentityRestore confirmation={true} />, {
    path: `/bevestiging/email/:token`,
    altPath: `/confirmation/email/:token`,
    protected: false,
});

router.state('organizations', <Organizations />, {
    path: `/organisaties`,
    altPath: `/organizations`,
    protected: false,
});

router.state('organizations-view', <OrganizationsView />, {
    path: `/organisaties/:organizationId`,
    altPath: `/organizations/:organizationId`,
    protected: false,
});

router.state('organizations-create', <OrganizationCreate />, {
    path: `/organisaties/aanmaken`,
    altPath: `/organizations/create`,
    protected: false,
    fallbackState: 'organizations',
});

router.state('organizations-edit', <OrganizationEdit />, {
    path: `/organisaties/:organizationId/bewerken`,
    altPath: `/organizations/:organizationId/edit`,
    fallbackState: 'organizations',
});

router.state('organization-funds', <OrganizationFunds />, {
    path: `/organisaties/:organizationId/fondsen`,
    altPath: `/organizations/:organizationId/funds`,
    fallbackState: 'organizations',
});

router.state('fund-backoffice-edit', <FundBackofficeEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/backoffice`,
    altPath: `/organizations/:organizationId/funds/:fundId/backoffice`,
    fallbackState: 'organizations',
});

router.state('funds-show', <OrganizationsFundsShow />, {
    path: `/organisaties/:organizationId/fondsen/:fundId`,
    altPath: `/organizations/:organizationId/funds/:fundId`,
    fallbackState: 'organizations',
});

router.state('funds-create', <OrganizationsFundsEdit />, {
    path: `/organisaties/:organizationId/fondsen/aanmaken`,
    altPath: `/organizations/:organizationId/funds/create`,
});

router.state('funds-edit', <OrganizationsFundsEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/bewerken`,
    altPath: `/organizations/:organizationId/funds/:fundId/edit`,
    fallbackState: 'organizations',
});

router.state('funds-security', <OrganizationsFundsSecurity />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/beveiliging`,
    altPath: `/organizations/:organizationId/funds/:fundId/security`,
    fallbackState: 'organizations',
});

router.state('identities-show', <IdentitiesShow />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/identiteiten/:id`,
    altPath: `/organizations/:organizationId/funds/:fundId/identities/:id`,
    fallbackState: 'organizations',
});

router.state('pre-check', <PreCheck />, {
    path: `/organisaties/:organizationId/pre-check`,
    altPath: `/organizations/:organizationId/pre-check`,
});

router.state('sponsor-provider-organizations', <SponsorProviderOrganizations />, {
    path: `/organisaties/:organizationId/aanbieders`,
    altPath: `/organizations/:organizationId/providers`,
    fallbackState: 'organizations',
});

router.state('sponsor-provider-organization', <SponsorProviderOrganization />, {
    path: `/organisaties/:organizationId/aanbieders/:id`,
    altPath: `/organizations/:organizationId/providers/:id`,
    fallbackState: 'organizations',
});

router.state('payouts', <Payouts />, {
    path: `/organisaties/:organizationId/uitbetalingen`,
    altPath: `/organizations/:organizationId/payouts`,
});

router.state('payout', <PayoutsView />, {
    path: `/organisaties/:organizationId/uitbetalingen/:address`,
    altPath: `/organizations/:organizationId/payouts/:address`,
});

router.state('fund-provider', <FundProvider />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:id`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:id`,
    fallbackState: 'organizations',
});

router.state('fund-provider-product-create', <SponsorProductsCreate />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/aanmaken`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/create`,
    fallbackState: 'organizations',
});

router.state('fund-provider-product', <FundProviderProductView />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/:id`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/:id`,
    fallbackState: 'organizations',
});

router.state('fund-provider-product-edit', <SponsorProductsEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/:id/bewerken`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/:id/edit`,
    fallbackState: 'organizations',
});

router.state('fund-provider-product-subsidy-edit', <FundProviderProductSubsidyEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/:id/subsidie`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/:id/subsidy`,
    fallbackState: 'organizations',
});

router.state('sponsor-fund-unsubscriptions', <SponsorFundUnsubscriptions />, {
    path: `/organisaties/:organizationId/fonds-afmeldingen`,
    altPath: `/organizations/:organizationId/fund-unsubscriptions`,
    fallbackState: 'organizations',
});

router.state('bank-connections', <BankConnections />, {
    path: `/organisaties/:organizationId/bank-integraties`,
    altPath: `/organizations/:organizationId/bank-connections`,
});

router.state('financial-dashboard', <FinancialDashboard />, {
    path: `/organisaties/:organizationId/financieel-dashboard`,
    altPath: `/organizations/:organizationId/financial-dashboard`,
});

router.state('financial-dashboard-overview', <FinancialDashboardOverview />, {
    path: `/organisaties/:organizationId/financieel-dashboard-overzicht`,
    altPath: `/organizations/:organizationId/financial-dashboard-overview`,
});

router.state('vouchers', <Vouchers />, {
    path: `/organisaties/:organizationId/tegoeden`,
    altPath: `/organizations/:organizationId/vouchers`,
});

router.state('vouchers-show', <VouchersViewComponent />, {
    path: `/organisaties/:organizationId/tegoeden/:id`,
    altPath: `/organizations/:organizationId/vouchers/:id`,
    fallbackState: 'organizations',
});

router.state('reimbursements', <Reimbursements />, {
    path: `/organisaties/:organizationId/declaraties`,
    altPath: `/organizations/:organizationId/reimbursements`,
});

router.state('reimbursements-view', <ReimbursementsView />, {
    path: `/organisaties/:organizationId/declaraties/:id`,
    altPath: `/organizations/:organizationId/reimbursements/:id`,
    fallbackState: 'reimbursements',
});

router.state('reimbursement-categories', <ReimbursementCategories />, {
    path: `/organisaties/:organizationId/declaraties-categorieën`,
    altPath: `/organizations/:organizationId/reimbursement-categories`,
});

router.state('extra-payments', <ExtraPayments />, {
    path: `/organisaties/:organizationId/bijbetalingen`,
    altPath: `/organizations/:organizationId/extra-payments`,
    fallbackState: 'organizations',
});

router.state('extra-payments-show', <ExtraPaymentsView />, {
    path: `/organisaties/:organizationId/bijbetalingen/:id`,
    altPath: `/organizations/:organizationId/extra-payments/:id`,
    fallbackState: 'organizations',
});

router.state('implementations', <Implementations />, {
    path: `/organisaties/:organizationId/implementaties`,
    altPath: `/organizations/:organizationId/implementations`,
    fallbackState: 'organizations',
});

router.state('implementations-view', <ImplementationsView />, {
    path: `/organisaties/:organizationId/implementaties/:id`,
    altPath: `/organizations/:organizationId/implementations/:id`,
    fallbackState: 'organizations',
});

router.state('implementations-cms', <ImplementationsCms />, {
    path: `/organisaties/:organizationId/implementaties/:id/cms`,
    altPath: `/organizations/:organizationId/implementations/:id/cms`,
    fallbackState: 'organizations',
});

router.state('implementations-cms-page-edit', <ImplementationsCmsPageEdit />, {
    path: `/organisaties/:organizationId/implementaties/:implementationId/paginas/:id`,
    altPath: `/organizations/:organizationId/implementations/:implementationId/pages/:id`,
    fallbackState: 'organizations',
});

router.state('implementations-cms-page-create', <ImplementationsCmsPageCreate />, {
    path: `/organisaties/:organizationId/implementaties/:implementationId/paginas/aanmaken`,
    altPath: `/organizations/:organizationId/implementations/:implementationId/pages/create`,
    fallbackState: 'organizations',
});

router.state('implementations-config', <ImplementationsConfig />, {
    path: `/organisaties/:organizationId/implementaties/:id/configuratie`,
    altPath: `/organizations/:organizationId/implementations/:id/config`,
    fallbackState: 'organizations',
});

router.state('implementations-email', <ImplementationsEmail />, {
    path: `/organisaties/:organizationId/implementaties/:id/email`,
    altPath: `/organizations/:organizationId/implementations/:id/email`,
    fallbackState: 'organizations',
});

router.state('implementations-digid', <ImplementationsDigid />, {
    path: `/organisaties/:organizationId/implementaties/:id/digid`,
    altPath: `/organizations/:organizationId/implementations/:id/digid`,
    fallbackState: 'organizations',
});

router.state('implementations-social-media', <ImplementationsSocialMedia />, {
    path: `/organisaties/:organizationId/implementaties/:id/social-media`,
    altPath: `/organizations/:organizationId/implementations/:id/social-media`,
    fallbackState: 'organizations',
});

router.state('implementation-notifications', <ImplementationsNotifications />, {
    path: `/organisaties/:organizationId/implementatie-meldingen`,
    altPath: `/organizations/:organizationId/implementation-notifications`,
    fallbackState: 'organizations',
});

router.state('implementation-notifications-send', <ImplementationsNotificationsSend />, {
    path: `/organisaties/:organizationId/implementaties/:id/implementatie-meldingen/versturen`,
    altPath: `/organizations/:organizationId/implementations/:id/implementation-notifications/send`,
    fallbackState: 'organizations',
});

router.state('implementation-notifications-edit', <ImplementationsNotificationsEdit />, {
    path: `/organisaties/:organizationId/implementaties/:implementationId/implementatie-meldingen/:id`,
    altPath: `/organizations/:organizationId/implementations/:implementationId/implementation-notifications/:id`,
    fallbackState: 'organizations',
});

router.state('implementation-notifications-branding', <ImplementationsNotificationsBranding />, {
    path: `/organisaties/:organizationId/implementaties/:id/meldingen-branding`,
    altPath: `/organizations/:organizationId/implementations/:id/notifications-branding`,
    fallbackState: 'organizations',
});

router.state('organization-logs', <EventLogs />, {
    path: `/organisaties/:organizationId/logs`,
    altPath: `/organizations/:organizationId/logs`,
    fallbackState: 'organizations',
});

router.state('bi-connection', <BiConnection />, {
    path: `/organisaties/:organizationId/bi-integratie`,
    altPath: `/organizations/:organizationId/bi-connection`,
    fallbackState: 'organizations',
});

router.state('organizations-contacts', <OrganizationsContacts />, {
    path: `/organisaties/:organizationId/contacten`,
    altPath: `/organizations/:organizationId/contacts`,
    fallbackState: 'organizations',
});

router.state('offices', <Offices />, {
    path: `/organisaties/:organizationId/vestigingen`,
    altPath: `/organizations/:organizationId/offices`,
});

router.state('offices-create', <OfficesCreate />, {
    path: `/organisaties/:organizationId/vestigingen/aanmaken`,
    altPath: `/organizations/:organizationId/offices/create`,
    protected: false,
    fallbackState: 'organizations',
});

router.state('offices-edit', <OfficesEdit />, {
    path: `/organisaties/:organizationId/vestigingen/:id/bewerken`,
    altPath: `/organizations/:organizationId/offices/:id/edit`,
    fallbackState: 'organizations',
});

router.state('organization-security', <OrganizationsSecurity />, {
    path: `/organisaties/:organizationId/beveiliging`,
    altPath: `/organizations/:organizationId/security`,
});

router.state('organization-no-permissions', <OrganizationsNoPermissions />, {
    path: `/organisaties/:organizationId/geen-rechten`,
    altPath: `/organizations/:organizationId/no-permissions`,
});

router.state('provider-overview', <ProviderOverview />, {
    path: `/organisaties/:organizationId/overzicht`,
    altPath: `/organizations/:organizationId/overview`,
});

router.state('provider-funds', <ProviderFunds />, {
    path: `/organisaties/:organizationId/aanbieder/fondsen`,
    altPath: `/organizations/:organizationId/provider/funds`,
});

router.state('transactions', <Transactions />, {
    path: `/organisaties/:organizationId/transacties`,
    altPath: `/organizations/:organizationId/transactions`,
});

router.state('transaction-settings', <TransactionSettings />, {
    path: `/organisaties/:organizationId/transactie-instellingen`,
    altPath: `/organizations/:organizationId/transaction-settings`,
});

router.state('transaction-bulk', <TransactionBulksView />, {
    path: `/organisaties/:organizationId/transactie-bulks/:id`,
    altPath: `/organizations/:organizationId/transaction-bulks/:id`,
});

router.state('transaction', <TransactionsView />, {
    path: `/organisaties/:organizationId/transacties/:address`,
    altPath: `/organizations/:organizationId/transactions/:address`,
});

router.state('reservations', <Reservations />, {
    path: `/organisaties/:organizationId/reserveringen`,
    altPath: `/organizations/:organizationId/reservations`,
});

router.state('reservations-show', <ReservationsView />, {
    path: `/organisaties/:organizationId/reserveringen/:id`,
    altPath: `/organizations/:organizationId/reservations/:id`,
});

router.state('reservations-settings', <ReservationsSettings />, {
    path: `/organisaties/:organizationId/reserveringen/instellingen`,
    altPath: `/organizations/:organizationId/reservations/settings`,
});

router.state('payment-methods', <PaymentMethods />, {
    path: `/organisaties/:organizationId/betaalmethoden`,
    altPath: `/organizations/:organizationId/payment-methods`,
});

router.state('mollie-privacy', <MolliePrivacy />, {
    path: `/organisaties/:organizationId/mollie-privacy`,
    altPath: `/organizations/:organizationId/mollie-privacy`,
});

router.state('products', <Products />, {
    path: `/organisaties/:organizationId/producten`,
    altPath: `/organizations/:organizationId/products`,
});

router.state('products-show', <ProductsView />, {
    path: `/organisaties/:organizationId/producten/:id`,
    altPath: `/organizations/:organizationId/products/:id`,
    fallbackState: 'products',
});

router.state('products-create', <ProductsCreate />, {
    path: `/organisaties/:organizationId/producten/aanmaken`,
    altPath: `/organizations/:organizationId/products/create`,
    fallbackState: 'products',
});

router.state('products-edit', <ProductsEdit />, {
    path: `/organisaties/:organizationId/producten/:id/bewerken`,
    altPath: `/organizations/:organizationId/products/:id/edit`,
    fallbackState: 'products',
});

router.state('fund-requests', <FundRequests />, {
    path: `/organisaties/:organizationId/aanvragen`,
    altPath: `/organizations/:organizationId/requests`,
});

router.state('fund-request', <FundRequestsView />, {
    path: `/organisaties/:organizationId/aanvragen/:id`,
    altPath: `/organizations/:organizationId/requests/:id`,
    fallbackState: 'fund-requests',
});

router.state('employees', <Employees />, {
    path: `/organisaties/:organizationId/medewerkers`,
    altPath: `/organizations/:organizationId/employees`,
});

router.state('organization-notifications', <OrganizationsNotifications />, {
    path: `/organisaties/:organizationId/notificaties`,
    altPath: `/organizations/:organizationId/notifications`,
});

router.state('features', <Features />, {
    path: `/organisaties/:organizationId/functionaliteiten`,
    altPath: `/organizations/:organizationId/features`,
});

router.state('feature', <Feature />, {
    path: `/organisaties/:organizationId/functionaliteiten/:key`,
    altPath: `/organizations/:organizationId/feature/:key`,
});

router.state('feedback', <Feedback />, {
    path: `/organisaties/:organizationId/feedback`,
    altPath: `/organizations/:organizationId/feedback`,
});

router.state('csv-validation', <CsvValidations />, {
    path: `/aanvragers-toevoegen`,
    altPath: `/csv-validations`,
});

router.state('preferences-emails', <PreferencesEmails />, {
    path: `/voorkeuren/emails`,
    altPath: `/preferences/emails`,
});

router.state('preferences-notifications', <PreferencesNotifications />, {
    path: `/voorkeuren/notificaties`,
    altPath: `/preferences/notifications`,
});

router.state('security-2fa', <Security2FA />, {
    path: `/beveiliging/tweefactorauthenticatie`,
    altPath: `/security/2fa`,
});

router.state('security-sessions', <SecuritySessions />, {
    path: `/beveiliging/sessies`,
    altPath: `/security/sessions`,
});

router.state('redirect', <Redirect />, {
    path: `/redirect`,
    layout: LayoutType.clear,
});

router.state('home', <Home />, {
    path: `/`,
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
