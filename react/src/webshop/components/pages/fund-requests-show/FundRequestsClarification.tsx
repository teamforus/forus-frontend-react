import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useNavigateState } from '../../../modules/state_router/Router';

export default function FundRequestsClarification() {
    const { request_id } = useParams();
    const navigateState = useNavigateState();

    useEffect(() => {
        if (request_id) {
            return navigateState('fund-request-show', { id: request_id });
        }

        return navigateState('home', { id: request_id });
    }, [navigateState, request_id]);

    return null;
}
