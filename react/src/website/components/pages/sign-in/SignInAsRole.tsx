import React, { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSetTitle from '../../../hooks/useSetTitle';
import useSetMetaDescription from '../../../hooks/useSetMetaDescription';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useParams } from 'react-router-dom';
import SignUpBlock from './elements/SignUpBlock';
import useEnvData from '../../../hooks/useEnvData';
import useAssetUrl from '../../../hooks/useAssetUrl';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { authContext } from '../../../contexts/AuthContext';
import QrCode from '../../../../dashboard/components/elements/qr-code/QrCode';
import { useNavigateState } from '../../../../dashboard/modules/state_router/Router';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import BlockDashedSeparator from '../home/elements/BlockDashedSeparator';
import AboutUsBlock from '../../elements/AboutUsBlock';
import LearnMore from '../../elements/LearnMore';

export default function SignInAsRole() {
    const { token, setToken } = useContext(authContext);

    const { role } = useParams();

    const envData = useEnvData();
    const setTitle = useSetTitle();
    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();
    const setMetaDescription = useSetMetaDescription();

    const identityService = useIdentityService();

    const [qrShown, setQrShown] = useState(false);
    const [qrValue, setQrValue] = useState(null);
    const [timer, setTimer] = useState(null);
    const [emailSent, setEmailSent] = useState(false);

    const signedIn = useMemo(() => !!token, [token]);
    const roleName = useMemo(() => {
        switch (role) {
            case 'requester':
                return 'Aanvrager';
            case 'provider':
                return 'Aanbieder';
            case 'sponsor':
                return 'Sponsor';
            case 'validator':
                return 'Beoordelaar';
        }
    }, [role]);

    const authForm = useFormBuilder(
        {
            email: '',
        },
        async (values) => {
            const handleErrors = (res: ResponseError) => {
                authForm.setIsLocked(false);
                authForm.setErrors(res.data.errors ? res.data.errors : { email: [res.data.message] });
            };

            const emailValidateRes = await new Promise<{ used: boolean; unique: boolean; valid: boolean }>(
                (resolve) => {
                    identityService.validateEmail(values).then((res) => {
                        resolve(res.data.email);
                    }, handleErrors);
                },
            );

            setProgress(0);

            if (!emailValidateRes.valid) {
                authForm.setErrors({ email: 'Het e-mailadres dat u hebt opgegeven, is ongeldig.' });
                authForm.setIsLocked(false);
                return;
            }

            if (emailValidateRes.used) {
                return identityService
                    .makeAuthEmailToken(values.email, `${envData.client_key}_website`)
                    .then(() => {
                        setEmailSent(true);
                        authForm.reset();
                    }, handleErrors)
                    .finally(() => setProgress(100));
            } else {
                authForm.setErrors({
                    email: 'Het door u opgegeven e-mailadres komt niet in ons systeem voor. Meld u alstublieft eerst aan.',
                });
                authForm.setIsLocked(false);
            }
        },
    );

    const checkAccessTokenStatus = useCallback(
        (access_token: string) => {
            identityService.checkAccessToken(access_token).then((res) => {
                if (res.data.message == 'active') {
                    setToken(access_token);
                } else if (res.data.message == 'pending') {
                    setTimer(window.setTimeout(() => checkAccessTokenStatus(access_token), 2500));
                } else {
                    document.location.reload();
                }
            });
        },
        [identityService, setToken],
    );

    const loadQrCode = useCallback(() => {
        identityService.makeAuthToken().then((res) => {
            setQrValue({ type: 'auth_token', value: res.data.auth_token });
            checkAccessTokenStatus(res.data.access_token);
        }, console.error);
    }, [checkAccessTokenStatus, identityService]);

    useEffect(() => {
        if (signedIn) {
            navigateState('home');
        }
    }, [navigateState, signedIn]);

    useEffect(() => {
        setTitle('Login | Het Forus-platform');
        setMetaDescription(`Inloggen op het Forus-platform als ${role}.`);
    }, [role, setMetaDescription, setTitle]);

    return (
        <div className="wrapper">
            <div className="block block-breadcrumbs hide-sm">
                <StateNavLink name={'home'} className="breadcrumb-item">
                    Home
                </StateNavLink>
                <StateNavLink name={'sign-in'} className="breadcrumb-item" activeExact={true}>
                    Inloggen
                </StateNavLink>
                {emailSent ? (
                    <a className="state-nav-link breadcrumb-item" onClick={() => setEmailSent(false)}>
                        Inloggen als {role}
                    </a>
                ) : (
                    <a className="breadcrumb-item active" aria-current="location">
                        Inloggen als {role}
                    </a>
                )}
                {emailSent && (
                    <a className="breadcrumb-item active" aria-current="location">
                        Confirmation
                    </a>
                )}
            </div>

            {!emailSent ? (
                <Fragment>
                    <div className="block block-sign-in">
                        <div className="block-sign-in-title">
                            Inloggen als <span className="block-sign-in-role-name">{roleName}</span>
                        </div>
                        <div className="block-sign-in-main">
                            <div className="block-sign-in-main-option block-sign-in-main-email">
                                <div className="block-sign-in-main-option-title">Login met e-mail</div>
                                <div className="block-sign-in-main-option-description">
                                    Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen
                                </div>
                                <form className="form">
                                    <div className="form-group">
                                        <label className="form-label">E-mail</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="E-mailadres"
                                            value={authForm.values.email}
                                            onChange={(e) => authForm.update({ email: e.target.value })}
                                            required
                                        />
                                        <FormError error={authForm.errors?.email} />
                                    </div>
                                    <div className="form-group">
                                        <button
                                            type="button"
                                            className="button button-primary button-send-email"
                                            onClick={() => authForm.submit()}>
                                            Login
                                        </button>
                                    </div>
                                </form>
                            </div>
                            <div className="block-sign-in-main-option block-sign-in-main-me-app">
                                <div className="block-sign-in-main-me-app-details">
                                    <div className="block-sign-in-main-option-title">Inloggen met Me-app</div>
                                    <div className="block-sign-in-main-option-description">
                                        Scan de QR-code aan de rechterzijde met de QR-scanner in de Me-app.
                                        <br />
                                        <br />
                                        De Me-app wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen
                                        en tegoeden te beheren.
                                    </div>
                                    <div className="block-sign-in-main-option-links">
                                        <a
                                            className="block-sign-in-main-option-link"
                                            href={envData?.config?.android_link}
                                            target={'_blank'}
                                            rel="noreferrer">
                                            <img src={assetUrl('/assets/img/icon-app-android-black.svg')} alt={''} />
                                        </a>
                                        <a
                                            className="block-sign-in-main-option-link"
                                            href={envData?.config?.ios_iphone_link}
                                            target={'_blank'}
                                            rel="noreferrer">
                                            <img src={assetUrl('/assets/img/icon-app-ios-black.svg')} alt={''} />
                                        </a>
                                    </div>
                                </div>

                                <div className="block-sign-in-main-me-app-qr">
                                    {qrShown ? (
                                        <div className="block-sign-in-main-me-app-qr-image">
                                            {qrValue && (
                                                <QrCode
                                                    value={JSON.stringify(qrValue)}
                                                    logo={assetUrl('/assets/img/me-logo.png')}
                                                    logoWidth={160}
                                                    logoHeight={160}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="block-sign-in-main-me-app-qr-hidden">
                                            <button
                                                type={'button'}
                                                className="button button-light"
                                                onClick={() => {
                                                    loadQrCode();
                                                    window.clearTimeout(timer);
                                                    setQrShown(true);
                                                }}>
                                                <img src={assetUrl('/assets/img/qr-code-icon.svg')} alt="" />
                                                Open QR
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <SignUpBlock />
                </Fragment>
            ) : (
                <Fragment>
                    <div className="block block-sign-in-email-sent">
                        <div className="block-sign-in-email-sent-image">
                            <img src={assetUrl('/assets/img/auth-email-sent.svg')} alt="" />
                        </div>
                        <div className="block-sign-in-email-sent-title">Aanmelden</div>
                        <div className="block-sign-in-email-sent-description">
                            Er is een e-mail verstuurd naar {authForm.values.email}.
                            <br />
                            Klik op de link om u aan te melden.
                        </div>
                        <StateNavLink name={'home'} className="button button-primary">
                            Naar home
                        </StateNavLink>
                    </div>

                    <BlockDashedSeparator image={true} />

                    <AboutUsBlock />

                    <LearnMore
                        title={'Klaar om uw impact te vergroten?'}
                        description={
                            'Laten we eens kijken naar de mogelijkheden en de optimale manier om uw regelingen uit te geven.'
                        }
                        buttons={[{ title: 'Gratis demo aanvragen', type: 'primary', stateName: 'book-demo' }]}
                    />
                </Fragment>
            )}
        </div>
    );
}
