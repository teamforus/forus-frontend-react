import React, { useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { mainContext } from '../../../contexts/MainContext';
import { useNavigate } from 'react-router';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function SignOut() {
    const { signOut, token } = useContext(authContext);
    const { clearAll } = useContext(mainContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            signOut();
            clearAll();
        } else {
            navigate(getStateRouteUrl(DashboardRoutes.HOME));
        }
    }, [signOut, clearAll, token, navigate]);

    return <></>;
}
