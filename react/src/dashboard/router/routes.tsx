import React from 'react';
import RouterBuilder, { DashboardRoutes } from '../modules/state_router/RouterBuilder';
import SignIn from '../components/pages/auth/SignIn';
import SignUp from '../components/pages/auth/SignUp';
import SignOut from '../components/pages/auth/SignOut';
import FundRequests from '../components/pages/fund-requests/FundRequests';
import FundRequestsView from '../components/pages/fund-requests-view/FundRequestsView';
import Home from '../components/pages/home/Home';
import Employees from '../components/pages/employees/Employees';
import Prevalidations from '../components/pages/prevalidations/Prevalidations';
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
import ProductsCreate from '../components/pages/products-edit/ProductsCreate';
import ProductsEdit from '../components/pages/products-edit/ProductsEdit';
import ProductView from '../components/pages/products-view/ProductView';
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
import ImplementationsCookies from '../components/pages/implementations-cookies/ImplementationsCookies';
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
import ImplementationsNotifications from '../components/pages/implementations-notifications/ImplementationsNotifications';
import ImplementationsNotificationsSend from '../components/pages/implementations-notifications-send/ImplementationsNotificationsSend';
import ImplementationsNotificationsEdit from '../components/pages/implementations-notifications-edit/ImplementationsNotificationsEdit';
import ImplementationsNotificationsBranding from '../components/pages/implementations-notifications-branding/ImplementationsNotificationsBranding';
import OrganizationFunds from '../components/pages/organizations-funds/OrganizationFunds';
import OrganizationsFundsShow from '../components/pages/organizations-funds-show/OrganizationsFundsShow';
import OrganizationsFundsEdit from '../components/pages/organizations-funds-edit/OrganizationsFundsEdit';
import OrganizationsFundsSecurity from '../components/pages/organizations-funds-security/OrganizationsFundsSecurity';
import Identities from '../components/pages/identities/Identities';
import IdentitiesShow from '../components/pages/identitities-show/IdentitiesShow';
import Households from '../components/pages/households/Households';
import HouseholdsShow from '../components/pages/households/HouseholdsShow';
import PreCheck from '../components/pages/pre-check/PreCheck';
import BiConnection from '../components/pages/bi-connection/BiConnection';
import ThrowError from '../components/pages_system/ThrowError';
import Implementations from '../components/pages/implementations/Implementations';
import SponsorFundUnsubscriptions from '../components/pages/sponsor-fund-unsubscriptions/SponsorFundUnsubscriptions';
import OrganizationsContacts from '../components/pages/organizations-contacts/OrganizationsContacts';
import Payouts from '../components/pages/payouts/Payouts';
import PayoutsView from '../components/pages/payouts-view/PayoutsView';
import Products from '../components/pages/products/Products';
import SponsorProducts from '../components/pages/sponsor-products/SponsorProducts';
import SponsorProductView from '../components/pages/sponsor-product/SponsorProductView';
import OrganizationsTranslations from '../components/pages/organizations-translations/OrganizationsTranslations';
import ImplementationsTranslations from '../components/pages/implementations-cookies/ImplementationsTranslations';
import FundForms from '../components/pages/fund-forms/FundForms';
import FundFormsView from '../components/pages/fund-forms-view/FundFormsView';
import PhysicalCards from '../components/pages/physical-cards/PhysicalCards';
import PhysicalCardTypesShow from '../components/pages/physical-cards/PhysicalCardTypesShow';

const router = new RouterBuilder();

router.state(DashboardRoutes.SIGN_IN, <SignIn />, {
    path: `/inloggen`,
    altPath: `/sign-in`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state(DashboardRoutes.SIGN_UP, <SignUp />, {
    path: `/aanmelden`,
    altPath: `/sign-up`,
    layout: LayoutType.landingClearNew,
    protected: false,
});

router.state(DashboardRoutes.SIGN_OUT, <SignOut />, {
    path: `/uitloggen`,
    altPath: `/sign-out`,
    protected: false,
});

router.state(DashboardRoutes.AUTH_2FA, <Auth2FA />, {
    path: `/tweefactorauthenticatie`,
    altPath: `/auth-2fa`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state(DashboardRoutes.IDENTITY_RESTORE, <IdentityRestore confirmation={false} />, {
    path: `/identiteit-herstellen`,
    altPath: `/identity-restore`,
    protected: false,
});

router.state(DashboardRoutes.IDENTITY_CONFIRMATION, <IdentityRestore confirmation={true} />, {
    path: `/bevestiging/email/:token`,
    altPath: `/confirmation/email/:token`,
    protected: false,
});

router.state(DashboardRoutes.ORGANIZATIONS, <Organizations />, {
    path: `/organisaties`,
    altPath: `/organizations`,
    protected: false,
});

router.state(DashboardRoutes.ORGANIZATION, <OrganizationsView />, {
    path: `/organisaties/:organizationId`,
    altPath: `/organizations/:organizationId`,
    protected: false,
});

router.state(DashboardRoutes.ORGANIZATION_CREATE, <OrganizationCreate />, {
    path: `/organisaties/aanmaken`,
    altPath: `/organizations/create`,
    protected: false,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.ORGANIZATION_EDIT, <OrganizationEdit />, {
    path: `/organisaties/:organizationId/bewerken`,
    altPath: `/organizations/:organizationId/edit`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.ORGANIZATION_FUNDS, <OrganizationFunds />, {
    path: `/organisaties/:organizationId/fondsen`,
    altPath: `/organizations/:organizationId/funds`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND_BACKOFFICE_EDIT, <FundBackofficeEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/backoffice`,
    altPath: `/organizations/:organizationId/funds/:fundId/backoffice`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND, <OrganizationsFundsShow />, {
    path: `/organisaties/:organizationId/fondsen/:fundId`,
    altPath: `/organizations/:organizationId/funds/:fundId`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND_CREATE, <OrganizationsFundsEdit />, {
    path: `/organisaties/:organizationId/fondsen/aanmaken`,
    altPath: `/organizations/:organizationId/funds/create`,
});

router.state(DashboardRoutes.FUND_EDIT, <OrganizationsFundsEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/bewerken`,
    altPath: `/organizations/:organizationId/funds/:fundId/edit`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND_SECURITY, <OrganizationsFundsSecurity />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/beveiliging`,
    altPath: `/organizations/:organizationId/funds/:fundId/security`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.PRE_CHECK, <PreCheck />, {
    path: `/organisaties/:organizationId/pre-check`,
    altPath: `/organizations/:organizationId/pre-check`,
});

router.state(DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATIONS, <SponsorProviderOrganizations />, {
    path: `/organisaties/:organizationId/aanbieders`,
    altPath: `/organizations/:organizationId/providers`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.SPONSOR_PROVIDER_ORGANIZATION, <SponsorProviderOrganization />, {
    path: `/organisaties/:organizationId/aanbieders/:id`,
    altPath: `/organizations/:organizationId/providers/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.PAYOUTS, <Payouts />, {
    path: `/organisaties/:organizationId/uitbetalingen`,
    altPath: `/organizations/:organizationId/payouts`,
});

router.state(DashboardRoutes.IDENTITIES, <Identities />, {
    path: `/organisaties/:organizationId/identiteiten`,
    altPath: `/organizations/:organizationId/identities`,
});

router.state(DashboardRoutes.IDENTITY, <IdentitiesShow />, {
    path: `/organisaties/:organizationId/identiteiten/:id`,
    altPath: `/organizations/:organizationId/identities/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.HOUSEHOLDS, <Households />, {
    path: `/organisaties/:organizationId/huishoudens`,
    altPath: `/organizations/:organizationId/households`,
});

router.state(DashboardRoutes.HOUSEHOLD, <HouseholdsShow />, {
    path: `/organisaties/:organizationId/huishoudens/:id`,
    altPath: `/organizations/:organizationId/households/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.PAYOUT, <PayoutsView />, {
    path: `/organisaties/:organizationId/uitbetalingen/:address`,
    altPath: `/organizations/:organizationId/payouts/:address`,
});

router.state(DashboardRoutes.FUND_PROVIDER, <FundProvider />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:id`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND_PROVIDER_PRODUCT_CREATE, <SponsorProductsCreate />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/aanmaken`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/create`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND_PROVIDER_PRODUCT, <FundProviderProductView />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/:id`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.FUND_PROVIDER_PRODUCT_EDIT, <SponsorProductsEdit />, {
    path: `/organisaties/:organizationId/fondsen/:fundId/aanbieders/:fundProviderId/producten/:id/bewerken`,
    altPath: `/organizations/:organizationId/funds/:fundId/providers/:fundProviderId/products/:id/edit`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.SPONSOR_FUND_UNSUBSCRIPTIONS, <SponsorFundUnsubscriptions />, {
    path: `/organisaties/:organizationId/fonds-afmeldingen`,
    altPath: `/organizations/:organizationId/fund-unsubscriptions`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.SPONSOR_PRODUCTS, <SponsorProducts />, {
    path: `/organisaties/:organizationId/sponsor/producten`,
    altPath: `/organizations/:organizationId/sponsor/products`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.SPONSOR_PRODUCT, <SponsorProductView />, {
    path: `/organisaties/:organizationId/sponsor/producten/:productId`,
    altPath: `/organizations/:organizationId/sponsor/products/:productId`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.BANK_CONNECTIONS, <BankConnections />, {
    path: `/organisaties/:organizationId/bank-integraties`,
    altPath: `/organizations/:organizationId/bank-connections`,
});

router.state(DashboardRoutes.FINANCIAL_DASHBOARD, <FinancialDashboard />, {
    path: `/organisaties/:organizationId/financieel-dashboard`,
    altPath: `/organizations/:organizationId/financial-dashboard`,
});

router.state(DashboardRoutes.FINANCIAL_DASHBOARD_OVERVIEW, <FinancialDashboardOverview />, {
    path: `/organisaties/:organizationId/financieel-dashboard-overzicht`,
    altPath: `/organizations/:organizationId/financial-dashboard-overview`,
});

router.state(DashboardRoutes.VOUCHERS, <Vouchers />, {
    path: `/organisaties/:organizationId/tegoeden`,
    altPath: `/organizations/:organizationId/vouchers`,
});

router.state(DashboardRoutes.VOUCHER, <VouchersViewComponent />, {
    path: `/organisaties/:organizationId/tegoeden/:id`,
    altPath: `/organizations/:organizationId/vouchers/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.PHYSICAL_CARDS, <PhysicalCards />, {
    path: `/organisaties/:organizationId/fysieke-passen`,
    altPath: `/organizations/:organizationId/physical-cards`,
});

router.state(DashboardRoutes.PHYSICAL_CARD_TYPE, <PhysicalCardTypesShow />, {
    path: `/organisaties/:organizationId/fysieke-passen-types/:id`,
    altPath: `/organizations/:organizationId/physical-cards-types/:id`,
});

router.state(DashboardRoutes.REIMBURSEMENTS, <Reimbursements />, {
    path: `/organisaties/:organizationId/declaraties`,
    altPath: `/organizations/:organizationId/reimbursements`,
});

router.state(DashboardRoutes.REIMBURSEMENT, <ReimbursementsView />, {
    path: `/organisaties/:organizationId/declaraties/:id`,
    altPath: `/organizations/:organizationId/reimbursements/:id`,
    fallbackState: DashboardRoutes.REIMBURSEMENTS,
});

router.state(DashboardRoutes.REIMBURSEMENT_CATEGORIES, <ReimbursementCategories />, {
    path: `/organisaties/:organizationId/declaraties-categorieën`,
    altPath: `/organizations/:organizationId/reimbursement-categories`,
});

router.state(DashboardRoutes.EXTRA_PAYMENTS, <ExtraPayments />, {
    path: `/organisaties/:organizationId/bijbetalingen`,
    altPath: `/organizations/:organizationId/extra-payments`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.EXTRA_PAYMENT, <ExtraPaymentsView />, {
    path: `/organisaties/:organizationId/bijbetalingen/:id`,
    altPath: `/organizations/:organizationId/extra-payments/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATIONS, <Implementations />, {
    path: `/organisaties/:organizationId/implementaties`,
    altPath: `/organizations/:organizationId/implementations`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION, <ImplementationsView />, {
    path: `/organisaties/:organizationId/implementaties/:id`,
    altPath: `/organizations/:organizationId/implementations/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_CMS, <ImplementationsCms />, {
    path: `/organisaties/:organizationId/implementaties/:id/cms`,
    altPath: `/organizations/:organizationId/implementations/:id/cms`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_CMS_PAGE_EDIT, <ImplementationsCmsPageEdit />, {
    path: `/organisaties/:organizationId/implementaties/:implementationId/paginas/:id`,
    altPath: `/organizations/:organizationId/implementations/:implementationId/pages/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_CMS_PAGE_CREATE, <ImplementationsCmsPageCreate />, {
    path: `/organisaties/:organizationId/implementaties/:implementationId/paginas/aanmaken`,
    altPath: `/organizations/:organizationId/implementations/:implementationId/pages/create`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_CONFIG, <ImplementationsConfig />, {
    path: `/organisaties/:organizationId/implementaties/:id/configuratie`,
    altPath: `/organizations/:organizationId/implementations/:id/config`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_EMAIL, <ImplementationsEmail />, {
    path: `/organisaties/:organizationId/implementaties/:id/email`,
    altPath: `/organizations/:organizationId/implementations/:id/email`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_COOKIES, <ImplementationsCookies />, {
    path: `/organisaties/:organizationId/implementaties/:id/cookiemelding`,
    altPath: `/organizations/:organizationId/implementations/:id/cookies`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_TRANSLATIONS, <ImplementationsTranslations />, {
    path: `/organisaties/:organizationId/implementaties/:id/vertalingen`,
    altPath: `/organizations/:organizationId/implementations/:id/translations`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_DIGID, <ImplementationsDigid />, {
    path: `/organisaties/:organizationId/implementaties/:id/digid`,
    altPath: `/organizations/:organizationId/implementations/:id/digid`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_SOCIAL_MEDIA, <ImplementationsSocialMedia />, {
    path: `/organisaties/:organizationId/implementaties/:id/social-media`,
    altPath: `/organizations/:organizationId/implementations/:id/social-media`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS, <ImplementationsNotifications />, {
    path: `/organisaties/:organizationId/implementatie-meldingen`,
    altPath: `/organizations/:organizationId/implementation-notifications`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS_SEND, <ImplementationsNotificationsSend />, {
    path: `/organisaties/:organizationId/implementaties/:id/implementatie-meldingen/versturen`,
    altPath: `/organizations/:organizationId/implementations/:id/implementation-notifications/send`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_NOTIFICATION_EDIT, <ImplementationsNotificationsEdit />, {
    path: `/organisaties/:organizationId/implementaties/:implementationId/implementatie-meldingen/:id`,
    altPath: `/organizations/:organizationId/implementations/:implementationId/implementation-notifications/:id`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.IMPLEMENTATION_NOTIFICATIONS_BRANDING, <ImplementationsNotificationsBranding />, {
    path: `/organisaties/:organizationId/implementaties/:id/meldingen-branding`,
    altPath: `/organizations/:organizationId/implementations/:id/notifications-branding`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.ORGANIZATION_LOGS, <EventLogs />, {
    path: `/organisaties/:organizationId/logs`,
    altPath: `/organizations/:organizationId/logs`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.BI_CONNECTION, <BiConnection />, {
    path: `/organisaties/:organizationId/bi-integratie`,
    altPath: `/organizations/:organizationId/bi-connection`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.ORGANIZATION_CONTACTS, <OrganizationsContacts />, {
    path: `/organisaties/:organizationId/contacten`,
    altPath: `/organizations/:organizationId/contacts`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.ORGANIZATION_TRANSLATIONS, <OrganizationsTranslations />, {
    path: `/organisaties/:organizationId/vertalingen`,
    altPath: `/organizations/:organizationId/translations`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.OFFICES, <Offices />, {
    path: `/organisaties/:organizationId/vestigingen`,
    altPath: `/organizations/:organizationId/offices`,
});

router.state(DashboardRoutes.OFFICE_CREATE, <OfficesCreate />, {
    path: `/organisaties/:organizationId/vestigingen/aanmaken`,
    altPath: `/organizations/:organizationId/offices/create`,
    protected: false,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.OFFICE_EDIT, <OfficesEdit />, {
    path: `/organisaties/:organizationId/vestigingen/:id/bewerken`,
    altPath: `/organizations/:organizationId/offices/:id/edit`,
    fallbackState: DashboardRoutes.ORGANIZATIONS,
});

router.state(DashboardRoutes.ORGANIZATION_SECURITY, <OrganizationsSecurity />, {
    path: `/organisaties/:organizationId/beveiliging`,
    altPath: `/organizations/:organizationId/security`,
});

router.state(DashboardRoutes.ORGANIZATION_NO_PERMISSIONS, <OrganizationsNoPermissions />, {
    path: `/organisaties/:organizationId/geen-rechten`,
    altPath: `/organizations/:organizationId/no-permissions`,
});

router.state(DashboardRoutes.PROVIDER_OVERVIEW, <ProviderOverview />, {
    path: `/organisaties/:organizationId/overzicht`,
    altPath: `/organizations/:organizationId/overview`,
});

router.state(DashboardRoutes.PROVIDER_FUNDS, <ProviderFunds />, {
    path: `/organisaties/:organizationId/aanbieder/fondsen`,
    altPath: `/organizations/:organizationId/provider/funds`,
});

router.state(DashboardRoutes.TRANSACTIONS, <Transactions />, {
    path: `/organisaties/:organizationId/transacties`,
    altPath: `/organizations/:organizationId/transactions`,
});

router.state(DashboardRoutes.TRANSACTION_SETTINGS, <TransactionSettings />, {
    path: `/organisaties/:organizationId/transactie-instellingen`,
    altPath: `/organizations/:organizationId/transaction-settings`,
});

router.state(DashboardRoutes.TRANSACTION_BULK, <TransactionBulksView />, {
    path: `/organisaties/:organizationId/transactie-bulks/:id`,
    altPath: `/organizations/:organizationId/transaction-bulks/:id`,
});

router.state(DashboardRoutes.TRANSACTION, <TransactionsView />, {
    path: `/organisaties/:organizationId/transacties/:address`,
    altPath: `/organizations/:organizationId/transactions/:address`,
});

router.state(DashboardRoutes.RESERVATIONS, <Reservations />, {
    path: `/organisaties/:organizationId/reserveringen`,
    altPath: `/organizations/:organizationId/reservations`,
});

router.state(DashboardRoutes.RESERVATION, <ReservationsView />, {
    path: `/organisaties/:organizationId/reserveringen/:id`,
    altPath: `/organizations/:organizationId/reservations/:id`,
});

router.state(DashboardRoutes.RESERVATIONS_SETTINGS, <ReservationsSettings />, {
    path: `/organisaties/:organizationId/reserveringen/instellingen`,
    altPath: `/organizations/:organizationId/reservations/settings`,
});

router.state(DashboardRoutes.PAYMENT_METHODS, <PaymentMethods />, {
    path: `/organisaties/:organizationId/betaalmethoden`,
    altPath: `/organizations/:organizationId/payment-methods`,
});

router.state(DashboardRoutes.MOLLIE_PRIVACY, <MolliePrivacy />, {
    path: `/organisaties/:organizationId/mollie-privacy`,
    altPath: `/organizations/:organizationId/mollie-privacy`,
});

router.state(DashboardRoutes.PRODUCTS, <Products />, {
    path: `/organisaties/:organizationId/producten`,
    altPath: `/organizations/:organizationId/products`,
});

router.state(DashboardRoutes.PRODUCT, <ProductView />, {
    path: `/organisaties/:organizationId/producten/:id`,
    altPath: `/organizations/:organizationId/products/:id`,
    fallbackState: DashboardRoutes.PRODUCTS,
});

router.state(DashboardRoutes.PRODUCT_CREATE, <ProductsCreate />, {
    path: `/organisaties/:organizationId/producten/aanmaken`,
    altPath: `/organizations/:organizationId/products/create`,
    fallbackState: DashboardRoutes.PRODUCTS,
});

router.state(DashboardRoutes.PRODUCT_EDIT, <ProductsEdit />, {
    path: `/organisaties/:organizationId/producten/:id/bewerken`,
    altPath: `/organizations/:organizationId/products/:id/edit`,
    fallbackState: DashboardRoutes.PRODUCTS,
});

router.state(DashboardRoutes.FUND_REQUESTS, <FundRequests />, {
    path: `/organisaties/:organizationId/aanvragen`,
    altPath: `/organizations/:organizationId/requests`,
});

router.state(DashboardRoutes.FUND_REQUEST, <FundRequestsView />, {
    path: `/organisaties/:organizationId/aanvragen/:id`,
    altPath: `/organizations/:organizationId/requests/:id`,
    fallbackState: DashboardRoutes.FUND_REQUESTS,
});

router.state(DashboardRoutes.FUND_FORMS, <FundForms />, {
    path: `/organisaties/:organizationId/formulieren`,
    altPath: `/organizations/:organizationId/forms`,
});

router.state(DashboardRoutes.FUND_FORM, <FundFormsView />, {
    path: `/organisaties/:organizationId/formulieren/:id`,
    altPath: `/organizations/:organizationId/forms/:id`,
});

router.state(DashboardRoutes.EMPLOYEES, <Employees />, {
    path: `/organisaties/:organizationId/medewerkers`,
    altPath: `/organizations/:organizationId/employees`,
});

router.state(DashboardRoutes.ORGANIZATION_NOTIFICATIONS, <OrganizationsNotifications />, {
    path: `/organisaties/:organizationId/notificaties`,
    altPath: `/organizations/:organizationId/notifications`,
});

router.state(DashboardRoutes.FEATURES, <Features />, {
    path: `/organisaties/:organizationId/functionaliteiten`,
    altPath: `/organizations/:organizationId/features`,
});

router.state(DashboardRoutes.FEATURE, <Feature />, {
    path: `/organisaties/:organizationId/functionaliteiten/:key`,
    altPath: `/organizations/:organizationId/feature/:key`,
});

router.state(DashboardRoutes.FEEDBACK, <Feedback />, {
    path: `/organisaties/:organizationId/feedback`,
    altPath: `/organizations/:organizationId/feedback`,
});

router.state(DashboardRoutes.CSV_VALIDATION, <Prevalidations />, {
    path: `/organisaties/:organizationId/aanvragers-toevoegen`,
    altPath: `/organizations/:organizationId/csv-validations`,
});

router.state(DashboardRoutes.PREFERENCE_EMAILS, <PreferencesEmails />, {
    path: `/voorkeuren/emails`,
    altPath: `/preferences/emails`,
});

router.state(DashboardRoutes.PREFERENCE_NOTIFICATIONS, <PreferencesNotifications />, {
    path: `/voorkeuren/notificaties`,
    altPath: `/preferences/notifications`,
});

router.state(DashboardRoutes.SECURITY_2FA, <Security2FA />, {
    path: `/beveiliging/tweefactorauthenticatie`,
    altPath: `/security/2fa`,
});

router.state(DashboardRoutes.SECURITY_SESSIONS, <SecuritySessions />, {
    path: `/beveiliging/sessies`,
    altPath: `/security/sessions`,
});

router.state(DashboardRoutes.REDIRECT, <Redirect />, {
    path: `/redirect`,
    layout: LayoutType.clear,
    protected: false,
});

router.state(DashboardRoutes.HOME, <Home />, {
    path: `/`,
    protected: false,
});

router.state(DashboardRoutes.NOT_FOUND, <NotFound />, {
    path: `/not-found`,
    protected: false,
});

router.state(DashboardRoutes.THROW, <ThrowError />, {
    path: `/throw`,
    protected: false,
});

router.state(DashboardRoutes.ANY, <NotFound />, {
    path: `*`,
    protected: false,
});

export default router;
