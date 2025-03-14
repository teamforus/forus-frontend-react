import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { ModalState } from '../../../dashboard/modules/modals/context/ModalContext';
import Identity2FAState from '../../../dashboard/props/models/Identity2FAState';
import useAssetUrl from '../../hooks/useAssetUrl';
import Identity2FA from '../../../dashboard/props/models/Identity2FA';
import { useIdentity2FAService } from '../../../dashboard/services/Identity2FAService';
import usePushDanger from '../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../dashboard/hooks/usePushSuccess';
import useTimer from '../../../dashboard/hooks/useTimer';
import Auth2FAProvider from '../../../dashboard/props/models/Auth2FAProvider';
import { ResponseError } from '../../../dashboard/props/ApiResponses';
import SelectControl from '../../../dashboard/components/elements/select-control/SelectControl';
import QrCode from '../../../dashboard/components/elements/qr-code/QrCode';
import PhoneControl from '../../../dashboard/components/elements/forms/controls/PhoneControl';
import FormError from '../../../dashboard/components/elements/forms/errors/FormError';
import PincodeControl from '../../../dashboard/components/elements/forms/controls/PincodeControl';
import BlockAuth2FAInfoBox from '../elements/block-auth-2fa-info-box/BlockAuth2FAInfoBox';
import Icon2faPhoneConnect from '../../../../assets/forus-webshop/resources/_webshop-common/assets/img/icon-2fa-phone-connect.svg';
import { clickOnKeyEnter } from '../../../dashboard/helpers/wcag';
import classNames from 'classnames';
import useTranslate from '../../../dashboard/hooks/useTranslate';
import TranslateHtml from '../../../dashboard/components/elements/translate-html/TranslateHtml';

export default function Modal2FASetup({
    modal,
    type,
    auth = false,
    className,
    onReady,
    onCancel,
    auth2FAState,
}: {
    modal: ModalState;
    type: string;
    auth?: boolean;
    className?: string;
    onReady: () => void;
    onCancel: () => void;
    auth2FAState: Identity2FAState;
}) {
    const assetUrl = useAssetUrl();
    const translate = useTranslate();

    const [isLocked, setIsLocked] = useState(false);
    const [unlockEvent, setUnlockEvent] = useState(null);

    const [auth2FA, setAuth2FA] = useState<Identity2FA>(null);

    const [phoneNumber, setPhoneNumber] = useState(null);
    const [phoneNumberError, setPhoneNumberError] = useState(null);
    const [activateAuthErrors, setActivateAuthErrors] = useState(null);

    const [confirmationCode, setConfirmationCode] = useState(null);
    const [verifyAuthErrors, setVerifyAuthErrors] = useState(null);

    const [sendingCode, setSendingCode] = useState(null);

    const [step, setStep] = useState(null);
    const identity2FAService = useIdentity2FAService();

    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const timer = useTimer();
    const { setTimer } = timer;

    const [providers, setProviders] = useState<Array<Auth2FAProvider>>(null);
    const [provider, setProvider] = useState<Auth2FAProvider>(null);

    const lock = useCallback(() => {
        if (isLocked) {
            return true;
        }

        setIsLocked(true);
    }, [isLocked]);

    const cancel = useCallback(() => {
        onCancel?.();
        modal.close();
    }, [modal, onCancel]);

    const done = useCallback(() => {
        onReady?.();
        modal.close();
    }, [modal, onReady]);

    const goToStep = useCallback((step: string) => {
        setPhoneNumber('+31');
        setPhoneNumberError(null);
        setConfirmationCode('');
        setStep(step);
    }, []);

    const unlock = useCallback(
        (time = 1000) => {
            window.clearTimeout(unlockEvent);
            setUnlockEvent(window.setTimeout(() => setIsLocked(false), time));
        },
        [unlockEvent],
    );

    const blockResend = useCallback(() => {
        setTimer(10);
    }, [setTimer]);

    const makePhone2FA = useCallback(() => {
        identity2FAService
            .store({
                type: 'phone',
                phone: parseInt(phoneNumber?.toString().replace(/\D/g, '') || 0),
            })
            .then((res) => {
                goToStep('provider_confirmation');
                setAuth2FA(res.data?.data);
                blockResend();
            })
            .catch((err: ResponseError) => {
                setPhoneNumberError(err?.data?.errors?.phone);
                pushDanger(translate('push.error'), err.data?.message || translate('modal_2fa_setup.unknown_error'));
            });
    }, [blockResend, goToStep, identity2FAService, phoneNumber, pushDanger, translate]);

    const makeAuthenticator2FA = useCallback(() => {
        identity2FAService
            .store({ type: 'authenticator' })
            .then((res) => {
                setAuth2FA(res.data?.data);
                goToStep('provider_select');
            })
            .catch((err: ResponseError) => {
                pushDanger(translate('push.error'), err.data?.message || translate('modal_2fa_setup.unknown_error'));

                if (err.status == 429) {
                    cancel();
                }
            });
    }, [cancel, goToStep, identity2FAService, pushDanger, translate]);

    const submitPhoneNumber = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            makePhone2FA();
        },
        [makePhone2FA],
    );

    const submitAuthenticator = useCallback(
        (e?: FormEvent) => {
            e?.preventDefault();
            goToStep('provider_confirmation');
        },
        [goToStep],
    );

    const activateProvider = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();

            if (!auth2FA || !provider || lock()) {
                return;
            }

            identity2FAService
                .activate(auth2FA.uuid, {
                    key: provider.key,
                    code: confirmationCode,
                })
                .then(() => {
                    setActivateAuthErrors(null);
                    goToStep('success');
                })
                .catch((err: ResponseError) => {
                    setActivateAuthErrors(err.data?.errors?.code);
                    pushDanger(
                        translate('push.error'),
                        err.data?.message || translate('modal_2fa_setup.unknown_error'),
                    );
                })
                .finally(() => unlock());
        },
        [auth2FA, confirmationCode, goToStep, identity2FAService, lock, provider, pushDanger, unlock, translate],
    );

    const verifyAuthProvider = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();

            if (!auth2FA || lock()) {
                return;
            }

            identity2FAService
                .authenticate(auth2FA.uuid, { code: confirmationCode })
                .then(() => {
                    setVerifyAuthErrors(null);
                    goToStep('success');
                })
                .catch((err: ResponseError) => {
                    setVerifyAuthErrors(err.data?.errors?.code);
                    pushDanger(
                        translate('push.error'),
                        err.data?.message || translate('modal_2fa_setup.unknown_error'),
                    );
                })
                .finally(() => unlock());
        },
        [auth2FA, confirmationCode, goToStep, identity2FAService, lock, pushDanger, unlock, translate],
    );

    const resendCode = useCallback(
        (notify = true) => {
            if (!auth2FA?.uuid) {
                return;
            }

            setSendingCode(true);
            blockResend();

            identity2FAService
                .send(auth2FA.uuid)
                .then(
                    () =>
                        notify
                            ? pushSuccess(translate('push.success'), translate('modal_2fa_setup.code_resent'))
                            : false,
                    (err: ResponseError) => pushDanger(translate('push.error'), err?.data?.message),
                )
                .then(() => setSendingCode(false));
        },
        [auth2FA?.uuid, blockResend, identity2FAService, pushDanger, pushSuccess, translate],
    );

    const onKeyDown = useCallback(
        (e) => {
            if (e.key === 'Enter' && step == 'provider_select') {
                return submitAuthenticator();
            }

            if (e.key === 'Enter' && step == 'success') {
                return done();
            }
        },
        [done, step, submitAuthenticator],
    );

    const bindEvents = useCallback(() => {
        document.body.addEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    const unbindEvents = useCallback(() => {
        document.body.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown]);

    useEffect(() => {
        bindEvents();

        return () => {
            unbindEvents();
        };
    }, [bindEvents, unbindEvents]);

    useEffect(() => {
        const providers = auth2FAState.providers
            .filter((provider) => provider.type == type)
            .map((provider) => ({ ...provider, name: translate('security_2fa.app_providers.' + provider.key) }));

        const active_providers = auth2FAState.active_providers.filter((item) => item.provider_type.type == type);

        setAuth2FA((auth2FA) => (auth2FA ? auth2FA : active_providers.find((auth_2fa) => auth_2fa)));
        setProvider(providers.find((provider) => provider));
        setProviders(providers);
    }, [type, auth2FAState, translate]);

    // should set up
    useEffect(() => {
        if (auth) {
            return;
        }

        // should set up
        if (type === 'authenticator') {
            makeAuthenticator2FA();
        }

        if (type === 'phone') {
            goToStep('phone_setup');
        }
    }, [type, auth, goToStep, makeAuthenticator2FA]);

    // should authenticate
    useEffect(() => {
        if (!auth) {
            return;
        }

        if (type === 'phone') {
            resendCode(false);
        }

        goToStep('provider_verification');
    }, [auth, goToStep, resendCode, type]);

    return (
        <div
            className={classNames(
                'modal',
                'modal-animated',
                'modal-2fa-setup',
                modal.loading ? '' : 'modal-loaded',
                className,
            )}>
            <div className="modal-backdrop" onClick={cancel} />
            {/* Select provider */}
            {step == 'provider_select' && (
                <form className={'modal-window form form-compact'} onSubmit={submitAuthenticator}>
                    <div className="modal-header">
                        <div className="modal-heading">{translate('modal_2fa_setup.setup_2fa')}</div>
                        <div
                            className="modal-close mdi mdi-close"
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            onClick={cancel}
                            role="button"
                        />
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-row">
                                <div className="modal-section-column flex-gap-lg">
                                    <div className="flex flex-vertical flex-gap">
                                        <div className="modal-section-title text-left">
                                            {translate('modal_2fa_setup.select_auth_app')}
                                        </div>
                                        <div className="form-group">
                                            <SelectControl
                                                value={provider}
                                                onChange={(provider: Auth2FAProvider) => setProvider(provider)}
                                                options={providers}
                                                allowSearch={false}
                                                multiline={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="modal-section-description text-left">
                                        <TranslateHtml
                                            i18n={'modal_2fa_setup.dont_have_app'}
                                            values={{ name: provider.name }}
                                        />
                                    </div>

                                    <div className="modal-section-description text-left">
                                        <div className="block block-app_download">
                                            <div className="app_download-row">
                                                <a
                                                    className="app_download-store_icon"
                                                    href={provider.url_android}
                                                    rel="noreferrer"
                                                    target="_blank">
                                                    <img
                                                        src={assetUrl(
                                                            '/assets/img/icon-app/app-store-android-dark.svg',
                                                        )}
                                                        alt={''}
                                                    />
                                                </a>
                                                <a
                                                    className="app_download-store_icon"
                                                    href={provider.url_ios}
                                                    rel="noreferrer"
                                                    target="_blank">
                                                    <img
                                                        src={assetUrl('/assets/img/icon-app/app-store-ios-dark.svg')}
                                                        alt={''}
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-section-separator" />

                                    <div className="modal-section-description text-left">
                                        <strong className="text-strong">
                                            {translate('modal_2fa_setup.already_have_app')}
                                        </strong>
                                    </div>

                                    <div className="modal-section-description text-left">
                                        <TranslateHtml
                                            i18n={'modal_2fa_setup.already_have_app_steps'}
                                            values={{ secret: auth2FA?.secret }}
                                        />
                                    </div>
                                </div>

                                <div className="modal-section-column modal-section-column-aside">
                                    {auth2FA && (
                                        <QrCode
                                            value={auth2FA.secret_url}
                                            logo={assetUrl('/assets/img/me-logo.png')}
                                            className={'block-qr-code-fit'}
                                            qrCodeAttrs={{ style: { padding: '15px' } }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="modal-section modal-section-collapsed">
                            <BlockAuth2FAInfoBox className="flex-center block-info-box-borderless" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-grow">
                            <button
                                className="button button-light button-sm flex-center"
                                type="button"
                                onClick={cancel}>
                                {translate('modal_2fa_setup.cancel')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button className="button button-primary button-sm flex-center" type="submit">
                                {translate('modal_2fa_setup.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Phone setup */}
            {step == 'phone_setup' && (
                <form className={'modal-window form form-compact'} onSubmit={submitPhoneNumber}>
                    <div className="modal-header">
                        <div className="modal-heading">{translate('modal_2fa_setup.setup_2fa')}</div>
                        <div
                            className="modal-close mdi mdi-close"
                            onClick={cancel}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            role="button"
                        />
                    </div>

                    <div className="modal-body">
                        <div className="modal-section form">
                            <div className="row">
                                <div className="col col-sm-10 col-sm-offset-1 col-xs-12 col-xs-offset-0">
                                    <div className="modal-section-icon">
                                        <Icon2faPhoneConnect />
                                    </div>
                                    <div className="modal-section-title">{translate('modal_2fa_setup.link_phone')}</div>

                                    <div className="modal-section-description">
                                        {translate('modal_2fa_setup.enter_phone')}
                                        <div className="modal-separator" />
                                        <div className="form-group">
                                            <div className="form-label text-strong">
                                                {translate('modal_2fa_setup.phone_number')}
                                            </div>
                                            <PhoneControl
                                                onChange={(value) => setPhoneNumber(value)}
                                                placeholder={null}
                                            />
                                            <FormError error={phoneNumberError} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-section modal-section-collapsed">
                            <BlockAuth2FAInfoBox className="flex-center block-info-box-borderless" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-grow">
                            <button
                                className="button button-light button-sm flex-center"
                                type="button"
                                onClick={cancel}>
                                {translate('modal_2fa_setup.cancel')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button className="button button-primary button-sm flex-center" type="submit">
                                {translate('modal_2fa_setup.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Authenticator setup */}
            {step == 'provider_confirmation' && (
                <form className={'modal-window form form-compact'} onSubmit={activateProvider}>
                    <div className="modal-header">
                        <div className="modal-header-title">{translate('modal_2fa_setup.setup_2fa')}</div>
                        <div
                            className="modal-close mdi mdi-close"
                            onClick={cancel}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            role="button"
                        />
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-title">{translate('modal_2fa_setup.enter_2fa_code')}</div>

                            <div className="modal-section-description">
                                <div className="form-group">
                                    {type == 'phone' && (
                                        <div className="form-label flex-center">
                                            {translate('modal_2fa_setup.enter_sms_code')}
                                        </div>
                                    )}

                                    {type == 'authenticator' && (
                                        <div className="form-label flex-center">
                                            {translate('modal_2fa_setup.enter_app_code')}
                                        </div>
                                    )}

                                    <PincodeControl
                                        value={confirmationCode}
                                        blockSize={3}
                                        blockCount={2}
                                        valueType={'num'}
                                        className={'block-pincode-compact'}
                                        onChange={(code) => setConfirmationCode(code)}
                                        ariaLabel={translate('modal_2fa_setup.enter_2fa_code')}
                                    />

                                    <FormError error={activateAuthErrors} />
                                </div>
                            </div>

                            {type == 'phone' && (
                                <div className="modal-section-description">
                                    <button
                                        className="button button-text button-text-primary button-sm"
                                        type="button"
                                        onClick={() => resendCode()}
                                        disabled={timer?.time > 0}>
                                        <div
                                            className={`mdi mdi-refresh icon-start ${sendingCode ? 'mdi-spin' : ''}`}
                                        />
                                        {translate('modal_2fa_setup.resend_code')}
                                        {timer?.time > 0 && (
                                            <span>
                                                &nbsp;({translate('modal_2fa_setup.seconds', { time: timer?.time })})
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="modal-section modal-section-collapsed">
                            <BlockAuth2FAInfoBox className="flex-center block-info-box-borderless" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group flex-grow">
                            <button
                                onClick={() => goToStep(type == 'phone' ? 'phone_setup' : 'provider_select')}
                                className="button button-light button-sm flex-center"
                                type="button">
                                {translate('modal_2fa_setup.back')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button
                                className="button button-primary button-sm flex-center"
                                type="submit"
                                disabled={confirmationCode.length !== 6}>
                                {translate('modal_2fa_setup.verify')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Provider verification */}
            {step == 'provider_verification' && (
                <form className={'modal-window form form-compact'} onSubmit={verifyAuthProvider}>
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_2fa_setup.2fa')}</h2>
                        <div
                            className="modal-close mdi mdi-close"
                            onClick={cancel}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            role="button"
                        />
                    </div>

                    <div className={'modal-body'}>
                        <div className="modal-section">
                            {auth2FA.provider_type?.type == 'phone' && (
                                <div className="modal-section-title">
                                    {translate('modal_2fa_setup.enter_sms_code_6_digits')}
                                </div>
                            )}
                            {auth2FA.provider_type?.type == 'authenticator' && (
                                <div className="modal-section-title">
                                    {translate('modal_2fa_setup.enter_app_code_6_digits', {
                                        provider: auth2FA.provider_type.name,
                                    })}
                                </div>
                            )}
                            <div className="modal-section-description">
                                <div className="form-group">
                                    {auth2FA.provider_type.type == 'phone' && (
                                        <div className="form-label">{translate('modal_2fa_setup.enter_sms_code')}</div>
                                    )}

                                    {auth2FA.provider_type.type == 'authenticator' && (
                                        <div className="form-label">{translate('modal_2fa_setup.enter_app_code')}</div>
                                    )}

                                    <div className="form-group">
                                        <PincodeControl
                                            value={confirmationCode}
                                            blockSize={3}
                                            blockCount={2}
                                            valueType={'num'}
                                            className={'block-pincode-compact'}
                                            onChange={(code) => setConfirmationCode(code)}
                                            ariaLabel={translate('modal_2fa_setup.enter_2fa_code')}
                                        />
                                        <FormError error={verifyAuthErrors} />
                                    </div>
                                </div>
                            </div>

                            {type == 'phone' && (
                                <div className="modal-section-description">
                                    <button
                                        className="button button-text button-text-primary button-sm"
                                        type="button"
                                        onClick={() => resendCode()}
                                        disabled={timer?.time > 0}>
                                        <div
                                            className={`mdi mdi-refresh icon-start ${sendingCode ? 'mdi-spin' : ''}`}
                                        />
                                        {translate('modal_2fa_setup.resend_code')}
                                        {timer?.time > 0 && (
                                            <span>
                                                &nbsp;({translate('modal_2fa_setup.seconds', { time: timer?.time })})
                                            </span>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="modal-section modal-section-collapsed">
                            <BlockAuth2FAInfoBox className="flex-center block-info-box-borderless" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group">
                            <button
                                className="button button-light button-sm flex-center"
                                type="button"
                                onClick={cancel}>
                                {translate('modal_2fa_setup.cancel')}
                            </button>
                            <div className="flex flex-grow hide-sm">&nbsp;</div>
                            <button
                                type="submit"
                                className="button button-primary button-sm flex-center"
                                disabled={confirmationCode.length !== 6}>
                                {translate('modal_2fa_setup.verify')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Success */}
            {step == 'success' && auth && (
                <div className="modal-window">
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_2fa_setup.2fa')}</h2>
                        <div
                            className="modal-close mdi mdi-close"
                            onClick={cancel}
                            tabIndex={0}
                            onKeyDown={clickOnKeyEnter}
                            role="button"
                        />
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <div className="mdi mdi-check-circle-outline" />
                            </div>
                            <div className="modal-section-title">{translate('modal_2fa_setup.successful_login')}</div>
                            <div className="modal-section-description">{translate('modal_2fa_setup.welcome_back')}</div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group">
                            <button className="button button-primary button-sm" onClick={done}>
                                {translate('modal_2fa_setup.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step == 'success' && !auth && (
                <div className="modal-window">
                    <div
                        className="modal-close mdi mdi-close"
                        onClick={cancel}
                        tabIndex={0}
                        onKeyDown={clickOnKeyEnter}
                        role="button"
                    />
                    <div className="modal-header">
                        <h2 className="modal-header-title">{translate('modal_2fa_setup.setup_2fa')}</h2>
                    </div>

                    <div className="modal-body">
                        <div className="modal-section">
                            <div className="modal-section-icon modal-section-icon-success">
                                <div className="mdi mdi-check-circle-outline" />
                            </div>
                            <div className="modal-section-title">{translate('modal_2fa_setup.2fa_success')}</div>
                            <div className="modal-section-description">
                                {translate('modal_2fa_setup.extra_security')}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <div className="button-group">
                            <button className="button button-primary button-sm flex-center" onClick={done}>
                                {translate('modal_2fa_setup.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
