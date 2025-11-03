import { useCallback } from 'react';
import { useNavigateState } from '../../../../../modules/state_router/Router';
import { WebshopRoutes } from '../../../../../modules/state_router/RouterBuilder';

export default function useStartFundRequest() {
    const navigateState = useNavigateState();

    return useCallback(
        (data = {}) => {
            navigateState(WebshopRoutes.START, null, data);
        },
        [navigateState],
    );
}
