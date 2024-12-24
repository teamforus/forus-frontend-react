import { useContext, useEffect } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { authContext } from '../../../contexts/AuthContext';
import { useAuthService } from '../../../services/AuthService';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { useNavigateState } from '../../../modules/state_router/Router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function AuthLink() {
    const { setToken } = useContext(authContext);
    const { onAuthRedirect, handleAuthTarget } = useAuthService();
    const identityService = useIdentityService();

    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const navigateState = useNavigateState();

    const [query] = useQueryParams({
        token: StringParam,
        target: StringParam,
    });

    useEffect(() => {
        identityService
            .exchangeShortToken(query.token)
            .then((res) => {
                setToken(res.data.access_token);

                if (!handleAuthTarget(query.target)) {
                    onAuthRedirect().then();
                }
            })
            .catch(() => {
                pushDanger(translate('auth.push.link_used.title'));
                navigateState('home');
            });
    }, [
        handleAuthTarget,
        identityService,
        navigateState,
        onAuthRedirect,
        pushDanger,
        query?.target,
        query?.token,
        translate,
        setToken,
    ]);

    return null;
}
