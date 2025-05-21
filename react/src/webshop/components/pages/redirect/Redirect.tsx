import React, { useContext, useEffect, useState } from 'react';
import { useQueryParams, StringParam, BooleanParam } from 'use-query-params';
import { useNavigateState } from '../../../modules/state_router/Router';
import { useAuthService } from '../../../services/AuthService';
import { useIdentityEmailsService } from '../../../../dashboard/services/IdentityEmailService';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import { authContext } from '../../../contexts/AuthContext';

export default function Redirect() {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();

    const { handleAuthTarget } = useAuthService();
    const identityEmailsService = useIdentityEmailsService();

    const { hasToken } = useContext(authContext);
    const [resolved, setResolved] = useState(false);

    const [{ target, email_confirmation, email_confirmation_token }] = useQueryParams({
        target: StringParam,
        email_confirmation: BooleanParam,
        email_confirmation_token: StringParam,
    });

    useEffect(() => {
        if (resolved) {
            return;
        }

        if (email_confirmation && email_confirmation_token) {
            setResolved(true);

            if (!hasToken) {
                pushDanger(
                    translate('push.email_verification_auth_error.title'),
                    translate('push.email_verification_auth_error.description'),
                );

                return navigateState('start', {}, {});
            }

            identityEmailsService
                .confirmVerification(email_confirmation_token)
                .then(() => {
                    setResolved(true);
                    pushSuccess(
                        translate('push.email_verification_success.title'),
                        translate('push.email_verification_success.description'),
                    );
                    navigateState('identity-emails', {}, {});
                })
                .catch((err: ResponseError) => {
                    pushDanger(
                        translate('push.error'),
                        err.data?.message || translate('push.email_verification_auth_unknown_error.description'),
                    );
                    navigateState('home', {}, {});
                });
            return;
        }

        if (!hasToken || !target || !handleAuthTarget(target)) {
            setResolved(true);
            return navigateState('start', {}, {});
        }
    }, [
        target,
        resolved,
        translate,
        email_confirmation,
        email_confirmation_token,
        handleAuthTarget,
        navigateState,
        identityEmailsService,
        pushSuccess,
        pushDanger,
        hasToken,
    ]);

    return <></>;
}
