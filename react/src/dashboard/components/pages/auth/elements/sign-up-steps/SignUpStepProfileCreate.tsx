import React, { useContext, useEffect, useState } from 'react';
import useAssetUrl from '../../../../../hooks/useAssetUrl';
import UIControlText from '../../../../elements/forms/ui-controls/UIControlText';
import FormError from '../../../../elements/forms/errors/FormError';
import QrCode from '../../../../elements/qr-code/QrCode';
import AppLinks from '../../../../elements/app-links/AppLinks';
import EmailProviderLink from '../EmailProviderLink';
import useFormBuilder from '../../../../../hooks/useFormBuilder';
import { ResponseError } from '../../../../../props/ApiResponses';
import { useIdentityService } from '../../../../../services/IdentityService';
import useEnvData from '../../../../../hooks/useEnvData';
import ProgressStorage from '../../../../../helpers/ProgressStorage';
import { authContext } from '../../../../../contexts/AuthContext';
import useTranslate from '../../../../../hooks/useTranslate';
import { makeQrCodeContent } from '../../../../../helpers/utils';

export default function SignUpStepProfileCreate({ panelType }: { panelType: 'sponsor' | 'validator' }) {
    const envData = useEnvData();
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const { setToken } = useContext(authContext);

    const identityService = useIdentityService();

    const [hasApp, setHasApp] = useState(null);
    const [tmpAuthToken, setTmpAuthToken] = useState(null);
    const [authEmailSent, setAuthEmailSent] = useState(null);
    const [authEmailRestoreSent, setAuthEmailRestoreSent] = useState(null);
    const [progressStorage] = useState(new ProgressStorage(`${panelType}-sign_up`));

    const formSignUp = useFormBuilder(
        {
            email: '',
            target: 'newSignup',
            confirm: true,
        },
        (values) => {
            const resolveErrors = (err: ResponseError) => {
                formSignUp.setIsLocked(false);
                formSignUp.setErrors(err.data.errors);

                if (err.response.status === 429) {
                    formSignUp.setErrors({ email: err?.data?.message });
                }
            };

            return identityService.validateEmail(values).then((res) => {
                const source = `${envData.client_key}_${envData.client_type}`;

                if (!res.data.email.used) {
                    identityService
                        .make(values)
                        .then(() => setAuthEmailSent(true))
                        .catch((err: ResponseError) => resolveErrors(err));
                } else {
                    identityService
                        .makeAuthEmailToken(values.email, source, 'newSignup')
                        .then(() => setAuthEmailRestoreSent(true))
                        .catch((err: ResponseError) => resolveErrors(err));
                }
            }, resolveErrors);
        },
    );

    useEffect(() => {
        setHasApp(JSON.parse(progressStorage.get('hasApp', 'false')));
    }, [progressStorage, tmpAuthToken]);

    useEffect(() => {
        let timer = null;
        progressStorage.set('hasApp', `${hasApp}`);

        if (!hasApp) {
            return;
        }

        const checkCallback = (access_token: string) => {
            identityService.checkAccessToken(access_token).then((res) => {
                if (res.data.message == 'active') {
                    setToken(access_token);
                    setHasApp(false);
                    progressStorage.set('step', '4');
                } else if (res.data.message == 'pending') {
                    timer = setTimeout(() => checkCallback(access_token), 2500);
                } else {
                    document.location.reload();
                }
            });
        };

        identityService
            .makeAuthToken()
            .then((res) => {
                setTmpAuthToken(res.data.auth_token);
                timer = window.setTimeout(() => checkCallback(res.data.access_token), 2500);
            })
            .catch(console.error);

        return () => window.clearTimeout(timer);
    }, [hasApp, identityService, progressStorage, setToken]);

    return (
        <div className="sign_up-pane">
            <div className="sign_up-pane-header">
                {translate(`sign_up_${panelType}.header.title_step_${panelType == 'sponsor' ? 2 : 3}`)}
            </div>

            {!authEmailSent && !authEmailRestoreSent && !hasApp && (
                <div className="sign_up-pane-body">
                    {panelType === 'validator' && (
                        <div className="sign_up-pane-heading">
                            {translate(`sign_up_validator.header.subtitle_step_3`)}
                        </div>
                    )}
                    <div className="sign_up-pane-text">{translate(`sign_up_${panelType}.labels.terms`)}</div>

                    <form className="form" onSubmit={formSignUp.submit}>
                        <div className="row">
                            <div className="col col-md-7 col-xs-12">
                                <div className="form-group">
                                    <label className="form-label">E-mailadres</label>
                                    <UIControlText
                                        value={formSignUp.values.email}
                                        onChangeValue={(email) => formSignUp.update({ email })}
                                        className={'large'}
                                        placeholder={'e-mail@e-mail.nl'}
                                        autoComplete={'email'}
                                    />
                                    <FormError
                                        error={formSignUp.errors?.email || formSignUp.errors?.['records.primary_email']}
                                    />
                                </div>
                            </div>

                            <div className="col col-md-5 col-xs-12">
                                <div className="form-group">
                                    <label className="form-label">&nbsp;</label>
                                    <button
                                        type="submit"
                                        className={`button button-primary button-fill ${
                                            formSignUp.values.email ? '' : 'button-disabled'
                                        }`}>
                                        {translate(`sign_up_${panelType}.app_instruction.create_profile`)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div
                        className="sign_up-pane-link visible-md-inline visible-lg-inline"
                        onClick={() => setHasApp(true)}>
                        {translate(`sign_up_${panelType}.no_app.to_app`)}
                    </div>
                </div>
            )}

            {!authEmailSent && !authEmailRestoreSent && hasApp && (
                <div className="sign_up-pane-body">
                    <div className="sign_up-pane-heading">{translate(`sign_up_${panelType}.app.title`)}</div>

                    <div className="sign_up-pane-auth">
                        <div className="sign_up-pane-auth-content">
                            {translate(`sign_up_${panelType}.app.description_top`)
                                ?.split('\n')
                                ?.map((line: string, index: number) => (
                                    <div key={index} className="sign_up-pane-text">
                                        {line}
                                    </div>
                                ))}

                            <div className="sign_up-pane-auth-qr_code visible-sm visible-xs">
                                {tmpAuthToken && (
                                    <QrCode
                                        logo={assetUrl('/assets/img/me-logo-react.png')}
                                        value={makeQrCodeContent('auth_token', tmpAuthToken)}
                                    />
                                )}
                            </div>

                            {translate(`sign_up_${panelType}.app.description_bottom`)
                                ?.split('\n')
                                ?.map((line: string, index: number) => (
                                    <div key={index} className="sign_up-pane-text">
                                        {line}
                                    </div>
                                ))}
                            <AppLinks />
                        </div>

                        <div className="sign_up-pane-auth-qr_code visible-md visible-lg">
                            {tmpAuthToken && (
                                <QrCode
                                    logo={assetUrl('/assets/img/me-logo-react.png')}
                                    value={makeQrCodeContent('auth_token', tmpAuthToken)}
                                />
                            )}
                        </div>
                    </div>

                    <div
                        className="sign_up-pane-link visible-md-inline visible-lg-inline"
                        onClick={() => setHasApp(false)}>
                        {translate(`sign_up_${panelType}.app.no_app`)}
                    </div>
                </div>
            )}

            {(authEmailSent || authEmailRestoreSent) && (
                <div className="sign_up-pane-body text-center">
                    <div className="sign_up-pane-media">
                        <img src={assetUrl('/assets/img/email_confirmed.svg')} alt={''} />
                    </div>
                    <div className="sign_up-pane-heading sign_up-pane-heading-lg text-primary-mid">
                        {translate(`sign_up_${panelType}.labels.confirm_email`)}
                    </div>
                    <div className="sign_up-pane-text text-center">
                        {translate(`sign_up_${panelType}.labels.confirm_email_description`)}
                        <span className="sign_up-pane-link text-underline">&nbsp;{formSignUp.values.email}</span>
                        <br />
                        <br />
                        <EmailProviderLink email={formSignUp.values?.email} />
                    </div>
                </div>
            )}
        </div>
    );
}
