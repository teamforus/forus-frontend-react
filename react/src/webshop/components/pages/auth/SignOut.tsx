import React, { useCallback, useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useNavigateState, useStateParams } from '../../../modules/state_router/Router';

export default function SignOut() {
    const { signOut, token } = useContext(authContext);
    const navigateState = useNavigateState();
    const stateParams = useStateParams<{ session_expired?: boolean }>();

    const redirectHome = useCallback(() => {
        navigateState('home', null, null, { state: stateParams });
    }, [navigateState, stateParams]);

    useEffect(() => {
        if (token) {
            signOut(null, false, true, () => {
                if (stateParams.session_expired) {
                    redirectHome();
                }
            });
        } else {
            redirectHome();
        }
    }, [signOut, token, navigateState, stateParams, redirectHome]);

    return <></>;
}
