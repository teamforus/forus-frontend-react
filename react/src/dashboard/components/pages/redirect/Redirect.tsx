import React, { useContext, useEffect, useState } from 'react';
import useAssetUrl from '../../../hooks/useAssetUrl';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { BooleanParam, StringParam, useQueryParams } from 'use-query-params';
import { ResponseError } from '../../../props/ApiResponses';
import usePushDanger from '../../../hooks/usePushDanger';
import usePushSuccess from '../../../hooks/usePushSuccess';
import { useNavigateState } from '../../../modules/state_router/Router';
import { useIdentityEmailsService } from '../../../services/IdentityEmailService';
import { authContext } from '../../../contexts/AuthContext';
import usePushApiError from '../../../hooks/usePushApiError';

export default function Redirect() {
    const assetUrl = useAssetUrl();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();

    const identityEmailsService = useIdentityEmailsService();

    const { hasToken } = useContext(authContext);
    const [resolved, setResolved] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

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
                    'Authenticatie vereist!',
                    'Je bent niet geauthenticeerd, log eerst in om je e-mailadres te bevestigen.',
                );

                return navigateState('sign-in', {}, {});
            }

            identityEmailsService
                .confirmVerification(email_confirmation_token)
                .then(() => {
                    setResolved(true);
                    pushSuccess('E-mail bevestigd!', 'De e-mail is bevestigd.');
                    setConfirmed(true);
                })
                .catch((err: ResponseError) => {
                    pushApiError(err);
                    navigateState('organizations', {}, {});
                });
            return;
        }
    }, [
        target,
        resolved,
        email_confirmation,
        email_confirmation_token,
        navigateState,
        identityEmailsService,
        pushSuccess,
        pushDanger,
        hasToken,
        pushApiError,
    ]);

    if (target) {
        return <></>;
    }

    if (confirmed) {
        return (
            <>
                <div className="block block-email-confirmed">
                    <div className="block-email-confirmed-content">
                        <div className="block-email-confirmed-icon">
                            <img src={assetUrl('/assets/img/confirm-success.svg')} alt="" />
                        </div>
                        <div className="block-email-confirmed-title">Gelukt!</div>
                        <div className="block-email-confirmed-subtitle">Uw e-mailadres is bevestigd</div>
                    </div>

                    <div className="block-email-confirmed-footer">
                        <StateNavLink
                            name={'organizations'}
                            dataDusk="identityEmailConfirmedButton"
                            className="button button-primary button-lg">
                            Bekijken
                        </StateNavLink>
                    </div>
                </div>
            </>
        );
    }

    return <></>;
}
