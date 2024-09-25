import React from 'react';
import RouterBuilder from '../modules/state_router/RouterBuilder';
import NotFound from '../components/pages_system/NotFound';
import Home from '../components/pages/home/Home';
import SignOut from '../components/pages/auth/SignOut';
import AboutUs from '../components/pages/about-us/AboutUs';
import AboutUsInnovation from '../components/pages/about-us/AboutUsInnovation';
import RolesMain from '../components/pages/roles/RolesMain';
import RolesRequester from '../components/pages/roles/RolesRequester';
import RolesProvider from '../components/pages/roles/RolesProvider';
import RolesSponsor from '../components/pages/roles/RolesSponsor';
import RolesValidator from '../components/pages/roles/RolesValidator';
import BasicFunctions from '../components/pages/basic-functions/BasicFunctions';
import MeApp from '../components/pages/basic-functions/MeApp';
import CMS from '../components/pages/basic-functions/CMS';
import Funds from '../components/pages/basic-functions/Funds';
import Website from '../components/pages/basic-functions/Website';
import Information from '../components/pages/basic-functions/Information';
import Privacy from '../components/pages/privacy/Privacy';
import Contacts from '../components/pages/contacts/Contacts';
import BookDemo from '../components/pages/book-demo/BookDemo';
import SignInGeneral from '../components/pages/sign-in/SignInGeneral';
import SignUp from '../components/pages/sign-up/SignUp';
import SignInAsRole from '../components/pages/sign-in/SignInAsRole';
import IdentityRestore from '../components/pages/auth/IdentityRestore';
import MeAppDownload from '../components/pages/dl/MeAppDownload';

const router = new RouterBuilder();

router.state('home', <Home />, {
    path: `/`,
    protected: false,
});

router.state('identity-restore', <IdentityRestore confirmation={false} />, {
    path: `/identity-restore`,
    protected: false,
});

router.state('sign-in', <SignInGeneral />, {
    path: `/login`,
    protected: false,
});

router.state('sign-in-as-role', <SignInAsRole />, {
    path: `/login/:role`,
    protected: false,
});

router.state('sign-up', <SignUp />, {
    path: `/sign-up`,
    protected: false,
});

router.state('sign-out', <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state('basic-functions', <BasicFunctions />, {
    path: `/basisfuncties`,
    protected: false,
});

router.state('me-app', <MeApp />, {
    path: `/me-app`,
    protected: false,
});

router.state('cms', <CMS />, {
    path: `/cms`,
    protected: false,
});

router.state('funds', <Funds />, {
    path: `/fondsen`,
    protected: false,
});

router.state('website', <Website />, {
    path: `/website`,
    protected: false,
});

router.state('information', <Information />, {
    path: `/managementinformatie`,
    protected: false,
});

router.state('about-us', <AboutUs />, {
    path: `/ons-verhaal`,
    protected: false,
});

router.state('about-us-innovation', <AboutUsInnovation />, {
    path: `/project-innovatiebudget-2023`,
    protected: false,
});

router.state('roles-main', <RolesMain />, {
    path: `/rollen`,
    protected: false,
});

router.state('roles-requester', <RolesRequester />, {
    path: `/rollen/deelnemer`,
    protected: false,
});

router.state('roles-provider', <RolesProvider />, {
    path: `/rollen/aanbieder`,
    protected: false,
});

router.state('roles-sponsor', <RolesSponsor />, {
    path: `/rollen/sponsor`,
    protected: false,
});

router.state('roles-validator', <RolesValidator />, {
    path: `/rollen/beoordelaar`,
    protected: false,
});

router.state('contacts', <Contacts />, {
    path: `/contact`,
    protected: false,
});

router.state('privacy', <Privacy />, {
    path: `/privacyverklaring`,
    protected: false,
});

router.state('book-demo', <BookDemo />, {
    path: `/demo-aanvragen`,
    protected: false,
});

router.state('me-app-dl', <MeAppDownload />, {
    path: `/DL`,
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
