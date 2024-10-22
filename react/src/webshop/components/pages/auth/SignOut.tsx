import React, { useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useNavigateState, useStateParams } from '../../../modules/state_router/Router';

export default function SignOut() {
    const { signOut, token } = useContext(authContext);
    const navigateState = useNavigateState();

    const stateParams = useStateParams<{
        session_expired?: boolean;
    }>();

    useEffect(() => {
        if (token) {
            signOut();
        } else {
            navigateState('home', null, null, { state: stateParams });
        }
    }, [signOut, token, navigateState, stateParams]);

    return <></>;
}
