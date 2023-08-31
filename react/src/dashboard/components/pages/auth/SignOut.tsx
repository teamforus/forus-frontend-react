import React, { useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { mainContext } from '../../../contexts/MainContext';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';

export default function SignOut() {
    const { signOut, token } = useContext(authContext);
    const { clearAll } = useContext(mainContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            signOut();
            clearAll();
        } else {
            navigate(getStateRouteUrl('home'));
        }
    }, [signOut, clearAll, token, navigate]);

    return <></>;
}
