import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Home() {
    const navigate = useNavigate();
    const authIdentity = useAuthIdentity();

    useEffect(() => {
        navigate(getStateRouteUrl(authIdentity ? DashboardRoutes.ORGANIZATIONS : DashboardRoutes.SIGN_IN));
    }, [authIdentity, navigate]);

    return <></>;
}
