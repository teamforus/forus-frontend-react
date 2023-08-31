import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import useAuthIdentity from '../../../hooks/useAuthIdentity';

export default function Home() {
    const navigate = useNavigate();
    const authIdentity = useAuthIdentity();

    useEffect(() => {
        navigate(getStateRouteUrl(authIdentity ? 'organizations' : 'sign-in'));
    }, [authIdentity, navigate]);

    return <></>;
}
