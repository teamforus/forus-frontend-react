import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useNavigateState } from '../../../modules/state_router/Router';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function FundRequestsClarification() {
    const { request_id } = useParams();
    const navigateState = useNavigateState();

    useEffect(() => {
        if (request_id) {
            return navigateState(WebshopRoutes.FUND_REQUEST_SHOW, { id: request_id });
        }

        return navigateState(WebshopRoutes.HOME, { id: request_id });
    }, [navigateState, request_id]);

    return null;
}
