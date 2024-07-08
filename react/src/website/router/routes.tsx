import React from 'react';
import RouterBuilder from '../modules/state_router/RouterBuilder';
import NotFound from '../components/pages_system/NotFound';
import Home from '../components/pages/home/Home';
import SignOut from '../components/pages/auth/SignOut';
import WIP from '../components/pages_system/WIP';

const router = new RouterBuilder();

router.state('home', <Home />, {
    path: `/`,
    protected: false,
});

router.state('sign-in', <WIP />, {
    path: `/sign-in`,
    protected: false,
});

router.state('sign-out', <SignOut />, {
    path: `/sign-out`,
    protected: false,
});

router.state('basic-functions', <WIP />, {
    path: `/basic-functions`,
    protected: false,
});

router.state('roles', <WIP />, {
    path: `/roles`,
    protected: false,
});

router.state('platform', <WIP />, {
    path: `/platform`,
    protected: false,
});

router.state('about', <WIP />, {
    path: `/about`,
    protected: false,
});

router.state('contacts', <WIP />, {
    path: `/contacts`,
    protected: false,
});

router.state('privacy', <WIP />, {
    path: `/contacts`,
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
