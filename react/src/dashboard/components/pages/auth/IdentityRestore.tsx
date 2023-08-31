import React, { useCallback, useContext, useEffect } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useIdentityService } from '../../../services/IdentityService';
import { useNavigate, useParams } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { StringParam, useQueryParams } from 'use-query-params';
import { pushNotificationContext } from '../../../modules/push_notifications/context/PushNotificationsContext';

const targetHome = 'homeStart';
const targetNewSignup = 'newSignup';

export default function IdentityRestore({ confirmation = false }: { confirmation: boolean }) {
    const tokenParam = useParams().token;
    const [query] = useQueryParams({
        token: StringParam,
        target: StringParam,
    });

    const { setToken } = useContext(authContext);
    const { pushDanger } = useContext(pushNotificationContext);
    const target = query.target;
    const token = confirmation ? tokenParam : query.token;
    const identityService = useIdentityService();
    const navigate = useNavigate();

    const handleAuthTarget = useCallback(
        (target: Array<string>) => {
            if (target[0] == targetHome) {
                navigate(getStateRouteUrl('home', { confirmed: true }));
                return true;
            }

            if (target[0] == targetNewSignup) {
                navigate(
                    getStateRouteUrl('sign-up', {
                        organization_id: target[1] || undefined,
                        fund_id: target[2] || undefined,
                        tag: target[3] || undefined,
                    }),
                );
                return true;
            }

            return false;
        },
        [navigate],
    );

    const exchangeToken = useCallback(
        (token: string, target: string) => {
            const promise = confirmation
                ? identityService.exchangeConfirmationToken(token)
                : identityService.authorizeAuthEmailToken(token);

            promise.then(
                function (res) {
                    setToken(res.data.access_token);

                    if (typeof target != 'string' || !handleAuthTarget(target.split('-'))) {
                        navigate(getStateRouteUrl('organizations'));
                    }
                },
                () => {
                    pushDanger(
                        'Helaas, het is niet gelukt om in te loggen. ',
                        'De link is reeds gebruikt of niet meer geldig, probeer het opnieuw met een andere link.',
                    );

                    navigate(getStateRouteUrl('home'));
                },
            );
        },
        [confirmation, identityService, setToken, handleAuthTarget, navigate, pushDanger],
    );

    useEffect(() => {
        exchangeToken(token, target);
    }, [exchangeToken, token, target]);

    return <></>;
}
