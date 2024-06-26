import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useNavigateState } from '../../../modules/state_router/Router';
import { useAuthService } from '../../../services/AuthService';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import useEnvData from '../../../hooks/useEnvData';
import { BooleanParam, useQueryParams } from 'use-query-params';
import { useDigiDService } from '../../../services/DigiDService';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAssetUrl from '../../../hooks/useAssetUrl';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import EmailProviderLink from '../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import QrCode from '../../../../dashboard/components/elements/qr-code/QrCode';
import AppLinks from '../../elements/app-links/AppLinks';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import useSetTitle from '../../../hooks/useSetTitle';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';

export default function Start() {
    const { token, signOut, setToken } = useContext(authContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const [state, setState] = useState<string>('start');
    const [timer, setTimer] = useState(null);
    const [loading, setLoading] = useState(false);

    const [qrValue, setQrValue] = useState(null);

    const [{ reset, logout, restore_with_digid, restore_with_email }, setQueryParams] = useQueryParams({
        reset: BooleanParam,
        logout: BooleanParam,
        restore_with_digid: BooleanParam,
        restore_with_email: BooleanParam,
    });

    const { onAuthRedirect } = useAuthService();
    const digIdService = useDigiDService();
    const identityService = useIdentityService();

    const [authEmailRestoreSent, setAuthEmailRestoreSent] = useState<boolean>(null);
    const [authEmailConfirmationSent, setAuthEmailConfirmationSent] = useState<boolean>(false);

    const signedIn = useMemo(() => !!token, [token]);

    const hasPrivacy = useMemo(() => {
        return (
            envData.config?.flags?.privacyPage &&
            (!envData.config?.flags?.startPage?.combineColumns || state === 'email')
        );
    }, [envData, state]);

    const authForm = useFormBuilder(
        {
            email: '',
            target: 'fundRequest',
            privacy: false,
        },
        async (values) => {
            if (!values.privacy && hasPrivacy) {
                // prevent submit if policy exist and not checked
                authForm.setIsLocked(false);
                return;
            }

            const handleErrors = (res: ResponseError) => {
                authForm.setIsLocked(false);
                authForm.setErrors(res.data.errors ? res.data.errors : { email: [res.data.message] });
            };

            const used = await new Promise((resolve) => {
                identityService.validateEmail(values).then((res) => {
                    resolve(res.data.email.used);
                }, handleErrors);
            });

            setProgress(0);

            if (used) {
                return identityService
                    .makeAuthEmailToken(values.email, `${envData.client_key}_${envData.client_type}`, values.target)
                    .then(() => {
                        setState('email');
                        setAuthEmailConfirmationSent(true);
                        authForm.reset();
                    }, handleErrors)
                    .finally(() => setProgress(100));
            }

            identityService
                .make(values)
                .then(() => {
                    setAuthEmailRestoreSent(true);
                    authForm.reset();
                    setState('email');
                }, handleErrors)
                .finally(() => setProgress(100));
        },
    );

    const { reset: authFormReset } = authForm;

    const startDigId = useCallback(() => {
        setLoading(true);
        setProgress(0);

        digIdService
            .startAuthRestore()
            .then((res) => (document.location = res.data.redirect_url))
            .catch((res: ResponseError) => navigateState('error', { errorCode: res.headers['error-code'] }))
            .finally(() => {
                setLoading(false);
                setProgress(100);
            });
    }, [digIdService, navigateState, setProgress]);

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
        if (state == 'qr' && !qrValue) {
            loadQrCode();
        }

        if (state !== 'qr') {
            setQrValue(null);
            window.clearTimeout(timer);
        }

        return () => {
            window.clearTimeout(timer);
        };
    }, [loadQrCode, state, timer, qrValue]);

    useEffect(() => {
        if (logout) {
            signOut(null, false, true, false);
        }

        if (restore_with_digid) {
            startDigId();
        }

        if (!restore_with_digid && restore_with_email) {
            setAuthEmailConfirmationSent(false);
            setAuthEmailRestoreSent(false);
            authFormReset();
            setState('email');
        }

        if (reset) {
            setState('start');
        }

        setQueryParams({ logout: null, restore_with_digid: null, restore_with_email: null, reset: null });
    }, [reset, logout, restore_with_digid, restore_with_email, setQueryParams, signOut, startDigId, authFormReset]);

    useEffect(() => {
        if (signedIn) {
            onAuthRedirect().then();
        }
    }, [onAuthRedirect, signedIn]);

    useEffect(() => {
        if (envData) {
            setTitle(translate(`signup.items.${envData.client_key}.title`, null, 'Inloggen'));
        }
    }, [envData, setTitle, translate]);

    const inlineEmailForm = useCallback(
        (showPolicy = true) => (
            <form className="form" onSubmit={authForm.submit} data-dusk="authEmailForm">
                <div className="row">
                    <div className="form-group col col-lg-9">
                        <label className="form-label" htmlFor="email">
                            <strong>{translate('popup_auth.input.mail')}</strong>
                        </label>
                        <UIControlText
                            type={'email'}
                            value={authForm.values.email}
                            onChange={(e) => authForm.update({ email: e.target.value })}
                            placeholder={'e-mail@e-mail.nl'}
                            id={'email'}
                            name={'email'}
                            tabIndex={1}
                            autoFocus={true}
                            dataDusk={'authEmailFormEmail'}
                        />
                        <FormError error={authForm.errors.email} />
                    </div>
                    <div className="form-group col col-lg-3">
                        <label className="form-label hide-sm" htmlFor="submit">
                            &nbsp;
                        </label>
                        <button
                            id={'submit'}
                            className="button button-primary button-fill"
                            type="submit"
                            disabled={showPolicy && !authForm.values.privacy && envData.config.flags.privacyPage}
                            data-dusk="authEmailFormSubmit"
                            tabIndex={4}>
                            {translate('popup_auth.buttons.submit')}
                        </button>
                    </div>
                </div>

                {showPolicy && envData.config.flags.privacyPage && (
                    <div className="row">
                        <div className="col col-lg-12">
                            <br className="hidden-lg" />
                            <label
                                className="sign_up-pane-text sign_up-pane-text-sm flex"
                                htmlFor="privacy"
                                tabIndex={2}
                                onKeyDown={(e) => {
                                    e.stopPropagation();
                                    clickOnKeyEnter(e);
                                }}>
                                <input
                                    type="checkbox"
                                    checked={authForm.values.privacy}
                                    onChange={(e) => {
                                        authForm.update({ privacy: e.target.checked });
                                        e.target?.parentElement?.focus();
                                    }}
                                    id="privacy"
                                />
                                <strong>
                                    Ik heb de{' '}
                                    <StateNavLink
                                        tabIndex={3}
                                        target={'_blank'}
                                        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                                            e.stopPropagation();
                                            clickOnKeyEnter(e);
                                        }}
                                        className="text-primary-light sign_up-pane-link"
                                        name="privacy">
                                        privacyverklaring
                                    </StateNavLink>{' '}
                                    gelezen
                                </strong>
                            </label>
                        </div>
                    </div>
                )}
            </form>
        ),
        [authForm, envData?.config?.flags?.privacyPage, translate],
    );

    const qrOption = (
        <div
            className="sign_up-option"
            tabIndex={0}
            onKeyDown={clickOnKeyEnter}
            onClick={() => setState('qr')}
            role="button">
            <div className="sign_up-option-media">
                <img
                    className="sign_up-option-media-img"
                    src={assetUrl('/assets/img/icon-auth/icon-auth-me_app.svg')}
                    alt=""
                />
            </div>
            <div className="sign_up-option-details">
                <div className="sign_up-option-title">Me app</div>
                <div className="sign_up-option-description">
                    Scan een QR-code met de&nbsp;<u>Me app</u>
                    &nbsp;
                </div>
            </div>
        </div>
    );

    const restoreLink = (label = 'Kun je niet meer inloggen?', link = 'Account herstellen met DigiD') => (
        <div className="sign_up-restore">
            <div className="sign_up-restore-label">{label}</div>
            <div
                className="sign_up-restore-link clickable"
                onClick={() => setState('restore')}
                role="button"
                tabIndex={0}
                onKeyDown={clickOnKeyEnter}>
                {link}
                <div className="sign_up-restore-chevron">
                    <em className="mdi mdi-chevron-right" />
                </div>
            </div>
        </div>
    );

    const digidOption = (title: string, description: string) => (
        <div className="sign_up-option" tabIndex={0} onKeyDown={clickOnKeyEnter} role="button" onClick={startDigId}>
            <div className="sign_up-option-media">
                <img
                    className="sign_up-option-media-img"
                    src={assetUrl('/assets/img/icon-auth/icon-auth-digid.svg')}
                    alt="logo DigiD"
                />
            </div>
            <div className="sign_up-option-details">
                <div className="sign_up-option-title">{title}</div>
                <div className="sign_up-option-description">{description}</div>
            </div>
        </div>
    );

    const emailOption = (dusk: string, title: string, description: string) => (
        <div
            className="sign_up-option"
            tabIndex={0}
            onKeyDown={clickOnKeyEnter}
            onClick={() => {
                window.setTimeout(() => setState('email'), 0);
            }}
            role="button"
            data-dusk={dusk}>
            <div className="sign_up-option-media">
                <img
                    className="sign_up-option-media-img"
                    src={assetUrl('/assets/img/icon-auth/icon-auth-mail.svg')}
                    alt=""
                />
            </div>
            <div className="sign_up-option-details">
                <div className="sign_up-option-title">{title}</div>
                <div className="sign_up-option-description">{description}</div>
            </div>
        </div>
    );

    return (
        <BlockShowcase wrapper={true} breadcrumbs={<></>} loaderElement={<BlockLoader type={'full'} />}>
            {!signedIn && (
                <header className="section section-sign-up-choose">
                    <div className="wrapper">
                        {state === 'start' && (
                            <div className="block block-sign_up">
                                <div
                                    className={`block-wrapper ${
                                        !envData.config.flags?.startPage?.combineColumns ? 'block-wrapper-lg' : ''
                                    }`}>
                                    <h1 className="block-title">
                                        {translate(
                                            `signup.items.${envData.client_key}.title`,
                                            {},
                                            'signup.items.title',
                                        )}
                                    </h1>

                                    <div className="sign_up-pane">
                                        <div className="sign_up-pane-body">
                                            {envData.config?.flags?.startPage?.combineColumns ? (
                                                <div className="sign_up-row">
                                                    <div className="sign_up-col">
                                                        <div className={`sign_up-options ${loading ? 'disabled' : ''}`}>
                                                            {inlineEmailForm(false)}

                                                            {!envData.config.flags.startPage.hideSignUpQrCodeOption &&
                                                                qrOption}
                                                        </div>

                                                        {appConfigs.digid && restoreLink()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="sign_up-row">
                                                    <div className="sign_up-col">
                                                        <h3 className="sign_up-pane-text">
                                                            <div className="sign_up-pane-heading">
                                                                Account aanmaken of een aanvraag starten?
                                                            </div>
                                                        </h3>
                                                        <div className={`sign_up-options ${loading ? 'disabled' : ''}`}>
                                                            {appConfigs.digid &&
                                                                !envData.config?.flags?.startPage
                                                                    ?.hideSignUpDigidOption &&
                                                                digidOption('DigiD', 'Open DigiD inlogscherm')}

                                                            {!envData.config?.flags?.startPage?.hideSignUpEmailOption &&
                                                                emailOption(
                                                                    'authOptionEmailRegister',
                                                                    'E-mailadres',
                                                                    'Ontvang een inloglink per e-mail',
                                                                )}
                                                        </div>
                                                    </div>
                                                    <div className="sign_up-col">
                                                        <h3 className="sign_up-pane-text">
                                                            <div className="sign_up-pane-heading">
                                                                {translate(
                                                                    `signup.items.${envData.client_key}.pane_text`,
                                                                    {},
                                                                    'signup.items.pane_text',
                                                                )}
                                                            </div>
                                                        </h3>
                                                        <div className={`sign_up-options ${loading ? 'disabled' : ''}`}>
                                                            {appConfigs.digid &&
                                                                envData.config?.flags?.startPage
                                                                    ?.hideSignInDigidOption &&
                                                                digidOption('DigiD', 'Open DigiD inlogscherm')}

                                                            {!envData.config?.flags?.startPage?.hideSignInEmailOption &&
                                                                emailOption(
                                                                    'authOptionEmailRestore',
                                                                    'E-mailadres',
                                                                    'Ontvang een inloglink per e-mail',
                                                                )}

                                                            {!envData.config?.flags?.startPage
                                                                ?.hideSignInQrCodeOption && qrOption}

                                                            {appConfigs.digid && restoreLink()}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'restore' && (
                            <div className="block block-sign_up">
                                <div className="block-wrapper">
                                    <h1 className="block-title">Account herstellen</h1>
                                    {!authEmailRestoreSent && !authEmailConfirmationSent && (
                                        <div className="sign_up-pane">
                                            <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                                                <div className="sign_up-options">
                                                    {appConfigs.digid && digidOption('DigiD', 'Open DigiD inlogscherm')}
                                                </div>
                                            </div>
                                            <div className="sign_up-pane-footer">
                                                <div
                                                    role={'button'}
                                                    tabIndex={0}
                                                    onKeyDown={clickOnKeyEnter}
                                                    className="button button-text button-text-padless"
                                                    onClick={() => setState('start')}>
                                                    <em className="mdi mdi-chevron-left icon-lefts" />
                                                    Terug naar inloggen
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {state == 'email' && (
                            <div className="block block-sign_up">
                                <div className="block-wrapper">
                                    <h1 className="block-title">
                                        {translate(
                                            `signup.items.${envData.client_key}.start_email`,
                                            {},
                                            'signup.items.start_email',
                                        )}
                                    </h1>

                                    {!authEmailRestoreSent && !authEmailConfirmationSent && (
                                        <div className="sign_up-pane">
                                            <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                                                {inlineEmailForm()}
                                            </div>
                                            <div className="sign_up-pane-footer">
                                                <div
                                                    role={'button'}
                                                    tabIndex={4}
                                                    onKeyDown={clickOnKeyEnter}
                                                    className="button button-text button-text-padless"
                                                    onClick={() => setState('start')}>
                                                    <em className="mdi mdi-chevron-left icon-lefts" />
                                                    Terug
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {authEmailRestoreSent && (
                                        <div className="sign_up-pane">
                                            <h1 className="sr-only">Start aanmelden</h1>
                                            <h2 className="sign_up-pane-header">
                                                {translate('popup_auth.header.title')}
                                            </h2>
                                            <div className="sign_up-pane-body" data-dusk="authEmailSentConfirmation">
                                                <div className="sign_up-email_sent">
                                                    <div className="sign_up-email_sent-icon">
                                                        <img
                                                            className="sign_up-email_sent-icon-img"
                                                            src={assetUrl('/assets/img/modal/email_signup.svg')}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="sign_up-email_sent-title">
                                                        {translate(
                                                            `popup_auth.header.title_succes_${appConfigs?.communication_type}`,
                                                        )}
                                                    </div>
                                                    <TranslateHtml
                                                        component={<div className="sign_up-email_sent-text" />}
                                                        i18n={`popup_auth.header.subtitle_we_succes_${appConfigs?.communication_type}`}
                                                        values={{ email: authForm.values.email }}
                                                    />
                                                    <EmailProviderLink email={authForm.values.email} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {authEmailConfirmationSent && (
                                        <div className="sign_up-pane">
                                            <h1 className="sr-only" role="heading">
                                                Start aanmelden
                                            </h1>
                                            <h2 className="sign_up-pane-header" role="heading">
                                                E-mail verstuurd
                                            </h2>
                                            <div className="sign_up-pane-body" data-dusk="authEmailSentConfirmation">
                                                <div className="sign_up-email_sent">
                                                    <div className="sign_up-email_sent-icon">
                                                        <img
                                                            className="sign_up-email_sent-icon-img"
                                                            src={assetUrl('/assets/img/modal/email_signup.svg')}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <h3 className="sign_up-email_sent-title" role="heading">
                                                        {translate(
                                                            `popup_auth.header.title_existing_user_succes_${appConfigs?.communication_type}`,
                                                        )}
                                                    </h3>
                                                    <TranslateHtml
                                                        component={<div className="sign_up-email_sent-text" />}
                                                        i18n={`popup_auth.notifications.link_${appConfigs?.communication_type}`}
                                                        values={authForm.values}
                                                    />
                                                    <EmailProviderLink email={authForm.values.email} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {state == 'qr' && (
                            <div className="block block-sign_up">
                                <div className="block-wrapper">
                                    <h1 className="block-title">Inloggen</h1>
                                    <div className="sign_up-pane">
                                        <div className="sign_up-pane-body sign_up-pane-body-padless-bottom">
                                            <div className="sign_up-pane-auth">
                                                <div className="sign_up-pane-auth-content">
                                                    <div className="sign_up-pane-heading sign_up-pane-heading-lg">
                                                        {translate('fund_request.sign_up.app.title')}
                                                    </div>
                                                    <div className="sign_up-pane-text">
                                                        {translate('fund_request.sign_up.app.description_top')}
                                                    </div>
                                                    <div className="sign_up-pane-auth-qr_code show-sm">
                                                        {qrValue && (
                                                            <QrCode
                                                                value={JSON.stringify(qrValue)}
                                                                logo={assetUrl('/assets/img/me-logo.png')}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="sign_up-pane-text">
                                                        {translate('fund_request.sign_up.app.description_bottom')}
                                                    </div>
                                                    <AppLinks />
                                                </div>
                                                <div className="sign_up-pane-auth-qr_code hide-sm">
                                                    {qrValue && (
                                                        <QrCode
                                                            value={JSON.stringify(qrValue)}
                                                            logo={assetUrl('/assets/img/me-logo.png')}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sign_up-pane-footer">
                                            <div
                                                role={'button'}
                                                tabIndex={0}
                                                onKeyDown={clickOnKeyEnter}
                                                className="button button-text button-text-padless"
                                                onClick={() => setState('start')}>
                                                <em className="mdi mdi-chevron-left icon-lefts" />
                                                Terug
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </header>
            )}
        </BlockShowcase>
    );
}
