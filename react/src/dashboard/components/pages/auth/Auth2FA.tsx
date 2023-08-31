import React, { useCallback, useEffect, useState } from 'react';
import Auth2FAInfoBox from '../../elements/auth2fa-info-box/Auth2FAInfoBox';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import Identity2FAState from '../../../props/models/Identity2FAState';
import { useIdentity2FAService } from '../../../services/Identity2FAService';
import usePushDanger from '../../../hooks/usePushDanger';
import useOpenModal from '../../../hooks/useOpenModal';
import Modal2FASetup from '../../modals/Modal2FASetup';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function Auth2FA() {
    const [step, setStep] = useState(null);
    const [hidePane, setHidePanel] = useState(null);
    const [auth2FAState, setAuth2FAState] = useState<Identity2FAState>(null);

    const [providerTypes, setProviderTypes] = useState<
        Array<{
            type: 'phone' | 'authenticator';
            title: string;
            subtitle: string;
        }>
    >(null);

    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();
    const navigate = useNavigate();
    const pushDanger = usePushDanger();
    const identity2FAService = useIdentity2FAService();

    const goDashboard = useCallback(() => {
        return navigate(getStateRouteUrl('organizations'));
    }, [navigate]);

    const auth2FA = useCallback(
        (type: string, auth = false) => {
            setHidePanel(true);

            openModal((modal) => (
                <Modal2FASetup
                    auth={auth}
                    type={type}
                    modal={modal}
                    onReady={goDashboard}
                    onCancel={() => setHidePanel(false)}
                    auth2FAState={auth2FAState}
                />
            ));
        },
        [auth2FAState, goDashboard, openModal],
    );

    const fetchState = useCallback(() => {
        identity2FAService.status().then(
            (res) => setAuth2FAState(res.data.data),
            (err) => pushDanger('Error!', err.data?.message || 'Unknown error.'),
        );
    }, [identity2FAService, pushDanger]);

    useEffect(() => {
        fetchState();
    }, [fetchState]);

    useEffect(() => {
        if (!auth2FAState) {
            return;
        }

        const { required, confirmed, active_providers, provider_types } = auth2FAState;

        if (!required || confirmed) {
            return goDashboard();
        }

        if (active_providers.length == 0) {
            setStep('setup');
            setProviderTypes(provider_types);
        }

        if (active_providers.length > 0) {
            setStep('auth');
            setProviderTypes(
                provider_types.filter((provider_type) => {
                    return active_providers.map((auth_2fa) => auth_2fa.provider_type.type).includes(provider_type.type);
                }),
            );
        }
    }, [auth2FAState, goDashboard]);

    if (!auth2FAState) {
        return <></>;
    }

    return (
        <div className="block block-sign_up block-sign_up-fixed">
            <div className="block-wrapper">
                {step == 'setup' && !hidePane && (
                    <div className="sign_up-pane">
                        <div className="sign_up-pane-body">
                            <div className="sign_up-pane-heading text-strong">Tweefactorauthenticatie instellen</div>
                            <div className="sign_up-pane-text">
                                Aangezien je een werknemer bent van een organisatie die 2FA vereist om het systeem te
                                gebruiken, moet je twee-factor-authenticatie configureren. Kies een van de onderstaande
                                opties.
                            </div>
                        </div>
                        <div className="sign_up-pane-body">
                            <div className="sign_up-pane-text">
                                <div className="sign_up-pane-heading">Kies een optie</div>
                            </div>
                            <div className="sign_up-options">
                                {providerTypes?.map((provider_type) => (
                                    <div
                                        key={provider_type.type}
                                        className="sign_up-option"
                                        onClick={() => auth2FA(provider_type.type)}>
                                        <div className="sign_up-option-media">
                                            <img
                                                alt={''}
                                                className="sign_up-option-media-img"
                                                src={assetUrl(`/assets/img/icon-2fa-${provider_type.type}.svg`)}
                                            />
                                        </div>
                                        <div className="sign_up-option-details">
                                            <div className="sign_up-option-title">{provider_type.subtitle}</div>
                                            <div className="sign_up-option-description">{provider_type.subtitle}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Auth2FAInfoBox />
                        </div>
                        <div className="sign_up-pane-body text-center">
                            <div className="landing-style">
                                <div
                                    className="button button-primary"
                                    onClick={() => navigate(getStateRouteUrl('sign-out'))}>
                                    Uitloggen
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step == 'auth' && !hidePane && (
                    <div className="sign_up-pane">
                        <div className="sign_up-pane-body">
                            <div className="sign_up-pane-heading text-strong">Tweefactorauthenticatie</div>
                        </div>
                        <div className="sign_up-pane-body">
                            <div className="sign_up-pane-text">
                                <div className="sign_up-pane-heading">Kies een optie</div>
                            </div>
                            <div className="sign_up-options">
                                {providerTypes?.map((provider_type) => (
                                    <div
                                        key={provider_type.type}
                                        className="sign_up-option"
                                        onClick={() => auth2FA(provider_type.type, true)}>
                                        <div className="sign_up-option-media">
                                            <img
                                                alt={''}
                                                className="sign_up-option-media-img"
                                                src={assetUrl(`/assets/img/icon-2fa-${provider_type.type}.svg`)}
                                            />
                                        </div>
                                        <div className="sign_up-option-details">
                                            <div className="sign_up-option-title">{provider_type.title}</div>
                                            <div className="sign_up-option-description">{provider_type.subtitle}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Auth2FAInfoBox />
                        </div>
                        <div className="sign_up-pane-body text-center">
                            <div className="landing-style">
                                <div
                                    className="button button-primary"
                                    onClick={() => navigate(getStateRouteUrl('sign-out'))}>
                                    Uitloggen
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
