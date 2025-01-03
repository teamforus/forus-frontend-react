import React, { useCallback, useEffect, useState } from 'react';
import useAuthIdentity2FAState from '../../../hooks/useAuthIdentity2FAState';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { useNavigate } from 'react-router-dom';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import BlockAuth2FAInfoBox from '../../elements/block-auth-2fa-info-box/BlockAuth2FAInfoBox';
import Modal2FASetup from '../../modals/Modal2FASetup';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import useTranslate from '../../../../dashboard/hooks/useTranslate';

export default function Auth2FA() {
    const openModal = useOpenModal();
    const assetUrl = useAssetUrl();
    const navigate = useNavigate();
    const translate = useTranslate();

    const [step, setStep] = useState(null);
    const [paneHidden, setPaneHidden] = useState(null);
    const auth2FAState = useAuthIdentity2FAState();

    const [providerTypes, setProviderTypes] =
        useState<Array<{ type: 'phone' | 'authenticator'; title: string; subtitle: string }>>(null);

    const goDashboard = useCallback(() => {
        return navigate(getStateRouteUrl('home'));
    }, [navigate]);

    const hidePane = useCallback(() => {
        setPaneHidden(true);
    }, []);

    const showPane = useCallback(() => {
        setPaneHidden(false);
    }, []);

    const auth2FA = useCallback(
        (type: string, auth = false) => {
            hidePane();

            openModal((modal) => (
                <Modal2FASetup
                    auth={auth}
                    type={type}
                    modal={modal}
                    onReady={goDashboard}
                    onCancel={showPane}
                    auth2FAState={auth2FAState}
                />
            ));
        },
        [auth2FAState, goDashboard, hidePane, openModal, showPane],
    );

    useEffect(() => {
        if (!auth2FAState) {
            return;
        }

        const { required, confirmed, active_providers, provider_types } = auth2FAState;

        if (!required || confirmed) {
            goDashboard();
            return;
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
        <BlockShowcase wrapper={true} breadcrumbItems={[]} loaderElement={<BlockLoader type={'full'} />}>
            <div className="block block-sign_up">
                <div className="block-wrapper">
                    {step == 'setup' && !paneHidden && (
                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                <div className="sign_up-pane-header-title">{translate('auth.setup_2fa_title')}</div>
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">
                                    <div className="sign_up-pane-heading">{translate('auth.choose_option')}</div>
                                </div>
                                <div className="sign_up-options sign_up-options-2fa">
                                    {providerTypes?.map((providerType) => (
                                        <div
                                            key={providerType.type}
                                            className="sign_up-option"
                                            onClick={() => auth2FA(providerType.type)}>
                                            <div className="sign_up-option-media">
                                                <img
                                                    alt=""
                                                    className="sign_up-option-media-img"
                                                    src={assetUrl(`/assets/img/icon-2fa-${providerType.type}.svg`)}
                                                />
                                            </div>
                                            <div className="sign_up-option-details">
                                                <div className="sign_up-option-title">{providerType.title}</div>
                                                <div className="sign_up-option-description">
                                                    {providerType.subtitle}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <BlockAuth2FAInfoBox />
                            </div>
                            <div className="sign_up-pane-body text-center">
                                <div
                                    className="button button-sm button-primary"
                                    onClick={() => navigate(getStateRouteUrl('sign-out'))}>
                                    {translate('auth.logout')}
                                </div>
                            </div>
                        </div>
                    )}

                    {step == 'auth' && !paneHidden && (
                        <div className="sign_up-pane">
                            <div className="sign_up-pane-header">
                                <div className="sign_up-pane-header-title">{translate('auth.2fa_title')}</div>
                            </div>
                            <div className="sign_up-pane-body">
                                <div className="sign_up-pane-text">
                                    <div className="sign_up-pane-heading">{translate('auth.choose_option')}</div>
                                </div>
                                <div className="sign_up-options sign_up-options-2fa">
                                    {providerTypes?.map((providerType) => (
                                        <div
                                            key={providerType.type}
                                            className="sign_up-option"
                                            onClick={() => auth2FA(providerType.type, true)}>
                                            <div className="sign_up-option-media">
                                                <img
                                                    alt=""
                                                    className="sign_up-option-media-img"
                                                    src={assetUrl(`/assets/img/icon-2fa-${providerType.type}.svg`)}
                                                />
                                            </div>
                                            <div className="sign_up-option-details">
                                                <div className="sign_up-option-title">{providerType.title}</div>
                                                <div className="sign_up-option-description">
                                                    {providerType.subtitle}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <BlockAuth2FAInfoBox />
                            </div>
                            <div className="sign_up-pane-body text-center">
                                <div
                                    className="button button-sm button-primary"
                                    onClick={() => navigate(getStateRouteUrl('sign-out'))}>
                                    {translate('auth.logout')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BlockShowcase>
    );
}
