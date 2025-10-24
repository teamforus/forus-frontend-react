import React, { useCallback, useContext, useEffect, useState } from 'react';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { getStateRouteUrl } from '../../../modules/state_router/Router';
import { NavLink, useNavigate } from 'react-router';
import { useIdentityService } from '../../../services/IdentityService';
import QrCode from '../../elements/qr-code/QrCode';
import { authContext } from '../../../contexts/AuthContext';
import AppLinks from '../../elements/app-links/AppLinks';
import FormError from '../../elements/forms/errors/FormError';
import useEnvData from '../../../hooks/useEnvData';
import useAssetUrl from '../../../hooks/useAssetUrl';
import TranslateHtml from '../../elements/translate-html/TranslateHtml';
import { ResponseError } from '../../../props/ApiResponses';
import useTranslate from '../../../hooks/useTranslate';
import { makeQrCodeContent } from '../../../helpers/utils';

export default function SignIn() {
    const [timer, setTimer] = useState(null);
    const [qrValue, setQrValue] = useState<{ type: 'auth_token'; value: string }>(null);
    const { token, setToken } = useContext(authContext);

    const envData = useEnvData();

    const assetUrl = useAssetUrl();
    const navigate = useNavigate();
    const translate = useTranslate();
    const identityService = useIdentityService();

    const signInForm = useFormBuilder({ email: '' }, async (values) => {
        const source = `${envData.client_key}_${envData.client_type}`;

        return identityService
            .makeAuthEmailToken(values.email?.toString(), source)
            .then(() => signInForm.setState('success'))
            .catch((err: ResponseError) => {
                return signInForm.setErrors(err.data.errors ? err.data.errors : { email: [err.data.message] });
            })
            .finally(() => signInForm.setIsLocked(false));
    });

    const checkAccessTokenStatus = useCallback(
        (type, access_token: string) => {
            identityService.checkAccessToken(access_token).then((res) => {
                if (res.data.message == 'active') {
                    setToken(access_token);
                } else if (res.data.message == 'pending') {
                    setTimer(window.setTimeout(() => checkAccessTokenStatus(type, access_token), 2500));
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
            checkAccessTokenStatus('token', res.data.access_token);
        }, console.error);
    }, [checkAccessTokenStatus, identityService]);

    useEffect(() => {
        return () => window.clearTimeout(timer);
    }, [timer]);

    useEffect(() => {
        if (token) {
            navigate(getStateRouteUrl('organizations'));
        }
    }, [token, navigate]);

    return (
        <div className="block block-login">
            {signInForm.state == 'pending' && (
                <div className="block-login-window">
                    <div className="block-login-content">
                        <div className="block-login-title">Login met e-mail</div>
                        <div className="block-login-description">
                            Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen
                        </div>
                        <div className="block-login-form">
                            <form onSubmit={signInForm.submit} className="form">
                                <div className="form-label">E-mailadres</div>
                                <div className="block-login-control">
                                    <div className="flex form-group">
                                        <input
                                            type="email"
                                            placeholder="e-mail@e-mail.nl"
                                            value={signInForm.values.email.toString()}
                                            onChange={(e) =>
                                                signInForm.update({
                                                    email: e?.target.value,
                                                })
                                            }
                                            autoFocus={true}
                                            className="form-control"
                                            autoComplete="email"
                                            aria-label={translate('popup_auth.input.mail')}
                                        />
                                        <FormError error={signInForm?.errors?.email} />
                                    </div>
                                    <div className="flex">
                                        <button className="button button-primary" type="submit">
                                            Login
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="block-login-me_app">
                            <div className="qr_code-container">
                                <div className="auth-title">Login met Me-app</div>

                                <div className="auth-description">
                                    Scan de QR-code aan de rechterzijde met de QR-scanner in de Me-app.
                                    <br />
                                    <br />
                                    De Me-app wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen en
                                    tegoeden te beheren.
                                    <br />
                                    <br />
                                </div>
                                <AppLinks />
                            </div>

                            <div className="qr_code-block">
                                {qrValue ? (
                                    <QrCode
                                        value={makeQrCodeContent(qrValue.type, qrValue.value)}
                                        logo={assetUrl('/assets/img/me-logo-react.png')}
                                    />
                                ) : (
                                    <div className="qr_code-block-placeholder">
                                        <button className="button" onClick={() => loadQrCode()}>
                                            <em className="mdi mdi-qrcode icon-start" />
                                            Open QR
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="block-login-footer">
                        <div className="block-login-footer-title">Nog geen account?</div>
                        <NavLink to={getStateRouteUrl('sign-up')} className="block-login-footer-button">
                            Inschrijven
                        </NavLink>
                    </div>
                </div>
            )}

            {signInForm.state == 'success' && (
                <div className="block-login-window">
                    <div className="block-login-content">
                        <div className="block-login-email_sent">
                            <div className="block-login-email_sent-icon">
                                <img
                                    src={assetUrl('/assets/img/sign_up-email.svg')}
                                    alt="Success icon"
                                    className="sign_up-email_sent-icon-img"
                                />
                            </div>
                            <div className="block-login-email_sent-title">{translate('popup_auth.labels.join')}</div>
                            <div className="block-login-email_sent-text">
                                <TranslateHtml
                                    i18n={'popup_auth.notifications.link'}
                                    values={{ email: signInForm.values.email }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
