import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authContext } from '../../../contexts/AuthContext';
import { useNavigateState, useStateHref, useStateParams } from '../../../modules/state_router/Router';
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
import EmailProviderLink from '../../../../dashboard/components/pages/auth/elements/EmailProviderLink';
import QrCode from '../../../../dashboard/components/elements/qr-code/QrCode';
import AppLinks from '../../elements/app-links/AppLinks';
import UIControlText from '../../../../dashboard/components/elements/forms/ui-controls/UIControlText';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import useSetTitle from '../../../hooks/useSetTitle';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import SignUpFooter from '../../elements/sign-up/SignUpFooter';
import BindLinksInside from '../../elements/bind-links-inside/BindLinksInside';
import { makeQrCodeContent } from '../../../../dashboard/helpers/utils';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';

export default function Start() {
    const { token, signOut, setToken } = useContext(authContext);

    const envData = useEnvData();
    const appConfigs = useAppConfigs();

    const assetUrl = useAssetUrl();
    const setTitle = useSetTitle();
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const navigateState = useNavigateState();

    const termsUrl = useStateHref(WebshopRoutes.TERMS_AND_CONDITIONS);
    const privacyUrl = useStateHref(WebshopRoutes.PRIVACY);

    const { target } = useStateParams<{ target?: string }>();
    const [state, setState] = useState<string>('start');
    const [timer, setTimer] = useState(null);
    const [loading, setLoading] = useState(false);

    const [qrValue, setQrValue] = useState<{ type: 'auth_token'; value: string }>(null);
    const [emailValue, setEmailValue] = useState(null);

    const [{ reset, logout, restore_with_digid, restore_with_email }, setQueryParams] = useQueryParams(
        {
            reset: BooleanParam,
            logout: BooleanParam,
            restore_with_digid: BooleanParam,
            restore_with_email: BooleanParam,
        },
        {
            updateType: 'replace',
        },
    );

    const { onAuthRedirect } = useAuthService();
    const digIdService = useDigiDService();
    const identityService = useIdentityService();

    const [disableSubmitBtn, setDisableSubmitBtn] = useState(false);
    const [authEmailRestoreSent, setAuthEmailRestoreSent] = useState<boolean>(null);
    const [authEmailConfirmationSent, setAuthEmailConfirmationSent] = useState<boolean>(false);

    const signedIn = useMemo(() => !!token, [token]);

    const showPrivacy = useMemo(() => {
        return (
            appConfigs?.show_privacy_checkbox &&
            appConfigs?.pages.privacy &&
            (!envData.config?.flags?.startPage?.combineColumns || state === 'email')
        );
    }, [appConfigs, envData, state]);

    const showTerms = useMemo(() => {
        return (
            appConfigs?.show_terms_checkbox &&
            appConfigs?.pages.terms_and_conditions &&
            (!envData.config?.flags?.startPage?.combineColumns || state === 'email')
        );
    }, [appConfigs, envData, state]);

    const authForm = useFormBuilder(
        {
            email: '',
            target: target || 'fundRequest',
            privacy: false,
            terms: false,
        },
        async (values) => {
            if ((!values.privacy && showPrivacy) || (!values.terms && showTerms)) {
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
                        setEmailValue(values.email);
                        setState('email');
                        setAuthEmailConfirmationSent(true);
                        authForm.reset();
                    }, handleErrors)
                    .finally(() => setProgress(100));
            }

            identityService
                .make(values)
                .then(() => {
                    setEmailValue(values.email);
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
            .catch((res: ResponseError) => navigateState(WebshopRoutes.ERROR, { errorCode: res.headers['error-code'] }))
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
            setAuthEmailConfirmationSent(false);
            setAuthEmailRestoreSent(false);
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
            setTitle(translate(`signup.items.${envData.client_key}.page_title`, null, 'signup.items.page_title'));
        }
    }, [envData, setTitle, translate]);

    useEffect(() => {
        if ((!authForm?.values?.privacy && showPrivacy) || (!authForm?.values?.terms && showTerms)) {
            setDisableSubmitBtn(true);
        } else {
            setDisableSubmitBtn(false);
        }
    }, [authForm?.values?.privacy, authForm?.values?.terms, showPrivacy, showTerms]);

    const privacyCheckbox = useCallback(() => {
        return showPrivacy ? (
            <div className="row">
                <div className="col col-lg-12">
                    <br className="hidden-lg" />
                    <label
                        className="sign_up-pane-text sign_up-pane-text-sm sign_up-privacy"
                        htmlFor="privacy"
                        tabIndex={2}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            clickOnKeyEnter(e);
                        }}>
                        <input
                            type="checkbox"
                            data-dusk={'privacyCheckbox'}
                            className={'sign_up-privacy-checkbox'}
                            checked={authForm.values.privacy}
                            onChange={(e) => {
                                authForm.update({ privacy: e.target.checked });
                                e.target?.parentElement?.focus();
                            }}
                            id="privacy"
                        />
                        <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                            <strong>
                                <TranslateHtml i18n={'auth.privacy_link.text'} values={{ link_url: privacyUrl }} />
                            </strong>
                        </BindLinksInside>
                    </label>
                </div>
            </div>
        ) : null;
    }, [authForm, showPrivacy, privacyUrl]);

    const termsCheckbox = useCallback(() => {
        return showTerms ? (
            <div className="row">
                <div className="col col-lg-12">
                    <br className="hidden-lg" />
                    <label
                        className="sign_up-pane-text sign_up-pane-text-sm sign_up-privacy"
                        htmlFor="terms"
                        tabIndex={2}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            clickOnKeyEnter(e);
                        }}>
                        <input
                            type="checkbox"
                            className={'sign_up-privacy-checkbox'}
                            checked={authForm.values.terms}
                            onChange={(e) => {
                                authForm.update({ terms: e.target.checked });
                                e.target?.parentElement?.focus();
                            }}
                            id="terms"
                        />
                        <BindLinksInside onKeyDown={(e) => e.stopPropagation()}>
                            <strong>
                                <TranslateHtml i18n={'auth.terms_link.text'} values={{ link_url: termsUrl }} />
                            </strong>
                        </BindLinksInside>
                    </label>
                </div>
            </div>
        ) : null;
    }, [authForm, showTerms, termsUrl]);

    const inlineEmailForm = useCallback(
        (showCheckboxes = true) => (
            <form className="form" onSubmit={authForm.submit} data-dusk="authEmailForm">
                <div className="row">
                    <div className="form-group col col-lg-9">
                        <label className="form-label" htmlFor="email">
                            <strong>{translate('popup_auth.input.mail')}</strong>
                        </label>
                        <div className="flex flex-vertical flex-gap">
                            <div>
                                <UIControlText
                                    value={authForm.values.email}
                                    onChange={(e) => authForm.update({ email: e.target.value })}
                                    id={'email'}
                                    name={'email'}
                                    tabIndex={1}
                                    autoFocus={true}
                                    dataDusk={'authEmailFormEmail'}
                                    autoComplete={'email'}
                                />
                                <FormError error={authForm.errors.email} />
                            </div>
                            <div className="form-value-hint">
                                <TranslateHtml i18n={'auth_start.example'} />
                            </div>
                        </div>
                    </div>
                    <div className="form-group col col-lg-3">
                        <label className="form-label hide-sm" htmlFor="submit">
                            &nbsp;
                        </label>
                        <button
                            id={'submit'}
                            className="button button-primary button-fill"
                            type="submit"
                            disabled={showCheckboxes && disableSubmitBtn}
                            data-dusk="authEmailFormSubmit"
                            tabIndex={4}>
                            {translate('popup_auth.buttons.submit')}
                        </button>
                    </div>
                </div>

                {showCheckboxes && privacyCheckbox()}
                {showCheckboxes && termsCheckbox()}
            </form>
        ),
        [authForm, disableSubmitBtn, privacyCheckbox, termsCheckbox, translate],
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
                <div className="sign_up-option-title">{translate('auth.options.qr.title')}</div>
                <div className="sign_up-option-description">
                    <TranslateHtml i18n={'auth.options.qr.description'} />
                </div>
            </div>
        </div>
    );

    const digidOption = (
        <div className="sign_up-option" tabIndex={0} onKeyDown={clickOnKeyEnter} role="button" onClick={startDigId}>
            <div className="sign_up-option-media">
                <img
                    className="sign_up-option-media-img"
                    src={assetUrl('/assets/img/icon-auth/icon-auth-digid.svg')}
                    alt="logo DigiD"
                />
            </div>
            <div className="sign_up-option-details">
                <div className="sign_up-option-title">{translate('auth.options.digid.title')}</div>
                <div className="sign_up-option-description">{translate('auth.options.digid.description')}</div>
            </div>
        </div>
    );

    const emailOption = (dusk: string) => (
        <div
            className="sign_up-option"
            tabIndex={0}
            onKeyDown={clickOnKeyEnter}
            onClick={() => window.setTimeout(() => setState('email'), 0)}
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
                <div className="sign_up-option-title">{translate('auth.options.email.title')}</div>
                <div className="sign_up-option-description">{translate('auth.options.email.description')}</div>
            </div>
        </div>
    );

    const restoreLink = () => (
        <div className="sign_up-restore">
            <div className="sign_up-restore-label">{translate('auth.restore.label')}</div>
            <div
                className="sign_up-restore-link clickable"
                onClick={() => setState('restore')}
                role="button"
                tabIndex={0}
                onKeyDown={clickOnKeyEnter}>
                {translate('auth.restore.link')}
                <div className="sign_up-restore-chevron">
                    <em className="mdi mdi-chevron-right" />
                </div>
            </div>
        </div>
    );

    return (
        <BlockShowcase breadcrumbItems={[]} loaderElement={<BlockLoader type={'full'} />}>
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
                                                        <h2 className="sign_up-pane-text">
                                                            <div className="sign_up-pane-heading">
                                                                {translate('auth.sign_in_up_title')}
                                                            </div>
                                                        </h2>
                                                        <div className={`sign_up-options ${loading ? 'disabled' : ''}`}>
                                                            {appConfigs.digid &&
                                                                !envData.config?.flags?.startPage
                                                                    ?.hideSignUpDigidOption &&
                                                                digidOption}

                                                            {!envData.config?.flags?.startPage?.hideSignUpEmailOption &&
                                                                emailOption('authOptionEmailRegister')}
                                                        </div>
                                                    </div>
                                                    <div className="sign_up-col">
                                                        <h2 className="sign_up-pane-text">
                                                            <div className="sign_up-pane-heading">
                                                                {translate(
                                                                    `signup.items.${envData.client_key}.pane_text`,
                                                                    {},
                                                                    'signup.items.pane_text',
                                                                )}
                                                            </div>
                                                        </h2>
                                                        <div className={`sign_up-options ${loading ? 'disabled' : ''}`}>
                                                            {appConfigs.digid &&
                                                                envData.config?.flags?.startPage
                                                                    ?.hideSignInDigidOption &&
                                                                digidOption}

                                                            {!envData.config?.flags?.startPage?.hideSignInEmailOption &&
                                                                emailOption('authOptionEmailRestore')}

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
                                    <h1 className="block-title">{translate('auth.restore.title')}</h1>
                                    {!authEmailRestoreSent && !authEmailConfirmationSent && (
                                        <div className="sign_up-pane">
                                            <div className="sign_up-pane-body">
                                                <div className="sign_up-options">{appConfigs.digid && digidOption}</div>
                                            </div>
                                            <SignUpFooter
                                                startActions={
                                                    <div
                                                        role={'button'}
                                                        tabIndex={0}
                                                        onKeyDown={clickOnKeyEnter}
                                                        className="button button-text button-text-padless"
                                                        onClick={() => setState('start')}>
                                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                                        {translate('auth.back_start')}
                                                    </div>
                                                }
                                            />
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
                                            <div className="sign_up-pane-body">{inlineEmailForm()}</div>
                                            <SignUpFooter
                                                startActions={
                                                    <div
                                                        role={'button'}
                                                        tabIndex={4}
                                                        onKeyDown={clickOnKeyEnter}
                                                        className="button button-text button-text-padless"
                                                        onClick={() => setState('start')}>
                                                        <em className="mdi mdi-chevron-left icon-lefts" />
                                                        {translate('auth.back')}
                                                    </div>
                                                }
                                            />
                                        </div>
                                    )}

                                    {authEmailRestoreSent && (
                                        <div className="sign_up-pane">
                                            <h1 className="sr-only" role="heading">
                                                {translate('popup_auth.header.title_sr')}
                                            </h1>
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
                                                        values={{ email: emailValue }}
                                                    />
                                                    <EmailProviderLink email={authForm.values.email} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {authEmailConfirmationSent && (
                                        <div className="sign_up-pane">
                                            <h1 className="sr-only" role="heading">
                                                {translate('popup_auth.header.title_sr')}
                                            </h1>
                                            <h2 className="sign_up-pane-header" role="heading">
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
                                                    <h3 className="sign_up-email_sent-title" role="heading">
                                                        {translate(
                                                            `popup_auth.header.title_existing_user_succes_${appConfigs?.communication_type}`,
                                                        )}
                                                    </h3>
                                                    <TranslateHtml
                                                        component={<div className="sign_up-email_sent-text" />}
                                                        i18n={`popup_auth.notifications.link_${appConfigs?.communication_type}`}
                                                        values={{ email: emailValue }}
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
                                    <h1 className="block-title">{translate('auth.qr.title')}</h1>
                                    <div className="sign_up-pane">
                                        <div className="sign_up-pane-body">
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
                                                                value={makeQrCodeContent(qrValue.type, qrValue.value)}
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
                                                            value={makeQrCodeContent(qrValue.type, qrValue.value)}
                                                            logo={assetUrl('/assets/img/me-logo.png')}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <SignUpFooter
                                            startActions={
                                                <div
                                                    role={'button'}
                                                    tabIndex={0}
                                                    onKeyDown={clickOnKeyEnter}
                                                    className="button button-text button-text-padless"
                                                    onClick={() => setState('start')}>
                                                    <em className="mdi mdi-chevron-left icon-lefts" />
                                                    {translate('auth.back')}
                                                </div>
                                            }
                                        />
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
