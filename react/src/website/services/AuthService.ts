import { useCallback } from 'react';
import { useNavigateState } from '../modules/state_router/Router';

export function useAuthService() {
    const navigateState = useNavigateState();

    const onAuthRedirect = useCallback(
        async (defaultState: false | string = 'home', defaultStateParams = {}) => {
            // Otherwise go home
            return defaultState !== false ? navigateState(defaultState, defaultStateParams) : false;
        },
        [navigateState],
    );

    return { onAuthRedirect };
}
