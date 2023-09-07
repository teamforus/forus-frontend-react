import React from 'react';
import RouterBuilder from '../modules/state_router/RouterBuilder';
import SignIn from '../components/pages/auth/SignIn';
import FundRequests from '../components/pages/fund_requests/FundRequests';
import Home from '../components/pages/home/Home';
import NotFound from '../components/pages/not_found/NotFound';
import PreferencesEmails from '../components/pages/preferences/PreferencesEmails';
import ExternalFunds from '../components/pages/external_funds/ExternalFunds';
import Employees from '../components/pages/employees/Employees';
import CsvValidations from '../components/pages/csv_validations/CsvValidations';
import SignOut from '../components/pages/auth/SignOut';
import PreferencesNotifications from '../components/pages/preferences/PreferencesNotifications';
import Security2FA from '../components/pages/security/Security2FA';
import SecuritySessions from '../components/pages/security/SecuritySessions';
import SignUp from '../components/pages/auth/SignUp';
import Organizations from '../components/pages/organizations/Organizations';
import IdentityRestore from '../components/pages/auth/IdentityRestore';
import OrganizationSecurity from '../components/pages/organization-security/OrganizationSecurity';
import FundRequest from '../components/pages/fund_request/FundRequest';
import Redirect from '../components/pages/redirect/Redirect';
import OrganizationNotifications from '../components/pages/organization-notifications/OrganizationNotifications';
import { LayoutType } from '../modules/state_router/RouterProps';
import OrganizationEdit from '../components/pages/organization-edit/OrganizationEdit';
import OrganizationCreate from '../components/pages/organization-edit/OrganizationCreate';
import Auth2FA from '../components/pages/auth/Auth2FA';
import OrganizationView from '../components/pages/organization-view/OrganizationView';

const router = new RouterBuilder();

router.state('sign-in', <SignIn />, {
    path: `/sign-in`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state('sign-up', <SignUp />, {
    path: `/sign-up`,
    layout: LayoutType.landingClearNew,
    protected: false,
});

router.state('sign-out', <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state('auth-2fa', <Auth2FA />, {
    path: `/auth-2fa`,
    layout: LayoutType.landingClear,
    protected: false,
});

router.state('identity-restore', <IdentityRestore confirmation={false} />, {
    path: `/identity-restore`,
    protected: false,
});

router.state('identity-confirmation', <IdentityRestore confirmation={true} />, {
    path: `/confirmation/email/:token`,
    protected: false,
});

router.state('organizations', <Organizations />, {
    path: `/organizations`,
    protected: false,
});

router.state('organizations-view', <OrganizationView />, {
    path: `/organizations/:id`,
    protected: false,
});

router.state('organizations-create', <OrganizationCreate />, {
    path: `/organizations/create`,
    protected: false,
    fallbackState: 'organizations',
});

router.state('organization-edit', <OrganizationEdit />, {
    path: `/organizations/:organizationId/edit`,
    fallbackState: 'organizations',
});

router.state('organization-security', <OrganizationSecurity />, {
    path: `/organizations/:organizationId/security`,
});

router.state('fund-requests', <FundRequests />, {
    path: `/organizations/:organizationId/requests`,
});

router.state('fund-request', <FundRequest />, {
    path: `/organizations/:organizationId/requests/:id`,
    fallbackState: 'fund-requests',
});

router.state('external-funds', <ExternalFunds />, {
    path: `/organizations/:organizationId/external-funds`,
});

router.state('employees', <Employees />, {
    path: `/organizations/:organizationId/employees`,
});

router.state('organization-notifications', <OrganizationNotifications />, {
    path: `/organizations/:organizationId/notifications`,
});

router.state('csv-validation', <CsvValidations />, {
    path: `/csv-validation/funds/:fundId?`,
});

router.state('preferences-emails', <PreferencesEmails />, {
    path: `/preferences/emails`,
});

router.state('preferences-notifications', <PreferencesNotifications />, {
    path: `/preferences/notifications`,
});

router.state('security-2fa', <Security2FA />, {
    path: `/security/2fa`,
});

router.state('security-sessions', <SecuritySessions />, {
    path: `/security/sessions`,
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

router.state('*', <NotFound />, {
    path: `*`,
    protected: false,
});

export default router;
