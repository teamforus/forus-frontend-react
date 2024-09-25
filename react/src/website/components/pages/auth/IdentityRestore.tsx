import React, { useCallback, useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { useNavigateState } from '../../../modules/state_router/Router';
import { StringParam, useQueryParams } from 'use-query-params';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { useAuthService } from '../../../services/AuthService';

export default function IdentityRestore({ confirmation = false }: { confirmation: boolean }) {
    const tokenParam = useParams().token;
    const [query] = useQueryParams({
        token: StringParam,
        target: StringParam,
    });

    const { setToken } = useContext(authContext);

    const target = query.target;
    const token = confirmation ? tokenParam : query.token;
    const identityService = useIdentityService();
    const navigateState = useNavigateState();
    const { onAuthRedirect } = useAuthService();

    const exchangeToken = useCallback(
        (token: string, target: string) => {
            const promise = confirmation
                ? identityService.exchangeConfirmationToken(token)
                : identityService.authorizeAuthEmailToken(token);

            promise
                .then((res) => {
                    setToken(res.data.access_token);

                    if (typeof target != 'string') {
                        onAuthRedirect().then();
                    }
                })
                .catch(() => {
                    navigateState('home');
                });
        },
        [confirmation, identityService, setToken, onAuthRedirect, navigateState],
    );

    useEffect(() => {
        exchangeToken(token, target);
    }, [exchangeToken, token, target]);

    return <></>;
}
