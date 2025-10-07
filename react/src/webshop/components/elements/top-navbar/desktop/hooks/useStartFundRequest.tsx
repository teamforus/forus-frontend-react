import { useCallback } from 'react';
import { useNavigateState } from '../../../../../modules/state_router/Router';

export default function useStartFundRequest() {
    const navigateState = useNavigateState();

    return useCallback(
        (data = {}) => {
            navigateState('start', null, data);
        },
        [navigateState],
    );
}
